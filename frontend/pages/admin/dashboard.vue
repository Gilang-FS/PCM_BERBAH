<script setup>
import { ref, computed } from 'vue'
import { useKeuangan } from '~/composables/useKeuangan'
import { useAum } from '~/composables/useAum'
import { exportToExcel, exportToPDF } from '~/utils/exportKeuangan'
import { formatRupiah, formatTanggal, formatBulan } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
})

const { userRole, userAum } = useAuth()
const { aumList, activeAum } = useAum()
const { success, error } = useToast()
const { getFiltered, hitungRingkasan, ringkasanPerKategori } = useKeuangan()

const filterPeriode = ref('bulanan')
const isExporting = ref(false)

const effectiveAum = computed(() => userRole.value === 'admin' ? userAum.value : activeAum.value)
const hasValidAum = computed(() => Boolean(effectiveAum.value && aumList.includes(effectiveAum.value)))
const filteredData = computed(() => hasValidAum.value
  ? getFiltered(effectiveAum.value, filterPeriode.value)
  : [])
const ringkasan = computed(() => hitungRingkasan(filteredData.value))
const ringkasanKategori = computed(() => ringkasanPerKategori(filteredData.value))

const periodeLabel = computed(() => {
  if (filterPeriode.value === 'harian') return 'hari ini'
  if (filterPeriode.value === 'bulanan') return 'bulan ini'
  return '6 bulan terakhir'
})

const handleExportExcel = () => handleExport('excel')
const handleExportPDF = () => handleExport('pdf')

const handleExport = async (format) => {
  if (isExporting.value || !hasValidAum.value || filteredData.value.length === 0) return

  isExporting.value = true
  const dataSnapshot = [...filteredData.value]
  const aumSnapshot = effectiveAum.value
  const periodeSnapshot = filterPeriode.value

  try {
    if (format === 'excel') {
      await exportToExcel(dataSnapshot, aumSnapshot, periodeSnapshot)
    } else {
      await exportToPDF(dataSnapshot, aumSnapshot, periodeSnapshot)
    }
    success(`Laporan ${format === 'excel' ? 'Excel' : 'PDF'} berhasil diunduh`)
  } catch {
    error('Laporan gagal dibuat. Silakan coba kembali.')
  } finally {
    isExporting.value = false
  }
}

const chartDataAgregat = computed(() => {
  const groupByMonth = filterPeriode.value === '6_bulanan'
  const grouped = filteredData.value.reduce((acc, item) => {
    const key = groupByMonth ? item.tanggal.substring(0, 7) : item.tanggal
    if (!acc[key]) {
      acc[key] = {
        label: groupByMonth ? formatBulan(key) : formatTanggal(item.tanggal),
        pemasukan: 0,
        pengeluaran: 0,
      }
    }

    const nominal = Number(item.nominal)
    if (!Number.isFinite(nominal)) return acc
    if (item.tipe === 'pemasukan') acc[key].pemasukan += nominal
    if (item.tipe === 'pengeluaran') acc[key].pengeluaran += nominal
    return acc
  }, {})

  return Object.keys(grouped).sort().map(key => grouped[key])
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ['#10B981', '#EF4444'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: chartDataAgregat.value.map(data => data.label),
    tooltip: { enabled: false },
    labels: {
      style: { colors: '#9CA3AF', fontSize: '10px' },
      rotate: -45,
      hideOverlappingLabels: true,
    },
  },
  yaxis: {
    labels: {
      formatter: (value) => value === 0 ? '0' : `Rp ${(value / 1000000).toFixed(1)}Jt`,
      style: { colors: '#9CA3AF', fontSize: '10px' },
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    fontSize: '12px',
    fontWeight: 600,
  },
  grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  },
}))

const chartSeries = computed(() => [
  { name: 'Pemasukan', data: chartDataAgregat.value.map(data => data.pemasukan) },
  { name: 'Pengeluaran', data: chartDataAgregat.value.map(data => data.pengeluaran) },
])
</script>

