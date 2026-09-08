<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useWakaf, WAKAF_STATUS } from '~/composables/useWakaf'
import { useAum } from '~/composables/useAum'
import { formatRupiah, formatTanggal } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const { userRole, username: userUsername } = useAuth()
const { aumList, activeAum } = useAum()
const { wakafData, tambahWakaf, editWakaf, hapusWakaf } = useWakaf()
const { success, error: toastError } = useToast()

const isSuperadmin = computed(() => userRole.value === 'superadmin')

const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
].join('-')

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
}

// ─── Data terfilter mengikuti unit yang dipilih superadmin ──────────────────
const filteredWakaf = computed(() =>
  wakafData.value
    .filter(item => item.aum === activeAum.value)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
)

const summaryTotal = computed(() =>
  filteredWakaf.value.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)
)
const summaryAktif = computed(() =>
  filteredWakaf.value.filter(i => i.status === 'Aktif').length
)

// ─── State Modal Form ────────────────────────────────────────────────────────
const isModalOpen = ref(false)
const modalType = ref('add')
const isSubmitting = ref(false)
const formError = ref('')
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
  aum: activeAum.value,
  jenis_aset: '',
  lokasi: '',
  status: 'Aktif',
  nominal: '',
  tanggal: today,
  image: '',
  keterangan: ''
})

const form = ref(createEmptyForm())

const openAddModal = () => {
  if (!isSuperadmin.value) return
  modalType.value = 'add'
  form.value = createEmptyForm()
  formError.value = ''
  isModalOpen.value = true
  nextTick(() => firstFieldRef.value?.focus())
}

const openEditModal = (item, triggerEl) => {
  if (!isSuperadmin.value) return
  editTriggerRef.value = triggerEl || null
  modalType.value = 'edit'
  form.value = {
    id: item.id,
    aum: item.aum,
    jenis_aset: item.jenis_aset,
    lokasi: item.lokasi,
    status: item.status,
    nominal: String(item.nominal),
    tanggal: item.tanggal,
    image: item.image || '',
    keterangan: item.keterangan || ''
  }
  formError.value = ''
  isModalOpen.value = true
  nextTick(() => firstFieldRef.value?.focus())
}

const closeModal = () => {
  if (isSubmitting.value) return
  isModalOpen.value = false
  formError.value = ''
  const trigger = modalType.value === 'add' ? addBtnRef.value : editTriggerRef.value
  nextTick(() => trigger?.focus())
}

const validateForm = () => {
  if (!aumList.includes(form.value.aum)) {
    formError.value = 'Unit / AUM tidak valid.'
    return false
  }
  if (!form.value.jenis_aset.trim()) {
    formError.value = 'Nama / jenis aset wajib diisi.'
    return false
  }
  if (!form.value.lokasi.trim()) {
    formError.value = 'Lokasi aset wajib diisi.'
    return false
  }
  if (!WAKAF_STATUS.includes(form.value.status)) {
    formError.value = 'Status aset tidak valid.'
    return false
  }
  if (!isValidDate(form.value.tanggal) || form.value.tanggal > today) {
    formError.value = 'Tanggal wajib valid dan tidak boleh melewati hari ini.'
    return false
  }
  const nominal = Number(form.value.nominal)
  if (form.value.nominal === '' || !Number.isFinite(nominal) || nominal < 0) {
    formError.value = 'Nilai aset wajib diisi dan tidak boleh negatif.'
    return false
  }
  return true
}

const submitWakaf = () => {
  if (isSubmitting.value || !isSuperadmin.value) return
  formError.value = ''

  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const payload = {
      aum: form.value.aum,
      jenis_aset: form.value.jenis_aset.trim(),
      lokasi: form.value.lokasi.trim(),
      status: form.value.status,
      nominal: Number(form.value.nominal),
      tanggal: form.value.tanggal,
      image: form.value.image.trim(),
      keterangan: form.value.keterangan.trim(),
    }

    const isAdd = modalType.value === 'add'
    const saved = isAdd
      ? tambahWakaf(payload)
      : editWakaf(form.value.id, payload, userUsername.value || 'superadmin')

    if (!saved) throw new Error('WAKAF_NOT_SAVED')

    isModalOpen.value = false
    success(isAdd ? 'Aset wakaf berhasil disimpan.' : 'Aset wakaf berhasil diperbarui.')
    const trigger = isAdd ? addBtnRef.value : editTriggerRef.value
    nextTick(() => trigger?.focus())
  } catch {
    formError.value = 'Gagal menyimpan data wakaf. Coba kembali.'
  } finally {
    isSubmitting.value = false
  }
}

// ─── Simulasi Upload Foto ────────────────────────────────────────────────────
const handlePhotoUpload = () => {
  form.value.image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
}

// ─── Modal Konfirmasi Hapus ──────────────────────────────────────────────────
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)
const deleteTriggerRef = ref(null)
const deleteDialogRef = ref(null)

