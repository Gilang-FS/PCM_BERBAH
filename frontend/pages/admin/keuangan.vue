<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useKeuangan, getNamaAkun, getAkunByTipe } from '~/composables/useKeuangan'
import { useAum } from '~/composables/useAum'
import { formatRupiah, formatTanggal } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const { userRole, username: userUsername, userAum } = useAuth()
const { aumList, activeAum } = useAum()
const { transaksiData, tambahTransaksi, editTransaksi, hapusTransaksi } = useKeuangan()
const { success, error: toastError } = useToast()

// AUM efektif: admin terikat ke AUM akun, superadmin menggunakan pilihan dropdown
const effectiveAum = computed(() =>
  userRole.value === 'admin' ? userAum.value : activeAum.value
)
const hasValidAum = computed(() =>
  Boolean(effectiveAum.value && aumList.includes(effectiveAum.value))
)

const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
].join('-')

const filterJenis = ref('semua')
const filterPeriode = ref('terbaru')
const rentangTanggal = ref({ dari: today, sampai: today })
const rentangDiterapkan = ref({ dari: today, sampai: today })
const rentangError = ref('')
const BATAS_TRANSAKSI_TERBARU = 20
const opsiPeriode = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'hari_ini', label: 'Hari Ini' },
  { value: 'bulan_ini', label: 'Bulan Ini' },
  { value: 'rentang', label: 'Rentang Tanggal' }
]

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
}

const terapkanRentang = () => {
  if (!rentangTanggal.value.dari || !rentangTanggal.value.sampai) {
    rentangError.value = 'Tanggal Dari dan Sampai wajib diisi.'
    return
  }
  if (!isValidDate(rentangTanggal.value.dari) || !isValidDate(rentangTanggal.value.sampai)) {
    rentangError.value = 'Format tanggal tidak valid.'
    return
  }
  if (rentangTanggal.value.sampai > today) {
    rentangError.value = 'Tanggal akhir tidak boleh melewati hari ini.'
    return
  }
  if (rentangTanggal.value.sampai < rentangTanggal.value.dari) {
    rentangError.value = 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    return
  }
  rentangDiterapkan.value = { ...rentangTanggal.value }
  rentangError.value = ''
}

const riwayat = computed(() => {
  if (!hasValidAum.value) return []
  const bulanIni = today.slice(0, 7)
  const aum = effectiveAum.value

  const hasil = transaksiData.value.filter(item => {
    if (typeof item.tanggal !== 'string') return false
    const sesuaiAum = item.aum === aum
    const sesuaiJenis = filterJenis.value === 'semua' || item.tipe === filterJenis.value
    let sesuaiPeriode = true

    if (filterPeriode.value === 'hari_ini') {
      sesuaiPeriode = item.tanggal === today
    } else if (filterPeriode.value === 'bulan_ini') {
      sesuaiPeriode = item.tanggal.slice(0, 7) === bulanIni && item.tanggal <= today
    } else if (filterPeriode.value === 'rentang') {
      sesuaiPeriode = item.tanggal >= rentangDiterapkan.value.dari
        && item.tanggal <= rentangDiterapkan.value.sampai
    }

    return sesuaiAum && sesuaiJenis && sesuaiPeriode
  }).sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return filterPeriode.value === 'terbaru'
    ? hasil.slice(0, BATAS_TRANSAKSI_TERBARU)
    : hasil
})

const adaTransaksiUntukFilterDasar = computed(() => {
  if (!hasValidAum.value) return false
  const aum = effectiveAum.value
  return transaksiData.value.some(item => {
    const sesuaiAum = item.aum === aum
    const sesuaiJenis = filterJenis.value === 'semua' || item.tipe === filterJenis.value
    return sesuaiAum && sesuaiJenis
  })
})

// ── Form tambah transaksi ──────────────────────────────────────────────────────
const form = ref({
  tipe: 'pemasukan',
  kode_akun: '',
  tanggal: today,
  nominal: '',
  keterangan: ''
})

const formError = ref('')
const opsiAkunInput = computed(() => getAkunByTipe(form.value.tipe))
const isSubmitting = ref(false)
const isInputModalOpen = ref(false)
const addBtnRef = ref(null)
const inputDateRef = ref(null)

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

const openInputModal = () => {
  isInputModalOpen.value = true
  nextTick(() => inputDateRef.value?.focus())
}

