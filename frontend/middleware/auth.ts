// Middleware ini akan berjalan setiap kali user mencoba akses halaman /admin/*
// Jika tidak ada token/role di localStorage, langsung tendang ke /login

export default defineNuxtRouteMiddleware((to) => {
  // Hanya jalankan di sisi client (browser), bukan server
  if (import.meta.client) {
    const userRole = localStorage.getItem('user_role')

    // Jika tidak ada role → redirect ke login
    if (!userRole) {
      return navigateTo('/login')
    }

    // Jika role adalah 'admin' biasa tapi mencoba akses halaman superadmin
    const superAdminOnlyRoutes = ['/admin/wakaf', '/admin/struktur', '/admin/users']
    if (userRole === 'admin' && superAdminOnlyRoutes.includes(to.path)) {
      return navigateTo('/admin/dashboard')
    }
  }
})
