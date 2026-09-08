<script setup lang="ts">
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

const props = defineProps<ToastProps>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const duration = props.duration ?? 3000
let timeoutId: ReturnType<typeof setTimeout> | null = null
let remaining = duration
let startedAt = 0

const startTimer = () => {
  if (remaining <= 0) return
  startedAt = Date.now()
  timeoutId = setTimeout(() => emit('close'), remaining)
}

const pauseTimer = () => {
  if (!timeoutId) return
  clearTimeout(timeoutId)
  timeoutId = null
  remaining = Math.max(0, remaining - (Date.now() - startedAt))
}

onMounted(() => {
  if (duration > 0) startTimer()
})

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div
    class="toast-item flex w-[min(28rem,calc(100vw-3rem))] items-start gap-3 rounded-lg border px-4 py-3.5 shadow-lg transition-all duration-300 animate-slide-in"
    :class="{
      'border-green-200 bg-green-50 text-green-800': type === 'success',
      'border-red-200 bg-red-50 text-red-800': type === 'error',
      'border-blue-200 bg-blue-50 text-blue-800': type === 'info',
      'border-yellow-200 bg-yellow-50 text-yellow-800': type === 'warning'
    }"
    :role="type === 'error' ? 'alert' : 'status'"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
    @mouseenter="pauseTimer"
    @mouseleave="startTimer"
    @focusin="pauseTimer"
    @focusout="startTimer"
  >
    <div class="mt-0.5 shrink-0">
      <svg v-if="type === 'success'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="type === 'error'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="type === 'info'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="type === 'warning'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div class="flex-1 text-sm leading-5">
      <p class="font-semibold">{{ type === 'success' ? 'Berhasil!' : type === 'error' ? 'Gagal!' : type === 'warning' ? 'Peringatan!' : 'Info!' }}</p>
      <p class="mt-1 opacity-90">{{ message }}</p>
    </div>
    <button
      type="button"
      class="ml-2 text-current opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
      aria-label="Tutup notifikasi"
      @click="emit('close')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toast-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
