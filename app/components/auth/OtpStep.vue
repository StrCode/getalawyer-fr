<template>
  <div class="space-y-4">
    <div v-if="blocked" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
      <p class="text-sm font-medium text-destructive">Too many attempts</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Please request a new verification code to continue.
      </p>
      <Button
        type="button"
        variant="outline"
        class="mt-4 cursor-pointer"
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
        class="w-full justify-center gap-2"
        @update:model-value="(v) => $emit('update:modelValue', v as string)"
      >
        <InputOTPGroup>
          <InputOTPSlot
            v-for="i in 3"
            :key="i"
            :index="i - 1"
            class="h-12 w-10 text-lg"
            :class="error ? 'border-destructive' : ''"
          />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot
            v-for="i in 3"
            :key="i + 3"
            :index="i + 2"
            class="h-12 w-10 text-lg"
            :class="error ? 'border-destructive' : ''"
          />
        </InputOTPGroup>
      </InputOTP>

      <p v-if="error" class="flex items-center justify-center gap-1.5 text-sm text-destructive">
        <PhWarningCircle class="size-3.5 shrink-0" />
        {{ error }}
      </p>

      <p class="text-center text-sm text-muted-foreground">
        Code expires in a few minutes.
        <Button
          type="button"
          variant="link"
          class="h-auto cursor-pointer p-0 font-medium"
          :disabled="isResending || resendCooldown > 0"
          @click="$emit('resend')"
        >
          <template v-if="isResending">Sending…</template>
          <template v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</template>
          <template v-else>Resend code</template>
        </Button>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PhWarningCircle } from "@phosphor-icons/vue";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

defineProps<{
  modelValue: string;
  error?: string;
  blocked?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  isResending?: boolean;
  resendCooldown?: number;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  resend: [];
  "request-new-code": [];
}>();
</script>
