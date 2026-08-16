<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
})

// Filter
const filterPeriode = ref('harian')
const filterAum = ref('PCM Berbah')

const aumList = ['PCM Berbah', 'SD Muh 1', 'SD Muh 2', 'SD Muh 3', 'SD Muh 4', 'SD Muh 5', 'SD Muh 6', 'SMP Muh', 'SMK Muh', 'Klinik']

// Data keuangan dummy
const keuanganData = ref([
  { id: '1', tanggal: '2026-08-16', keterangan: 'SPP Bulan Agustus', jenis: 'pemasukan', nominal: 5000000, aum: 'SD Muh 1' },
  { id: '2', tanggal: '2026-08-16', keterangan: 'Pembelian ATK', jenis: 'pengeluaran', nominal: 1200000, aum: 'SD Muh 1' },
  { id: '3', tanggal: '2026-08-15', keterangan: 'Infaq Jumat', jenis: 'pemasukan', nominal: 3500000, aum: 'PCM Berbah' },
  { id: '4', tanggal: '2026-08-10', keterangan: 'Gaji Guru Honorer', jenis: 'pengeluaran', nominal: 8500000, aum: 'SMP Muh' },
  { id: '5', tanggal: '2026-08-01', keterangan: 'Dana BOS Semester 1', jenis: 'pemasukan', nominal: 45000000, aum: 'SMK Muh' },
  { id: '6', tanggal: '2026-07-20', keterangan: 'Perawatan Gedung', jenis: 'pengeluaran', nominal: 3200000, aum: 'SD Muh 2' },
  { id: '7', tanggal: '2026-03-15', keterangan: 'Dana BOS Semester 2', jenis: 'pemasukan', nominal: 42000000, aum: 'SD Muh 1' },
])

// Data wakaf dummy (dengan gambar agar mirip berita)
const wakafData = ref([
  {
    id: '1',
    jenisAset: 'Tanah Kosong 200m²',
    lokasi: 'Jl. Raya Berbah, Tegaltirto',
    status: 'Aktif',
    keterangan: 'Lahan wakaf strategis di pinggir jalan raya, cocok untuk dibangun panti asuhan atau pusat dakwah Muhammadiyah.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop'
  },
  {
    id: '2',
    jenisAset: 'Gedung Serbaguna',
    lokasi: 'Kalitirto, Berbah',
    status: 'Proses',
    keterangan: 'Sedang dalam proses balik nama sertifikat. Gedung ini sebelumnya difungsikan sebagai balai pertemuan warga.',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&h=300&fit=crop'
  },
  {
    id: '3',
    jenisAset: 'Lahan Pertanian 500m²',
    lokasi: 'Sendangtirto, Berbah',
    status: 'Aktif',
    keterangan: 'Aset wakaf produktif berupa lahan persawahan yang disewakan untuk dikelola. Hasil sewa masuk kas PCM.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop'
  },
])

// Filter keuangan berdasarkan periode & AUM
const filteredKeuangan = computed(() => {
  const now = new Date()
  return keuanganData.value.filter(item => {
    // 1. Filter AUM
    if (item.aum !== filterAum.value) {
      return false
    }

    // 2. Filter Periode
    const itemDate = new Date(item.tanggal)
    if (filterPeriode.value === 'harian') {
      return itemDate.toDateString() === now.toDateString()
    } else if (filterPeriode.value === 'bulanan') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    } else {
      // 6 bulanan — 6 bulan terakhir
      const sixMonthsAgo = new Date(now)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return itemDate >= sixMonthsAgo
    }
  })
})

const dataPemasukan = computed(() => filteredKeuangan.value.filter(r => r.jenis === 'pemasukan'))
const dataPengeluaran = computed(() => filteredKeuangan.value.filter(r => r.jenis === 'pengeluaran'))

const totalPemasukan = computed(() =>
  filteredKeuangan.value.filter(r => r.jenis === 'pemasukan').reduce((s, r) => s + r.nominal, 0)
)
const totalPengeluaran = computed(() =>
  filteredKeuangan.value.filter(r => r.jenis === 'pengeluaran').reduce((s, r) => s + r.nominal, 0)
)
const saldo = computed(() => totalPemasukan.value - totalPengeluaran.value)

const formatRupiah = (num: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num)

