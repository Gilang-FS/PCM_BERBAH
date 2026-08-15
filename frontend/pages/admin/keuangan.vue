<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
})

// State untuk filter
const filterPeriode = ref('harian') // harian, bulanan, 6_bulanan
const filterAum = ref('semua') // untuk superadmin

// State untuk modal
const isModalOpen = ref(false)
const modalType = ref<'add' | 'edit'>('add')

const form = ref({
  id: '',
  keterangan: '',
  jenis: 'pemasukan',
  nominal: 0,
  periode: 'harian',
  tanggal: new Date().toISOString().split('T')[0],
  aum: 'SD Muh 1'
})

// Data dummy (nanti dari API)
const keuanganData = ref([
  { id: '1', tanggal: '2026-08-15', keterangan: 'SPP Bulan Agustus', jenis: 'pemasukan', nominal: 5000000, periode: 'bulanan', aum: 'SD Muh 1' },
  { id: '2', tanggal: '2026-08-14', keterangan: 'Pembelian ATK', jenis: 'pengeluaran', nominal: 1200000, periode: 'harian', aum: 'SMP Muh' },
  { id: '3', tanggal: '2026-08-14', keterangan: 'Infaq Jumat', jenis: 'pemasukan', nominal: 3500000, periode: 'harian', aum: 'SD Muh 3' },
  { id: '4', tanggal: '2026-08-01', keterangan: 'Dana BOS Semester 1', jenis: 'pemasukan', nominal: 45000000, periode: '6_bulanan', aum: 'SMK Muh' },
])

const aumList = ['SD Muh 1', 'SD Muh 2', 'SD Muh 3', 'SD Muh 4', 'SD Muh 5', 'SD Muh 6', 'SMP Muh', 'SMK Muh', 'Ranting A']