const closeInputModal = () => {
  if (isSubmitting.value) return
  isInputModalOpen.value = false
  formError.value = ''
  nextTick(() => addBtnRef.value?.focus())
}

const validateForm = () => {
  if (!isValidDate(form.value.tanggal) || form.value.tanggal > today) {
    formError.value = 'Tanggal wajib valid dan tidak boleh melewati hari ini.'
    return false
  }
  if (!getAkunByTipe(form.value.tipe).some(akun => akun.kode === form.value.kode_akun)) {
    formError.value = 'Kategori wajib dipilih.'
    return false
  }
  const nominal = Number(form.value.nominal)
  if (!Number.isFinite(nominal) || nominal <= 0) {
    formError.value = 'Nominal harus berupa angka lebih dari 0.'
    return false
  }
  return true
}

const submitInput = async () => {
  if (isSubmitting.value) return
  formError.value = ''

  if (!validateForm()) return

  const targetAum = effectiveAum.value
  if (!targetAum || !aumList.includes(targetAum)) {
    formError.value = 'Unit akun tidak valid. Silakan login kembali.'
    return
  }

  isSubmitting.value = true
  try {
    const saved = tambahTransaksi({
      tanggal: form.value.tanggal,
      kode_akun: form.value.kode_akun,
      keterangan: form.value.keterangan.trim(),
      tipe: form.value.tipe,
      nominal: Number(form.value.nominal),
      aum: targetAum
    })
    if (!saved) throw new Error('TRANSACTION_NOT_SAVED')

    form.value.nominal = ''
    form.value.keterangan = ''
    form.value.kode_akun = ''
    isInputModalOpen.value = false
    success('Transaksi berhasil disimpan.')
    nextTick(() => addBtnRef.value?.focus())
  } catch {
    formError.value = 'Gagal menyimpan transaksi. Coba kembali.'
  } finally {
    isSubmitting.value = false
  }
}

// ── Modal Edit (Superadmin) ───────────────────────────────────────────────────
const isEditModalOpen = ref(false)
const editingId = ref(null)
const editingAum = ref('')
const editTriggerRef = ref(null)
const editDateRef = ref(null)
const editForm = ref({
  tipe: 'pemasukan',
  kode_akun: '',
  tanggal: '',
  nominal: '',
  keterangan: ''
})
const editFormError = ref('')
const opsiAkunEdit = computed(() => getAkunByTipe(editForm.value.tipe))
const isSubmittingEdit = ref(false)

const startEdit = (item) => {
  if (userRole.value !== 'superadmin') return
  editTriggerRef.value = actionTriggerRef.value
  editingId.value = item.id
  editingAum.value = item.aum
  editForm.value.tipe = item.tipe
  editForm.value.kode_akun = item.kode_akun
  editForm.value.tanggal = item.tanggal
  editForm.value.nominal = String(Number(item.nominal) || '')
  editForm.value.keterangan = item.keterangan || ''
  editFormError.value = ''
  isEditModalOpen.value = true
  openDropdownId.value = null
  nextTick(() => editDateRef.value?.focus())
}

const validateEditForm = () => {
  if (!isValidDate(editForm.value.tanggal) || editForm.value.tanggal > today) {
    editFormError.value = 'Tanggal wajib valid dan tidak boleh melewati hari ini.'
    return false
  }
  if (!getAkunByTipe(editForm.value.tipe).some(akun => akun.kode === editForm.value.kode_akun)) {
    editFormError.value = 'Kategori wajib dipilih.'
    return false
  }
  const nominal = Number(editForm.value.nominal)
  if (!Number.isFinite(nominal) || nominal <= 0) {
    editFormError.value = 'Nominal harus berupa angka lebih dari 0.'
    return false
  }
  if (!aumList.includes(editingAum.value)) {
    editFormError.value = 'Unit transaksi tidak valid.'
    return false
  }
  return true
}