const formatTanggal = (str: string) => {
  const d = new Date(str)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const periodeLabel = computed(() => {
  if (filterPeriode.value === 'harian') return 'Hari Ini'
  if (filterPeriode.value === 'bulanan') return 'Bulan Ini'
  return '6 Bulan Terakhir'
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5 pb-10">

    <!-- Header -->
    <div>
      <h1 class="text-lg font-bold text-gray-800">Home</h1>
      <p class="text-[13px] text-gray-400 mt-0.5">Ringkasan data keuangan dan aset wakaf.</p>
    </div>

    <!-- Filter Bar -->
    <div class="space-y-3">
      <!-- Filter AUM (Khusus Superadmin) -->
      <div v-if="userRole === 'superadmin'" class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Lihat Data AUM</label>
        <select
          v-model="filterAum"
          class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] p-2.5"
        >

          <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
        </select>
      </div>

      <!-- Tab Periode -->
      <div class="flex bg-white rounded-xl p-1 gap-1 border border-gray-100 shadow-sm">
        <button
          v-for="p in [
            { key: 'harian', label: 'Harian' },
            { key: 'bulanan', label: 'Bulanan' },
            { key: '6_bulanan', label: '6 Bulanan' }
          ]"
          :key="p.key"
          @click="filterPeriode = p.key"
          class="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200"
          :class="filterPeriode === p.key
            ? 'bg-[#0b4a2f] text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="space-y-3">
      <!-- Saldo -->
      <div class="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <div>
          <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Total Saldo · {{ periodeLabel }}</p>
          <p class="text-[22px] font-bold text-gray-900 leading-tight mt-0.5">{{ formatRupiah(saldo) }}</p>
        </div>
      </div>

      <!-- Pemasukan & Pengeluaran -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            </div>
            <p class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Pemasukan</p>
          </div>
          <p class="text-[17px] font-bold text-green-600 leading-tight">{{ formatRupiah(totalPemasukan) }}</p>
        </div>

        <div class="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </div>
            <p class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Pengeluaran</p>
          </div>
          <p class="text-[17px] font-bold text-red-500 leading-tight">{{ formatRupiah(totalPengeluaran) }}</p>
        </div>
      </div>
    </div>

    <!-- Tabel Rekapan Keuangan Split (Pemasukan / Pengeluaran) -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
      <!-- Kiri: Pemasukan -->
      <div class="flex-1 border-b md:border-b-0 md:border-r border-gray-100">
        <div class="px-4 py-3.5 border-b border-gray-50 flex items-center justify-center bg-green-50/30">
          <h2 class="text-[13px] font-bold text-green-700 uppercase tracking-widest">Pemasukan</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="item in dataPemasukan" :key="item.id" class="px-4 py-3.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <div class="w-24 shrink-0">
              <p class="text-[11px] text-gray-400">{{ formatTanggal(item.tanggal) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-green-600 mb-0.5">{{ formatRupiah(item.nominal) }}</p>
              <p class="text-[12px] text-gray-700 leading-snug">{{ item.keterangan }}</p>
            </div>
          </div>
          <div v-if="dataPemasukan.length === 0" class="px-5 py-8 text-center text-gray-400 text-[12px]">
            Tidak ada pemasukan
          </div>
        </div>
      </div>

      <!-- Kanan: Pengeluaran -->
      <div class="flex-1">
        <div class="px-4 py-3.5 border-b border-gray-50 flex items-center justify-center bg-red-50/30">
          <h2 class="text-[13px] font-bold text-red-600 uppercase tracking-widest">Pengeluaran</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="item in dataPengeluaran" :key="item.id" class="px-4 py-3.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <div class="w-24 shrink-0">
              <p class="text-[11px] text-gray-400">{{ formatTanggal(item.tanggal) }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-red-500 mb-0.5">{{ formatRupiah(item.nominal) }}</p>
              <p class="text-[12px] text-gray-700 leading-snug">{{ item.keterangan }}</p>
            </div>
          </div>
          <div v-if="dataPengeluaran.length === 0" class="px-5 py-8 text-center text-gray-400 text-[12px]">
            Tidak ada pengeluaran
          </div>
        </div>
      </div>
    </div>

    <!-- Data Wakaf (Tampilan Card Berita) -->
    <div class="space-y-4 pt-2">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-lg font-bold text-gray-800">Informasi Aset Wakaf</h2>
        <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{{ wakafData.length }} Aset</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in wakafData"
          :key="item.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <!-- Gambar Aset -->
          <div class="relative w-full h-40 bg-gray-100 overflow-hidden">
            <img :src="item.image" :alt="item.jenisAset" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute top-3 right-3">
              <span
                class="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md"
                :class="item.status === 'Aktif' ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
          
          <!-- Konten Card -->
          <div class="p-4 flex flex-col flex-1">
            <div class="flex items-center gap-1.5 text-gray-400 mb-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-[11px] font-medium">{{ item.lokasi }}</span>
            </div>
            <h3 class="text-[15px] font-bold text-gray-800 leading-tight mb-2 group-hover:text-[#1B5E20] transition-colors">{{ item.jenisAset }}</h3>
            <p class="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mt-auto">{{ item.keterangan }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
