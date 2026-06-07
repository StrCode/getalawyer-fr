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
  title: string
  description?: string
  saveLabel?: string
  saving?: boolean
  saveDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: []
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
    <DialogContent class="max-h-[min(90svh,720px)] gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader class="border-b border-border/60 px-6 py-4">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[min(60svh,520px)] overflow-y-auto px-6 py-4">
        <slot />
      </div>

      <DialogFooter class="border-t border-border/60 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          @click="close"
        >
          Cancel
        </Button>
        <ButtonBusy
          type="button"
          :loading="saving"
          :disabled="saveDisabled"
          @click="emit('save')"
        >
          {{ saveLabel ?? 'Save' }}
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
