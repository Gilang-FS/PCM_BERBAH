<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useUsers, MIN_PASSWORD_LENGTH } from '~/composables/useUsers'
import { useAum } from '~/composables/useAum'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const { username: loggedInUsername } = useAuth()
const { aumList } = useAum()
const { usersData, isCoreSuperadmin, tambahUser, editUser, hapusUser } = useUsers()
const { success, error: toastError } = useToast()

// Aktor login: hanya superadmin inti yang boleh mengelola superadmin backup
const actorIsCore = computed(() => isCoreSuperadmin(loggedInUsername.value))

// Baris yang boleh dikelola (edit/hapus) oleh aktor yang sedang login:
// - Akun inti: tidak pernah (immutable, ganti password via Profil)
// - Akun sendiri: tidak (self-service via halaman Profil)
// - Superadmin backup: hanya oleh superadmin inti
// - Admin: oleh semua superadmin
const canManage = (item) => {
  if (item.is_core) return false
  if (item.username === loggedInUsername.value) return false
  if (item.role === 'superadmin') return actorIsCore.value
  return true
}

const manageLockReason = (item) => {
  if (item.is_core) return 'Akun inti tidak dapat dikelola lewat UI.'
  if (item.username === loggedInUsername.value) return 'Gunakan halaman Profil untuk mengubah akun sendiri.'
  if (item.role === 'superadmin') return 'Superadmin backup hanya dapat dikelola oleh superadmin inti.'
  return 'Akun tidak dapat dikelola.'
}

// Urutkan: superadmin inti paling atas, lalu superadmin backup, lalu admin
const sortedUsersData = computed(() => {
  const rank = (u) => (u.is_core ? 0 : u.role === 'superadmin' ? 1 : 2)
  return [...usersData.value].sort((a, b) => rank(a) - rank(b))
})

// ─── State Modal Form ────────────────────────────────────────────────────────
const isModalOpen = ref(false)
const modalType = ref('add')
const isSubmitting = ref(false)
const generalError = ref('')
const addBtnRef = ref(null)
const editTriggerRef = ref(null)
const firstFieldRef = ref(null)

const trapFocus = (event) => {
  const dialog = event.currentTarget
  const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(element => element.getClientRects().length > 0)
  if (!focusable.length) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
    event.preventDefault()
    first.focus()
  }
}

const createEmptyForm = () => ({
  id: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'admin', // akun baru selalu admin; superadmin hanya via .env
  aum: aumList[1] || ''
})

const form = ref(createEmptyForm())

const formErrors = ref({ username: '', password: '', confirmPassword: '', aum: '' })
const resetFormErrors = () => {
  formErrors.value = { username: '', password: '', confirmPassword: '', aum: '' }
}

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const openAddModal = () => {
  modalType.value = 'add'
  form.value = createEmptyForm()
  resetFormErrors()
  generalError.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  isModalOpen.value = true
  nextTick(() => firstFieldRef.value?.focus())
}

const openEditModal = (item, triggerEl) => {
  if (!canManage(item)) return
  editTriggerRef.value = triggerEl || null
  modalType.value = 'edit'
  form.value = {
    id: item.id,
    username: item.username,
    password: '',
    confirmPassword: '',
    role: item.role,
    aum: item.aum || ''
  }
  resetFormErrors()
  generalError.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  isModalOpen.value = true
  nextTick(() => firstFieldRef.value?.focus())
}

const closeModal = () => {
  if (isSubmitting.value) return
  isModalOpen.value = false
  generalError.value = ''
  const trigger = modalType.value === 'add' ? addBtnRef.value : editTriggerRef.value
  nextTick(() => trigger?.focus())
}

const isDuplicateUsername = () =>
  usersData.value.some(u =>
    u.username.toLowerCase() === form.value.username.trim().toLowerCase() &&
    u.id !== form.value.id
  )

