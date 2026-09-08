<template>
  <div class="min-h-screen bg-[#f5f6fa] flex flex-col">
    <a href="#admin-main-content" class="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1B5E20] shadow-lg transition-transform focus:translate-y-0">Lewati ke konten utama</a>
    <!-- TOPBAR -->
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-white h-14 flex items-center px-4 shadow-sm"
    >
      <div class="flex items-center justify-between w-full">
        <!-- Logo & Hamburger -->
        <div class="flex items-center gap-2.5">
          <button
            ref="mobileMenuButton"
            type="button"
            @click="toggleMobileMenu"
            class="md:hidden p-1.5 -ml-1.5 mr-0.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] focus-visible:ring-offset-2"
            :aria-label="isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="admin-sidebar"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src="/images/logos/logo-muhammadiyah.png"
            alt="Logo Muhammadiyah"
            class="w-7 h-7 object-contain"
          />
          <p class="text-[12px] font-bold text-[#1B5E20] tracking-wider uppercase">
            PCM Berbah
          </p>
        </div>

        <!-- Right side — hanya Role Badge, logout sudah dipindah ke sidebar -->
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="max-w-48 truncate text-[11px] font-semibold text-gray-700">@{{ username }}</p>
            <p v-if="userAum" class="max-w-48 truncate text-[9px] text-gray-400">{{ userAum }}</p>
          </div>
          <span
            class="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            :class="
              userRole === 'superadmin'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            "
          >
            {{ userRole === "superadmin" ? "Superadmin" : "Admin" }}
          </span>
        </div>
      </div>
    </header>
    <div class="h-14"></div>

    <!-- BODY -->
    <div class="flex flex-1 relative">
      <!-- Backdrop -->
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-gray-900/40 z-30 md:hidden backdrop-blur-sm"
        @click="closeMobileMenu()"
      ></div>

      <!-- SIDEBAR -->
      <aside
        id="admin-sidebar"
        ref="adminSidebar"
        :inert="isSidebarHiddenFromInteraction"
        :aria-hidden="isSidebarHiddenFromInteraction ? 'true' : undefined"
        class="flex flex-col w-[220px] bg-white border-r border-gray-100 fixed top-14 bottom-0 left-0 overflow-y-auto py-5 px-3 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl md:shadow-none"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        @keydown.tab="trapSidebarFocus"
      >
        <p
          class="text-[9px] font-bold text-gray-300 tracking-[0.2em] uppercase px-3 mb-3"
        >
          MENU UTAMA
        </p>

        <!-- Dashboard -->
        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
          :class="
            isActive('/admin/dashboard')
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          "
          :aria-current="isActive('/admin/dashboard') ? 'page' : undefined"
        >
          <svg
            class="w-[18px] h-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
            />
          </svg>
          Beranda
        </NuxtLink>

        <!-- Keuangan -->
        <NuxtLink
          to="/admin/keuangan"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
          :class="
            isActive('/admin/keuangan')
              ? 'bg-[#1B5E20] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          "
          :aria-current="isActive('/admin/keuangan') ? 'page' : undefined"
        >
          <svg
            class="w-[18px] h-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Keuangan
        </NuxtLink>

        <!-- Superadmin-only menu -->
        <template v-if="userRole === 'superadmin'">
          <div class="border-t border-gray-100 my-4"></div>
          <p
            class="text-[9px] font-bold text-gray-300 tracking-[0.2em] uppercase px-3 mb-3"
          >
            PENGATURAN
          </p>

          <!-- Wakaf -->
          <NuxtLink
            to="/admin/wakaf"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
            :class="
              isActive('/admin/wakaf')
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            "
            :aria-current="isActive('/admin/wakaf') ? 'page' : undefined"
          >
            <svg
              class="w-[18px] h-[18px] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Wakaf
          </NuxtLink>

          <!-- Manage User -->
          <NuxtLink
            to="/admin/users"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 mb-0.5"
            :class="
              isActive('/admin/users')
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            "
            :aria-current="isActive('/admin/users') ? 'page' : undefined"
          >
            <svg
              class="w-[18px] h-[18px] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Pengguna
          </NuxtLink>
        </template>

        <!-- Spacer supaya logout selalu di bawah -->
        <div class="flex-1"></div>

        <!-- Logout & Profil di sidebar -->
        <div class="border-t border-gray-100 mt-4 pt-3 space-y-0.5">
          <!-- Profil Saya (semua role) -->
          <NuxtLink
            to="/admin/profil"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
            :class="
              isActive('/admin/profil')
                ? 'bg-[#1B5E20] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            "
            :aria-current="isActive('/admin/profil') ? 'page' : undefined"
          >
            <svg
              class="w-[18px] h-[18px] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profil Saya
          </NuxtLink>

          <!-- Logout -->
          <button
            type="button"
            ref="logoutButton"
            @click="openLogoutConfirm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full"
          >
            <svg
              class="w-[18px] h-[18px] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main id="admin-main-content" tabindex="-1" :inert="isMobileViewport && isMobileMenuOpen" class="w-full min-w-0 p-4 pb-6 sm:p-6 md:ml-[220px] md:w-[calc(100%-220px)]">
        <slot />
      </main>
    </div>

    <!-- Modal Konfirmasi Logout -->
    <Teleport to="body">
      <div
        v-if="showLogoutConfirm"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @keydown.esc="closeLogoutConfirm"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeLogoutConfirm"
        ></div>
        <div
          ref="logoutDialog"
          class="relative bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          tabindex="-1"
          @keydown="handleLogoutDialogKeydown"
        >
        <div class="p-6 text-center">
          <!-- Icon -->
          <div
            class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <h3 id="logout-title" class="text-[16px] font-bold text-gray-800 mb-1">
            Keluar dari akun?
          </h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">
            Anda perlu login kembali untuk mengakses dashboard.
          </p>

          <!-- Tombol -->
          <div class="flex gap-3 mt-6">
            <button
              ref="logoutCancelButton"
              type="button"
              @click="closeLogoutConfirm"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              @click="handleLogout"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const route = useRoute();
