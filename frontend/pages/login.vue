<template>
  <main class="login-page min-h-screen bg-white font-publicSans text-[#252b28]">
    <div class="grid min-h-screen w-full bg-white lg:grid-cols-2">
      <section class="brand-panel relative isolate flex min-h-[250px] overflow-hidden bg-[#1B5E20] text-white sm:min-h-[320px] lg:min-h-0">
        <div class="absolute inset-0 -z-30 bg-[linear-gradient(145deg,#0c6b48_0%,#145c32_48%,#0d4527_100%)]"></div>
        <div class="brand-grid absolute inset-0 -z-20"></div>
        <div class="absolute -left-32 -top-36 -z-10 h-[30rem] w-[30rem] rounded-full border border-white/[0.07]"></div>
        <div class="absolute -left-20 -top-24 -z-10 h-[22rem] w-[22rem] rounded-full border border-white/[0.06]"></div>
        <div class="absolute -bottom-52 -right-48 -z-10 h-[34rem] w-[34rem] rounded-full bg-white/[0.035]"></div>
        <div class="absolute bottom-0 left-0 right-0 -z-10 h-px bg-white/15"></div>

        <div class="flex w-full items-center justify-center px-6 py-6 text-center sm:px-12 sm:py-10 lg:px-16">
          <div class="flex max-w-[430px] flex-col items-center">
            <img src="/images/logos/logo-muhammadiyah-white.png" alt="Logo Muhammadiyah" class="h-16 w-16 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
            <p class="mt-2.5 text-[13px] font-bold uppercase tracking-[0.12em] sm:mt-4 sm:text-[15px]">PCM Berbah</p>
            <p class="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-white/70 sm:mt-1 sm:text-[10px]">Portal Pengurus</p>

            <span class="my-3 h-px w-10 bg-white/50 sm:my-6 sm:w-12"></span>

            <h1 class="font-serif text-[28px] font-semibold leading-tight sm:text-[40px] lg:text-[46px]">Selamat datang</h1>
            <p class="mt-1.5 max-w-[310px] text-[11px] leading-5 text-white/85 sm:mt-3 sm:max-w-[380px] sm:text-[14px] sm:leading-6 lg:text-[15px]">
              Kelola informasi organisasi, keuangan, dan aset wakaf dalam satu ruang kerja.
            </p>
          </div>
        </div>
      </section>

      <section class="relative flex min-h-[620px] bg-[#fffefc] px-6 py-12 sm:px-12 lg:min-h-screen lg:px-16 xl:px-24">
        <NuxtLink to="/" class="group absolute left-6 top-6 inline-flex items-center gap-2 text-[11px] font-medium text-[#8a918c] transition-colors hover:text-[#1B5E20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] sm:left-8 sm:top-8">
          <svg class="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 12H5m5 5l-5-5 5-5" />
          </svg>
          Kembali ke situs publik
        </NuxtLink>

          <div class="mx-auto my-auto w-full max-w-[390px] pt-8">
            <div class="text-center">
              <h2 class="text-[32px] font-extrabold leading-[1.15] tracking-[-0.01em] text-[#252b28] sm:text-[36px]">Masuk</h2>
            </div>

          <form class="mt-9 space-y-4" novalidate @submit.prevent="handleLogin">
            <div>
              <label for="username" class="sr-only">Username</label>
              <div class="field-shell" :class="{ 'field-shell--error': fieldErrors.username }">
                <svg class="h-[18px] w-[18px] shrink-0 text-[#879189]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M20 21a8 8 0 00-16 0m8-10a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                <input
                  id="username"
                  ref="usernameInput"
                  v-model="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  autocapitalize="none"
                  spellcheck="false"
                  placeholder="Username"
                  class="min-w-0 flex-1 bg-transparent text-sm text-[#252b28] outline-none placeholder:text-[#a7ada9]"
                  :aria-invalid="Boolean(fieldErrors.username)"
                  :aria-describedby="fieldErrors.username ? 'username-error' : undefined"
                  @input="clearFieldError('username')"
                  @blur="validateField('username')"
                />
              </div>
              <p id="username-error" class="mt-1.5 min-h-[18px] text-[11px] font-medium leading-[18px] text-red-600" aria-live="polite">{{ fieldErrors.username }}</p>
            </div>

            <div>
              <label for="password" class="sr-only">Password</label>
              <div class="field-shell" :class="{ 'field-shell--error': fieldErrors.password }">
                <svg class="h-[18px] w-[18px] shrink-0 text-[#879189]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M7 10V8a5 5 0 0110 0v2m-11 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                </svg>
                <input
                  id="password"
                  ref="passwordInput"
                  v-model="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Password"
                  class="min-w-0 flex-1 bg-transparent text-sm text-[#252b28] outline-none placeholder:text-[#a7ada9]"
                  :aria-invalid="Boolean(fieldErrors.password)"
                  :aria-describedby="fieldErrors.password ? 'password-error' : undefined"
                  @input="clearFieldError('password')"
                  @blur="validateField('password')"
                />
                <button
                  type="button"
                  class="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-[#7c867e] transition hover:bg-[#f0f1ed] hover:text-[#1B5E20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                    <circle cx="12" cy="12" r="2.5" stroke-width="1.7" />
                  </svg>
                  <svg v-else class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3 3l18 18M10.6 6.2A10.6 10.6 0 0112 6c6 0 9.5 6 9.5 6a16.8 16.8 0 01-2.2 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a9.7 9.7 0 003.2-.5M9.9 9.9a3 3 0 004.2 4.2" />
                  </svg>
                </button>
              </div>
              <p id="password-error" class="mt-1.5 min-h-[18px] text-[11px] font-medium leading-[18px] text-red-600" aria-live="polite">{{ fieldErrors.password }}</p>
            </div>

            <div class="flex items-center justify-between gap-4 pt-1">
              <label class="group flex cursor-pointer select-none items-center gap-2.5 text-[12px] text-[#667068]">
                <input v-model="remember" type="checkbox" class="peer sr-only" />
                <span class="flex h-[18px] w-[18px] items-center justify-center border border-[#c4c9c5] bg-white transition group-hover:border-[#7da180] peer-checked:border-[#1B5E20] peer-checked:bg-[#1B5E20] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1B5E20]/30 peer-focus-visible:ring-offset-2">
                  <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                Ingat saya
              </label>
              <button
                type="button"
                class="text-[12px] font-bold text-[#1B5E20] transition hover:text-[#145218] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
                :aria-expanded="showHelp"
                aria-controls="login-help"
                @click="showHelp = !showHelp"
              >
                Butuh bantuan?
              </button>
            </div>

            <div class="min-h-[82px]">
              <Transition name="message" mode="out-in">
                <div v-if="showHelp" id="login-help" key="login-help" class="feedback-panel flex gap-3 border border-[#d8dfd5] bg-[#f4f6f1] px-4 py-3.5 text-[11px] leading-5 text-[#5e6961]">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#1b6a3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 17h.01M9.1 9a3 3 0 115.4 1.8c-.9 1.2-2.5 1.5-2.5 3.2M12 22a10 10 0 100-20 10 10 0 000 20z" />
                  </svg>
                  <p>Hubungi Superadmin PCM Berbah untuk aktivasi akun atau pengaturan ulang password.</p>
                </div>

                <div v-else-if="errorMessage" id="login-error" key="login-error" role="alert" aria-live="assertive" class="feedback-panel flex items-start gap-3 rounded-[5px] border border-red-200 bg-red-50 px-4 py-3.5 text-[12px] leading-5 text-red-700">
                  <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v4m0 4h.01M10.3 3.8L2.4 17.5A2 2 0 004.1 20h15.8a2 2 0 001.7-2.5L13.7 3.8a2 2 0 00-3.4 0z" />
                  </svg>
                  <p>{{ errorMessage }}</p>
                </div>

                <div v-else-if="rateLimitMessage" id="rate-limit-error" key="rate-limit-error" role="alert" aria-live="assertive" class="feedback-panel flex items-start gap-3 rounded-[5px] border border-orange-200 bg-orange-50 px-4 py-3.5 text-[12px] leading-5 text-orange-700">
                  <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{{ rateLimitMessage }}</p>
                </div>

              </Transition>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="group mx-auto flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-[5px] bg-[#1B5E20] px-7 py-3 text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(27,94,32,0.2)] transition duration-200 hover:bg-[#145218] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-3 disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto sm:min-w-[150px]"
            >
              <svg v-if="isLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
                <path class="opacity-80" fill="currentColor" d="M12 3a9 9 0 00-9 9h3a6 6 0 016-6V3z" />
              </svg>
              <span>{{ isLoading ? 'Memeriksa...' : 'Masuk' }}</span>
            </button>
          </form>

          <div class="mt-10 flex items-center justify-center gap-2 border-t border-[#e1e3e0] pt-6 text-center text-[11px] leading-5 text-[#858c87]">
            <svg class="h-4 w-4 shrink-0 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10zM9 12l2 2 4-4" />
            </svg>
            <p>Akses khusus pengurus terdaftar.</p>
          </div>

          <p class="mt-8 text-center text-[9px] uppercase tracking-[0.13em] text-[#b0b5b1]">
            &copy; {{ currentYear }} Pimpinan Cabang Muhammadiyah Berbah
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: false, middleware: ['guest'] })

