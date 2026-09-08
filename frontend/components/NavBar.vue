<template>
  <header
    class="fixed left-0 right-0 top-0 z-50 border-b border-[#dedbd1] bg-white/95 backdrop-blur-sm"
  >
    <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
      <div class="flex items-center justify-between h-[76px]">

        <!-- Logo + Brand -->
        <NuxtLink
          to="/"
          class="flex min-w-0 items-center gap-3 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2 sm:gap-3.5"
          aria-label="Pimpinan Cabang Muhammadiyah Berbah"
        >
          <img
            src="/images/logos/logo-muhammadiyah.png"
            alt="Logo Muhammadiyah"
            width="44"
            height="44"
            class="h-11 w-11 shrink-0 object-contain"
          />
          <div class="min-w-0 leading-[1.35]">
            <span class="sm:hidden text-[13px] font-bold tracking-[0.08em] text-[#144a18] uppercase">
              PCM Berbah
            </span>
            <div class="hidden text-[12px] font-bold uppercase tracking-[0.085em] text-[#144a18] sm:block lg:text-[13px]">
              <span class="block whitespace-nowrap">Pimpinan Cabang</span>
              <span class="block whitespace-nowrap">Muhammadiyah Berbah</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Nav Desktop -->
        <nav class="hidden items-center gap-1 lg:flex">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-current="$route.path === item.to ? 'page' : undefined"
            class="group relative rounded-[6px] px-7 py-3 text-[16px] font-semibold text-gray-700 transition-colors hover:text-[#144a18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
            :class="{ 'text-[#144a18]': $route.path === item.to }"
          >
            {{ item.label }}
            <!-- Garis bawah aktif -->
            <span
              class="absolute bottom-1 left-7 right-7 h-[2px] origin-center scale-x-0 bg-[#144a18] transition-transform group-hover:scale-x-100"
              :class="{ 'scale-x-100': $route.path === item.to }"
            ></span>
          </NuxtLink>
        </nav>

        <!-- Login Button (Desktop) + Hamburger (Mobile) -->
        <div class="flex items-center gap-3">
          <!-- Login -->
          <NuxtLink
            to="/login"
            class="hidden items-center rounded-[10px] border border-[#145218] bg-[#144a18] px-5 py-2 text-[16px] font-semibold text-white transition-colors hover:bg-[#145218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2 lg:inline-flex"
          >
            Login
          </NuxtLink>

          <!-- Hamburger Button (Mobile) -->
          <button
            ref="menuButton"
            @click="toggleMenu"
            type="button"
            class="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2 lg:hidden"
            :aria-label="isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-navigation"
          >
            <span
              class="block w-5 h-[1.5px] bg-gray-700 rounded transition-all duration-300"
              :class="isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''"
            ></span>
            <span
              class="block w-5 h-[1.5px] bg-gray-700 rounded transition-all duration-300"
              :class="isMenuOpen ? 'opacity-0 scale-x-0' : ''"
            ></span>
            <span
              class="block w-5 h-[1.5px] bg-gray-700 rounded transition-all duration-300"
              :class="isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''"
            ></span>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <transition name="slide-down">
      <div
        id="mobile-navigation"
        v-if="isMenuOpen"
        @keydown.esc="closeMenu(true)"
        class="absolute left-0 right-0 top-[76px] max-h-[calc(100dvh-76px)] overflow-y-auto border-b border-t border-gray-200 border-b-[#dedbd1] bg-white shadow-[0_10px_24px_rgba(31,41,36,0.08)] lg:hidden"
      >
        <nav class="flex flex-col px-5 py-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-current="$route.path === item.to ? 'page' : undefined"
            @click="closeMenu()"
            class="flex items-center border-b border-gray-100 px-1 py-3 text-[14px] font-semibold text-gray-700 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B5E20]"
            :class="{ 'text-primary-900': $route.path === item.to }"
          >
            {{ item.label }}
          </NuxtLink>

          <!-- Login Mobile -->
          <div class="py-3">
            <NuxtLink
              to="/login"
              @click="closeMenu()"
              class="flex w-full justify-center bg-primary-900 py-3 text-[14px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              Login
            </NuxtLink>
          </div>
        </nav>
      </div>
    </transition>
  </header>

  <!-- Spacer agar konten tidak tertutup navbar -->
  <div class="h-[76px]"></div>
</template>

<script setup lang="ts">
const route = useRoute()

const isMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

const navItems = [
  { to: '/', label: 'Beranda' },
  { to: '/wakaf', label: 'Wakaf' },
  { to: '/keuangan', label: 'Keuangan' },
  { to: '/struktur', label: 'Struktur' },
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = (restoreFocus = false) => {
  isMenuOpen.value = false
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

// Tutup menu saat route berubah
watch(() => route.path, () => closeMenu())

</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
