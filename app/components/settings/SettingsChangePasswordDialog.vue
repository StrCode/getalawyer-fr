<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { authClient } from '~/lib/auth-client'
import { authPasswordSchema } from '~/lib/auth-password'

const open = defineModel<boolean>({ required: true })

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: authPasswordSchema,
    confirmPassword: z.string().min(1, 'Type the new password again.'),
    revokeOtherSessions: z.boolean(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'The two new passwords are not the same.',
    path: ['confirmPassword'],
  })
  // only once a new password is typed: two empty boxes are not "the same password"
  .refine(data => !data.newPassword || data.currentPassword !== data.newPassword, {
    message: 'Choose a password different from your current one.',
    path: ['newPassword'],
  })

const isSubmitting = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: true,
  },
  validators: {
    onChange: schema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    apiError.value = ''
    isSubmitting.value = true
    try {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: value.revokeOtherSessions,
      })
      if (error)
        throw new Error(error.message || 'Could not change password.')

      toast.success(value.revokeOtherSessions ? 'Password changed. Your other devices are signed out.' : 'Password changed.')
      open.value = false
      form.reset()
    }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (/invalid|incorrect|wrong|current/i.test(msg))
        apiError.value = 'Your current password is not right.'
      else if (/credential|password.*not.*found|no.*password/i.test(msg))
        apiError.value = 'This account has no password yet. Sign out and use "Forgot password" to set one.'
      else
        apiError.value = msg || 'We could not change your password. Nothing has changed.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const formId = useId()

watch(open, (isOpen) => {
  if (!isOpen) {
    apiError.value = ''
    isSubmitting.value = false
    form.reset()
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[min(92svh,46rem)] gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 sm:max-w-120">
      <DialogHeader class="gap-1.5 border-b border-border px-4.75 md:px-7 py-4.5 text-left">
        <DialogTitle class="font-display text-xl leading-none font-normal tracking-tight">Change your password</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">Enter your current password, then choose a new one.</DialogDescription>
      </DialogHeader>

      <div class="max-h-[min(62svh,34rem)] overflow-y-auto px-4.75 md:px-7 py-4.75">
        <form :id="formId" novalidate @submit.prevent="form.handleSubmit">
          <FieldGroup class="gap-4.5">
            <form.Field v-slot="{ field }" name="currentPassword">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">Current password</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  autocomplete="current-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="newPassword">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">New password</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  autocomplete="new-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <!-- only when empty: with something typed, the list below shows what is missing -->
                <FieldError v-if="isInvalid(field) && !field.state.value" :errors="field.state.meta.errors" />
                <AuthPasswordRequirements class="mt-2" :password="field.state.value" :invalid="isInvalid(field)" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="confirmPassword">
              <Field :class="canopyField" :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name" :class="canopyLabel">New password again</FieldLabel>
                <AuthPasswordInput
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  autocomplete="new-password"
                  :aria-invalid="isInvalid(field)"
                  :disabled="isSubmitting"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="revokeOtherSessions">
              <FieldLabel :for="field.name" :class="canopyChoice">
                <Field orientation="horizontal" class="items-start">
                  <Checkbox
                    :id="field.name"
                    :class="canopyCheckbox"
                    :model-value="field.state.value"
                    :disabled="isSubmitting"
                    @update:model-value="(v) => field.handleChange(v === true)"
                  />
                  <FieldContent class="gap-0.5">
                    <span class="text-sm leading-snug font-medium text-foreground">Sign out my other devices</span>
                    <FieldDescription class="text-sm">A good idea if you think someone else knows your password.</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </form.Field>

            <AuthFormError :message="apiError" />
          </FieldGroup>
        </form>
      </div>

      <DialogFooter class="gap-2.5 border-t border-border px-4.75 md:px-7 py-4">
        <Button type="button" variant="line" size="pill" :disabled="isSubmitting" @click="open = false">Cancel</Button>
        <Button type="submit" :form="formId" variant="canopy" size="pill" :disabled="isSubmitting" :aria-busy="isSubmitting">{{ isSubmitting ? 'Changing…' : 'Change password' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
