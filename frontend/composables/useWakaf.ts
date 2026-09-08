// composables/useWakaf.ts
// Master composable wakaf. Berisi:
//   - Singleton data (shared state antar halaman)
//   - Normalisasi & validasi aset wakaf
//   - Persistence localStorage
//   - CRUD operations (tambah / edit / hapus)

import { ref } from 'vue'
import { AUM_LIST, normalizeAumName } from './useAum'

const STORAGE_KEY = 'pcm_berbah_wakaf_data'

// Status pengelolaan aset wakaf
export const WAKAF_STATUS = ['Aktif', 'Proses']

// Foto fallback jika aset tidak memiliki gambar (upload saat ini masih simulasi)
export const DEFAULT_WAKAF_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop'

const normalizeImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return DEFAULT_WAKAF_IMAGE

  const image = value.trim()
  if (image.startsWith('/')) return image

  try {
    return new URL(image).protocol === 'https:' ? image : DEFAULT_WAKAF_IMAGE
  } catch {
    return DEFAULT_WAKAF_IMAGE
  }
}

const normalizeWakaf = (item) => {
  if (!item || typeof item !== 'object') return null

  const id = String(item.id || '')
  const aum = normalizeAumName(item.aum)
  const jenisAset = typeof item.jenis_aset === 'string' ? item.jenis_aset.trim() : ''
  const lokasi = typeof item.lokasi === 'string' ? item.lokasi.trim() : ''
  const nominal = Number(item.nominal)
  const tanggal = String(item.tanggal || '')

  if (!id || !jenisAset || !lokasi) return null
  if (!WAKAF_STATUS.includes(item.status)) return null
  if (!Number.isFinite(nominal) || nominal < 0) return null
  if (!AUM_LIST.includes(aum)) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return null

  const [year, month, day] = tanggal.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

  return {
    id,
    aum,
    jenis_aset: jenisAset,
    lokasi,
    status: item.status,
    nominal,
    tanggal,
    image: normalizeImageUrl(item.image),
    keterangan: typeof item.keterangan === 'string' ? item.keterangan : '',
    diedit_oleh: typeof item.diedit_oleh === 'string' ? item.diedit_oleh : null,
    diedit_pada: typeof item.diedit_pada === 'string' ? item.diedit_pada : null,
  }
}

// ─── DATA AWAL ────────────────────────────────────────────────────────────────
// Unit mengikuti master AUM_LIST. Field `tanggal` adalah tanggal pendataan aset.

const INITIAL_DATA = [
  { id: '1', aum: 'PCM Berbah', jenis_aset: 'Tanah Kosong 200m²', lokasi: 'Jl. Raya Berbah, Tegaltirto', status: 'Aktif', nominal: 5000000, tanggal: '2026-05-12', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', keterangan: 'Rencana pembangunan panti asuhan anak yatim piatu cabang Berbah.', diedit_oleh: null, diedit_pada: null },
  { id: '2', aum: 'PCM Berbah', jenis_aset: 'Gedung Serbaguna', lokasi: 'Kalitirto, Berbah', status: 'Proses', nominal: 25000000, tanggal: '2026-07-03', image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&h=400&fit=crop', keterangan: 'Sedang dalam proses penyelesaian administrasi balik nama sertifikat wakaf di BPN.', diedit_oleh: null, diedit_pada: null },
  { id: '3', aum: 'PCM Berbah', jenis_aset: 'Ambulans Umat', lokasi: 'PKU Muhammadiyah Berbah', status: 'Aktif', nominal: 120000000, tanggal: '2026-02-18', image: 'https://images.unsplash.com/photo-1588775005506-cc9c8491cbb1?w=600&h=400&fit=crop', keterangan: 'Kendaraan operasional untuk layanan kesehatan gratis bagi dhuafa.', diedit_oleh: null, diedit_pada: null },
  { id: '4', aum: 'SD Muhammadiyah Karangharjo', jenis_aset: 'Ruang Kelas Permanen', lokasi: 'Berbah, Sleman', status: 'Aktif', nominal: 80000000, tanggal: '2025-11-24', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop', keterangan: 'Ruang kelas hasil wakaf wali murid angkatan 2015 untuk keperluan KBM.', diedit_oleh: null, diedit_pada: null },
  { id: '5', aum: 'SMK Muhammadiyah Berbah', jenis_aset: 'Peralatan Bengkel Las', lokasi: 'SMK Muhammadiyah Berbah', status: 'Aktif', nominal: 35000000, tanggal: '2026-01-09', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', keterangan: 'Seperangkat alat las untuk praktik jurusan Teknik Mesin.', diedit_oleh: null, diedit_pada: null },
]

const getInitialData = () => INITIAL_DATA.map(normalizeWakaf).filter(Boolean)

const loadStoredData = () => {
  if (!import.meta.client) return getInitialData()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getInitialData()

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return getInitialData()

    const normalized = parsed.map(normalizeWakaf).filter(Boolean)
    return normalized.length || parsed.length === 0 ? normalized : getInitialData()
  } catch {
    return getInitialData()
  }
}

const persistData = () => {
  if (!import.meta.client) return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(_data.value))
}

const _data = ref(loadStoredData())

// ─── COMPOSABLE EXPORT ────────────────────────────────────────────────────────

export const useWakaf = () => {

  const getByAum = (aum) => _data.value.filter(w => w.aum === normalizeAumName(aum))

  // Tambah aset wakaf baru (hanya Superadmin)
  const tambahWakaf = (w) => {
    const normalized = normalizeWakaf({
      ...w,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      diedit_oleh: null,
      diedit_pada: null,
    })
    if (!normalized) return false

    const previous = [..._data.value]
    try {
      _data.value.unshift(normalized)
      persistData()
      return true
    } catch {
      _data.value = previous
      return false
    }
  }

  // Edit aset wakaf (hanya Superadmin)
  const editWakaf = (id, updates, editedBy) => {
    const idx = _data.value.findIndex(w => w.id === id)
    if (idx === -1) return false

    const previous = { ..._data.value[idx] }
    const normalized = normalizeWakaf({
      ...previous,
      ...updates,
      id: previous.id,
      diedit_oleh: editedBy,
      diedit_pada: new Date().toISOString(),
    })
    if (!normalized) return false

    try {
      _data.value[idx] = normalized
      persistData()
      return true
    } catch {
      _data.value[idx] = previous
      return false
    }
  }

  // Hapus aset wakaf (hanya Superadmin)
  const hapusWakaf = (id) => {
    const idx = _data.value.findIndex(w => w.id === id)
    if (idx === -1) return false

    const deleted = _data.value[idx]
    try {
      _data.value.splice(idx, 1)
      persistData()
      return true
    } catch {
      _data.value.splice(idx, 0, deleted)
      return false
    }
  }

  return {
    wakafData: _data,
    getByAum,
    tambahWakaf,
    editWakaf,
    hapusWakaf,
  }
}
