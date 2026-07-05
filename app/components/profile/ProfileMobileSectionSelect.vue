<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProfileSectionLink {
  id: string
  label: string
}

const props = defineProps<{
  sections: ProfileSectionLink[]
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed({
  get: () => props.modelValue ?? props.sections[0]?.id ?? '',
  set: (value: string) => {
    emit('update:modelValue', value)
    const el = document.getElementById(value)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  },
})
</script>

<template>
  <Select
    v-model="selected"
  >
    <SelectTrigger class="w-full">
      <SelectValue placeholder="Jump to section" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="section in sections"
        :key="section.id"
        :value="section.id"
      >
        {{ section.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
