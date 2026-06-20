<template>
  <Tabs
    :model-value="modelValue"
    class="w-full gap-6"
    @update:model-value="onTabChange"
  >
    <TabsList
      class="grid h-11 w-full grid-cols-2 rounded-xl border border-border/60 bg-muted/30 p-1"
    >
      <TabsTrigger
        value="email"
        class="cursor-pointer rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        :disabled="disabled"
      >
        Email
      </TabsTrigger>
      <TabsTrigger
        value="phone"
        class="cursor-pointer rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        :disabled="disabled"
      >
        Phone
      </TabsTrigger>
    </TabsList>
    <slot />
  </Tabs>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AuthMethod = "email" | "phone";

const props = defineProps<{
  modelValue: AuthMethod;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AuthMethod];
}>();

function onTabChange(value: string | number) {
  if (value === "email" || value === "phone") {
    emit("update:modelValue", value);
  }
}
</script>
