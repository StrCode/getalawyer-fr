<template>
  <div class="space-y-2">
    <Label v-if="label" :for="inputId">{{ label }}</Label>
    <div class="flex gap-2">
      <!-- Nigeria, locked — this is a Nigeria-only directory, so the country
           is fixed rather than a selectable dropdown. -->
      <div
        class="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 text-sm font-medium text-muted-foreground"
        aria-hidden="true"
      >
        <svg viewBox="0 0 6 3" class="h-3 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10">
          <rect width="6" height="3" fill="#008751" />
          <rect x="2" width="2" height="3" fill="#fff" />
        </svg>
        +234
      </div>
      <Input
        :id="inputId"
        :model-value="formatted"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="invalid"
        aria-label="Nigerian phone number"
        class="h-11 flex-1 text-base"
        @update:model-value="onInput"
        @blur="$emit('blur')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AsYouType } from "libphonenumber-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeNgPhone, toE164Plus } from "~/lib/phone";

const props = withDefaults(
  defineProps<{
    /** Stored value — E.164 with `+` when valid, raw national digits while typing. */
    modelValue?: string;
    /** Field label; pass an empty string to let the parent own the label row. */
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

/** The national significant number (10 digits, no trunk 0), from any stored form. */
function toNsn(value: string): string {
  const normalized = normalizeNgPhone(value);
  if (normalized) {
    return normalized.startsWith("234") ? normalized.slice(3) : normalized;
  }
  return value.replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "").slice(0, 10);
}

// As-you-type national grouping (801 234 5678). AsYouType groups NG numbers only
// with the trunk 0, so we format against a prepended 0 and strip it back off.
const formatted = computed(() => {
  const nsn = toNsn(props.modelValue);
  if (!nsn) return "";
  return new AsYouType("NG").input(`0${nsn}`).replace(/^0\s?/, "");
});

function onInput(raw: string | number) {
  const nsn = String(raw).replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "").slice(0, 10);
  const normalized = normalizeNgPhone(`0${nsn}`);
  emit("update:modelValue", normalized ? toE164Plus(normalized) : nsn);
}
</script>
