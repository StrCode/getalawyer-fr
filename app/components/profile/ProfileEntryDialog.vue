<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * The dialog that adds or edits one entry of a profile list. The section puts
 * its form in the slot and gives the form's id here, so the Save button at the
 * foot submits it (and Enter in a field does too).
 */
defineProps<{
  open: boolean
  title: string
  description?: string
  /** The `id` of the form in the slot. */
  formId: string
  saveLabel?: string
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[min(92svh,46rem)] gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 sm:max-w-136">
      <DialogHeader class="gap-1.5 border-b border-border px-4.75 md:px-7 py-4.5 text-left">
        <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">{{ title }}</DialogTitle>
        <DialogDescription v-if="description" class="text-sm text-muted-foreground">{{ description }}</DialogDescription>
      </DialogHeader>
      <div class="max-h-[min(60svh,34rem)] overflow-y-auto px-4.75 md:px-7 py-4.75">
        <slot />
      </div>
      <DialogFooter class="gap-2.5 border-t border-border px-4.75 md:px-7 py-4">
        <Button type="button" variant="line" size="pill" :disabled="saving" @click="emit('update:open', false)">Cancel</Button>
        <Button type="submit" :form="formId" variant="canopy" size="pill" :disabled="saving" :aria-busy="saving">{{ saving ? 'Saving…' : saveLabel ?? 'Save' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
