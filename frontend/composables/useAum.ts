// composables/useAum.ts
// Single source of truth untuk PCM Berbah + 11 AUM.
// Dipakai di: dashboard.vue, keuangan.vue, dan semua halaman yang butuh daftar unit.

import { ref } from 'vue'

export const AUM_LIST = [
  'PCM Berbah',
  'SD Muhammadiyah Karangharjo',
  'SD Muhammadiyah Pajangan 1',
  'SD Muhammadiyah Pajangan 2',
  'SD Muhammadiyah Noyokerten',
  'SD Muhammadiyah Semoya',
  'SD Muhammadiyah Bulu',
  'SMP Muhammadiyah 1 Berbah',
  'SMK Muhammadiyah Berbah',
  'Klinik PKU Muhammadiyah Berbah',
  'Lazismu Berbah',
  'Masjid',
]

const LEGACY_AUM_MAP = {
  'PCM Pusat': 'PCM Berbah',
  'PCM Berbah (Pusat)': 'PCM Berbah',
  'SD Muhammadiyah 1': 'SD Muhammadiyah Karangharjo',
  'SD Muhammadiyah 2': 'SD Muhammadiyah Pajangan 1',
  'SD Muhammadiyah 3': 'SD Muhammadiyah Pajangan 2',
  'SD Muhammadiyah 4': 'SD Muhammadiyah Noyokerten',
  'SD Muhammadiyah 5': 'SD Muhammadiyah Semoya',
  'SD Muhammadiyah 6': 'SD Muhammadiyah Bulu',
  'SD Muhammadiyah Bulu Berbah': 'SD Muhammadiyah Bulu',
  'SD Muhammadiyah Berbah Bulu': 'SD Muhammadiyah Bulu',
  'SMP Muhammadiyah': 'SMP Muhammadiyah 1 Berbah',
  'SMK Muhammadiyah': 'SMK Muhammadiyah Berbah',
  'Klinik Muhammadiyah': 'Klinik PKU Muhammadiyah Berbah',
  'Klinik PKU': 'Klinik PKU Muhammadiyah Berbah',
  'PKU Muhammadiyah Berbah': 'Klinik PKU Muhammadiyah Berbah',
  'LAZISMU Berbah': 'Lazismu Berbah',
  'LazisMu Berbah': 'Lazismu Berbah',
}

export const normalizeAumName = (value) => {
  const aum = String(value || '')
  return LEGACY_AUM_MAP[aum] || aum
}

// Global state untuk dropdown superadmin agar pilihan tidak reset saat pindah halaman
const _activeAum = ref('PCM Berbah')

export const useAum = () => {
  return {
    aumList: AUM_LIST,
    activeAum: _activeAum
  }
}
