<template>
  <CardFooter class="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-6 py-4">
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!dirty || saving"
      @click="$emit('discard')"
    >
      Discard
    </Button>
    <ButtonBusy
      type="button"
      size="sm"
      :loading="saving"
      :disabled="!canSave"
      @click="$emit('save')"
    >
      Save changes
    </ButtonBusy>
  </CardFooter>
</template>

<script setup lang="ts">
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'

defineProps<{
  dirty: boolean
  canSave: boolean
  saving?: boolean
}>()

defineEmits<{
  discard: []
  save: []
}>()
</script>
