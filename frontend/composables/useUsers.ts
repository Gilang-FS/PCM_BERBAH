// composables/useUsers.ts
// Master composable pengguna (akun login mock). Berisi:
//   - Seed dari konfigurasi env (NUXT_PUBLIC_USERS) sebagai data awal
//   - Persistence localStorage agar CRUD dari UI terpakai oleh alur login
//   - Proteksi superadmin inti & backup:
//     * Superadmin PERTAMA di env = akun inti: tidak dapat diedit/dihapus siapa pun lewat UI.
//     * Superadmin backup hanya dapat dikelola (edit/hapus) oleh superadmin inti.
//     * UI hanya dapat membuat akun ber-role 'admin'.
//   - CRUD operations dengan try/catch + rollback + return boolean

import { ref, computed } from 'vue'
import { AUM_LIST, normalizeAumName } from './useAum'

const STORAGE_KEY = 'pcm_berbah_users_data'

export const USER_ROLES = ['admin', 'superadmin']

export const MIN_PASSWORD_LENGTH = 6

const normalizeUser = (item) => {
  if (!item || typeof item !== 'object') return null

  const id = String(item.id || '')
  const username = typeof item.username === 'string' ? item.username.trim() : ''
  const password = typeof item.password === 'string' ? item.password : ''

  if (!id || !username || !password) return null
  if (!USER_ROLES.includes(item.role)) return null

  const aum = normalizeAumName(typeof item.aum === 'string' ? item.aum.trim() : '')
  if (item.role === 'admin' && !AUM_LIST.includes(aum)) return null

  return {
    id,
    username,
    role: item.role,
    aum: item.role === 'admin' ? aum : '',
    password,
  }
}

const parseEnvUsers = (usersRaw) => {
  if (!usersRaw || typeof usersRaw !== 'string') return []

  return usersRaw
    .split('|')
    .map((userStr, index) => {
      const [username, role, aum, password] = userStr.split(':')
      return normalizeUser({
        id: String(index + 1),
        username: username || '',
        role: role || '',
        aum: aum || '',
        password: password || '',
      })
    })
    .filter(Boolean)
}

// ─── STATE MODULE-LEVEL (singleton, pola sama dengan useKeuangan/useWakaf) ──
// _data null = belum dimuat (SSR tidak pernah menulis state module agar aman
// antar-request; SSR selalu memakai seed dari env).

let _seed = []
let _coreUsername = null
let _seedInitialized = false
const _data = ref(null)

const markCoreUser = (list) => list.map(user => ({
  ...user,
  is_core: Boolean(_coreUsername && user.username === _coreUsername && user.role === 'superadmin'),
}))

// Pastikan akun inti selalu ada & tetap superadmin (anti tamper localStorage).
// Password inti TIDAK ditimpa dari env bila sudah ada (bisa diubah via Profil).
const enforceCore = (list) => {
  if (!_coreUsername) return list

  const coreInList = list.find(u => u.username === _coreUsername && u.role === 'superadmin')
  if (coreInList) return list

  const coreFromSeed = _seed.find(u => u.username === _coreUsername)
  if (!coreFromSeed) return list

  return [coreFromSeed, ...list.filter(u => u.username !== _coreUsername)]
}

const loadStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    const normalized = parsed.map(normalizeUser).filter(Boolean)
    return normalized.length ? normalized : null
  } catch {
    return null
  }
}

const persistData = () => {
  if (!import.meta.client || !_data.value) return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(_data.value))
}

// ─── COMPOSABLE EXPORT ────────────────────────────────────────────────────────

