<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useKeuangan, getNamaAkun, getAkunByTipe } from '~/composables/useKeuangan'
import { useAum } from '~/composables/useAum'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
const userUsername = ref('')

const { aumList, activeAum } = useAum()
const { getFiltered, hitungRingkasan, tambahTransaksi, editTransaksi, hapusTransaksi } = useKeuangan()

onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
  userUsername.value = localStorage.getItem('user_username') || 'admin_tester'
  // Jika admin biasa, paksa unit ke miliknya sendiri
  if (userRole.value !== 'superadmin') {
    activeAum.value = 'SD Muhammadiyah 1' 
  }
})

// Filter Periode (untuk riwayat & saldo)
const filterPeriode = ref('bulanan')

// Data yang ditampilkan murni berdasar activeAum
const riwayat = computed(() => {
  return getFiltered(activeAum.value, filterPeriode.value)
})

const ringkasan = computed(() => hitungRingkasan(riwayat.value))

// State Form Input Utama
const form = ref({
  tipe: 'pemasukan' as 'pemasukan' | 'pengeluaran',
  kode_akun: '',
  tanggal: new Date().toISOString().split('T')[0],
  nominal: '',
  keterangan: ''
})

// Update opsi dropdown saat tipe berubah
const opsiAkunInput = computed(() => getAkunByTipe(form.value.tipe))

const isSubmitting = ref(false)

// State Modal Edit (Khusus Superadmin)
const isEditModalOpen = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref({
  tipe: 'pemasukan' as 'pemasukan' | 'pengeluaran',
  kode_akun: '',
  tanggal: '',
  nominal: '',
  keterangan: ''
})
const opsiAkunEdit = computed(() => getAkunByTipe(editForm.value.tipe))
const isSubmittingEdit = ref(false)

const formatRupiah = (num: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num)
const formatTanggal = (str: string) => new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

// Submit Input Baru
const submitInput = async () => {
  if (!form.value.nominal || !form.value.kode_akun || !form.value.tanggal) return
  isSubmitting.value = true
  
  await new Promise(r => setTimeout(r, 300))

  tambahTransaksi({
    tanggal: form.value.tanggal,
    kode_akun: form.value.kode_akun,
    keterangan: form.value.keterangan,
    tipe: form.value.tipe,
    nominal: Number(form.value.nominal),
    aum: activeAum.value
  })

  form.value.nominal = ''
  form.value.keterangan = ''
  form.value.kode_akun = ''
  isSubmitting.value = false
}

// Buka Modal Edit
const startEdit = (item: any) => {
  editingId.value = item.id
  editForm.value.tipe = item.tipe
  editForm.value.kode_akun = item.kode_akun
  editForm.value.tanggal = item.tanggal
  editForm.value.nominal = item.nominal.toString()
  editForm.value.keterangan = item.keterangan
  isEditModalOpen.value = true
  openDropdownId.value = null
}

// Simpan Edit dari Modal
const submitEdit = async () => {
  if (!editingId.value || !editForm.value.nominal || !editForm.value.kode_akun || !editForm.value.tanggal) return
  isSubmittingEdit.value = true
  
  await new Promise(r => setTimeout(r, 300))

  editTransaksi(editingId.value, {
    tanggal: editForm.value.tanggal,
    kode_akun: editForm.value.kode_akun,
    keterangan: editForm.value.keterangan,
    tipe: editForm.value.tipe,
    nominal: Number(editForm.value.nominal),
    aum: activeAum.value // Tetap masuk ke aum yang sedang aktif
  }, userUsername.value)

  isSubmittingEdit.value = false
  isEditModalOpen.value = false
  editingId.value = null
}

// Batal edit
const cancelEdit = () => {
  isEditModalOpen.value = false
  editingId.value = null
}

// Hapus (Khusus Superadmin)
const showDeleteConfirm = ref<string | null>(null)
const deleteItem = (id: string) => {
  hapusTransaksi(id)
  showDeleteConfirm.value = null
  if (editingId.value === id) cancelEdit()
}

// Dropdown Menu (Khusus Superadmin)
const openDropdownId = ref<string | null>(null)
const toggleDropdown = (id: string) => {
  if (openDropdownId.value === id) openDropdownId.value = null
  else openDropdownId.value = id
}

// Tutup dropdown jika klik di luar (sederhana)
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.action-menu-container')) {
      openDropdownId.value = null
    }
  })
})
</script>

