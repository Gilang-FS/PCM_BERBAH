<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />

    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed top-6 right-6 z-[100] flex flex-col gap-3"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :type="toast.type"
          :message="toast.message"
          :duration="toast.duration"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </Teleport>
  </NuxtLayout>
</template>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
