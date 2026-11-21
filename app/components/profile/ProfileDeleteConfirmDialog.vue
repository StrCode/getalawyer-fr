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
    <DialogContent class="gap-4.5 rounded-2xl border-border bg-card p-5.5 md:p-7.75 lg:p-8 sm:max-w-120">
      <DialogHeader class="gap-2 text-left">
        <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">{{ title ?? 'Remove this?' }}</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          {{ description ?? 'This will be removed from your profile.' }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="mt-1.25 gap-2.5">
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
