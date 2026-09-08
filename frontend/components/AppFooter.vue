<template>
  <footer class="mt-auto bg-[#144a18] pb-7 pt-14 text-[#F7F5EE] lg:pt-16">
    <div class="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-16">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-12 lg:grid-cols-12 lg:gap-12">
        <!-- Kiri: Brand & Deskripsi -->
        <div class="flex flex-col md:col-span-2 lg:col-span-5">
          <h2 class="mb-6 text-[18px] font-bold text-[#F7F5EE] lg:text-[20px]">PCM Berbah</h2>
          <p class="max-w-[32rem] text-left text-[15px] leading-6 text-[#F7F5EE]/80 sm:text-justify lg:text-[16px]">
            Media informasi resmi Pimpinan Cabang Muhammadiyah Berbah untuk pelayanan umat, transparansi, dan dakwah Islam berkemajuan.
          </p>
        </div>

        <!-- Tengah: Navigasi Cepat -->
        <div class="flex flex-col lg:col-span-3">
          <h2 class="mb-6 text-[18px] font-bold text-[#F7F5EE] lg:text-[20px]">Menu Cepat</h2>
          <div class="flex flex-col gap-3">
            <NuxtLink
              v-for="item in navLinks"
              :key="item.to"
              :to="item.to"
              class="w-fit rounded-sm text-[15px] leading-6 text-[#F7F5EE]/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#144a18] lg:text-[16px]"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Kanan: Kontak -->
        <div class="flex flex-col lg:col-span-4">
          <h2 class="mb-6 text-[18px] font-bold text-[#F7F5EE] lg:text-[20px]">Kontak</h2>
          <div class="flex max-w-md flex-col gap-4 text-left text-[15px] leading-6 text-[#F7F5EE]/80 sm:text-justify lg:text-[16px]">
            <p class="text-left">Kantor PCM Berbah</p>
            <address class="not-italic">
              Jl. Tegal Sari, Krikilan, Kalurahan Tegaltirto,<br />
              Kapanewon Berbah, Kabupaten Sleman,<br />
              Daerah Istimewa Yogyakarta 55573
            </address>
            <p>Telepon: (0722) 333 5535</p>
            <p>Email: info@pcmberbah.com</p>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-12 border-t border-white/10 pt-6 lg:mt-14">
        <p class="text-left text-[12px] text-[#F7F5EE]/75 lg:text-[13px]">
          © {{ new Date().getFullYear() }} Pimpinan Cabang Muhammadiyah Berbah. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/wakaf', label: 'Wakaf' },
  { to: '/keuangan', label: 'Keuangan' },
  { to: '/struktur', label: 'Struktur Organisasi' },
]
</script>
