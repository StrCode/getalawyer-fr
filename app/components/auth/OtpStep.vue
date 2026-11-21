<template>
  <div class="space-y-4">
    <div v-if="blocked" class="rounded-card border border-destructive/30 bg-destructive/5 p-4 text-center">
      <p class="text-sm font-medium text-destructive">Too many attempts</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Please request a new verification code to continue.
      </p>
      <Button
        type="button"
        variant="line"
        size="pill-sm"
        class="mt-4"
        :disabled="resendCooldown > 0 || isResending"
        @click="$emit('request-new-code')"
      >
        <template v-if="isResending">Sending…</template>
        <template v-else-if="resendCooldown > 0">Request new code in {{ resendCooldown }}s</template>
        <template v-else>Request new code</template>
      </Button>
    </div>

    <template v-else>
      <InputOTP
        :model-value="modelValue"
        :maxlength="6"
        :disabled="disabled || isSubmitting"
        aria-label="6-digit code"
        class="w-full"
        @update:model-value="(v: unknown) => $emit('update:modelValue', String(v))"
      >
        <InputOTPGroup class="w-full gap-2">
          <InputOTPSlot
            v-for="i in 6"
            :key="i"
            :index="i - 1"
            :class="[authOtpSlot, error ? 'border-destructive' : '']"
          />
        </InputOTPGroup>
      </InputOTP>

      <p v-if="error" role="alert" class="flex items-center gap-1.5 text-sm text-destructive">
        <HugeiconsIcon :icon="AlertCircleIcon" class="size-3.5 shrink-0" />
        {{ error }}
      </p>

      <p class="text-sm text-muted-foreground">
        The code expires in a few minutes.
        <button
          type="button"
          :class="authLink"
          :disabled="isResending || resendCooldown > 0"
          @click="$emit('resend')"
        >
          <template v-if="isResending">Sending…</template>
          <template v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</template>
          <template v-else>Resend code</template>
        </button>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

withDefaults(defineProps<{
  modelValue: string;
  error?: string;
  blocked?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  isResending?: boolean;
  /** Seconds until another code can be requested; 0 = now. */
  resendCooldown?: number;
}>(), { resendCooldown: 0 });

defineEmits<{
  "update:modelValue": [value: string];
  resend: [];
  "request-new-code": [];
}>();
</script>
