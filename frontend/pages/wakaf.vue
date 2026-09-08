<script setup>
import { computed, ref } from 'vue'
import { useAum } from '~/composables/useAum'
import { useAumProfiles } from '~/composables/useAumProfiles'
import { useWakaf } from '~/composables/useWakaf'
import { formatRupiah, formatTanggal } from '~/utils/format'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Profil AUM & Wakaf | PCM Berbah',
  meta: [
    {
      name: 'description',
      content: 'Profil singkat, visi misi, dan informasi aset wakaf AUM PCM Berbah.',
    },
  ],
})

const { aumList } = useAum()
const { getAumProfile } = useAumProfiles()
const { wakafData } = useWakaf()

const selectedAum = ref(aumList[0])
const selectedProfile = computed(() => getAumProfile(selectedAum.value))
const filteredWakaf = computed(() =>
  wakafData.value
    .filter(item => item.aum === selectedAum.value)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
)
const activeAssets = computed(() => filteredWakaf.value.filter(item => item.status === 'Aktif').length)
const totalValue = computed(() =>
  filteredWakaf.value.reduce((total, item) => total + (Number(item.nominal) || 0), 0)
)
</script>

<template>
  <div class="flex flex-col bg-white">

    <!-- ============================================================
         BAGIAN 1: HERO — Header foto pendek landscape + kontrol AUM
    ============================================================= -->
    <section aria-labelledby="wakaf-page-title">
      <!-- Foto AUM: landscape, judul di dalam foto -->
      <div class="relative h-56 overflow-hidden bg-[#20241f] sm:h-64 md:h-72">
        <img
          :key="selectedAum"
          :src="selectedProfile.hero"
          :alt="`Foto ${selectedAum}`"
          class="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div class="absolute inset-0 flex items-end px-6 pb-7 md:px-10 lg:px-14">
          <div class="max-w-3xl border-l-4 border-[#144a18] pl-5 text-left sm:pl-7">
            <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-xs">Profil AUM &amp; Aset Wakaf</p>
            <h1 id="wakaf-page-title" class="public-hero-title font-serif text-[26px] font-bold leading-[1.2] text-white sm:text-[32px] lg:text-[38px]">{{ selectedAum }}</h1>
          </div>
        </div>
      </div>

      <!-- Dropdown pilih AUM -->
      <div class="border-b border-[#dedbd1] bg-[#f0eee7] px-6 py-4 md:px-10 lg:px-14">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[12px] font-bold text-[#252b28]">Pilih unit / AUM</p>
          <div class="relative w-full sm:w-[300px]">
            <label for="public-wakaf-aum" class="sr-only">Pilih Unit / AUM</label>
            <select
              id="public-wakaf-aum"
              v-model="selectedAum"
              class="w-full appearance-none rounded-[10px] border border-[#c9c5ba] bg-white px-4 py-3 pr-10 text-[13px] font-semibold text-gray-800 focus:border-[#144a18] focus:outline-none focus:ring-2 focus:ring-[#144a18]/20"
            >
              <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         BAGIAN 2: PROFIL SINGKAT (kiri) + INFORMASI UNIT (kanan)
    ============================================================= -->
    <section aria-labelledby="aum-profile-title">
      <div class="mx-6 border-t border-[#d8d4c9] py-10 md:mx-10 md:py-12 lg:mx-14 lg:py-14">
        <!-- Grid 2:1 (Profil ambil 2 kolom, Info ambil 1 kolom) -->
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12 xl:gap-16">

          <!-- Kiri (2/3): Profil singkat -->
          <div class="lg:col-span-2">
            <div class="mb-5 border-b border-[#dedbd1] pb-4">
              <h2 id="aum-profile-title" class="public-section-title text-gray-900">Profil Singkat</h2>
            </div>
            <p class="text-left text-[16px] leading-relaxed text-gray-700 sm:text-justify">{{ selectedProfile.profile }}</p>
          </div>

          <!-- Kanan (1/3): Informasi Identitas -->
          <div class="border-t border-[#d8d4c9] pt-10 lg:col-span-1 lg:border-t-0 lg:pt-0">
            <!-- Box dengan border keliling, tanpa pemisah internal -->
            <div class="rounded-[10px] border-2 border-[#e4e1d8] bg-white p-5 sm:p-6">
              <h2 class="mb-5 font-serif text-[18px] font-bold text-[#252b28]">Informasi Unit</h2>

              <ul class="flex flex-col gap-4">
                <li
                  v-for="info in selectedProfile.info"
                  :key="info.label"
                  class="flex flex-col gap-1"
                >
                  <span class="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">{{ info.label }}</span>
                   <span class="break-words text-[14px] leading-snug text-[#252b28] sm:text-[15px]">{{ info.value }}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ============================================================
         BAGIAN 4: DATA ASET WAKAF — header (judul + stats) + grid kartu
    ============================================================= -->
    <section aria-labelledby="wakaf-data-title">
      <div class="mx-6 pb-10 md:mx-10 md:pb-12 lg:mx-14 lg:pb-14">

        <!-- Header: Judul -->
        <div class="mb-6 border-b border-[#dedbd1] pb-4">
          <h2 id="wakaf-data-title" class="public-section-title text-[#252b28]">Aset Wakaf {{ selectedAum }}</h2>
        </div>

        <!-- Stats Ringkasan Besar (seperti Keuangan) -->
        <div class="mb-10 grid grid-cols-1 overflow-hidden rounded-[10px] border border-[#d8d4c9] divide-y divide-[#d8d4c9] md:grid-cols-3 md:divide-x md:divide-y-0">
          <div class="bg-[#faf9f5] p-5 sm:p-6">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Total Aset</p>
            <p class="text-2xl font-semibold tabular-nums text-[#252b28] lg:text-[28px]">{{ filteredWakaf.length }}</p>
          </div>
          <div class="bg-[#faf9f5] p-5 sm:p-6">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Aset Aktif</p>
            <p class="text-2xl font-semibold tabular-nums text-[#252b28] lg:text-[28px]">{{ activeAssets }}</p>
          </div>
          <div class="bg-[#eef2e7] p-5 sm:p-6">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Total Nilai Wakaf</p>
             <p class="break-words text-2xl font-bold tabular-nums text-[#252b28] lg:text-[28px]">{{ formatRupiah(totalValue) }}</p>
          </div>
        </div>

        <!-- Grid kartu aset -->
        <div v-if="filteredWakaf.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in filteredWakaf"
            :key="item.id"
            class="flex flex-col overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-white"
          >
            <div class="relative h-36 overflow-hidden bg-[#ece9df] sm:h-40">
              <img
                :src="item.image"
                :alt="`Foto ${item.jenis_aset}`"
                class="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                loading="lazy"
              />
              <span
                class="absolute right-2.5 top-2.5 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]"
                :class="item.status === 'Aktif' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'"
              >
                {{ item.status }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-4">
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-[#144a18]">{{ formatTanggal(item.tanggal) }}</p>
               <h3 class="mt-1.5 break-words font-serif text-[17px] font-bold leading-snug text-[#252b28]">{{ item.jenis_aset }}</h3>
               <p class="mt-1.5 line-clamp-2 break-words text-[11px] font-semibold leading-4 text-gray-500">{{ item.lokasi }}</p>
              <p class="mt-3 line-clamp-2 flex-1 text-[12px] leading-5 text-gray-600">{{ item.keterangan || 'Belum ada keterangan tambahan.' }}</p>
              <div class="mt-3 border-t border-[#dedbd1] pt-3">
                <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">Nilai / Terkumpul</p>
                <p class="mt-0.5 text-[15px] font-bold text-[#144a18]">{{ formatRupiah(item.nominal) }}</p>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="rounded-[10px] border border-dashed border-[#c9c5ba] bg-[#faf9f5] px-6 py-10 text-center"
          role="status"
        >
          <p class="text-[14px] text-gray-500">Belum ada data yang tersedia untuk unit ini.</p>
        </div>

      </div>
    </section>

  </div>
</template>