const deleteItemName = computed(() =>
  wakafData.value.find(w => w.id === itemToDelete.value)?.jenis_aset || ''
)

const confirmDelete = (id, triggerEl) => {
  if (!isSuperadmin.value) return
  deleteTriggerRef.value = triggerEl || null
  itemToDelete.value = id
  isDeleteModalOpen.value = true
  nextTick(() => deleteDialogRef.value?.focus())
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  itemToDelete.value = null
  nextTick(() => deleteTriggerRef.value?.focus())
}

const executeDelete = () => {
  if (!isSuperadmin.value || isDeleting.value || !itemToDelete.value) return
  isDeleting.value = true
  try {
    const deleted = hapusWakaf(itemToDelete.value)
    if (!deleted) {
      toastError('Aset wakaf tidak ditemukan atau sudah dihapus.')
      return
    }
    isDeleteModalOpen.value = false
    itemToDelete.value = null
    success('Aset wakaf berhasil dihapus.')
    nextTick(() => addBtnRef.value?.focus())
  } catch {
    toastError('Gagal menghapus aset wakaf. Coba kembali.')
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
  <div class="w-full max-w-5xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <h1 class="text-[26px] font-bold tracking-tight text-gray-900">Wakaf</h1>
      <NuxtLink to="/wakaf" target="_blank" class="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        Lihat Halaman Publik
      </NuxtLink>
    </div>

    <!-- Filter Unit + Ringkasan -->
    <div class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <!-- Dropdown Filter -->
      <div class="min-w-0 flex-1 space-y-1">
        <label for="wakaf-filter-aum" class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filter Unit / AUM</label>
        <div class="relative">
          <select
            id="wakaf-filter-aum"
            v-model="activeAum"
            class="w-full appearance-none pl-3.5 pr-10 py-2.5 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] cursor-pointer"
          >
            <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
          </select>
          <svg class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      <!-- Garis pemisah (mobile: horizontal, desktop: vertical) -->
      <div class="hidden h-12 w-px bg-gray-100 lg:block"></div>
      <div class="h-px bg-gray-100 lg:hidden"></div>

      <!-- Ringkasan Unit -->
      <div class="grid min-w-0 w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:w-auto lg:gap-8">
        <div class="text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Aset</p>
          <p class="text-[18px] font-bold text-gray-800">{{ filteredWakaf.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Aktif</p>
          <p class="text-[18px] font-bold text-green-600">{{ summaryAktif }}</p>
        </div>
        <div class="col-span-2 text-center sm:col-span-1">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Nilai</p>
          <p class="break-words text-[18px] font-bold text-gray-800">{{ formatRupiah(summaryTotal) }}</p>
        </div>
      </div>
    </div>

    <button
      ref="addBtnRef"
      type="button"
      @click="openAddModal"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-green-900/20 transition-all hover:bg-[#145218] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/40"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
      Tambah Aset Baru
    </button>

    <!-- Grid Aset Wakaf -->
    <div v-if="filteredWakaf.length" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in filteredWakaf"
        :key="item.id"
        class="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-lg hover:border-green-100 transition-all flex flex-col"
      >
        <!-- Card Image -->
        <div class="relative h-48 overflow-hidden bg-gray-100">
          <img :src="item.image" :alt="`Foto ${item.jenis_aset}`" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            <span
              class="text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm border border-white/20"
              :class="item.status === 'Aktif' ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'"
            >
              {{ item.status }}
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col">
          <h2 class="break-words text-[16px] font-bold leading-tight text-gray-900">{{ item.jenis_aset }}</h2>
          <div class="flex items-start gap-1.5 mt-2">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p class="break-words text-[12px] font-medium text-gray-500">{{ item.lokasi }}</p>
          </div>
          <div class="mt-4 mb-3 flex-1">
            <p class="text-[12px] text-gray-600 line-clamp-3 leading-relaxed">{{ item.keterangan }}</p>
          </div>

          <div class="flex items-center gap-1.5 mb-4">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p class="text-[11px] font-medium text-gray-400">Dicatat {{ formatTanggal(item.tanggal) }}</p>
          </div>

          <!-- Footer Nominal & Aksi -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nilai / Terkumpul</p>
              <p class="text-[14px] font-bold text-green-600">{{ formatRupiah(item.nominal) }}</p>
            </div>
            <div class="flex items-center gap-3 pr-1">
              <button
                type="button"
                @click="openEditModal(item, $event.currentTarget)"
                :aria-label="`Edit ${item.jenis_aset}`"
                class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30 rounded"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button
                type="button"
                @click="confirmDelete(item.id, $event.currentTarget)"
                :aria-label="`Hapus ${item.jenis_aset}`"
                class="text-red-500 hover:text-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="w-full rounded-[20px] border border-dashed border-gray-200 bg-gray-50 px-5 py-16 text-center" role="status">
      <svg class="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      <p class="text-[14px] font-semibold text-gray-500">Belum ada aset wakaf untuk <span class="text-[#1B5E20]">{{ activeAum }}</span></p>
      <p class="mt-1 text-[12px] text-gray-400">Klik tombol Tambah Aset Baru untuk mulai mendata.</p>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         Modal Form: Tambah / Edit Aset Wakaf
    ═════════════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm"
        @keydown.esc="closeModal"
      >
        <div
          class="bg-white w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'wakaf-modal-title'"
          tabindex="-1"
          @keydown.tab="trapFocus"
        >
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <h2 id="wakaf-modal-title" class="text-[16px] font-bold text-gray-800">
              {{ modalType === 'add' ? 'Tambah Aset Wakaf' : 'Edit Aset Wakaf' }}
            </h2>
            <button
              type="button"
              aria-label="Tutup modal"
              @click="closeModal"
              :disabled="isSubmitting"
              class="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-lg shadow-sm border border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form @submit.prevent="submitWakaf" class="p-5 overflow-y-auto space-y-4" novalidate>
            <p v-if="formError" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
              {{ formError }}
            </p>

            <!-- Kepemilikan Unit / AUM -->
            <div class="space-y-1.5">
              <label for="wakaf-aum" class="text-[12px] font-medium text-gray-600">Milik Unit / AUM</label>
              <div class="relative">
                <select
                  id="wakaf-aum"
                  ref="firstFieldRef"
                  v-model="form.aum"
                  required
                  class="w-full appearance-none pl-3.5 pr-10 py-2.5 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20]"
                >
                  <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
                </select>
                <svg class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <!-- Upload Area Dummy -->
            <div class="space-y-1.5">
              <span id="wakaf-foto-label" class="text-[12px] font-medium text-gray-600">Foto Aset Wakaf</span>
              <button
                type="button"
                aria-labelledby="wakaf-foto-label"
                @click="handlePhotoUpload"
                class="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 hover:border-[#1B5E20]/30 transition-colors relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
              >
                <img v-if="form.image" :src="form.image" alt="" class="absolute inset-0 w-full h-full object-cover opacity-30" />
                <svg class="w-6 h-6 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 <span class="relative z-10 text-[12px] font-semibold text-gray-500">{{ form.image ? 'Ubah Foto Contoh' : 'Gunakan Foto Contoh' }}</span>
              </button>
            </div>

            <div class="space-y-1.5">
              <label for="wakaf-jenis" class="text-[12px] font-medium text-gray-600">Nama / Jenis Aset</label>
              <input id="wakaf-jenis" type="text" v-model="form.jenis_aset" required placeholder="Contoh: Tanah Kosong 200m²" class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
            </div>

            <div class="space-y-1.5">
              <label for="wakaf-lokasi" class="text-[12px] font-medium text-gray-600">Lokasi Aset</label>
              <input id="wakaf-lokasi" type="text" v-model="form.lokasi" required placeholder="Contoh: Jl. Raya Berbah, Tegaltirto" class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
            </div>

            <div class="space-y-1.5">
              <label for="wakaf-tanggal" class="text-[12px] font-medium text-gray-600">Tanggal Pendataan</label>
              <input id="wakaf-tanggal" type="date" v-model="form.tanggal" :max="today" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label for="wakaf-status" class="text-[12px] font-medium text-gray-600">Status</label>
                <div class="relative">
                  <select id="wakaf-status" v-model="form.status" required class="w-full appearance-none py-2.5 pl-3.5 pr-10 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
                    <option value="Aktif">Aktif / Berjalan</option>
                    <option value="Proses">Dalam Proses Hukum</option>
                  </select>
                  <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div class="space-y-1.5">
                <label for="wakaf-nominal" class="text-[12px] font-medium text-gray-600">Nilai (Rp)</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400" aria-hidden="true">Rp</span>
                  <input id="wakaf-nominal" type="number" v-model="form.nominal" min="0" step="1" required placeholder="0" class="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
                </div>
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="wakaf-keterangan" class="text-[12px] font-medium text-gray-600">Keterangan / Deskripsi</label>
              <textarea id="wakaf-keterangan" v-model="form.keterangan" rows="3" placeholder="Informasi tambahan, tujuan wakaf, dsb..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 resize-none"></textarea>
            </div>

            <div class="pt-4 pb-2">
              <button type="submit" :disabled="isSubmitting" class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#124016] text-white shadow-md shadow-green-900/20 disabled:opacity-50">
                <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Wakaf' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════════════════════
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
          aria-labelledby="wakaf-delete-title"
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
              <h3 id="wakaf-delete-title" class="text-[15px] font-bold text-gray-800">Hapus Aset Wakaf Ini?</h3>
              <p class="text-[12px] text-gray-500 mt-1 leading-relaxed">
                <span v-if="deleteItemName" class="break-words font-semibold text-gray-600">{{ deleteItemName }}</span>
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
