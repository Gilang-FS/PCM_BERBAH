<template>
  <!-- Sticky Navbar -->
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300"
    :class="isScrolled ? 'shadow-md' : 'border-b border-gray-100'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo + Brand -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <img
            src="/images/logos/logo-muhammadiyah.png"
            alt="Logo PCM Berbah"
            class="w-9 h-9 object-contain"
          />
          <div class="flex flex-col leading-tight">
            <span class="text-[13px] font-bold tracking-[0.12em] text-[#1B5E20] uppercase">
              PCM Berbah
            </span>
            <span class="text-[9px] tracking-widest text-gray-400 uppercase hidden sm:block">
              Muhammadiyah
            </span>
          </div>
        </NuxtLink>

        <!-- Nav Desktop -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="relative px-4 py-2 text-[13.5px] font-medium text-gray-600 hover:text-[#1B5E20] transition-colors duration-200 group"
            :class="{ 'text-[#1B5E20]': $route.path === item.to }"
          >
            {{ item.label }}
            <!-- Garis bawah aktif -->
            <span
              class="absolute bottom-0 left-4 right-4 h-[2px] bg-[#1B5E20] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"
              :class="{ 'scale-x-100': $route.path === item.to }"
            ></span>
          </NuxtLink>
        </nav>

        <!-- Login Button (Desktop) + Hamburger (Mobile) -->
        <div class="flex items-center gap-3">
          <!-- Login -->
          <NuxtLink
            to="/login"
            class="hidden md:inline-flex items-center px-5 py-2 text-[13px] font-semibold text-white bg-[#1B5E20] rounded-lg hover:bg-[#145218] active:scale-[0.97] transition-all duration-200 shadow-sm tracking-wide"
          >
            Login
          </NuxtLink>

          <!-- Hamburger Button (Mobile) -->
          <button
            @click="toggleMenu"
            class="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] focus:outline-none"
            aria-label="Toggle menu"
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
        v-if="isMenuOpen"
        class="md:hidden bg-white border-t border-gray-100 shadow-lg"
      >
        <nav class="flex flex-col px-4 py-3 gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-3 text-[14px] font-medium text-gray-600 hover:text-[#1B5E20] hover:bg-green-50 rounded-lg transition-all duration-200"
            :class="{ 'text-[#1B5E20] bg-green-50': $route.path === item.to }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-[#1B5E20] transition-opacity"
              :class="$route.path === item.to ? 'opacity-100' : 'opacity-0'"
            ></span>
            {{ item.label }}
          </NuxtLink>

          <!-- Login Mobile -->
          <div class="pt-2 pb-1">
            <NuxtLink
              to="/login"
              @click="closeMenu"
              class="block w-full text-center py-3 text-[13.5px] font-semibold text-white bg-[#1B5E20] rounded-lg hover:bg-[#145218] transition-colors duration-200"
            >
              Login
            </NuxtLink>
          </div>
        </nav>
      </div>
    </transition>
  </header>

  <!-- Spacer agar konten tidak tertutup navbar -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
const route = useRoute()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

const navItems = [
  { to: '/', label: 'Beranda' },
  { to: '/wakaf', label: 'Wakaf' },
  { to: '/keuangan', label: 'Keuangan' },
  { to: '/struktur', label: 'Struktur' },
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Tutup menu saat route berubah
watch(() => route.path, () => closeMenu())

// Deteksi scroll untuk shadow navbar
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}
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