const submitEdit = async () => {
  if (userRole.value !== 'superadmin' || isSubmittingEdit.value) return
  editFormError.value = ''

  if (!editingId.value || !validateEditForm()) return

  isSubmittingEdit.value = true
  try {
    const saved = editTransaksi(editingId.value, {
      tanggal: editForm.value.tanggal,
      kode_akun: editForm.value.kode_akun,
      keterangan: editForm.value.keterangan.trim(),
      tipe: editForm.value.tipe,
      nominal: Number(editForm.value.nominal),
      aum: editingAum.value
    }, userUsername.value || 'superadmin')

    if (!saved) {
      editFormError.value = 'Transaksi tidak ditemukan atau sudah berubah.'
      return
    }

    isEditModalOpen.value = false
    editingId.value = null
    editingAum.value = ''
    success('Transaksi berhasil diperbarui.')
    nextTick(() => editTriggerRef.value?.focus())
  } catch {
    editFormError.value = 'Gagal menyimpan perubahan. Coba kembali.'
  } finally {
    isSubmittingEdit.value = false
  }
}

const cancelEdit = () => {
  isEditModalOpen.value = false
  editFormError.value = ''
  editingId.value = null
  editingAum.value = ''
  nextTick(() => editTriggerRef.value?.focus())
}

// ── Hapus (Superadmin) ────────────────────────────────────────────────────────
const showDeleteConfirm = ref(null)
const deleteTriggerRef = ref(null)
const deleteDialogRef = ref(null)

const confirmDelete = (id) => {
  if (userRole.value !== 'superadmin') return
  deleteTriggerRef.value = actionTriggerRef.value
  showDeleteConfirm.value = id
  openDropdownId.value = null
  nextTick(() => deleteDialogRef.value?.focus())
}

const cancelDelete = () => {
  showDeleteConfirm.value = null
  nextTick(() => deleteTriggerRef.value?.focus())
}

const deleteItem = (id) => {
  if (userRole.value !== 'superadmin') return
  try {
    const deleted = hapusTransaksi(id)
    if (!deleted) {
      toastError('Transaksi tidak ditemukan atau sudah dihapus.')
      return
    }
    if (editingId.value === id) cancelEdit()
    success('Transaksi berhasil dihapus.')
  } catch {
    toastError('Gagal menghapus transaksi. Coba kembali.')
  } finally {
    showDeleteConfirm.value = null
    nextTick(() => addBtnRef.value?.focus())
  }
}

// ── Dropdown Menu (Superadmin) ────────────────────────────────────────────────
const openDropdownId = ref(null)
const actionTriggerRef = ref(null)
const toggleDropdown = (id, triggerEl) => {
  if (userRole.value !== 'superadmin') return
  actionTriggerRef.value = triggerEl || null
  openDropdownId.value = openDropdownId.value === id ? null : id
}

const closeDropdown = () => {
  openDropdownId.value = null
  nextTick(() => actionTriggerRef.value?.focus())
}

watch([isInputModalOpen, isEditModalOpen, showDeleteConfirm], ([inputOpen, editOpen, deleteOpen]) => {
  document.body.style.overflow = inputOpen || editOpen || deleteOpen ? 'hidden' : ''
})