const router = useRouter();
const { logout, userRole, username, userAum } = useAuth()

const isMobileMenuOpen = ref(false);
const showLogoutConfirm = ref(false);
const isMobileViewport = ref(false)
const mobileMenuButton = ref<HTMLButtonElement | null>(null)
const adminSidebar = ref<HTMLElement | null>(null)
const logoutButton = ref<HTMLButtonElement | null>(null)
const logoutDialog = ref<HTMLElement | null>(null)
const logoutCancelButton = ref<HTMLButtonElement | null>(null)
let mobileMediaQuery: MediaQueryList | null = null
let logoutTrigger: HTMLElement | null = null
let previousBodyOverflow = ''
let bodyScrollIsLocked = false

const isSidebarHiddenFromInteraction = computed(() => isMobileViewport.value && !isMobileMenuOpen.value)
const isBodyScrollLocked = computed(() => (isMobileViewport.value && isMobileMenuOpen.value) || showLogoutConfirm.value)

const syncMobileViewport = (event?: MediaQueryListEvent) => {
  isMobileViewport.value = event?.matches ?? mobileMediaQuery?.matches ?? false
  if (!isMobileViewport.value) isMobileMenuOpen.value = false
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileViewport.value && isMobileMenuOpen.value && !showLogoutConfirm.value) {
    event.preventDefault()
    closeMobileMenu(true)
  }
}

onMounted(() => {
  if (userRole.value !== 'admin' && userRole.value !== 'superadmin') {
    router.replace('/login')
  }

  mobileMediaQuery = window.matchMedia('(max-width: 767px)')
  syncMobileViewport()
  mobileMediaQuery.addEventListener('change', syncMobileViewport)
  window.addEventListener('keydown', handleGlobalKeydown)
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncMobileViewport)
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (bodyScrollIsLocked) document.body.style.overflow = previousBodyOverflow
})

const isActive = (path: string) => route.path === path;

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const trapSidebarFocus = (event: KeyboardEvent) => {
  if (!isMobileViewport.value || !isMobileMenuOpen.value || !adminSidebar.value) return
  const focusable = Array.from(adminSidebar.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isMobileMenuOpen, async (isOpen) => {
  if (!isOpen || !isMobileViewport.value) return
  await nextTick()
  adminSidebar.value?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus()
})

const closeMobileMenu = async (restoreFocus = false) => {
  isMobileMenuOpen.value = false;
  if (restoreFocus) {
    await nextTick()
    mobileMenuButton.value?.focus()
  }
};

const openLogoutConfirm = () => {
  logoutTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : logoutButton.value
  showLogoutConfirm.value = true
}

const closeLogoutConfirm = async () => {
  showLogoutConfirm.value = false
  await nextTick()
  if (logoutTrigger?.isConnected) logoutTrigger.focus()
  else logoutButton.value?.focus()
  logoutTrigger = null
}

const handleLogoutDialogKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeLogoutConfirm()
    return
  }
  if (event.key !== 'Tab' || !logoutDialog.value) return

  const focusable = Array.from(logoutDialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) {
    event.preventDefault()
    logoutDialog.value.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(showLogoutConfirm, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  if (logoutCancelButton.value) logoutCancelButton.value.focus()
  else logoutDialog.value?.focus()
})

watch(isBodyScrollLocked, (shouldLock) => {
  if (shouldLock === bodyScrollIsLocked) return
  if (shouldLock) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
    previousBodyOverflow = ''
  }
  bodyScrollIsLocked = shouldLock
})

watch(
  () => route.path,
  () => {
    closeMobileMenu();
  },
);

const handleLogout = async () => {
  logoutTrigger = null
  showLogoutConfirm.value = false
  logout()
  await router.replace({ path: '/' })
}
</script>
