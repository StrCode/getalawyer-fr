<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="iconOnly ? resolvedAriaLabel : undefined"
    :class="cn(
      'inline-flex shrink-0 items-center justify-center gap-2.5 bg-white/60 hover:bg-white active:scale-[0.98] disabled:opacity-50 border border-border/50 rounded-2xl font-semibold text-sidebar shadow-sm transition-all duration-200 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary',
      iconOnly ? 'h-11 min-w-0 flex-1 px-3' : 'h-11 w-full px-4 text-sm whitespace-nowrap',
    )"
    @click="$emit('click')"
  >
    <PhCircleNotch v-if="loading" class="w-5 h-5 shrink-0 animate-spin text-muted-foreground" />
    <template v-else>
      <svg v-if="provider === 'google'" viewBox="0 0 24 24" class="w-5 h-5 shrink-0" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" class="w-5 h-5 shrink-0" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="#1877F2"/>
      </svg>
    </template>
    <span v-if="!iconOnly" class="truncate"><slot /></span>
  </button>
</template>

<script setup lang="ts">
import { PhCircleNotch } from '@phosphor-icons/vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  provider: 'google' | 'facebook'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  ariaLabel?: string
}>(), {
  iconOnly: false,
})

defineEmits<{
  click: []
}>()

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  return props.provider === 'google' ? 'Continue with Google' : 'Continue with Facebook'
})
</script>
