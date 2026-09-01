<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useKeuangan, getPeriodeLabel } from '~/composables/useKeuangan'
import { useAum } from '~/composables/useAum'

import { exportToExcel, exportToPDF } from '~/utils/exportKeuangan'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
const { aumList, activeAum } = useAum()

// 1. State Filter
const filterPeriode = ref('bulanan')

onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
  // Jika Admin biasa, ganti default ke unit mereka sendiri
  if (userRole.value !== 'superadmin') {
    activeAum.value = 'SD Muhammadiyah 1'
  }
})

// 2. Mengambil data dari composable
const { getFiltered, hitungRingkasan, ringkasanPerKategori } = useKeuangan()

// Reactive data berdasarkan filter
const filteredData = computed(() => getFiltered(activeAum.value, filterPeriode.value))
const ringkasan = computed(() => hitungRingkasan(filteredData.value))
const ringkasanKategori = computed(() => ringkasanPerKategori(filteredData.value))

const periodeLabel = computed(() => {
  if (filterPeriode.value === 'harian') return 'HARI INI'
  if (filterPeriode.value === 'bulanan') return 'BULAN INI'
  return '6 BULAN TERAKHIR'
})

// Handler Export
const handleExportExcel = async () => {
  await exportToExcel(filteredData.value, activeAum.value, filterPeriode.value)
}

const handleExportPDF = async () => {
  await exportToPDF(filteredData.value, activeAum.value, filterPeriode.value)
}

// 3. Formatters
const formatRupiah = (num: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num)
const formatTanggal = (str: string) => new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

// 4. Konfigurasi Grafik (ApexCharts)
const formatBulan = (str: string) => {
  const [yyyy, mm] = str.split('-')
  const date = new Date(Number(yyyy), Number(mm) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

const chartDataAgregat = computed(() => {
  const isHarian = filterPeriode.value === 'harian'
  
  // Mapping data ke bentuk { label: string, pemasukan: number, pengeluaran: number }
  const grouped = filteredData.value.reduce((acc, item) => {
    // Jika harian, group by YYYY-MM-DD. Jika bulanan/6_bulanan, group by YYYY-MM
    const key = isHarian ? item.tanggal : item.tanggal.substring(0, 7)
    
    if (!acc[key]) {
      acc[key] = { label: isHarian ? formatTanggal(item.tanggal) : formatBulan(key), pemasukan: 0, pengeluaran: 0 }
    }
    
    if (item.tipe === 'pemasukan') acc[key].pemasukan += item.nominal
    else acc[key].pengeluaran += item.nominal
      
    return acc
  }, {} as Record<string, { label: string, pemasukan: number, pengeluaran: number }>)

  // Sort keys (YYYY-MM-DD atau YYYY-MM) secara ascending
  const sortedKeys = Object.keys(grouped).sort()
  return sortedKeys.map(k => grouped[k])
})

const chartOptions = computed(() => {
  const labels = chartDataAgregat.value.map(d => d.label)
  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#10B981', '#EF4444'], // Hijau (pemasukan), Merah (pengeluaran)
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: labels.length ? labels : ['Belum ada data'],
      tooltip: { enabled: false },
      labels: { 
        style: { colors: '#9CA3AF', fontSize: '10px' },
        rotate: -45,
        hideOverlappingLabels: true
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
          if (val === 0) return '0'
          return 'Rp ' + (val / 1000000).toFixed(1) + 'Jt'
        },
        style: { colors: '#9CA3AF', fontSize: '10px' }
      }
    },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', fontWeight: 600 },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] }
    }
  }
})

const chartSeries = computed(() => {
  const data = chartDataAgregat.value
  if (data.length === 0) return [{ name: 'Pemasukan', data: [0] }, { name: 'Pengeluaran', data: [0] }]

  return [
    { name: 'Pemasukan', data: data.map(d => d.pemasukan) },
    { name: 'Pengeluaran', data: data.map(d => d.pengeluaran) }
  ]
})