useHead({
  title: 'Masuk ke Portal | PCM Berbah',
  meta: [
    { name: 'description', content: 'Masuk ke Sistem Informasi Terpadu Pimpinan Cabang Muhammadiyah Berbah.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const router = useRouter()
const route = useRoute()
const { login } = useAuth()
const { success } = useToast()

const usernameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const username = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const showHelp = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const fieldErrors = reactive({ username: '', password: '' })
const currentYear = new Date().getFullYear()
const rateLimitMessage = ref('')

onMounted(() => {
  usernameInput.value?.focus()
})

const clearFieldError = (field: 'username' | 'password') => {
  errorMessage.value = ''
  rateLimitMessage.value = ''

  if (fieldErrors[field]) validateField(field)
}

const validateField = (field: 'username' | 'password') => {
  if (field === 'username') {
    fieldErrors.username = username.value.trim() ? '' : 'Username wajib diisi.'
    return !fieldErrors.username
  }

  if (!password.value) {
    fieldErrors.password = 'Password wajib diisi.'
  } else {
    fieldErrors.password = ''
  }

  return !fieldErrors.password
}

const validateForm = () => {
  const isUsernameValid = validateField('username')
  const isPasswordValid = validateField('password')

  return isUsernameValid && isPasswordValid
}

const handleLogin = async () => {
  if (isLoading.value) return

  errorMessage.value = ''
  rateLimitMessage.value = ''

  if (!validateForm()) {
    await nextTick()
    const firstInvalidInput = fieldErrors.username ? usernameInput.value : passwordInput.value
    firstInvalidInput?.focus()
    return
  }

  isLoading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 650))

    await login(username.value.trim(), password.value, remember.value)

    success('Login berhasil! Mengarahkan ke dashboard...')
    await router.replace(getSafeRedirect())
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('terkunci')) {
      rateLimitMessage.value = message
      showHelp.value = false
    } else {
      errorMessage.value = message === 'Username atau password salah'
        ? 'Username atau password salah. Silakan periksa kembali.'
        : 'Login belum dapat diproses. Silakan coba kembali beberapa saat lagi.'
    }
    password.value = ''
    await nextTick()
    passwordInput.value?.focus()
  } finally {
    isLoading.value = false
  }
}