const saveUser = () => {
  if (isSubmitting.value) return
  resetFormErrors()
  generalError.value = ''

  let hasError = false

  if (!form.value.username.trim()) {
    formErrors.value.username = 'Username wajib diisi.'
    hasError = true
  } else if (isDuplicateUsername()) {
    formErrors.value.username = 'Username sudah digunakan, pilih yang lain.'
    hasError = true
  }

  if (modalType.value === 'add' && !form.value.password) {
    formErrors.value.password = 'Password wajib diisi.'
    hasError = true
  } else if (form.value.password && form.value.password.length < MIN_PASSWORD_LENGTH) {
    formErrors.value.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
    hasError = true
  }

  const confirmRequired = modalType.value === 'add' || Boolean(form.value.password)
  if (confirmRequired && form.value.password !== form.value.confirmPassword) {
    formErrors.value.confirmPassword = 'Password tidak cocok, periksa kembali.'
    hasError = true
  }

  if (modalType.value === 'add' && !aumList.includes(form.value.aum)) {
    formErrors.value.aum = 'Unit / AUM wajib dipilih.'
    hasError = true
  }

  if (hasError) return

  isSubmitting.value = true
  try {
    const isAdd = modalType.value === 'add'
    const saved = isAdd
      ? tambahUser({
          username: form.value.username.trim(),
          password: form.value.password,
          role: 'admin',
          aum: form.value.aum,
        }, loggedInUsername.value)
      : editUser(form.value.id, {
          username: form.value.username.trim(),
          password: form.value.password,
          aum: form.value.aum,
        }, loggedInUsername.value)

    if (!saved) throw new Error('USER_NOT_SAVED')

    isModalOpen.value = false
    success(isAdd ? 'Akun berhasil ditambahkan.' : 'Akun berhasil diperbarui.')
    const trigger = isAdd ? addBtnRef.value : editTriggerRef.value
    nextTick(() => trigger?.focus())
  } catch {
    generalError.value = 'Gagal menyimpan akun. Periksa kembali data atau coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}

// ─── Modal Konfirmasi Hapus ──────────────────────────────────────────────────
const isDeleteModalOpen = ref(false)
const userToDelete = ref(null)
const isDeleting = ref(false)
const deleteTriggerRef = ref(null)
const deleteDialogRef = ref(null)

const deleteUserName = computed(() =>
  usersData.value.find(u => u.id === userToDelete.value)?.username || ''
)

const confirmDeleteUser = (id, triggerEl) => {
  const item = usersData.value.find(u => u.id === id)
  if (!item || !canManage(item)) return
  deleteTriggerRef.value = triggerEl || null
  userToDelete.value = id
  isDeleteModalOpen.value = true
  nextTick(() => deleteDialogRef.value?.focus())
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  userToDelete.value = null
  nextTick(() => deleteTriggerRef.value?.focus())
}

const executeDelete = () => {
  if (isDeleting.value || !userToDelete.value) return
  isDeleting.value = true
  try {
    const deleted = hapusUser(userToDelete.value, loggedInUsername.value)
    if (!deleted) {
      toastError('Akun tidak dapat dihapus. Muat ulang halaman dan coba lagi.')
      return
    }
    isDeleteModalOpen.value = false
    userToDelete.value = null
    success('Akun berhasil dihapus.')
    nextTick(() => addBtnRef.value?.focus())
  } catch {
    toastError('Gagal menghapus akun. Coba kembali.')
  } finally {
    isDeleting.value = false
  }
}

// ─── Scroll-lock saat ada modal terbuka ──────────────────────────────────────
watch([isModalOpen, isDeleteModalOpen], ([formOpen, deleteOpen]) => {
  document.body.style.overflow = formOpen || deleteOpen ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="w-full max-w-5xl mx-auto space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 class="text-[26px] font-bold tracking-tight text-gray-900">Pengguna</h1>
      <button
        ref="addBtnRef"
        type="button"
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/40"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Tambah Akun
      </button>
    </div>

    <!-- Catatan aturan superadmin -->
    <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
      <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-[12px] text-amber-800 leading-relaxed">
        Akun <strong>superadmin</strong> hanya dapat didaftarkan melalui konfigurasi sistem.
        Superadmin pertama adalah <strong>akun inti</strong> yang tidak dapat dikelola dari halaman ini —
        termasuk oleh superadmin lainnya. Ganti password akun sendiri lewat halaman <strong>Profil</strong>.
      </p>
    </div>

    <!-- Table Data (data pengguna dimuat di client dari store) -->
    <ClientOnly>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <!-- Mobile View -->
        <div class="divide-y divide-gray-50 md:hidden">
          <div v-if="sortedUsersData.length === 0" class="px-4 py-10 text-center text-[13px] font-medium text-gray-400" role="status">
            Belum ada pengguna terdaftar.
          </div>
          <div v-for="item in sortedUsersData" :key="item.id" class="p-4 flex flex-col gap-2">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="break-all text-[14px] font-bold leading-tight text-gray-800">@{{ item.username }}</p>
                <p class="text-[11px] text-gray-500 font-medium mt-0.5">{{ item.aum || '— Semua Unit' }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :class="item.role === 'superadmin' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
                >
                  {{ item.role === 'superadmin' ? 'Superadmin' : 'Admin' }}
                </span>
                <span v-if="item.is_core" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Inti
                </span>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-2 pt-2 border-t border-gray-50">
              <template v-if="canManage(item)">
                <button
                  type="button"
                  @click="openEditModal(item, $event.currentTarget)"
                  :aria-label="`Edit akun @${item.username}`"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  type="button"
                  @click="confirmDeleteUser(item.id, $event.currentTarget)"
                  :aria-label="`Hapus akun @${item.username}`"
                  class="text-red-400 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </template>
              <span v-else class="text-gray-300" :title="manageLockReason(item)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span class="sr-only">{{ manageLockReason(item) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-[13px]">
            <caption class="sr-only">Daftar akun pengguna PCM Berbah</caption>
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                <th scope="col" class="px-4 py-3 font-semibold">Username</th>
                <th scope="col" class="px-4 py-3 font-semibold">Unit / AUM</th>
                <th scope="col" class="px-4 py-3 font-semibold">Role</th>
                <th scope="col" class="px-4 py-3 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="item in sortedUsersData" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="break-words px-4 py-3.5 font-bold text-gray-800">@{{ item.username }}</td>
                <td class="break-words px-4 py-3.5 text-gray-600">{{ item.aum || '— Semua Unit' }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      :class="item.role === 'superadmin' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
                    >
                      {{ item.role === 'superadmin' ? 'Superadmin' : 'Admin' }}
                    </span>
                    <span v-if="item.is_core" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Inti
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <div v-if="canManage(item)" class="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      @click="openEditModal(item, $event.currentTarget)"
                      :aria-label="`Edit akun @${item.username}`"
                      class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      type="button"
                      @click="confirmDeleteUser(item.id, $event.currentTarget)"
                      :aria-label="`Hapus akun @${item.username}`"
                      class="text-red-400 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <span v-else class="inline-flex text-gray-300" :title="manageLockReason(item)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span class="sr-only">{{ manageLockReason(item) }}</span>
                  </span>
                </td>
              </tr>
              <tr v-if="sortedUsersData.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-gray-400 text-[13px] font-medium">
                  Belum ada pengguna terdaftar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #fallback>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-[13px] font-medium">
          Memuat data pengguna...
        </div>
      </template>
    </ClientOnly>

    <!-- ════════════════════════════════════════════════════════════════════════
         Modal Form: Tambah / Edit Akun
    ═════════════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @keydown.esc="closeModal"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
        <div
          class="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="users-modal-title"
          tabindex="-1"
          @keydown.tab="trapFocus"
        >
          <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <h2 id="users-modal-title" class="text-[15px] font-bold text-gray-800">
              {{ modalType === 'add' ? 'Tambah Akun' : 'Edit Akun' }}
            </h2>
            <button
              type="button"
              aria-label="Tutup modal"
              @click="closeModal"
              :disabled="isSubmitting"
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded p-1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form @submit.prevent="saveUser" class="p-5 space-y-4 overflow-y-auto" novalidate>

            <p v-if="generalError" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
              {{ generalError }}
            </p>

            <!-- Username -->
            <div class="space-y-1">
              <label for="users-username" class="text-[12px] font-semibold text-gray-600">Username</label>
              <input
                id="users-username"
                ref="firstFieldRef"
                type="text"
                v-model="form.username"
                required
                autocomplete="off"
                placeholder="admin_sd1"
                :aria-invalid="Boolean(formErrors.username)"
                :aria-describedby="formErrors.username ? 'users-username-error' : undefined"
                class="w-full p-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                :class="formErrors.username ? 'border-red-400 bg-red-50' : 'border-gray-200'"
              />
              <p v-if="formErrors.username" id="users-username-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ formErrors.username }}
              </p>
            </div>

            <!-- Password dengan toggle show/hide -->
            <div class="space-y-1">
              <label for="users-password" class="text-[12px] font-semibold text-gray-600">
                Password
                <span v-if="modalType === 'edit'" class="text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
              </label>
              <div class="relative">
                <input
                  id="users-password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  :required="modalType === 'add'"
                  autocomplete="new-password"
                  :placeholder="`Minimal ${MIN_PASSWORD_LENGTH} karakter`"
                  :aria-invalid="Boolean(formErrors.password)"
                  :aria-describedby="formErrors.password ? 'users-password-error' : undefined"
                  class="w-full p-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  :class="formErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded"
                >
                  <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="formErrors.password" id="users-password-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ formErrors.password }}
              </p>
            </div>

            <!-- Ulangi Password (saat Tambah, atau saat Edit jika password diisi) -->
            <div v-if="modalType === 'add' || form.password" class="space-y-1">
              <label for="users-confirm-password" class="text-[12px] font-semibold text-gray-600">Ulangi Password</label>
              <div class="relative">
                <input
                  id="users-confirm-password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirmPassword"
                  required
                  autocomplete="new-password"
                  placeholder="••••••••"
                  :aria-invalid="Boolean(formErrors.confirmPassword)"
                  :aria-describedby="formErrors.confirmPassword ? 'users-confirm-password-error' : undefined"
                  class="w-full p-2.5 pr-10 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  :class="formErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded"
                >
                  <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="formErrors.confirmPassword" id="users-confirm-password-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ formErrors.confirmPassword }}
              </p>
            </div>

            <!-- Role (terkunci — superadmin hanya via konfigurasi sistem) -->
            <div class="space-y-1">
              <span id="users-role-label" class="text-[12px] font-semibold text-gray-600">Role</span>
              <div
                class="flex items-center justify-between p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                role="group"
                aria-labelledby="users-role-label"
              >
                <span class="font-semibold">{{ form.role === 'superadmin' ? 'Superadmin' : 'Admin' }}</span>
                <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">
                {{ modalType === 'add'
                  ? 'Akun baru selalu ber-role Admin. Superadmin hanya dapat didaftarkan melalui konfigurasi sistem.'
                  : 'Role akun tidak dapat diubah.' }}
              </p>
            </div>

            <!-- Dropdown AUM — hanya untuk role admin -->
            <div v-if="form.role !== 'superadmin'" class="space-y-1">
              <label for="users-aum" class="text-[12px] font-semibold text-gray-600">Asal Unit / AUM</label>
              <div class="relative">
                <select
                  id="users-aum"
                  v-model="form.aum"
                  required
                  :aria-invalid="Boolean(formErrors.aum)"
                  :aria-describedby="formErrors.aum ? 'users-aum-error' : undefined"
                  class="w-full appearance-none py-2.5 pl-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  :class="formErrors.aum ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                >
                  <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              <p v-if="formErrors.aum" id="users-aum-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ formErrors.aum }}
              </p>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Akun' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ════════════════════════════════════════════════════════════════════════
         Modal Konfirmasi Hapus
    ═════════════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        @keydown.esc="cancelDelete"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancelDelete"></div>
        <div
          ref="deleteDialogRef"
          class="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="users-delete-title"
          tabindex="-1"
          @keydown.tab="trapFocus"
        >
          <div class="flex flex-col items-center gap-3 overflow-y-auto p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 id="users-delete-title" class="text-[15px] font-bold text-gray-800">Hapus Akun Ini?</h3>
              <p class="text-[12px] text-gray-500 mt-1 leading-relaxed">
                Akun <span v-if="deleteUserName" class="break-words font-bold text-gray-700">@{{ deleteUserName }}</span>
                akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3">
            <button
              type="button"
              @click="cancelDelete"
              class="flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Batal
            </button>
            <button
              type="button"
              @click="executeDelete"
              :disabled="isDeleting"
              class="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
