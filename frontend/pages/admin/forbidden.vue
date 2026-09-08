<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

useHead({ title: 'Akses Ditolak | PCM Berbah' })
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg items-center justify-center px-4 text-center">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.18em] text-[#1B5E20]">403</p>
      <h1 class="mt-3 text-2xl font-bold text-gray-900">Akses tidak tersedia</h1>
      <p class="mt-3 text-sm leading-6 text-gray-500">
        Akun Anda tidak memiliki izin untuk membuka halaman ini.
      </p>
      <NuxtLink
        to="/admin/dashboard"
        class="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1B5E20] px-5 text-sm font-semibold text-white hover:bg-[#145218] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2"
      >
        Kembali ke beranda
      </NuxtLink>
    </div>
  </section>
</template>
