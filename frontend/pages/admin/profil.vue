<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const router = useRouter()
const { username, userRole, logout } = useAuth()

// ─── Data User yang Login ───────────────────────────────────────────────────
const loggedInUsername = ref('')
const loggedInRole = ref('')

// Ambil data users global
const { usersData, ubahPasswordSendiri } = useUsers()

onMounted(() => {
  loggedInUsername.value = username.value || ''
  loggedInRole.value = userRole.value || ''
})

// ─── Form Ganti Password ───────────────────────────────────────────────────
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const formErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// ─── Toggle show/hide password ─────────────────────────────────────────────
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)

// ─── State Modal Logout Otomatis ───────────────────────────────────────────
const isSubmitting = ref(false)
const isAutoLogoutOpen = ref(false)
const currentPasswordInput = ref(null)
const newPasswordInput = ref(null)
const confirmPasswordInput = ref(null)
const autoLogoutDialog = ref(null)
let logoutTimer = null

const logoutAndRedirect = () => {
  if (logoutTimer) clearTimeout(logoutTimer)
  logoutTimer = null
  logout()
  router.replace({ path: '/login' })
}

const containAutoLogoutFocus = (event) => {
  if (event.key !== 'Tab') return
  event.preventDefault()
  autoLogoutDialog.value?.focus()
}

watch(isAutoLogoutOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  if (logoutTimer) clearTimeout(logoutTimer)
})

const resetForm = () => {
  form.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  formErrors.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmNewPassword.value = false
}