// Filter logika
const filteredData = computed(() => {
  return keuanganData.value.filter(item => {
    const matchPeriode = filterPeriode.value === 'semua' || item.periode === filterPeriode.value
    const matchAum = filterAum.value === 'semua' || item.aum === filterAum.value
    return matchPeriode && matchAum
  })
})

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const openAddModal = () => {
  modalType.value = 'add'
  form.value = {
    id: '',
    keterangan: '',
    jenis: 'pemasukan',
    nominal: 0,
    periode: filterPeriode.value !== 'semua' ? filterPeriode.value : 'harian',
    tanggal: new Date().toISOString().split('T')[0],
    aum: userRole.value === 'superadmin' ? 'SD Muh 1' : 'AUM Anda' // Nanti dari profile user
  }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalType.value = 'edit'
  form.value = { ...item }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveKeuangan = () => {
  if (modalType.value === 'add') {
    keuanganData.value.unshift({
      ...form.value,
      id: Date.now().toString()
    })
  } else {
    const index = keuanganData.value.findIndex(k => k.id === form.value.id)
    if (index !== -1) keuanganData.value[index] = { ...form.value }
  }
  closeModal()
}

const deleteKeuangan = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    keuanganData.value = keuanganData.value.filter(item => item.id !== id)
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-800">Kelola Keuangan</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">Pantau dan catat pemasukan / pengeluaran.</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Data
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
      <!-- Filter Periode -->
      <div class="flex-1">
        <label class="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Periode Laporan</label>
        <select v-model="filterPeriode" class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20] block p-2">
          <option value="semua">Semua Periode</option>
          <option value="harian">Harian</option>
          <option value="bulanan">Bulanan</option>
          <option value="6_bulanan">6 Bulanan (Semester)</option>
        </select>
      </div>

      <!-- Filter AUM (Khusus Superadmin) -->
      <div v-if="userRole === 'superadmin'" class="flex-1">
        <label class="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Filter AUM</label>
        <select v-model="filterAum" class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20] block p-2">
          <option value="semua">Semua AUM & Ranting</option>
          <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
        </select>
      </div>
    </div>

    <!-- Table Data -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Mobile View (Card List) -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="item in filteredData" :key="item.id" class="p-4 flex flex-col gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[14px] font-bold text-gray-800 leading-tight">{{ item.keterangan }}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ item.aum }} · {{ item.tanggal }}</p>
            </div>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full"
              :class="item.periode === 'harian' ? 'bg-blue-50 text-blue-600' : item.periode === 'bulanan' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'"
            >
              {{ item.periode.replace('_', ' ').toUpperCase() }}
            </span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <p
              class="text-[14px] font-bold"
              :class="item.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
            >
              {{ item.jenis === 'pemasukan' ? '+' : '-' }}Rp {{ formatRupiah(item.nominal) }}
            </p>
            <div class="flex items-center gap-2">
              <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700 p-1">Edit</button>
              <button @click="deleteKeuangan(item.id)" class="text-red-500 hover:text-red-700 p-1">Hapus</button>
            </div>
          </div>
        </div>
        <div v-if="filteredData.length === 0" class="p-8 text-center text-gray-400 text-sm">
          Tidak ada data keuangan.
        </div>
      </div>

      <!-- Desktop View (Table) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">Tanggal</th>
              <th class="px-4 py-3 font-semibold">Keterangan</th>
              <th v-if="userRole === 'superadmin'" class="px-4 py-3 font-semibold">AUM</th>
              <th class="px-4 py-3 font-semibold">Periode</th>
              <th class="px-4 py-3 font-semibold">Jenis</th>
              <th class="px-4 py-3 font-semibold text-right">Nominal</th>
              <th class="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredData" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-4 py-3.5 text-gray-500">{{ item.tanggal }}</td>
              <td class="px-4 py-3.5 text-gray-800 font-medium">{{ item.keterangan }}</td>
              <td v-if="userRole === 'superadmin'" class="px-4 py-3.5 text-gray-500">{{ item.aum }}</td>
              <td class="px-4 py-3.5">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded border"
                  :class="item.periode === 'harian' ? 'bg-blue-50 text-blue-600 border-blue-100' : item.periode === 'bulanan' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'"
                >
                  {{ item.periode.replace('_', ' ').toUpperCase() }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :class="item.jenis === 'pemasukan' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                >
                  {{ item.jenis }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-right font-bold"
                :class="item.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
              >
                {{ item.jenis === 'pemasukan' ? '+' : '-' }}Rp {{ formatRupiah(item.nominal) }}
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                  <button @click="deleteKeuangan(item.id)" class="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredData.length === 0">
              <td :colspan="userRole === 'superadmin' ? 7 : 6" class="px-4 py-8 text-center text-gray-400">
                Tidak ada data ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Add/Edit) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <!-- Modal Box -->
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-[15px] font-bold text-gray-800">
            {{ modalType === 'add' ? 'Tambah Data Keuangan' : 'Edit Data Keuangan' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveKeuangan" class="p-5 space-y-4">
          <div v-if="userRole === 'superadmin' && modalType === 'add'" class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Pilih AUM / Ranting</label>
            <select v-model="form.aum" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
              <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Periode</label>
              <select v-model="form.periode" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
                <option value="harian">Harian</option>
                <option value="bulanan">Bulanan</option>
                <option value="6_bulanan">6 Bulanan</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Tanggal</label>
              <input type="date" v-model="form.tanggal" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Jenis Transaksi</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" :class="form.jenis === 'pemasukan' ? 'border-green-500 bg-green-50/50' : ''">
                <input type="radio" v-model="form.jenis" value="pemasukan" class="text-green-600 focus:ring-green-500" />
                <span class="text-sm font-medium" :class="form.jenis === 'pemasukan' ? 'text-green-700' : 'text-gray-600'">Pemasukan</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" :class="form.jenis === 'pengeluaran' ? 'border-red-500 bg-red-50/50' : ''">
                <input type="radio" v-model="form.jenis" value="pengeluaran" class="text-red-500 focus:ring-red-500" />
                <span class="text-sm font-medium" :class="form.jenis === 'pengeluaran' ? 'text-red-700' : 'text-gray-600'">Pengeluaran</span>
              </label>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Keterangan / Rincian</label>
            <input type="text" v-model="form.keterangan" required placeholder="Contoh: Pembayaran Listrik" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Nominal (Rp)</label>
            <input type="number" v-model="form.nominal" required min="0" placeholder="0" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors">
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