// 5. Preview Wakaf Dummy (Sifatnya global/terbaru, tidak terpengaruh filter)
const wakafTerbaru = ref([
  { id: '1', jenisAset: 'Tanah Kosong 200m²', lokasi: 'Jl. Raya Berbah, Tegaltirto', nominal: 5000000, tanggal: '2026-10-12', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop' },
  { id: '2', jenisAset: 'Gedung Serbaguna', lokasi: 'Kalitirto, Berbah', nominal: 25000000, tanggal: '2026-10-10', image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&h=300&fit=crop' }
])
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5 pb-10">

    <!-- Header -->
    <div>
      <h1 class="text-lg font-bold text-gray-800">Home</h1>
      <p class="text-[13px] text-gray-400 mt-0.5">Ringkasan kinerja keuangan dan aset wakaf.</p>
    </div>

    <!-- Filter & Action Bar -->
    <div class="space-y-4">
      <!-- Filter AUM (Khusus Superadmin, Tepat 10 Opsi tanpa Semua/Gabungan) -->
      <div v-if="userRole === 'superadmin'" class="bg-white rounded-[16px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-4 py-3.5">
        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Unit</label>
        <select
          v-model="activeAum"
          class="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-[14px] font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] p-3 appearance-none"
        >
          <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
        </select>
      </div>

      <!-- Tab Periode (Scroll horizontal di mobile) -->
      <div class="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <div class="flex bg-white rounded-xl p-1 gap-1 border border-gray-50 shadow-sm min-w-max">
          <button
            v-for="p in [ { key: 'harian', label: 'Harian' }, { key: 'bulanan', label: 'Bulanan' }, { key: '6_bulanan', label: '6 Bulanan' } ]"
            :key="p.key"
            @click="filterPeriode = p.key"
            class="px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="filterPeriode === p.key ? 'bg-[#1B5E20] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards (Hero & Grid) -->
    <div class="space-y-4">
      <!-- Saldo (Hero Card) -->
      <div class="bg-[#1B5E20] rounded-[24px] px-6 py-6 shadow-lg shadow-green-900/20 relative overflow-hidden">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-[14px] bg-white/20 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <p class="text-[13px] font-medium text-green-100">Total saldo {{ periodeLabel.toLowerCase() }}</p>
        </div>
        <div>
          <p class="text-[32px] font-bold text-white leading-none tracking-tight">{{ formatRupiah(ringkasan.saldoAkhir) }}</p>
        </div>
      </div>

      <!-- Pemasukan & Pengeluaran (2 Columns) -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Pemasukan -->
        <div class="bg-white rounded-[20px] px-5 py-4 border border-gray-100 shadow-sm relative overflow-hidden">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            <p class="text-[12px] font-medium text-gray-500">Pemasukan</p>
          </div>
          <p class="text-[18px] font-bold text-gray-900 mt-2">{{ formatRupiah(ringkasan.totalPemasukan) }}</p>
        </div>

        <!-- Pengeluaran -->
        <div class="bg-white rounded-[20px] px-5 py-4 border border-gray-100 shadow-sm relative overflow-hidden">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            <p class="text-[12px] font-medium text-gray-500">Pengeluaran</p>
          </div>
          <p class="text-[18px] font-bold text-gray-900 mt-2">{{ formatRupiah(ringkasan.totalPengeluaran) }}</p>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-[24px] p-5 border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-[14px] font-bold text-gray-800">Tren Keuangan</h3>
      </div>
      <div class="-ml-2">
        <ClientOnly>
          <apexchart height="200" :options="chartOptions" :series="chartSeries"></apexchart>
        </ClientOnly>
      </div>
    </div>

    <!-- Tabel Ringkasan Kategori -->
    <div class="bg-white rounded-[24px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="text-[14px] font-bold text-gray-800">Ringkasan Kategori</h3>
      </div>
      
      <!-- Pemasukan Group -->
      <div v-if="ringkasanKategori.filter(i => i.tipe === 'pemasukan').length" class="px-5 py-2 bg-green-50/50 border-b border-green-50">
        <p class="text-[11px] font-bold text-green-700 uppercase tracking-wider">Pendapatan</p>
      </div>
      <div class="divide-y divide-gray-50 px-5">
        <div v-for="item in ringkasanKategori.filter(i => i.tipe === 'pemasukan')" :key="item.kode_akun" class="py-3.5 flex items-center justify-between">
          <p class="text-[13px] font-medium text-gray-600">{{ item.nama }}</p>
          <p class="text-[14px] font-bold text-green-600">{{ formatRupiah(item.total) }}</p>
        </div>
      </div>

      <!-- Pengeluaran Group -->
      <div v-if="ringkasanKategori.filter(i => i.tipe === 'pengeluaran').length" class="px-5 py-2 bg-red-50/50 border-y border-red-50 mt-2">
        <p class="text-[11px] font-bold text-red-700 uppercase tracking-wider">Pengeluaran & Beban</p>
      </div>
      <div class="divide-y divide-gray-50 px-5">
        <div v-for="item in ringkasanKategori.filter(i => i.tipe === 'pengeluaran')" :key="item.kode_akun" class="py-3.5 flex items-center justify-between">
          <p class="text-[13px] font-medium text-gray-600">{{ item.nama }}</p>
          <p class="text-[14px] font-bold text-red-500">{{ formatRupiah(item.total) }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="ringkasanKategori.length === 0" class="py-8 text-center text-gray-400 text-[13px] font-medium">
        Belum ada transaksi di periode ini.
      </div>

      <!-- Total Footer -->
      <div class="bg-gray-50/50 px-5 py-4 border-t border-gray-100 mt-2">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[12px] font-bold text-gray-500">Total Pemasukan</p>
          <p class="text-[14px] font-bold text-green-600">{{ formatRupiah(ringkasan.totalPemasukan) }}</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[12px] font-bold text-gray-500">Total Pengeluaran</p>
          <p class="text-[14px] font-bold text-red-500">{{ formatRupiah(ringkasan.totalPengeluaran) }}</p>
        </div>
      </div>
      
      <!-- Export Action Area -->
      <div class="px-5 py-4 bg-white border-t border-gray-100">
        <p class="text-[11px] text-gray-400 mb-3 text-center sm:text-left">Unduh laporan rinci untuk periode ini:</p>
        <div class="flex flex-col sm:flex-row items-center gap-2">
          <button @click="handleExportExcel" class="w-full sm:flex-1 justify-center px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export Buku Besar (Excel)
          </button>
          <button @click="handleExportPDF" class="w-full sm:flex-1 justify-center px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Export Laba/Rugi (PDF)
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Wakaf -->
    <div class="bg-white rounded-[24px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="text-[15px] font-bold text-gray-800">Wakaf Terbaru</h3>
        <NuxtLink to="/admin/wakaf" class="text-[11px] font-bold text-[#1B5E20] hover:text-[#124016]">Semua Wakaf</NuxtLink>
      </div>
      <div class="divide-y divide-gray-50 px-5">
        <div v-for="item in wakafTerbaru" :key="item.id" class="py-4 flex items-center gap-4 group">
          <div class="w-12 h-12 rounded-[14px] bg-[#f0f7f3] flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[13px] font-bold text-gray-800 truncate">{{ item.jenisAset }}</h3>
            <p class="text-[11px] text-gray-500 mt-0.5 truncate">{{ item.lokasi }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-[14px] font-bold text-green-600">{{ formatRupiah(item.nominal) }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
