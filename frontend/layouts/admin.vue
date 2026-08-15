<template>
  <div class="min-h-screen bg-[#f5f6fa] flex flex-col">

    <!-- TOPBAR -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white h-14 flex items-center px-4 shadow-sm">
      <div class="flex items-center justify-between w-full">

        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <img src="/images/logos/logo-muhammadiyah.png" alt="Logo" class="w-7 h-7 object-contain" />
          <div class="leading-tight">
            <p class="text-[12px] font-bold text-[#1B5E20] tracking-wider uppercase">PCM Berbah</p>
            <p class="text-[9px] text-gray-400 tracking-widest hidden sm:block">DASHBOARD</p>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Role Badge -->
          <span
            class="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            :class="userRole === 'superadmin'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'"
          >
            {{ userRole === 'superadmin' ? 'Superadmin' : 'Admin' }}
          </span>

          <!-- Logout -->
          <button @click="handleLogout" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Logout">
            <svg class="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
    <div class="h-14"></div>

    <!-- BODY -->
    <div class="flex flex-1">

      <!-- SIDEBAR (Desktop) -->
      <aside class="hidden md:flex flex-col w-[220px] bg-white border-r border-gray-100 fixed top-14 bottom-0 left-0 overflow-y-auto py-5 px-3">

        <p class="text-[9px] font-bold text-gray-300 tracking-[0.2em] uppercase px-3 mb-3">MENU UTAMA</p>

        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
          :class="isActive(item.to)
            ? 'bg-[#1B5E20] text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'"
        >
          <component :is="item.icon" class="w-[18px] h-[18px]" />
          {{ item.label }}
        </NuxtLink>

        <!-- Superadmin Section -->
        <template v-if="userRole === 'superadmin'">
          <div class="border-t border-gray-100 my-4"></div>
          <p class="text-[9px] font-bold text-gray-300 tracking-[0.2em] uppercase px-3 mb-3">PENGATURAN</p>

          <NuxtLink
            v-for="item in superAdminMenuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
            :class="isActive(item.to)
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'"
          >
            <component :is="item.icon" class="w-[18px] h-[18px]" />
            {{ item.label }}
          </NuxtLink>
        </template>

      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 md:ml-[220px] p-4 sm:p-6 pb-24 md:pb-6">
        <slot />
      </main>
    </div>

    <!-- BOTTOM NAV (Mobile) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div class="flex">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors duration-150 relative"
          :class="isActive(item.to) ? 'text-[#1B5E20]' : 'text-gray-400'"
        >
          <!-- Active indicator -->
          <span
            v-if="isActive(item.to)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#1B5E20] rounded-b-full"
          ></span>
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const userRole = ref('')

onMounted(() => {
  const role = localStorage.getItem('user_role')
  if (!role) {
    router.push('/login')
    return
  }
  userRole.value = role
})

const isActive = (path: string) => route.path === path

// SVG Icon Components (Inline — lightweight, no library needed)
const IconDashboard = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" /></svg>`
})
const IconKeuangan = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
})
const IconWakaf = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`
})
const IconStruktur = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
})
const IconUsers = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
})
const IconBerita = defineComponent({
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`
})

// Menu items
const menuItems = [
  { to: '/admin/dashboard', icon: IconDashboard, label: 'Dashboard' },
  { to: '/admin/keuangan', icon: IconKeuangan, label: 'Keuangan' },
]

const superAdminMenuItems = [
  { to: '/admin/wakaf', icon: IconWakaf, label: 'Wakaf' },
  { to: '/admin/struktur', icon: IconStruktur, label: 'Struktur' },
  { to: '/admin/users', icon: IconUsers, label: 'Kelola User' },
]

const bottomNavItems = computed(() => {
  const base = [
    { to: '/admin/dashboard', icon: IconDashboard, label: 'Home' },
    { to: '/admin/keuangan', icon: IconKeuangan, label: 'Keuangan' },
  ]
  if (userRole.value === 'superadmin') {
    base.push({ to: '/admin/wakaf', icon: IconWakaf, label: 'Wakaf' })
    base.push({ to: '/admin/users', icon: IconUsers, label: 'Lainnya' })
  }
  return base
})

const handleLogout = () => {
  localStorage.removeItem('user_role')
  router.push('/login')
}
</script>