const getSafeRedirect = () => {
  const redirect = Array.isArray(route.query.redirect)
    ? route.query.redirect[0]
    : route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/admin/dashboard'
}
</script>

<style scoped>
.brand-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(135deg, black, transparent 78%);
  -webkit-mask-image: linear-gradient(135deg, black, transparent 78%);
}

.field-shell {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #d8dcd7;
  border-radius: 5px;
  background: #fff;
  padding: 0.625rem 0.875rem;
  box-shadow: 0 1px 2px rgba(23, 35, 27, 0.025);
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.field-shell:hover {
  border-color: #aeb8af;
}

.field-shell:focus-within {
  border-color: #1b5e20;
  box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.1);
}

.field-shell--error {
  border-color: #ef9a9a;
  background: #fffdfd;
}

.field-shell--error:focus-within {
  border-color: #dc6262;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

.message-enter-active,
.message-leave-active {
  transform-origin: top center;
}

.message-enter-active {
  transition:
    opacity 240ms ease-out,
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 300ms ease-out;
}

.message-leave-active {
  transition:
    opacity 140ms ease-in,
    transform 160ms ease-in;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

.message-enter-to {
  box-shadow: 0 8px 22px rgba(27, 94, 32, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .login-page *,
  .login-page *::before,
  .login-page *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
