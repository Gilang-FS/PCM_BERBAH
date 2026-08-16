<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
})

// Filter periode
const filterPeriode = ref('harian')

// Data keuangan dummy
const keuanganData = ref([
  { id: '1', tanggal: '2026-08-16', keterangan: 'SPP Bulan Agustus', jenis: 'pemasukan', nominal: 5000000, aum: 'SD Muh 1' },
  { id: '2', tanggal: '2026-08-16', keterangan: 'Pembelian ATK', jenis: 'pengeluaran', nominal: 1200000, aum: 'SD Muh 1' },
  { id: '3', tanggal: '2026-08-15', keterangan: 'Infaq Jumat', jenis: 'pemasukan', nominal: 3500000, aum: 'SD Muh 3' },
  { id: '4', tanggal: '2026-08-10', keterangan: 'Gaji Guru Honorer', jenis: 'pengeluaran', nominal: 8500000, aum: 'SMP Muh' },
  { id: '5', tanggal: '2026-08-01', keterangan: 'Dana BOS Semester 1', jenis: 'pemasukan', nominal: 45000000, aum: 'SMK Muh' },
  { id: '6', tanggal: '2026-07-20', keterangan: 'Perawatan Gedung', jenis: 'pengeluaran', nominal: 3200000, aum: 'SD Muh 2' },
  { id: '7', tanggal: '2026-03-15', keterangan: 'Dana BOS Semester 2', jenis: 'pemasukan', nominal: 42000000, aum: 'SD Muh 1' },
])

// Data wakaf dummy
const wakafData = ref([
  { id: '1', jenisAset: 'Tanah Kosong 200m²', lokasi: 'Jl. Raya Berbah, Tegaltirto', status: 'Aktif', keterangan: 'Cocok untuk panti asuhan' },
  { id: '2', jenisAset: 'Gedung Serbaguna', lokasi: 'Kalitirto, Berbah', status: 'Proses', keterangan: 'Proses balik nama sertifikat' },
  { id: '3', jenisAset: 'Lahan Pertanian 500m²', lokasi: 'Sendangtirto, Berbah', status: 'Aktif', keterangan: 'Disewakan untuk kas PCM' },
])

// Filter keuangan berdasarkan periode
const filteredKeuangan = computed(() => {
  const now = new Date()
  return keuanganData.value.filter(item => {
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
          : 'text-gray-400 hover:text-gray-600'"
      >
        {{ p.label }}
      </button>
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

    <!-- Tabel Rekapan Keuangan -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Rekap Keuangan</h2>
        <span class="text-[11px] text-gray-400 font-medium">{{ filteredKeuangan.length }} transaksi</span>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="item in filteredKeuangan"
          :key="item.id"
          class="px-5 py-3.5 flex items-center gap-3"
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :class="item.jenis === 'pemasukan' ? 'bg-green-50' : 'bg-red-50'"
          >
            <svg
              class="w-4 h-4"
              :class="item.jenis === 'pemasukan' ? 'text-green-500' : 'text-red-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="item.jenis === 'pemasukan' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'"
              />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-gray-800 truncate">{{ item.keterangan }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ formatTanggal(item.tanggal) }} · {{ item.aum }}</p>
          </div>

          <p
            class="text-[14px] font-bold shrink-0"
            :class="item.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
          >
            {{ item.jenis === 'pemasukan' ? '+' : '-' }}{{ formatRupiah(item.nominal) }}
          </p>
        </div>

        <div v-if="filteredKeuangan.length === 0" class="px-5 py-10 text-center text-gray-400 text-sm">
          Tidak ada data untuk periode {{ periodeLabel.toLowerCase() }}.
        </div>
      </div>
    </div>

    <!-- Data Wakaf -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Data Aset Wakaf</h2>
        <span class="text-[11px] text-gray-400 font-medium">{{ wakafData.length }} aset</span>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="item in wakafData"
          :key="item.id"
          class="px-5 py-3.5 flex items-start gap-3"
        >
          <div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-gray-800">{{ item.jenisAset }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ item.lokasi }}</p>
            <p class="text-[11px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">{{ item.keterangan }}</p>
          </div>

          <span
            class="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
            :class="item.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
          >
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>
