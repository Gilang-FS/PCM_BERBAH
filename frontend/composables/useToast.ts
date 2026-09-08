export const useToast = () => {
  const toasts = useState<{ id: number; type: 'success' | 'error' | 'info' | 'warning'; message: string; duration?: number }[]>('app_toasts', () => [])

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => {
    const id = Date.now()
    toasts.value.push({ id, type, message, duration })
    return id
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message: string, duration?: number) => addToast('success', message, duration)
  const error = (message: string, duration?: number) => addToast('error', message, duration)
  const info = (message: string, duration?: number) => addToast('info', message, duration)
  const warning = (message: string, duration?: number) => addToast('warning', message, duration)

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
