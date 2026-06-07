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
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title ?? 'Remove item?' }}</DialogTitle>
        <DialogDescription>
          {{ description ?? 'This will be removed from your public profile.' }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="close"
        >
          Cancel
        </Button>
        <ButtonBusy
          type="button"
          variant="destructive"
          :loading="deleting"
          @click="emit('confirm')"
        >
          Remove
        </ButtonBusy>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
