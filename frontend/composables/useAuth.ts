import { useStorage } from '@vueuse/core'
import { useUsers } from './useUsers'
import { AUM_LIST, normalizeAumName } from './useAum'

export type UserRole = 'admin' | 'superadmin'

export const useAuth = () => {
  const token = useStorage<string | null>('auth_token', null)
  const refreshToken = useStorage<string | null>('auth_refreshToken', null)
  const userRole = useStorage<UserRole | null>('auth_role', null)
  const username = useStorage<string | null>('auth_username', null)
  const userAum = useStorage<string | null>('auth_aum', null)
  const rememberMe = useStorage<boolean>('auth_remember', false)
  const loginAttempts = useStorage<number>('auth_login_attempts', 0)
  const lastAttemptTime = useStorage<number>('auth_last_attempt', 0)
  const lockedUntil = useStorage<number>('auth_locked_until', 0)
  const isLocked = computed(() => lockedUntil.value > Date.now())

  if (import.meta.client && userAum.value) {
    const normalizedAum = normalizeAumName(userAum.value)
    if (AUM_LIST.includes(normalizedAum)) userAum.value = normalizedAum
  }

  const login = async (usernameInput: string, password: string, remember: boolean) => {
    if (lockedUntil.value > Date.now()) {
      throw new Error('Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.')
    }

    if (lockedUntil.value) {
      lockedUntil.value = 0
      loginAttempts.value = 0
    }

    // Baca pengguna dari store terpusat:
    // seed awal dari NUXT_PUBLIC_USERS, perubahan CRUD dipersist di localStorage.
    const { usersData } = useUsers()

    const user = usersData.value.find(u => u.username === usernameInput && u.password === password)

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      handleFailedAttempt()

      if (loginAttempts.value >= 5) {
        lockedUntil.value = Date.now() + 15 * 60 * 1000
        throw new Error('Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.')
      }

      throw new Error('Username atau password salah')
    }

    token.value = generateToken()
    refreshToken.value = generateToken()
    userRole.value = user.role
    username.value = user.username
    userAum.value = user.role === 'admin' ? user.aum : null
    rememberMe.value = remember

    loginAttempts.value = 0
    lastAttemptTime.value = 0
    lockedUntil.value = 0

    return { user, token: token.value }
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    userRole.value = null
    username.value = null
    userAum.value = null
    rememberMe.value = false
    loginAttempts.value = 0
    lastAttemptTime.value = 0
    lockedUntil.value = 0

  }

  const generateToken = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleFailedAttempt = () => {
    if (Date.now() - lastAttemptTime.value > 5 * 60 * 1000) {
      loginAttempts.value = 0
    }

    loginAttempts.value++
    lastAttemptTime.value = Date.now()
  }

  const isAuthenticated = computed(() => !!token.value && !!userRole.value)

  return {
    login,
    logout,
    token,
    refreshToken,
    userRole,
    username,
    userAum,
    rememberMe,
    isAuthenticated,
    isLocked,
    loginAttempts
  }
}
