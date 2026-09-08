// middleware/guest.ts
// Middleware untuk halaman publik (login, landing page).
// Jika user sudah login, jangan biarkan mereka membuka halaman login lagi —
// langsung redirect ke dashboard.

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    const userRole = localStorage.getItem('auth_role')
    if (token && (userRole === 'admin' || userRole === 'superadmin')) {
      return navigateTo('/admin/dashboard')
    }
  }
})
