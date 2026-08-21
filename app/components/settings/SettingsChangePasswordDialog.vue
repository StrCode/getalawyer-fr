<script setup lang="ts">
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { authClient } from '~/lib/auth-client'
import { authPasswordSchema } from '~/lib/auth-password'

const open = defineModel<boolean>({ required: true })

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: authPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
    revokeOtherSessions: z.boolean(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password.',
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

      toast.success('Password updated', {
        description: value.revokeOtherSessions
          ? 'Your other sessions have been signed out.'
          : 'Use your new password next time you sign in.',
      })
      open.value = false
      form.reset()
    }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (/invalid|incorrect|wrong|current/i.test(msg))
        apiError.value = 'Current password is incorrect.'
      else if (/credential|password.*not.*found|no.*password/i.test(msg))
        apiError.value = 'This account does not have a password set. Use account recovery after signing out.'
      else
        apiError.value = msg || 'Could not change password. Please try again.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

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
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          Change password
        </DialogTitle>
        <DialogDescription>
          Enter your current password, then choose a new one.
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="form.handleSubmit"
      >
        <FieldGroup class="space-y-4">
          <form.Field
            v-slot="{ field }"
            name="currentPassword"
          >
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                Current password
              </FieldLabel>
              <AuthPasswordInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                autocomplete="current-password"
                placeholder="••••••••"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError
                v-if="isInvalid(field)"
                :errors="field.state.meta.errors"
              />
            </Field>
          </form.Field>

          <form.Field
            v-slot="{ field }"
            name="newPassword"
          >
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                New password
              </FieldLabel>
              <AuthPasswordInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                autocomplete="new-password"
                placeholder="••••••••"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError
                v-if="isInvalid(field)"
                :errors="field.state.meta.errors"
              />
              <AuthPasswordRequirements
                class="mt-2"
                :password="field.state.value"
              />
            </Field>
          </form.Field>

          <form.Field
            v-slot="{ field }"
            name="confirmPassword"
          >
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                Confirm new password
              </FieldLabel>
              <AuthPasswordInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                autocomplete="new-password"
                placeholder="••••••••"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError
                v-if="isInvalid(field)"
                :errors="field.state.meta.errors"
              />
            </Field>
          </form.Field>

          <form.Field
            v-slot="{ field }"
            name="revokeOtherSessions"
          >
            <div class="flex items-start gap-3 rounded-lg border border-foreground/15 px-3 py-3">
              <Checkbox
                :id="field.name"
                :model-value="field.state.value"
                class="mt-0.5"
                :disabled="isSubmitting"
                @update:model-value="(v) => field.handleChange(v === true)"
              />
              <div class="min-w-0 space-y-0.5">
                <Label
                  :for="field.name"
                  class="cursor-pointer text-sm font-medium text-foreground"
                >
                  Sign out other devices
                </Label>
                <p class="text-xs leading-relaxed text-muted-foreground">
                  Recommended after a password change.
                </p>
              </div>
            </div>
          </form.Field>

          <p
            v-if="apiError"
            class="text-sm text-destructive"
            role="alert"
          >
            {{ apiError }}
          </p>
        </FieldGroup>

        <DialogFooter class="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            class="cursor-pointer"
            :disabled="isSubmitting"
            @click="open = false"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            class="cursor-pointer gap-2"
            :disabled="isSubmitting"
          >
            <HugeiconsIcon
              v-if="isSubmitting"
              :icon="Loading03Icon"
              class="size-4 shrink-0 animate-spin"
            />
            {{ isSubmitting ? 'Updating…' : 'Update password' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
