<template>
  <div class="space-y-2">
    <Label v-if="label" :for="inputId">{{ label }}</Label>
    <div class="flex gap-2">
      <div
        class="flex h-11 shrink-0 items-center rounded-xl border border-border/50 bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
        aria-hidden="true"
      >
        +234
      </div>
      <Input
        :id="inputId"
        :model-value="localDigits"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="invalid"
        class="h-11 flex-1 text-base"
        @update:model-value="onInput"
        @blur="$emit('blur')"
      />
    </div>
    <p v-if="displayValue && !invalid" class="text-xs text-muted-foreground">
      {{ displayValue }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNgPhoneDisplay, normalizeNgPhone, toE164Plus } from "~/lib/phone";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    autocomplete?: string;
    disabled?: boolean;
    invalid?: boolean;
  }>(),
  {
    modelValue: "",
    label: "Phone number",
    placeholder: "801 234 5678",
    autocomplete: "tel",
    disabled: false,
    invalid: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
}>();

const inputId = useId();

const localDigits = computed(() => {
  const normalized = normalizeNgPhone(props.modelValue);
  if (!normalized) return props.modelValue.replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "");
  return normalized.startsWith("234") ? normalized.slice(3) : normalized;
});

const displayValue = computed(() => {
  const normalized = normalizeNgPhone(props.modelValue || `0${localDigits.value}`);
  if (!normalized) return "";
  return formatNgPhoneDisplay(normalized);
});

function onInput(raw: string | number) {
  const digits = String(raw).replace(/\D/g, "").slice(0, 10);
  const normalized = normalizeNgPhone(digits.length === 10 ? digits : `0${digits}`);
  if (normalized) {
    emit("update:modelValue", toE164Plus(normalized));
  } else {
    emit("update:modelValue", digits);
  }
}
</script>
