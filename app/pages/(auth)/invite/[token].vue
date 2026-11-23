<template>
  <div class="w-full">
    <!-- Checking the link -->
    <div v-if="status === 'pending'" class="flex justify-center py-16" role="status" aria-label="Checking your invitation">
      <span class="size-6 animate-spin rounded-full border-2 border-border border-t-brand" />
    </div>

    <!-- The link does not work: say why, and what to do instead -->
    <AuthFormShell
      v-else-if="problem"
      :title="problem.title"
      :description="problem.message"
    >
      <AuthSubmit type="button" @click="navigateTo(problem.code === 'INVITATION_ACCEPTED' ? '/login' : '/contact')">
        {{ problem.code === 'INVITATION_ACCEPTED' ? 'Sign in' : 'Contact us' }}
      </AuthSubmit>
      <template #after>
        <template v-if="problem.code === 'INVITATION_ACCEPTED'">
          Forgot your password? <NuxtLink to="/forgot-password" :class="authLink">Reset it</NuxtLink>
        </template>
        <template v-else>
          You can also <NuxtLink to="/register" :class="authLink">create an account</NuxtLink> yourself.
        </template>
      </template>
    </AuthFormShell>

    <AuthFormShell
      v-else-if="invitation"
      :title="lawyer ? 'Join getalawyer as a lawyer' : 'Welcome to getalawyer'"
    >
      <template #description>
        {{ invitation.invitedByName }} from getalawyer invited you.
        {{ lawyer
          ? 'Set a password, then finish your application. We check your identity and your Supreme Court number before clients can find you.'
          : 'Set a password to find verified lawyers and message them.' }}
      </template>

      <!-- Clients may use Google, as long as it is the address we wrote to. -->
      <template v-if="!lawyer">
        <AuthGoogleButton :loading="googling" :disabled="isSubmitting" @click="continueWithGoogle" />
        <p class="mt-2 text-center text-sm text-muted-foreground">
          Use the Google account for {{ invitation.email }}.
        </p>
        <div class="my-5.25 flex items-center gap-3.5 text-sm text-muted-foreground">
          <span class="h-px flex-1 bg-border" />or<span class="h-px flex-1 bg-border" />
        </div>
      </template>

      <form novalidate @submit.prevent="form.handleSubmit">
        <FieldGroup class="gap-4.5">
          <Field>
            <FieldLabel for="invite-email" class="text-sm font-medium">Email address</FieldLabel>
            <Input id="invite-email" :model-value="invitation.email" type="email" readonly :class="cn(authInput, 'bg-muted/50 text-muted-foreground')" />
          </Field>

          <form.Field v-slot="{ field }" name="name">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" class="text-sm font-medium">Your name</FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                autocomplete="name"
                :class="authInput"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(v as any)"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="password">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" class="text-sm font-medium">Choose a password</FieldLabel>
              <AuthPasswordInput
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                placeholder="••••••••"
                autocomplete="new-password"
                :aria-invalid="isInvalid(field)"
                :disabled="isSubmitting"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(v as any)"
              />
              <FieldError v-if="isInvalid(field) && !field.state.value" :errors="field.state.meta.errors" />
              <AuthPasswordRequirements :password="field.state.value" :invalid="isInvalid(field)" />
            </Field>
          </form.Field>

          <AuthFormError :message="apiError" />

          <AuthSubmit :loading="isSubmitting" class="mt-1.25">
            {{ isSubmitting ? 'Creating your account…' : lawyer ? 'Accept and continue' : 'Accept invitation' }}
          </AuthSubmit>
        </FieldGroup>
      </form>

      <template #after>
        <p class="text-sm">
          By continuing, you agree to our
          <NuxtLink to="/terms" class="font-medium text-foreground underline underline-offset-3 hover:text-brand">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/privacy" class="font-medium text-foreground underline underline-offset-3 hover:text-brand">Privacy Policy</NuxtLink>.
        </p>
      </template>
    </AuthFormShell>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { authPasswordSchema } from '~/lib/auth-password'
