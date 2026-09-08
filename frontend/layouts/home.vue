<template>
  <div class="public-site flex min-h-screen flex-col bg-[#f3f1ea] font-publicSans text-[#252b28]">
    <a href="#main-content" class="fixed left-4 top-4 z-[100] -translate-y-24 rounded-[6px] bg-white px-4 py-2 font-bold text-[#144a18] shadow-lg transition-transform focus:translate-y-0">Lewati ke konten utama</a>
    <NavBar />
    <main id="main-content" tabindex="-1" class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
