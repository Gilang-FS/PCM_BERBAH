<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const router = useRouter()
const userRole = ref('')

onMounted(() => {
  const role = localStorage.getItem('user_role')
  if (!role) { router.push('/login'); return }
  userRole.value = role
})

// Data Dummy — nanti akan diganti dengan API call
const summaryCards = computed(() => {
  const base = [
    {
      label: 'Total Pemasukan',
      value: 'Rp 245.800.000',
      change: '+12.5%',
      changeType: 'up',
      color: 'green',
    },
    {
      label: 'Total Pengeluaran',
      value: 'Rp 98.200.000',
      change: '+3.2%',
      changeType: 'up',
      color: 'red',
    },
    {
      label: 'Saldo Bersih',
      value: 'Rp 147.600.000',
      change: '+8.1%',
      changeType: 'up',
      color: 'blue',
    },
  ]

  if (userRole.value === 'superadmin') {
    base.push({
      label: 'Total Aset Wakaf',
      value: '12 Aset',
      change: '+2 bulan ini',
      changeType: 'up',
      color: 'amber',
    })
  }

  return base
})

const recentTransactions = [
  { id: 1, tanggal: '2026-08-15', jenis: 'pemasukan', nominal: 5000000, keterangan: 'SPP Bulan Agustus', aum: 'SD Muh 1' },
  { id: 2, tanggal: '2026-08-14', jenis: 'pengeluaran', nominal: 1200000, keterangan: 'Pembelian ATK', aum: 'SMP Muh' },
  { id: 3, tanggal: '2026-08-14', jenis: 'pemasukan', nominal: 3500000, keterangan: 'Infaq Jumat', aum: 'SD Muh 3' },
  { id: 4, tanggal: '2026-08-13', jenis: 'pengeluaran', nominal: 800000, keterangan: 'Listrik & Air', aum: 'SMK Muh' },
  { id: 5, tanggal: '2026-08-12', jenis: 'pemasukan', nominal: 15000000, keterangan: 'Donasi Wali Murid', aum: 'SD Muh 2' },
]

const recentWakaf = [
  { id: 1, aset: 'Tanah Kosong 200m²', lokasi: 'Jl. Raya Berbah', status: 'Aktif' },
  { id: 2, aset: 'Gedung Serbaguna', lokasi: 'Kalitirto', status: 'Proses' },
  { id: 3, aset: 'Lahan Pertanian 500m²', lokasi: 'Tegaltirto', status: 'Aktif' },
]

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
}
</script>

<template>
  <div class="space-y-5">

    <!-- Greeting -->
    <div>
      <h1 class="text-lg font-bold text-gray-800">
        Assalamu'alaikum {{ userRole === 'superadmin' ? 'Superadmin' : 'Admin' }} 👋
      </h1>
      <p class="text-[13px] text-gray-400 mt-0.5">
        Berikut ringkasan data terkini PCM Berbah.
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-3" :class="userRole === 'superadmin' ? 'md:grid-cols-4' : 'md:grid-cols-3'">
      <div
        v-for="(card, idx) in summaryCards"
        :key="idx"
        class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        :class="idx === 0 ? 'col-span-2 md:col-span-1' : ''"
      >
        <div class="flex items-start justify-between mb-3">
          <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wide leading-tight">{{ card.label }}</p>
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            :class="[colorMap[card.color].bg, colorMap[card.color].text]"
          >
            {{ card.change }}
          </span>
        </div>
        <p class="text-xl font-bold text-gray-800">{{ card.value }}</p>
      </div>
    </div>

    <!-- Transaksi Terakhir -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <h2 class="text-[14px] font-bold text-gray-700">Transaksi Terakhir</h2>
        <NuxtLink to="/admin/keuangan" class="text-[12px] text-[#1B5E20] font-medium hover:underline">
          Lihat Semua
        </NuxtLink>
      </div>

      <!-- Mobile: List view -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="trx in recentTransactions" :key="trx.id" class="px-4 py-3 flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-medium text-gray-700 truncate">{{ trx.keterangan }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ trx.aum }} · {{ trx.tanggal }}</p>
          </div>
          <p
            class="text-[13px] font-semibold ml-3 shrink-0"
            :class="trx.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
          >
            {{ trx.jenis === 'pemasukan' ? '+' : '-' }}Rp {{ formatRupiah(trx.nominal) }}
          </p>
        </div>
      </div>

      <!-- Desktop: Table view -->
      <div class="hidden md:block">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="text-left text-[11px] text-gray-400 uppercase tracking-wider">
              <th class="px-4 py-2.5 font-medium">Tanggal</th>
              <th class="px-4 py-2.5 font-medium">Keterangan</th>
              <th class="px-4 py-2.5 font-medium">AUM</th>
              <th class="px-4 py-2.5 font-medium">Jenis</th>
              <th class="px-4 py-2.5 font-medium text-right">Nominal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="trx in recentTransactions" :key="trx.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-500">{{ trx.tanggal }}</td>
              <td class="px-4 py-3 text-gray-700 font-medium">{{ trx.keterangan }}</td>
              <td class="px-4 py-3 text-gray-500">{{ trx.aum }}</td>
              <td class="px-4 py-3">
                <span
                  class="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  :class="trx.jenis === 'pemasukan' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                >
                  {{ trx.jenis }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-semibold"
                :class="trx.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
              >
                {{ trx.jenis === 'pemasukan' ? '+' : '-' }}Rp {{ formatRupiah(trx.nominal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Wakaf Section (Superadmin only) -->
    <div v-if="userRole === 'superadmin'" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <h2 class="text-[14px] font-bold text-gray-700">Data Wakaf Terbaru</h2>
        <NuxtLink to="/admin/wakaf" class="text-[12px] text-[#1B5E20] font-medium hover:underline">
          Lihat Semua
        </NuxtLink>
      </div>

      <div class="divide-y divide-gray-50">
        <div v-for="item in recentWakaf" :key="item.id" class="px-4 py-3 flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-gray-700">{{ item.aset }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ item.lokasi }}</p>
          </div>
          <span
            class="text-[10.5px] font-medium px-2 py-0.5 rounded-full"
            :class="item.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
          >
            {{ item.status }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>
