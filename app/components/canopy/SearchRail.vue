<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { NIGERIA_STATE_NAMES } from '~/constants/nigeria-states-lgas'

/**
 * The search rail: what you need, where, and the action. Used in the homepage
 * hero and at the top of the directory. Emits `submit`; the two values are
 * `v-model:need` and `v-model:where`.
 */
const props = withDefaults(defineProps<{
  /** Prefix for the field ids, so two rails can share a page. */
  idPrefix?: string
  placeholder?: string
  action?: string
  /** On a light panel: a border and a light shadow instead of the deep one made for dark ground. */
  onLight?: boolean
}>(), {
  idPrefix: 'search',
  onLight: false,
  placeholder: 'Tenancy dispute, divorce, unpaid salary…',
  action: 'Search lawyers',
})

const need = defineModel<string>('need', { default: '' })
const where = defineModel<string>('where', { default: '' })
defineEmits<{ submit: [] }>()

const needId = computed(() => `${props.idPrefix}-need`)
const whereId = computed(() => `${props.idPrefix}-where`)
</script>

<template>
  <!-- Focus: the fields drop their own outline (a box around bare text); the whole
       bar takes a ring instead, and the label of the field in use turns green.
       Shape: a pill like the site's buttons, 72px tall, with a 60px pill button
       6px in from every edge so the two curves follow each other. On phones the
       fields stack, so the bar is a rounded card there. -->
  <form
    class="flex flex-wrap rounded-2xl sm:rounded-full bg-card text-foreground transition-[border-color,box-shadow] duration-150 has-[:is(input,select):focus-visible]:ring-[3px]"
    :class="onLight
      ? 'border border-border shadow-rail-soft has-[:is(input,select):focus-visible]:border-brand has-[:is(input,select):focus-visible]:ring-brand/25'
      : 'shadow-rail has-[:is(input,select):focus-visible]:ring-lime'"
    @submit.prevent="$emit('submit')"
  >
    <div class="group/field min-w-0 grow-2 basis-64 px-5.5 py-3.5 sm:pl-7">
      <label :for="needId" class="block text-xs font-medium text-muted-foreground transition-colors duration-150 group-focus-within/field:text-brand">What do you need help with?</label>
      <input
        :id="needId"
        v-model="need"
        type="text"
        :placeholder="placeholder"
        class="mt-0.5 w-full bg-transparent p-0 text-base text-foreground outline-hidden placeholder:text-placeholder"
      >
    </div>
    <div class="group/field min-w-0 grow basis-44 border-l border-border px-5.5 py-3.5 max-sm:border-t max-sm:border-l-0">
      <label :for="whereId" class="block text-xs font-medium text-muted-foreground transition-colors duration-150 group-focus-within/field:text-brand">Where?</label>
      <select
        :id="whereId"
        v-model="where"
        class="mt-0.5 w-full cursor-pointer appearance-none bg-transparent p-0 text-base text-foreground outline-hidden"
      >
        <option value="">All states</option>
        <option v-for="state in NIGERIA_STATE_NAMES" :key="state" :value="state">{{ state }}</option>
      </select>
    </div>
    <Button type="submit" variant="canopy" size="pill" class="group/btn m-1.5 h-15 gap-3.5 self-center pr-2.5 pl-6.5 max-sm:m-2 max-sm:h-12 max-sm:w-[calc(100%-1rem)] max-sm:justify-between">
      {{ action }}<CanopyArrowChip />
    </Button>
  </form>
</template>
