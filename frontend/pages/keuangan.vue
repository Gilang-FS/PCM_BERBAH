<template>
  <div class="flex flex-col">

    <!-- BOX 1: HERO / BANNER SECTION -->
    <div class="bg-white overflow-hidden border-b border-[#dedbd1]">
      <section class="relative flex h-[360px] items-end overflow-hidden bg-cover bg-center px-6 pb-12 sm:h-[420px] md:px-10 md:pb-14 lg:h-[480px] lg:px-14 lg:pb-16" style="background-image: url('/images/banner-keuangan.png')" aria-labelledby="finance-page-title">
        <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div class="relative z-10 max-w-2xl border-l-4 border-[#1B5E20] pl-5 text-left sm:pl-7">
          <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-[12px]">Transparansi Keuangan</p>
          <h1 id="finance-page-title" class="public-hero-title mb-4 font-serif text-3xl font-bold leading-[1.2] text-white md:text-4xl lg:text-[42px]">
            Laporan Keuangan PCM Berbah
          </h1>
          <p class="max-w-xl text-[15px] leading-relaxed text-white/85 md:text-[16px]">
            Informasi penerimaan, pengeluaran, dan saldo kas secara terbuka.
          </p>
        </div>
      </section>
    </div>

    <!-- BOX 2: RINGKASAN SALDO -->
    <div class="overflow-hidden bg-white">
      <div class="px-6 py-12 md:px-10 md:py-14 lg:px-14 lg:py-16">

        <div class="mb-8">
          <h2 class="public-section-title text-[#252b28]">Ringkasan Kas</h2>
          <p class="text-sm text-gray-600 mt-1">Laporan penerimaan dan pengeluaran per unit kerja</p>
        </div>

          <!-- Cards Ringkasan -->
          <div class="grid grid-cols-1 overflow-hidden rounded-[10px] border border-[#d8d4c9] divide-y divide-[#d8d4c9] md:grid-cols-3 md:divide-x md:divide-y-0">
            <!-- Card Pemasukan -->
            <div class="bg-[#faf9f5] p-6">
              <p class="text-[12px] uppercase tracking-[0.08em] font-bold text-gray-500 mb-2">Total Pemasukan</p>
               <p class="break-words text-2xl font-semibold tabular-nums text-[#252b28] lg:text-[28px]">{{ formatRupiah(ringkasan.totalPemasukan) }}</p>
            </div>

            <!-- Card Pengeluaran -->
            <div class="bg-[#faf9f5] p-6">
              <p class="text-[12px] uppercase tracking-[0.08em] font-bold text-gray-500 mb-2">Total Pengeluaran</p>
               <p class="break-words text-2xl font-semibold tabular-nums text-[#252b28] lg:text-[28px]">{{ formatRupiah(ringkasan.totalPengeluaran) }}</p>
            </div>

            <!-- Card Saldo -->
            <div class="bg-[#eef2e7] p-6">
              <p class="text-[12px] uppercase tracking-[0.1em] font-bold text-gray-500 mb-2">Saldo Kas</p>
               <p class="break-words text-2xl font-bold tabular-nums text-[#252b28] lg:text-[28px]">{{ formatRupiah(ringkasan.saldoAkhir) }}</p>
            </div>
          </div>
      </div>
    </div>

    <!-- BOX 3: TABEL RIWAYAT TRANSAKSI -->
    <div class="mx-6 mb-12 md:mx-10 md:mb-14 lg:mx-14 lg:mb-16">

      <!-- Tab Controls & Dropdown -->
      <div class="overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-[#f0eee7]">
        <!-- Tabs -->
        <div class="flex overflow-x-auto border-b border-[#d8d4c9]">
          <button
            type="button"
            @click="filterPeriode = 'harian'"
            class="min-w-[120px] flex-1 border-r border-[#d8d4c9] px-2 py-3 text-center text-[12px] font-semibold focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B5E20] sm:text-[13px]"
            :class="filterPeriode === 'harian' ? 'bg-[#303030] text-white' : 'text-gray-700 hover:bg-[#e4e1d8]'"
            :aria-pressed="filterPeriode === 'harian'"
          >
            Rekap Harian
          </button>
          <button
            type="button"
            @click="filterPeriode = 'bulanan'"
            class="min-w-[120px] flex-1 border-r border-[#d8d4c9] px-2 py-3 text-center text-[12px] font-semibold focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B5E20] sm:text-[13px]"
            :class="filterPeriode === 'bulanan' ? 'bg-[#303030] text-white' : 'text-gray-700 hover:bg-[#e4e1d8]'"
            :aria-pressed="filterPeriode === 'bulanan'"
          >
            Rekap Bulanan
          </button>
          <button
            type="button"
            @click="filterPeriode = '6_bulanan'"
            class="min-w-[130px] flex-1 px-2 py-3 text-center text-[12px] font-semibold focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B5E20] sm:text-[13px]"
            :class="filterPeriode === '6_bulanan' ? 'bg-[#303030] text-white' : 'text-gray-700 hover:bg-[#e4e1d8]'"
            :aria-pressed="filterPeriode === '6_bulanan'"
          >
            Rekap 6 Bulanan
          </button>
        </div>

        <!-- Dropdown AUM -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <label for="public-finance-aum" class="text-[11px] font-bold uppercase tracking-wider text-gray-600 shrink-0">Unit/AUM</label>
          <div class="relative flex-1 max-w-[260px] ml-auto">
            <select id="public-finance-aum" v-model="selectedAum" class="w-full cursor-pointer appearance-none rounded-[10px] border border-[#c9c5ba] bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20">
              <option value="Semua AUM">Semua AUM</option>
              <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Tampilan Mobile: Card List -->
      <div class="mt-4 md:hidden">
        <div v-if="riwayat.length === 0" class="rounded-[10px] border border-[#d8d4c9] bg-white px-6 py-14 text-center" role="status">
          <p class="text-[17px] font-bold text-[#343a36]">Belum ada transaksi</p>
          <p class="mt-1.5 text-[14px] leading-6 text-gray-500">Tidak ada transaksi pada unit dan periode yang dipilih.</p>
        </div>
        <div v-else class="flex flex-col divide-y divide-[#dedbd1] overflow-hidden rounded-[10px] border border-[#d8d4c9]">
          <div
            v-for="(item, index) in riwayat"
            :key="item.id"
            class="flex items-start justify-between gap-3 px-4 py-3.5"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f5]'"
          >
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-gray-900 leading-snug">{{ item.keterangan }}</p>
              <p class="mt-0.5 text-[11px] text-gray-500">{{ formatTanggal(item.tanggal) }}</p>
              <span
                class="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider"
                :class="item.tipe === 'pemasukan' ? 'text-[#246b2d]' : 'text-[#a33b35]'"
              >{{ item.tipe }}</span>
            </div>
            <p
              class="max-w-[45%] break-words text-right text-[14px] font-bold tabular-nums"
              :class="item.tipe === 'pemasukan' ? 'text-[#246b2d]' : 'text-[#a33b35]'"
            >
              {{ item.tipe === 'pemasukan' ? '+' : '-' }} {{ formatRupiah(item.nominal) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tampilan Desktop: Tabel -->
      <div class="mt-4 hidden overflow-x-auto border border-[#d8d4c9] md:block">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <caption class="sr-only">Riwayat transaksi keuangan berdasarkan unit dan periode yang dipilih</caption>
          <thead>
            <tr class="border-b border-[#222222] bg-[#303030] text-white">
              <th scope="col" class="py-3.5 px-6 text-[12px] uppercase tracking-wider font-bold w-32">Tanggal</th>
              <th scope="col" class="py-3.5 px-6 text-[12px] uppercase tracking-wider font-bold">Keterangan</th>
              <th scope="col" class="py-3.5 px-6 text-[12px] uppercase tracking-wider font-bold text-right w-40">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="riwayat.length === 0">
              <td colspan="3" class="bg-white px-6 py-14 text-center" role="status">
                <p class="text-[17px] font-bold text-[#343a36]">Belum ada transaksi</p>
                <p class="mt-1.5 text-[14px] leading-6 text-gray-500">Tidak ada transaksi pada unit dan periode yang dipilih.</p>
              </td>
            </tr>
            <tr
              v-else
              v-for="(item, index) in riwayat"
              :key="item.id"
              class="border-b border-[#dedbd1] odd:bg-white even:bg-[#faf9f5] hover:bg-[#f1f3ec]"
            >
              <td class="py-4 px-6 text-[14px] text-gray-600 font-medium">{{ formatTanggal(item.tanggal) }}</td>
              <td class="py-4 px-6">
                <div class="text-[15px] font-semibold text-gray-900">{{ item.keterangan }}</div>
                <div class="text-[13px] text-gray-500 mt-1 flex items-center gap-2">
                  <span
                    class="pr-2 border-r border-gray-300 text-[11px] font-bold uppercase tracking-wider"
                    :class="item.tipe === 'pemasukan' ? 'text-[#246b2d]' : 'text-[#a33b35]'"
                  >
                    {{ item.tipe }}
                  </span>
                  <span>{{ getNamaAkun(item.kode_akun) }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-right font-bold text-[15px] tabular-nums" :class="item.tipe === 'pemasukan' ? 'text-[#246b2d]' : 'text-[#a33b35]'">
                {{ item.tipe === 'pemasukan' ? '+' : '-' }} {{ formatRupiah(item.nominal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKeuangan, getNamaAkun } from '~/composables/useKeuangan'
import { useAum } from '~/composables/useAum'
import { formatRupiah, formatTanggal } from '~/utils/format'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Laporan Keuangan | PCM Berbah',
  meta: [
    {
      name: 'description',
      content: 'Laporan penerimaan, pengeluaran, dan saldo kas PCM Berbah serta unit AUM secara terbuka.',
    },
  ],
})

const { getFiltered, hitungRingkasan } = useKeuangan()
const { aumList } = useAum()

// Sinkronisasi dengan kapabilitas Admin (Periode & Default AUM)
const filterPeriode = ref('bulanan')
const selectedAum = ref('Semua AUM')

// Computed reaktif berdasarkan filter & dropdown
const riwayat = computed(() => getFiltered(selectedAum.value, filterPeriode.value))
const ringkasan = computed(() => hitungRingkasan(riwayat.value))
</script>
