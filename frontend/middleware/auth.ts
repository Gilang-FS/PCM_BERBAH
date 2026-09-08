// Middleware ini akan berjalan setiap kali user mencoba akses halaman /admin/*
// Jika tidak ada token/role di localStorage, langsung arahkan ke /login.

export default defineNuxtRouteMiddleware((to) => {
  // Hanya jalankan di sisi client (browser), bukan server
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    const userRole = localStorage.getItem('auth_role')

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }

    if (userRole === 'admin' && !localStorage.getItem('auth_aum')) {
      return navigateTo('/login')
    }

    const superAdminOnlyRoutes = ['/admin/wakaf', '/admin/users']
    if (userRole !== 'superadmin' && superAdminOnlyRoutes.includes(to.path)) {
      return navigateTo('/admin/forbidden')
    }
  }
})
