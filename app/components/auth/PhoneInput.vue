<template>
  <div class="space-y-2">
    <Label v-if="label" :for="inputId" class="text-[0.9rem] font-semibold">{{ label }}</Label>
    <!-- Nigeria, locked: this is a Nigeria-only directory, so the country code
         is a fixed prefix inside the field rather than a selectable dropdown. -->
    <InputGroup :class="authInputGroup">
      <InputGroupAddon class="pl-4 text-[1.02rem] font-semibold">
        <!-- The flag is drawn 3:2 and stretched to its 3:2 box, so it fills it edge
             to edge. It sits in a wrapper because the addon forces bare svg
             children to a 16px square. -->
        <span aria-hidden="true" class="block h-[1.1rem] w-[1.65rem] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/15 dark:ring-white/25">
          <svg viewBox="0 0 3 2" preserveAspectRatio="none" class="block size-full">
            <rect width="3" height="2" fill="#008751" />
            <rect x="1" width="1" height="2" fill="#fff" />
          </svg>
        </span>
        <span aria-hidden="true">+234</span>
      </InputGroupAddon>
      <InputGroupInput
        :id="inputId"
        :model-value="formatted"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="invalid"
        aria-label="Nigerian phone number, without the leading zero"
        :class="authInputGroupControl"
        @update:model-value="onInput"
        @blur="$emit('blur')"
      />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import { AsYouType } from "libphonenumber-js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