<template>
  <div class="max-w-xl mx-auto space-y-4 pb-10">
    <!-- Header -->
    <div class="mb-2">
      <h1 class="text-lg font-bold text-gray-800">Keuangan</h1>
      <p class="text-[13px] text-gray-400 mt-0.5">Catat & pantau arus kas unit</p>
    </div>

    <!-- Pilih Unit (Khusus Superadmin) -->
    <div v-if="userRole === 'superadmin'" class="bg-white rounded-[16px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-4 py-3.5 mb-2">
      <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Unit</label>
      <select
        v-model="activeAum"
        class="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-[14px] font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] p-3 appearance-none"
      >
        <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
      </select>
    </div>

    <!-- Tab Periode -->
    <div class="flex bg-white rounded-xl p-1 gap-1 border border-gray-100 shadow-sm">
      <button
        v-for="p in [{ key: 'harian', label: 'Harian' }, { key: 'bulanan', label: 'Bulanan' }, { key: '6_bulanan', label: '6 Bulanan' }]"
        :key="p.key"
        @click="filterPeriode = p.key"
        class="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
        :class="filterPeriode === p.key ? 'bg-[#1B5E20] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Bagian 1: Ringkasan Saldo -->
    <div class="bg-white rounded-[20px] p-5 border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <p class="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Ringkasan Saldo</p>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase">Pemasukan</p>
          <p class="text-[16px] font-bold text-green-600">{{ formatRupiah(ringkasan.totalPemasukan) }}</p>
        </div>
        <div>
          <p class="text-[10px] font-semibold text-gray-400 uppercase">Pengeluaran</p>
          <p class="text-[16px] font-bold text-red-500">{{ formatRupiah(ringkasan.totalPengeluaran) }}</p>
        </div>
      </div>
      <div class="pt-4 border-t border-gray-100 flex items-end justify-between">
        <p class="text-[12px] font-bold text-gray-500 uppercase">Saldo Akhir</p>
        <p class="text-[22px] font-bold text-gray-900 leading-none">{{ formatRupiah(ringkasan.saldoAkhir) }}</p>
      </div>
    </div>

    <!-- Bagian 2: Form Input Transaksi -->
    <div class="bg-white rounded-[20px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div class="px-5 pt-5 pb-1 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Input Transaksi</h2>
      </div>

      <form @submit.prevent="submitInput" class="px-5 pb-5 pt-3 space-y-4">
        <!-- Tipe Toggle -->
        <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            type="button"
            @click="form.tipe = 'pemasukan'; form.kode_akun = ''"
            class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
            :class="form.tipe === 'pemasukan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
          >
            ↑ Pemasukan
          </button>
          <button
            type="button"
            @click="form.tipe = 'pengeluaran'; form.kode_akun = ''"
            class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
            :class="form.tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
          >
            ↓ Pengeluaran
          </button>
        </div>

        <!-- Tanggal -->
        <div class="space-y-1">
          <label class="text-[12px] font-medium text-gray-600">Tanggal</label>
          <input type="date" v-model="form.tanggal" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
        </div>

        <!-- Nama Akun (Dropdown berdasar tipe) -->
        <div class="space-y-1">
          <label class="text-[12px] font-medium text-gray-600">Kategori (nama akun)</label>
          <select v-model="form.kode_akun" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
            <option value="" disabled>-- Pilih kategori --</option>
            <option v-for="akun in opsiAkunInput" :key="akun.kode" :value="akun.kode">
              {{ akun.nama }}
            </option>
          </select>
        </div>

        <!-- Nominal -->
        <div class="space-y-1">
          <label class="text-[12px] font-medium text-gray-600">Jumlah (Rp)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">Rp</span>
            <input type="number" v-model="form.nominal" min="0" required placeholder="0" class="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
          </div>
        </div>

        <!-- Keterangan (Opsional) -->
        <div class="space-y-1">
          <label class="text-[12px] font-medium text-gray-600">Keterangan tambahan (opsional)</label>
          <input type="text" v-model="form.keterangan" placeholder="Catatan tambahan..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
        </div>

        <!-- Tombol Submit -->
        <button
          type="submit"
          :disabled="isSubmitting || !form.kode_akun"
          class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 bg-[#1B5E20] hover:bg-[#124016] text-white shadow-md shadow-green-900/20"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
        </button>
      </form>
    </div>

    <!-- Modal Edit Transaksi (Khusus Superadmin) -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div class="bg-white w-full max-w-md rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden animate-slide-up sm:animate-zoom-in">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 class="text-[15px] font-bold text-gray-800">Edit Transaksi</h2>
          <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitEdit" class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <!-- Tipe Toggle -->
          <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button type="button" @click="editForm.tipe = 'pemasukan'; editForm.kode_akun = ''" class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200" :class="editForm.tipe === 'pemasukan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'">
              ↑ Pemasukan
            </button>
            <button type="button" @click="editForm.tipe = 'pengeluaran'; editForm.kode_akun = ''" class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200" :class="editForm.tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'">
              ↓ Pengeluaran
            </button>
          </div>

          <!-- Tanggal -->
          <div class="space-y-1">
            <label class="text-[12px] font-medium text-gray-600">Tanggal</label>
            <input type="date" v-model="editForm.tanggal" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
          </div>

          <!-- Nama Akun -->
          <div class="space-y-1">
            <label class="text-[12px] font-medium text-gray-600">Kategori (nama akun)</label>
            <select v-model="editForm.kode_akun" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
              <option value="" disabled>-- Pilih kategori --</option>
              <option v-for="akun in opsiAkunEdit" :key="akun.kode" :value="akun.kode">
                {{ akun.nama }}
              </option>
            </select>
          </div>

          <!-- Nominal -->
          <div class="space-y-1">
            <label class="text-[12px] font-medium text-gray-600">Jumlah (Rp)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">Rp</span>
              <input type="number" v-model="editForm.nominal" min="0" required placeholder="0" class="w-full pl-10 pr-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring--[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
            </div>
          </div>

          <!-- Keterangan -->
          <div class="space-y-1">
            <label class="text-[12px] font-medium text-gray-600">Keterangan tambahan (opsional)</label>
            <input type="text" v-model="editForm.keterangan" placeholder="Catatan tambahan..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 placeholder-gray-300" />
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="isSubmittingEdit || !editForm.kode_akun" class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <svg v-if="isSubmittingEdit" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bagian 3: Riwayat Transaksi -->
    <div class="bg-white rounded-[20px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Riwayat Transaksi</h2>
        <span class="text-[11px] text-gray-400 font-medium">{{ riwayat.length }} transaksi</span>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="item in riwayat"
          :key="item.id"
          class="px-5 py-4 flex items-center gap-3 relative transition-colors"
          :class="editingId === item.id ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'"
        >
          <!-- Icon (Avatar kecil 34px) -->
          <div
            class="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0"
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
            <p class="text-[13px] font-bold text-gray-800 truncate">{{ getNamaAkun(item.kode_akun) }}</p>
            <p class="text-[11px] text-gray-500 mt-0.5 truncate">{{ item.keterangan || '-' }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] text-gray-400 font-medium">{{ formatTanggal(item.tanggal) }}</span>
            </div>
          </div>

          <!-- Nominal -->
          <div class="text-right shrink-0 mr-2">
            <p
              class="text-[14px] font-bold"
              :class="item.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
            >
              {{ item.tipe === 'pemasukan' ? '+' : '-' }}{{ formatRupiah(item.nominal) }}
            </p>
          </div>

          <!-- Aksi (Titik tiga) HANYA untuk Superadmin -->
          <div v-if="userRole === 'superadmin'" class="shrink-0 relative action-menu-container">
            <button @click="toggleDropdown(item.id)" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div v-if="openDropdownId === item.id" class="absolute right-0 top-10 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1.5 animate-fade-in-up">
              <button @click="startEdit(item)" class="w-full px-4 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                Edit transaksi
              </button>
              <button @click="showDeleteConfirm = item.id; openDropdownId = null" class="w-full px-4 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Hapus transaksi
              </button>
            </div>
          </div>
        </div>

        <div v-if="riwayat.length === 0" class="px-5 py-10 text-center text-gray-400 text-[13px] font-medium">
          Belum ada transaksi di periode ini.
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = null"></div>
      <div class="relative bg-white rounded-[24px] shadow-xl w-full max-w-[320px] overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-[16px] font-bold text-gray-800 mb-1">Hapus transaksi ini?</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Tindakan ini tidak bisa dibatalkan.</p>
          <div class="flex gap-3 mt-6">
            <button
              @click="showDeleteConfirm = null"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              @click="deleteItem(showDeleteConfirm!)"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