const handleOutsideClick = (e) => {
  if (!(e.target instanceof Element)) return
  if (!e.target.closest('.action-menu-container')) {
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="w-full max-w-5xl mx-auto space-y-4 pb-10">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 class="text-[26px] font-bold tracking-tight text-gray-900">Keuangan</h1>
      <NuxtLink to="/keuangan" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-xl shadow-sm transition-colors w-fit">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        Lihat Halaman Publik
      </NuxtLink>
    </div>

    <!-- Pilih Unit (Khusus Superadmin) -->
    <div v-if="userRole === 'superadmin'" class="bg-white rounded-[16px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-4 py-3.5 mb-2">
      <label for="keuangan-aum" class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Unit</label>
      <div class="relative">
        <select
          id="keuangan-aum"
          v-model="activeAum"
          class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-800 text-[14px] font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] p-3 pr-10"
        >
          <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
        </select>
        <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>

    <div v-if="!hasValidAum" role="alert" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      Unit akun tidak valid. Silakan login kembali atau hubungi Superadmin.
    </div>

    <!-- CTA Input Transaksi -->
    <button
      ref="addBtnRef"
      type="button"
      :disabled="!hasValidAum"
      @click="openInputModal"
      class="group inline-flex w-full items-center justify-center gap-2.5 rounded-[13px] bg-[#1B5E20] px-5 py-3 text-white shadow-[0_12px_24px_-16px_rgba(15,68,24,0.95)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span class="flex h-5 w-5 items-center justify-center text-white transition-colors">
        <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/>
        </svg>
      </span>
      <span class="text-[14px] font-bold leading-none tracking-[0.01em]">Tambah Transaksi Baru</span>
    </button>

    <!-- Modal Input Transaksi -->
    <Teleport to="body">
      <div
        v-if="isInputModalOpen"
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
        @keydown.esc="closeInputModal"
      >
        <div
          class="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl animate-slide-up sm:rounded-[24px] sm:animate-zoom-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-input-title"
          tabindex="-1"
          @keydown.tab="trapFocus"
        >
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 id="modal-input-title" class="text-[15px] font-bold text-gray-800">Input Transaksi</h2>
            <button
              type="button"
              aria-label="Tutup modal"
              @click="closeInputModal"
              :disabled="isSubmitting"
              class="text-gray-400 hover:text-gray-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitInput" class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <p v-if="formError" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
              {{ formError }}
            </p>

            <fieldset class="border-0 p-0 m-0">
              <legend class="sr-only">Jenis transaksi</legend>
              <div class="flex bg-gray-100 rounded-xl p-1 gap-1" role="group">
                <button
                  type="button"
                  :aria-pressed="form.tipe === 'pemasukan'"
                  @click="form.tipe = 'pemasukan'; form.kode_akun = ''"
                  class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
                  :class="form.tipe === 'pemasukan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >
                  ↑ Pemasukan
                </button>
                <button
                  type="button"
                  :aria-pressed="form.tipe === 'pengeluaran'"
                  @click="form.tipe = 'pengeluaran'; form.kode_akun = ''"
                  class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
                  :class="form.tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                >
                  ↓ Pengeluaran
                </button>
              </div>
            </fieldset>

            <div class="space-y-1">
              <label for="input-tanggal" class="text-[12px] font-medium text-gray-600">Tanggal</label>
              <input id="input-tanggal" ref="inputDateRef" type="date" v-model="form.tanggal" :max="today" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
            </div>

            <div class="space-y-1">
              <label for="input-kategori" class="text-[12px] font-medium text-gray-600">Kategori (nama akun)</label>
              <div class="relative">
                <select id="input-kategori" v-model="form.kode_akun" required class="w-full appearance-none py-2.5 pl-3.5 pr-10 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
                  <option value="" disabled>-- Pilih kategori --</option>
                  <option v-for="akun in opsiAkunInput" :key="akun.kode" :value="akun.kode">
                    {{ akun.nama }}
                  </option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div class="space-y-1">
              <label for="input-nominal" class="text-[12px] font-medium text-gray-600">Jumlah (Rp)</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400" aria-hidden="true">Rp</span>
                <input id="input-nominal" type="number" v-model="form.nominal" min="1" step="1" required placeholder="0" class="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
              </div>
            </div>

            <div class="space-y-1">
              <label for="input-keterangan" class="text-[12px] font-medium text-gray-600">Keterangan tambahan (opsional)</label>
              <input id="input-keterangan" type="text" v-model="form.keterangan" placeholder="Catatan tambahan..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !form.kode_akun"
              class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 bg-[#1B5E20] hover:bg-[#124016] text-white shadow-md shadow-green-900/20"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Edit Transaksi (Khusus Superadmin) -->
    <Teleport to="body">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in" @keydown.esc="cancelEdit">
        <div class="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl animate-slide-up sm:rounded-[24px] sm:animate-zoom-in" role="dialog" aria-modal="true" aria-labelledby="modal-edit-title" tabindex="-1" @keydown.tab="trapFocus">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 id="modal-edit-title" class="text-[15px] font-bold text-gray-800">Edit Transaksi</h2>
          <button type="button" aria-label="Tutup modal" :disabled="isSubmittingEdit" @click="cancelEdit" class="text-gray-400 hover:text-gray-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitEdit" class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p v-if="editFormError" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {{ editFormError }}
          </p>

          <!-- Tipe Toggle -->
          <div class="flex bg-gray-100 rounded-xl p-1 gap-1" role="group" aria-label="Jenis transaksi">
            <button type="button" :aria-pressed="editForm.tipe === 'pemasukan'" @click="editForm.tipe = 'pemasukan'; editForm.kode_akun = ''" class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200" :class="editForm.tipe === 'pemasukan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'">
              ↑ Pemasukan
            </button>
            <button type="button" :aria-pressed="editForm.tipe === 'pengeluaran'" @click="editForm.tipe = 'pengeluaran'; editForm.kode_akun = ''" class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200" :class="editForm.tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'">
              ↓ Pengeluaran
            </button>
          </div>

          <!-- Tanggal -->
          <div class="space-y-1">
            <label for="edit-tanggal" class="text-[12px] font-medium text-gray-600">Tanggal</label>
            <input id="edit-tanggal" ref="editDateRef" type="date" v-model="editForm.tanggal" :max="today" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
          </div>

          <!-- Nama Akun -->
          <div class="space-y-1">
            <label for="edit-kategori" class="text-[12px] font-medium text-gray-600">Kategori (nama akun)</label>
            <div class="relative">
              <select id="edit-kategori" v-model="editForm.kode_akun" required class="w-full appearance-none py-2.5 pl-3.5 pr-10 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
                <option value="" disabled>-- Pilih kategori --</option>
                <option v-for="akun in opsiAkunEdit" :key="akun.kode" :value="akun.kode">
                  {{ akun.nama }}
                </option>
              </select>
              <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <!-- Nominal -->
          <div class="space-y-1">
            <label for="edit-nominal" class="text-[12px] font-medium text-gray-600">Jumlah (Rp)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400" aria-hidden="true">Rp</span>
              <input id="edit-nominal" type="number" v-model="editForm.nominal" min="1" step="1" required placeholder="0" class="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
            </div>
          </div>

          <!-- Keterangan -->
          <div class="space-y-1">
            <label for="edit-keterangan" class="text-[12px] font-medium text-gray-600">Keterangan tambahan (opsional)</label>
            <input id="edit-keterangan" type="text" v-model="editForm.keterangan" placeholder="Catatan tambahan..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="isSubmittingEdit || !editForm.kode_akun" class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide bg-[#1B5E20] hover:bg-[#124016] text-white shadow-md shadow-green-900/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <svg v-if="isSubmittingEdit" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- Riwayat Transaksi -->
    <div class="rounded-[20px] border border-gray-50 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Riwayat Transaksi</h2>
        <span class="text-[11px] text-gray-400 font-medium">
          {{ riwayat.length }} transaksi{{ filterPeriode === 'terbaru' ? ' terbaru' : '' }}
        </span>
      </div>

      <div class="px-5 py-4 border-b border-gray-50 space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(180px,0.65fr)_minmax(0,1.35fr)] gap-3">
          <div class="space-y-1.5">
            <label for="filter-jenis" class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jenis</label>
            <div class="relative">
              <select
                id="filter-jenis"
                v-model="filterJenis"
                class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] py-2.5 pl-3.5 pr-10"
              >
                <option value="semua">Semua Transaksi</option>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
              <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div class="space-y-1.5">
            <span id="finance-period-label" class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Periode</span>
            <div class="grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100/80 p-1 sm:grid-cols-4" role="group" aria-labelledby="finance-period-label">
              <button
                v-for="periode in opsiPeriode"
                :key="periode.value"
                type="button"
                :aria-pressed="filterPeriode === periode.value"
                class="rounded-lg px-2.5 py-2 text-[12px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                :class="filterPeriode === periode.value
                  ? 'bg-white text-[#1B5E20] shadow-sm'
                  : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'"
                @click="filterPeriode = periode.value"
              >
                {{ periode.label }}
              </button>
            </div>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <form
            v-if="filterPeriode === 'rentang'"
            class="rounded-2xl border border-green-100 bg-green-50/40 p-4 space-y-3"
            novalidate
            @submit.prevent="terapkanRentang"
          >
            <div>
              <p class="text-[12px] font-bold text-gray-700">Pilih periode transaksi</p>
              <p class="mt-0.5 text-[11px] text-gray-500">Tentukan tanggal awal dan akhir, lalu terapkan filter.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
              <div class="space-y-1.5">
                <label for="filter-dari" class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dari tanggal</label>
                <input
                  id="filter-dari"
                  v-model="rentangTanggal.dari"
                  type="date"
                  :max="rentangTanggal.sampai || today"
                  class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-white"
                />
              </div>
              <div class="space-y-1.5">
                <label for="filter-sampai" class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sampai tanggal</label>
                <input
                  id="filter-sampai"
                  v-model="rentangTanggal.sampai"
                  type="date"
                  :min="rentangTanggal.dari || undefined"
                  :max="today"
                  class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-white"
                />
              </div>
              <button
                type="submit"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#1B5E20] hover:bg-[#124016] text-white shadow-sm transition-colors"
              >
                Tampilkan
              </button>
            </div>
            <p v-if="rentangError" role="alert" class="text-[11px] font-medium text-red-500">{{ rentangError }}</p>
            <p v-else role="status" aria-live="polite" class="text-[11px] font-medium text-green-700">
              Menampilkan transaksi {{ formatTanggal(rentangDiterapkan.dari) }} sampai {{ formatTanggal(rentangDiterapkan.sampai) }}.
            </p>
          </form>
        </Transition>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="item in riwayat"
          :key="item.id"
          class="relative grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-4 transition-colors sm:grid-cols-[34px_minmax(0,1fr)_180px_32px] sm:px-5"
          :class="editingId === item.id ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'"
        >
          <!-- Icon (Avatar kecil 34px) -->
          <div
            class="hidden w-[34px] h-[34px] rounded-full items-center justify-center shrink-0 sm:flex"
            :class="item.tipe === 'pemasukan' ? 'bg-green-50' : 'bg-red-50'"
          >
            <svg
              class="w-4 h-4"
              :class="item.tipe === 'pemasukan' ? 'text-green-500' : 'text-red-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="item.tipe === 'pemasukan' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'" />
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="break-words text-[13px] font-bold leading-snug text-gray-800">{{ getNamaAkun(item.kode_akun) }}</p>
            <p class="mt-0.5 line-clamp-2 break-words text-[11px] leading-4 text-gray-500">{{ item.keterangan || '-' }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] text-gray-400 font-medium">{{ formatTanggal(item.tanggal) }}</span>
            </div>
          </div>

          <!-- Nominal -->
          <div class="min-w-0 text-right tabular-nums">
            <p
              class="text-[12px] font-bold sm:text-[14px]"
              :class="item.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
            >
              {{ item.tipe === 'pemasukan' ? '+' : '-' }}{{ formatRupiah(item.nominal) }}
            </p>
          </div>

          <!-- Aksi (Titik tiga) HANYA untuk Superadmin -->
          <div v-if="userRole === 'superadmin'" class="relative h-8 w-8 action-menu-container">
            <button
              type="button"
              :id="`action-trigger-${item.id}`"
              :aria-expanded="openDropdownId === item.id"
              :aria-controls="`action-menu-${item.id}`"
              :aria-label="`Tindakan untuk ${getNamaAkun(item.kode_akun)}`"
              @click.stop="toggleDropdown(item.id, $event.currentTarget)"
              @keydown.esc.stop.prevent="closeDropdown"
              class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-if="openDropdownId === item.id"
              :id="`action-menu-${item.id}`"
              class="absolute right-0 top-10 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1.5 animate-fade-in-up"
              @keydown.esc.stop.prevent="closeDropdown"
            >
              <button type="button" @click="startEdit(item)" class="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                Edit transaksi
              </button>
              <button type="button" @click="confirmDelete(item.id)" class="w-full px-4 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Hapus transaksi
              </button>
            </div>
          </div>
        </div>

        <div v-if="riwayat.length === 0" class="px-5 py-10 text-center text-gray-400 text-[13px] font-medium" role="status">
          {{ adaTransaksiUntukFilterDasar
            ? 'Tidak ada transaksi pada periode ini. Coba pilih periode lain atau gunakan rentang tanggal.'
            : 'Belum ada transaksi yang dicatat untuk pilihan ini.' }}
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[70] flex items-center justify-center p-4" @keydown.esc="cancelDelete">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="cancelDelete"></div>
        <div ref="deleteDialogRef" class="relative max-h-[calc(100dvh-2rem)] w-full max-w-[320px] overflow-y-auto rounded-[24px] bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-transaction-title" tabindex="-1" @keydown.tab="trapFocus">
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 id="delete-transaction-title" class="text-[16px] font-bold text-gray-800 mb-1">Hapus transaksi ini?</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Tindakan ini tidak bisa dibatalkan.</p>
          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="cancelDelete"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              @click="deleteItem(showDeleteConfirm)"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

  </div>
</template>
