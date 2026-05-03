<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { DialogRootEmits, DialogRootProps } from "reka-ui"
import { useForwardPropsEmits } from "reka-ui"
import { reactiveOmit } from "@vueuse/core"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from "@/lib/utils"
import Command from "./Command.vue"

const props = withDefaults(defineProps<DialogRootProps & {
  title?: string
  description?: string
  /** Merged onto `DialogContent` (palette width, shadows, padding). */
  contentClass?: HTMLAttributes["class"]
}>(), {
  title: "Command Palette",
  description: "Search for a command to run...",
})

const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(reactiveOmit(props, "title", "description", "contentClass"), emits)
</script>

<template>
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent
      :class="cn(
        'overflow-hidden gap-0 p-0 shadow-2xl sm:max-w-[min(30rem,calc(100vw-2rem))]',
        props.contentClass,
      )"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <Command>
        <slot v-bind="slotProps" />
      </Command>
    </DialogContent>
  </Dialog>
</template>
