// composables/useAum.ts
// Single source of truth untuk daftar unit (PCM Pusat + 9 AUM).
// Dipakai di: dashboard.vue, keuangan.vue, dan semua halaman yang butuh daftar unit.

import { ref } from 'vue'

export const AUM_LIST = [
  'PCM Pusat',
  'SD Muhammadiyah 1',
  'SD Muhammadiyah 2',
  'SD Muhammadiyah 3',
  'SD Muhammadiyah 4',
  'SD Muhammadiyah 5',
  'SD Muhammadiyah 6',
  'SMP Muhammadiyah',
  'SMK Muhammadiyah',
  'Klinik Muhammadiyah',
] as const

export type AumName = typeof AUM_LIST[number]

// Global state untuk dropdown superadmin agar pilihan tidak reset saat pindah halaman
const _activeAum = ref<string>('PCM Pusat')

export const useAum = () => {
  return { 
    aumList: AUM_LIST,
    activeAum: _activeAum
  }
}

