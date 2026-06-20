<template>
  <div
    class="inline-flex w-full rounded-xl border border-border/60 bg-muted/30 p-1"
    role="tablist"
    aria-label="Sign-in method"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
      :class="
        modelValue === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      "
      :aria-selected="modelValue === option.value"
      :disabled="disabled"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export type AuthMethod = "email" | "phone";

defineProps<{
  modelValue: AuthMethod;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: AuthMethod];
}>();

const options: { value: AuthMethod; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];
</script>
