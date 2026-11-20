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
       bar takes a ring instead, and the label of the field in use turns green. -->
  <form
    class="flex flex-wrap rounded-[1.4rem] bg-card text-foreground transition-[border-color,box-shadow] duration-150 has-[:is(input,select):focus-visible]:ring-[3px]"
    :class="onLight
      ? 'border border-border shadow-rail-soft has-[:is(input,select):focus-visible]:border-brand has-[:is(input,select):focus-visible]:ring-brand/25'
      : 'shadow-rail has-[:is(input,select):focus-visible]:ring-lime'"
    @submit.prevent="$emit('submit')"
  >
    <div class="group/field min-w-0 flex-[2_1_16rem] px-[1.4rem] py-4">
      <label :for="needId" class="block text-[0.78rem] font-bold text-muted-foreground transition-colors duration-150 group-focus-within/field:text-brand">What do you need help with?</label>
      <input
        :id="needId"
        v-model="need"
        type="text"
        :placeholder="placeholder"
        class="mt-[0.15rem] w-full bg-transparent p-0 text-[1.05rem] text-foreground outline-hidden placeholder:text-placeholder"
      >
    </div>
    <div class="group/field min-w-0 flex-[1_1_11rem] border-l border-border px-[1.4rem] py-4 max-sm:border-t max-sm:border-l-0">
      <label :for="whereId" class="block text-[0.78rem] font-bold text-muted-foreground transition-colors duration-150 group-focus-within/field:text-brand">Where?</label>
      <select
        :id="whereId"
        v-model="where"
        class="mt-[0.15rem] w-full cursor-pointer appearance-none bg-transparent p-0 text-[1.05rem] text-foreground outline-hidden"
      >
        <option value="">All states</option>
        <option v-for="state in NIGERIA_STATE_NAMES" :key="state" :value="state">{{ state }}</option>
      </select>
    </div>
    <Button type="submit" variant="canopy" class="group/btn m-2 h-16 gap-4 self-center rounded-[1.1rem] pr-3 pl-8 text-[1.1rem] max-sm:w-[calc(100%-1rem)] max-sm:justify-between">
      {{ action }}<CanopyArrowChip large />
    </Button>
  </form>
</template>
