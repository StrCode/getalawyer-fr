<script setup lang="ts">
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  open: boolean
  title?: string
  description?: string
  deleting?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: []
}>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="gap-[1.1rem] rounded-[1.75rem] border-border bg-card p-[clamp(1.4rem,4vw,2rem)] sm:max-w-[30rem]">
      <DialogHeader class="gap-[0.5rem] text-left">
        <DialogTitle class="font-display text-[1.5rem] leading-[1.1] font-[650] tracking-[-0.03em]">{{ title ?? 'Remove this?' }}</DialogTitle>
        <DialogDescription class="text-[1rem] text-muted-foreground">
          {{ description ?? 'This will be removed from your profile.' }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="mt-[0.3rem] gap-[0.6rem]">
        <Button
          type="button"
          variant="line"
          size="pill"
          @click="close"
        >
          Keep it
        </Button>
        <ButtonBusy
          type="button"
          variant="destructive"
          size="pill"
          class="rounded-full"
          :loading="deleting"
          @click="emit('confirm')"
        >
          Remove
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