import { authClient } from '~/lib/auth-client'
import { ApiError } from '~/lib/api/client'
import { invitationsAPI, type InvitationSummary } from '~/lib/api/invitations'
import { APPLICATION_HOME, WELCOME_HOME } from '~/lib/setup-paths'

/**
 * Accepting an invitation from our staff. The link proves the address is
 * theirs, so the account is made confirmed and of the kind they were invited
 * as. A lawyer then finishes the application; a client their welcome steps,
 * both starting from what staff filled in.
 */
definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useHead({ title: 'Accept your invitation', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))
const { refetchSession } = useAuth()

const PROBLEM_TITLES: Record<string, string> = {
  INVITATION_EXPIRED: 'This invitation has expired',
  INVITATION_CANCELLED: 'This invitation was withdrawn',
  INVITATION_ACCEPTED: 'You have already joined',
  INVITATION_NOT_FOUND: 'This link does not work',
}

type LookUp = { invitation: InvitationSummary, problem: null } | { invitation: null, problem: { code: string, title: string, message: string } }

// The reason a link does not work is kept here: useAsyncData would turn the
// API's error into a generic one and lose it.
const { data: lookUp, status } = useAsyncData<LookUp>(
  () => `invitation-${token.value}`,
  async () => {
    try {
      return { invitation: await invitationsAPI.lookUp(token.value), problem: null }
    }
    catch (err: unknown) {
      const code = err instanceof ApiError && err.code ? err.code : 'INVITATION_NOT_FOUND'
      return {
        invitation: null,
        problem: {
          code,
          title: PROBLEM_TITLES[code] ?? 'This link does not work',
          message: err instanceof ApiError && err.code ? err.message : 'We could not check this link. Try again in a moment.',
        },
      }
    }
  },
  { server: false },
)
const invitation = computed(() => lookUp.value?.invitation ?? null)
const problem = computed(() => lookUp.value?.problem ?? null)

const lawyer = computed(() => invitation.value?.kind === 'lawyer')
const home = computed(() => (lawyer.value ? APPLICATION_HOME : WELCOME_HOME))

// Tell the layout's brand panel who is joining.
const panelRole = useState<'client' | 'lawyer' | null>('auth-panel-role', () => null)
watch(invitation, (value) => {
  if (value) panelRole.value = value.kind
}, { immediate: true })

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120, 'Keep your name under 120 characters.'),
  password: authPasswordSchema,
})

const isSubmitting = ref(false)
const googling = ref(false)
const apiError = ref('')

const form = useForm({
  defaultValues: { name: '', password: '' },
  validators: { onChange: schema },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    if (!invitation.value) return
    apiError.value = ''
    isSubmitting.value = true
    try {
      // `invitationToken` is read by the backend's sign-up hook, which checks
      // the link and sets the account's kind. Built first: Better Auth's typed
      // body does not list extra keys.
      const body = {
        name: value.name.trim(),
        email: invitation.value.email,
        password: value.password,
        invitationToken: token.value,
        callbackURL: home.value,
      }
      const { error: signUpError } = await authClient.signUp.email(body)
      if (signUpError) {
        apiError.value = signUpError.message || 'Your account could not be created. Try again.'
        return
      }
      await refetchSession()
      await navigateTo(home.value)
    }
    catch (err: unknown) {
      apiError.value = err instanceof Error ? err.message : 'Something went wrong. Try again.'
    }
    finally {
      isSubmitting.value = false
    }
  },
})

// The name they were invited under, for them to correct if it is wrong.
watch(invitation, (value) => {
  if (value && !form.state.values.name) form.setFieldValue('name', value.name)
}, { immediate: true })

const { isInvalid } = useAuthFieldInvalid(form)

/** Google confirms the address itself; the invitation is matched to it when the account is made. */
async function continueWithGoogle() {
  googling.value = true
  apiError.value = ''
  try {
    await authClient.signIn.social({ provider: 'google', callbackURL: WELCOME_HOME })
  }
  catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'Could not continue with Google.'
  }
  finally {
    googling.value = false
  }
}
</script>