export const useUsers = () => {
  const config = useRuntimeConfig()

  if (!_seedInitialized) {
    const parsedSeed = parseEnvUsers(config.public.users)
    _coreUsername = parsedSeed.find(u => u.role === 'superadmin')?.username ?? null
    _seed = markCoreUser(parsedSeed)
    _seedInitialized = true
  }

  if (import.meta.client && !_data.value) {
    _data.value = markCoreUser(enforceCore(loadStoredData() ?? [..._seed]))
  }

  const usersData = computed(() => _data.value ?? _seed)

  const coreUsername = _coreUsername

  const isCoreUser = (user) =>
    Boolean(user && coreUsername && user.username === coreUsername && user.role === 'superadmin')

  const isCoreSuperadmin = (username) => Boolean(username && username === coreUsername)

  const getUserByUsername = (username) =>
    usersData.value.find(u => u.username === username) ?? null

  // Aturan pengelolaan antar akun (dipakai UI & ditegakkan ulang di CRUD):
  //   - Akun inti tidak dapat dikelola siapa pun lewat halaman Pengguna.
  //   - Superadmin backup hanya dapat dikelola oleh superadmin inti.
  //   - Akun admin dapat dikelola oleh superadmin mana pun.
  //   - Tidak ada yang dapat mengelola akunnya sendiri di halaman ini
  //     (password sendiri diubah lewat halaman Profil).
  const canManageUser = (actorUsername, target) => {
    if (!actorUsername || !target) return false

    const actor = getUserByUsername(actorUsername)
    if (!actor || actor.role !== 'superadmin') return false
    if (target.username === actorUsername) return false
    if (isCoreUser(target)) return false
    if (target.role === 'superadmin') return isCoreUser(actor)
    return true
  }

  const isUsernameTaken = (username, exceptId = null) =>
    usersData.value.some(u =>
      u.username.toLowerCase() === String(username).toLowerCase() && u.id !== exceptId
    )

  // Tambah akun — role dipaksa 'admin' (superadmin hanya lewat konfigurasi env)
  const tambahUser = (payload, actorUsername) => {
    if (!import.meta.client || !_data.value) return false

    const actor = getUserByUsername(actorUsername)
    if (!actor || actor.role !== 'superadmin') return false

    const normalized = normalizeUser({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: typeof payload?.username === 'string' ? payload.username : '',
      role: 'admin',
      aum: typeof payload?.aum === 'string' ? payload.aum : '',
      password: typeof payload?.password === 'string' ? payload.password : '',
    })
    if (!normalized) return false
    if (normalized.password.length < MIN_PASSWORD_LENGTH) return false
    if (isUsernameTaken(normalized.username)) return false

    const previous = [..._data.value]
    try {
      _data.value.push(normalized)
      persistData()
      return true
    } catch {
      _data.value = previous
      return false
    }
  }

  // Edit akun — role tidak pernah berubah; superadmin tanpa AUM
  const editUser = (id, updates, actorUsername) => {
    if (!import.meta.client || !_data.value) return false

    const idx = _data.value.findIndex(u => u.id === id)
    if (idx === -1) return false

    const target = _data.value[idx]
    if (!canManageUser(actorUsername, target)) return false

    const username = typeof updates?.username === 'string' ? updates.username.trim() : ''
    if (!username) return false
    if (isUsernameTaken(username, target.id)) return false

    const next = { ...target, username }

    if (target.role === 'admin') {
      const aum = typeof updates?.aum === 'string' ? updates.aum.trim() : ''
      if (!AUM_LIST.includes(aum)) return false
      next.aum = aum
    }

    const password = typeof updates?.password === 'string' ? updates.password : ''
    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) return false
      next.password = password
    }

    const previous = _data.value[idx]
    try {
      _data.value[idx] = next
      persistData()
      return true
    } catch {
      _data.value[idx] = previous
      return false
    }
  }

  // Hapus akun — aturan sama dengan edit (inti tidak pernah bisa dihapus)
  const hapusUser = (id, actorUsername) => {
    if (!import.meta.client || !_data.value) return false

    const idx = _data.value.findIndex(u => u.id === id)
    if (idx === -1) return false

    const target = _data.value[idx]
    if (!canManageUser(actorUsername, target)) return false

    const previous = [..._data.value]
    try {
      _data.value.splice(idx, 1)
      persistData()
      return true
    } catch {
      _data.value = previous
      return false
    }
  }

  // Ganti password akun sendiri (dipakai halaman Profil) — wajib verifikasi
  // password lama. Return boolean.
  const gantiPassword = (username, currentPassword, newPassword) => {
    if (!import.meta.client || !_data.value) return false

    const idx = _data.value.findIndex(u => u.username === username)
    if (idx === -1) return false

    const target = _data.value[idx]
    if (target.password !== currentPassword) return false
    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) return false

    const previous = { ...target }
    try {
      _data.value[idx] = { ...target, password: newPassword }
      persistData()
      return true
    } catch {
      _data.value[idx] = previous
      return false
    }
  }

  return {
    usersData,
    coreUsername,
    isCoreUser,
    isCoreSuperadmin,
    canManageUser,
    getUserByUsername,
    isUsernameTaken,
    tambahUser,
    editUser,
    hapusUser,
    gantiPassword,
    ubahPasswordSendiri: gantiPassword,
  }
}