<template>
  <div class="w-full max-w-5xl mx-auto space-y-5 pb-10">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-[26px] font-bold tracking-tight text-gray-900">
        Beranda
      </h1>
    </div>

    <div v-if="!hasValidAum" role="alert" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      Unit akun tidak valid. Silakan login kembali atau hubungi Superadmin.
    </div>

    <!-- Filter & Action Bar -->
    <div class="space-y-4">
      <!-- Filter AUM khusus Superadmin, berasal dari master AUM. -->
      <div
        v-if="userRole === 'superadmin'"
        class="bg-white rounded-[16px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-4 py-3.5"
      >
        <label
          for="dashboard-aum"
          class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2"
          >Pilih Unit</label
        >
        <div class="relative">
          <select
            id="dashboard-aum"
            v-model="activeAum"
            class="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-[14px] font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] p-3 appearance-none pr-10"
          >
            <option v-for="aum in aumList" :key="aum" :value="aum">
              {{ aum }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tab Periode (Scroll horizontal di mobile) -->
      <div class="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0" role="group" aria-label="Periode laporan">
        <div
          class="flex bg-white rounded-xl p-1 gap-1 border border-gray-50 shadow-sm min-w-max"
        >
          <button
            v-for="p in [
              { key: 'harian', label: 'Harian' },
              { key: 'bulanan', label: 'Bulanan' },
              { key: '6_bulanan', label: '6 Bulanan' },
            ]"
            :key="p.key"
            type="button"
            @click="filterPeriode = p.key"
            :aria-pressed="filterPeriode === p.key"
            class="rounded-lg px-6 py-2.5 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-1"
            :class="
              filterPeriode === p.key
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            "
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards (Hero & Grid) -->
    <div class="space-y-4">
      <!-- Sisa Saldo Periode (Hero Card) -->
      <div
        class="rounded-[24px] px-6 py-5 shadow-lg relative overflow-hidden"
        :class="ringkasan.saldoAkhir < 0
          ? 'bg-[#a33b35] shadow-red-900/20'
          : 'bg-[#1B5E20] shadow-green-900/20'"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-[14px] bg-white/20 flex items-center justify-center shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <p class="text-[13px] font-medium text-white/80">
            Surplus/defisit {{ periodeLabel.toLowerCase() }}
          </p>
        </div>
        <p class="text-[32px] font-bold text-white leading-none tracking-tight">
          {{ formatRupiah(ringkasan.saldoAkhir) }}
        </p>
      </div>

      <!-- Pemasukan & Pengeluaran (2 Columns) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Pemasukan -->
        <div
          class="bg-white rounded-[20px] px-5 py-4 border border-gray-100 shadow-sm relative overflow-hidden"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg
              class="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <p class="text-[12px] font-medium text-gray-500">Pemasukan</p>
          </div>
          <p class="text-[18px] font-bold text-gray-900 mt-2">
            {{ formatRupiah(ringkasan.totalPemasukan) }}
          </p>
        </div>

        <!-- Pengeluaran -->
        <div
          class="bg-white rounded-[20px] px-5 py-4 border border-gray-100 shadow-sm relative overflow-hidden"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg
              class="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <p class="text-[12px] font-medium text-gray-500">Pengeluaran</p>
          </div>
          <p class="text-[18px] font-bold text-gray-900 mt-2">
            {{ formatRupiah(ringkasan.totalPengeluaran) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div
      class="bg-white rounded-[24px] p-5 border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-[14px] font-bold text-gray-800">Tren Keuangan</h2>
      </div>
      <div class="-ml-2 min-h-[200px]">
        <ClientOnly>
          <apexchart
            v-if="chartDataAgregat.length"
            height="200"
            :options="chartOptions"
            :series="chartSeries"
          ></apexchart>
          <div v-else class="flex h-[200px] items-center justify-center text-[13px] font-medium text-gray-400" role="status">
            Belum ada transaksi pada periode ini.
          </div>
          <template #fallback>
            <div class="flex h-[200px] items-center justify-center text-[13px] font-medium text-gray-500" role="status">Memuat grafik...</div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Tabel Ringkasan Kategori -->
    <div
      class="bg-white rounded-[24px] border border-gray-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      <div
        class="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
      >
        <h2 class="text-[14px] font-bold text-gray-800">Ringkasan Kategori</h2>
      </div>

      <!-- Pemasukan Group -->
      <div
        v-if="ringkasanKategori.filter((i) => i.tipe === 'pemasukan').length"
        class="px-5 py-2 bg-green-50/50 border-b border-green-50"
      >
        <p
          class="text-[11px] font-bold text-green-700 uppercase tracking-wider"
        >
          Pendapatan
        </p>
      </div>
      <div class="divide-y divide-gray-50 px-5">
        <div
          v-for="item in ringkasanKategori.filter(
            (i) => i.tipe === 'pemasukan',
          )"
          :key="item.kode_akun"
          class="flex items-center justify-between gap-3 py-3.5"
        >
          <p class="min-w-0 break-words text-[13px] font-medium text-gray-600">{{ item.nama }}</p>
          <p class="shrink-0 text-right text-[14px] font-bold text-green-600">
            {{ formatRupiah(item.total) }}
          </p>
        </div>
      </div>

      <!-- Pengeluaran Group -->
      <div
        v-if="ringkasanKategori.filter((i) => i.tipe === 'pengeluaran').length"
        class="px-5 py-2 bg-red-50/50 border-y border-red-50 mt-2"
      >
        <p class="text-[11px] font-bold text-red-700 uppercase tracking-wider">
          Pengeluaran & Beban
        </p>
      </div>
      <div class="divide-y divide-gray-50 px-5">
        <div
          v-for="item in ringkasanKategori.filter(
            (i) => i.tipe === 'pengeluaran',
          )"
          :key="item.kode_akun"
          class="flex items-center justify-between gap-3 py-3.5"
        >
          <p class="min-w-0 break-words text-[13px] font-medium text-gray-600">{{ item.nama }}</p>
          <p class="shrink-0 text-right text-[14px] font-bold text-red-500">
            {{ formatRupiah(item.total) }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredData.length === 0"
        class="py-8 text-center text-gray-400 text-[13px] font-medium"
        role="status"
      >
        Belum ada transaksi di periode ini.
      </div>

      <!-- Total Footer -->
      <div class="bg-gray-50/50 px-5 py-4 border-t border-gray-100 mt-2">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[12px] font-bold text-gray-500">Total Pemasukan</p>
          <p class="text-[14px] font-bold text-green-600">
            {{ formatRupiah(ringkasan.totalPemasukan) }}
          </p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[12px] font-bold text-gray-500">Total Pengeluaran</p>
          <p class="text-[14px] font-bold text-red-500">
            {{ formatRupiah(ringkasan.totalPengeluaran) }}
          </p>
        </div>
      </div>

      <!-- Export Action Area -->
      <div class="px-5 py-4 bg-white border-t border-gray-100">
        <p class="text-[11px] text-gray-400 mb-3 text-center sm:text-left">
          Unduh laporan rinci untuk periode ini:
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-2">
          <button
            @click="handleExportExcel"
            :disabled="isExporting || !hasValidAum || filteredData.length === 0"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-[13px] font-bold text-green-700 transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-70 sm:flex-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ isExporting ? 'Memproses...' : 'Export Laba/Rugi (Excel)' }}
          </button>
          <button
            @click="handleExportPDF"
            :disabled="isExporting || !hasValidAum || filteredData.length === 0"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-70 sm:flex-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {{ isExporting ? 'Memproses...' : 'Export Laba/Rugi (PDF)' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