const handleChangePassword = async () => {
  // Reset
  formErrors.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  let hasError = false

  const currentUser = usersData.value.find(u => u.username === loggedInUsername.value)

  // Validasi 1: Password saat ini wajib diisi
  if (!form.value.currentPassword) {
    formErrors.value.currentPassword = 'Password saat ini wajib diisi.'
    hasError = true
  } else if (currentUser && form.value.currentPassword !== currentUser.password) {
    // Nanti diganti bcrypt.compare di backend
    formErrors.value.currentPassword = 'Password saat ini salah.'
    hasError = true
  }

  // Validasi 2: Password baru wajib diisi
  if (!form.value.newPassword) {
    formErrors.value.newPassword = 'Password baru wajib diisi.'
    hasError = true
  } else if (form.value.newPassword.length < 6) {
    formErrors.value.newPassword = 'Password minimal 6 karakter.'
    hasError = true
  }

  // Validasi 3: Konfirmasi password harus cocok
  if (form.value.newPassword !== form.value.confirmNewPassword) {
    formErrors.value.confirmNewPassword = 'Password tidak cocok, periksa kembali.'
    hasError = true
  }

  // Validasi 4: Password baru tidak boleh sama dengan password lama
  if (form.value.newPassword && form.value.newPassword === form.value.currentPassword) {
    formErrors.value.newPassword = 'Password baru tidak boleh sama dengan password saat ini.'
    hasError = true
  }

  if (hasError) {
    await nextTick()
    const firstInvalid = formErrors.value.currentPassword
      ? currentPasswordInput.value
      : formErrors.value.newPassword
        ? newPasswordInput.value
        : confirmPasswordInput.value
    firstInvalid?.focus()
    return
  }

  // Simpan password baru lewat store (terpersist ke localStorage).
  // Ini satu-satunya jalan mengubah password akun inti.
  const saved = ubahPasswordSendiri(loggedInUsername.value, form.value.currentPassword, form.value.newPassword)
  if (!saved) {
    formErrors.value.currentPassword = 'Gagal menyimpan password baru. Coba lagi.'
    return
  }

  // Simulasi submit
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 500))
  isSubmitting.value = false

  // Tampilkan modal logout otomatis
  isAutoLogoutOpen.value = true
  resetForm()
  await nextTick()
  autoLogoutDialog.value?.focus()

  // Simulasi: setelah 2.5 detik, logout otomatis (invalidate session)
  logoutTimer = setTimeout(() => {
    logoutAndRedirect()
  }, 2500)
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-5">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-[26px] font-bold tracking-tight text-gray-900">Profil Saya</h1>
    </div>

    <!-- Info Akun -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-[#1B5E20] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
          {{ loggedInUsername.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="break-words text-[15px] font-bold text-gray-800">@{{ loggedInUsername }}</p>
          <span
            class="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-1"
            :class="loggedInRole === 'superadmin' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
          >
            {{ loggedInRole === 'superadmin' ? 'Superadmin' : 'Admin' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Form Ganti Password -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 class="text-[15px] font-bold text-gray-800">Ganti Password</h2>
        <p class="text-[11px] text-gray-400 mt-0.5">Anda akan diminta login ulang setelah password berhasil diubah.</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="p-5 space-y-4">

        <!-- Password Saat Ini -->
        <div class="space-y-1">
          <label for="current-password" class="text-[12px] font-semibold text-gray-600">Password Saat Ini</label>
          <div class="relative">
            <input
              id="current-password"
              ref="currentPasswordInput"
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="form.currentPassword"
              required
              placeholder="Masukkan password saat ini"
              class="w-full p-2.5 pr-10 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
              :class="formErrors.currentPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'"
              :aria-invalid="Boolean(formErrors.currentPassword)"
              :aria-describedby="formErrors.currentPassword ? 'current-password-error' : undefined"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showCurrentPassword ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'"
              :aria-pressed="showCurrentPassword"
            >
              <svg v-if="!showCurrentPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="formErrors.currentPassword" id="current-password-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ formErrors.currentPassword }}
          </p>
        </div>

        <div class="border-t border-gray-100"></div>

        <!-- Password Baru -->
        <div class="space-y-1">
          <label for="new-password" class="text-[12px] font-semibold text-gray-600">Password Baru</label>
          <div class="relative">
            <input
              id="new-password"
              ref="newPasswordInput"
              :type="showNewPassword ? 'text' : 'password'"
              v-model="form.newPassword"
              required
              placeholder="Minimal 6 karakter"
              class="w-full p-2.5 pr-10 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
              :class="formErrors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'"
              :aria-invalid="Boolean(formErrors.newPassword)"
              :aria-describedby="formErrors.newPassword ? 'new-password-error' : undefined"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showNewPassword ? 'Sembunyikan password baru' : 'Tampilkan password baru'"
              :aria-pressed="showNewPassword"
            >
              <svg v-if="!showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="formErrors.newPassword" id="new-password-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ formErrors.newPassword }}
          </p>
        </div>

        <!-- Ulangi Password Baru -->
        <div class="space-y-1">
          <label for="confirm-new-password" class="text-[12px] font-semibold text-gray-600">Ulangi Password Baru</label>
          <div class="relative">
            <input
              id="confirm-new-password"
              ref="confirmPasswordInput"
              :type="showConfirmNewPassword ? 'text' : 'password'"
              v-model="form.confirmNewPassword"
              required
              placeholder="••••••••"
              class="w-full p-2.5 pr-10 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
              :class="formErrors.confirmNewPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'"
              :aria-invalid="Boolean(formErrors.confirmNewPassword)"
              :aria-describedby="formErrors.confirmNewPassword ? 'confirm-new-password-error' : undefined"
            />
            <button
              type="button"
              @click="showConfirmNewPassword = !showConfirmNewPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="showConfirmNewPassword ? 'Sembunyikan konfirmasi password baru' : 'Tampilkan konfirmasi password baru'"
              :aria-pressed="showConfirmNewPassword"
            >
              <svg v-if="!showConfirmNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="formErrors.confirmNewPassword" id="confirm-new-password-error" role="alert" class="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ formErrors.confirmNewPassword }}
          </p>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isSubmitting ? 'Menyimpan...' : 'Ubah Password' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         Modal Auto-Logout (Pasca Ganti Password)
    ═════════════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="isAutoLogoutOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div ref="autoLogoutDialog" class="relative bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden animate-in zoom-in-95 duration-300" role="dialog" aria-modal="true" aria-labelledby="auto-logout-title" aria-describedby="auto-logout-description" tabindex="-1" @keydown="containAutoLogoutFocus">
          <div class="p-6 text-center">
            <!-- Icon Success -->
            <div class="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 id="auto-logout-title" class="text-[17px] font-bold text-gray-800 mb-2">
              Password Berhasil Diubah!
            </h3>
            <p id="auto-logout-description" class="text-[13px] text-gray-500 leading-relaxed mb-6">
              Silakan login ulang dengan password baru Anda. Mengalihkan dalam beberapa detik...
            </p>

            <button type="button" class="w-full rounded-xl bg-[#1B5E20] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#145218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2" @click="logoutAndRedirect">Login kembali sekarang</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
