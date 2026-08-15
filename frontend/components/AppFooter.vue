<template>
  <footer class="bg-[#1B5E20] text-white mt-auto">

    <!-- Main Footer Content -->
    <div class="max-w-7xl mx-auto px-5 py-10">

      <!-- Mobile: Stack vertikal | Desktop: Grid 3 kolom -->
      <div class="flex flex-col gap-8 md:grid md:grid-cols-3 md:gap-12">

        <!-- Brand & Deskripsi -->
        <div class="flex flex-col items-center text-center md:items-start md:text-left">
          <div class="flex items-center gap-3 mb-3">
            <img
              src="/images/logos/logo-muhammadiyah.png"
              alt="Logo Muhammadiyah"
              class="w-8 h-8 object-contain brightness-0 invert"
            />
            <span class="font-bold tracking-widest text-sm uppercase">PCM Berbah</span>
          </div>
          <p class="text-green-200 text-[12.5px] leading-relaxed max-w-[260px]">
            Pimpinan Cabang Muhammadiyah Berbah, Sleman, Yogyakarta.
            Bergerak maju bersama untuk umat.
          </p>
        </div>

        <!-- Navigasi Cepat -->
        <div class="flex flex-col items-center text-center md:items-start md:text-left">
          <h4 class="text-[11px] font-bold tracking-[0.2em] uppercase text-green-300 mb-4">
            Navigasi
          </h4>
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="item in navLinks"
              :key="item.to"
              :to="item.to"
              class="text-[13px] text-green-100 hover:text-white transition-colors duration-200"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Kontak -->
        <div class="flex flex-col items-center text-center md:items-start md:text-left">
          <h4 class="text-[11px] font-bold tracking-[0.2em] uppercase text-green-300 mb-4">
            Hubungi Kami
          </h4>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center gap-2 justify-center md:justify-start">
              <svg class="w-3.5 h-3.5 text-green-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-[12.5px] text-green-100">Berbah, Sleman, Yogyakarta</span>
            </div>
            <div class="flex items-center gap-2 justify-center md:justify-start">
              <svg class="w-3.5 h-3.5 text-green-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-[12.5px] text-green-100">0821-333-555</span>
            </div>
            <div class="flex items-center gap-2 justify-center md:justify-start">
              <svg class="w-3.5 h-3.5 text-green-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-[12.5px] text-green-100">info@pcmberbah.or.id</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Copyright Bar -->
    <div class="border-t border-green-700">
      <div class="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-[11px] text-green-400 tracking-wide text-center sm:text-left">
          © {{ new Date().getFullYear() }} PCM Berbah Muhammadiyah. Hak cipta dilindungi.
        </p>
        <p class="text-[11px] text-green-500 tracking-wide">
          Sistem Informasi PCM Berbah
        </p>
      </div>
    </div>

  </footer>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/struktur', label: 'Struktur Organisasi' },
  { to: '/keuangan', label: 'Laporan Keuangan' },
  { to: '/wakaf', label: 'Program Wakaf' },
]
</script>
