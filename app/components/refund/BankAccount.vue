<script setup lang="ts">
import { ArrowDown01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useForm } from '@tanstack/vue-form'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError } from '~/lib/api/client'
import { type RefundBank, refundBankAccountAPI } from '~/lib/api/refund-bank-account'
import { queryKeys } from '~/lib/query-client'
import {
  accountNumberInput,
  refundBankAccountGiven,
  refundBankAccountPayload,
  refundBankAccountSchema,
  refundBankAccountValues,
  refundNeedsBankAccount,
} from '~/lib/refund-bank-account'

/**
 * A refund Paystack cannot return the way it was paid (a bank transfer, USSD,
 * or a closed card): the lawyer gives the bank account it should go to. The
 * name on the account is shown before anything is sent. Shows nothing unless a
 * refund of theirs waits on an account, or has just been given one.
 */
const queryClient = useQueryClient()
const { data: status } = useSubscriptionStatus()
const subscription = computed(() => status.value?.subscription ?? null)
const needed = computed(() => refundNeedsBankAccount(subscription.value))
const given = computed(() => refundBankAccountGiven(subscription.value))
const amount = computed(() => {
  const naira = subscription.value?.refundNaira
  return naira ? `₦${Math.round(naira).toLocaleString('en-NG')}` : 'your refund'
})

const banksQuery = useQuery({
  queryKey: ['subscription', 'refund-banks'] as const,
  queryFn: async () => (await refundBankAccountAPI.banks()).banks,
  enabled: needed,
  staleTime: 60 * 60 * 1000,
})
const banks = computed<RefundBank[]>(() => banksQuery.data.value ?? [])

const formId = useId()
const sendError = ref('')

/** The account-name check, for exactly the bank and number it was asked about. */
const check = ref<{ key: string, state: 'checking' | 'found' | 'failed', name?: string, message?: string } | null>(null)

const form = useForm({
  defaultValues: refundBankAccountValues(),
  validators: { onChange: refundBankAccountSchema },
  listeners: { onBlur: ({ fieldApi }) => { fieldApi.validate('change') } },
  onSubmit: async ({ value }) => {
    sendError.value = ''
    if (check.value?.key !== keyOf(value) || check.value.state !== 'found') {
      sendError.value = 'Wait for the name on the account to show, then send.'
      return
    }
    try {
      const sent = await refundBankAccountAPI.send(refundBankAccountPayload(value))
      toast.success(`Sending ${amount.value} to ${sent.bankName} ••${sent.accountLast4}.`)
    }
    catch (error) {
      // Sent already (a retried request, or another tab): the page catches up below.
      if (!(error instanceof ApiError && (error.code === 'ALREADY_SENT' || error.code === 'NOT_NEEDED'))) {
        sendError.value = error instanceof Error && error.message ? error.message : 'We could not send it. Nothing has been sent; try again.'
        return
      }
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.subscription.status })
  },
})
const { isInvalid } = useAuthFieldInvalid(form)
const submitting = form.useStore(state => state.isSubmitting)
const values = form.useStore(state => state.values)

const keyOf = (value: { bankId: string, accountNumber: string }) => `${value.bankId}:${accountNumberInput(value.accountNumber)}`
const ready = computed(() => refundBankAccountSchema.safeParse(values.value).success)
const currentCheck = computed(() => (check.value?.key === keyOf(values.value) ? check.value : null))

// Ask for the name once the bank and all ten digits are in, after a short pause.
let timer: ReturnType<typeof setTimeout> | undefined
watch([() => values.value.bankId, () => values.value.accountNumber], () => {
  clearTimeout(timer)
  sendError.value = ''
  if (!ready.value) return
  const key = keyOf(values.value)
  if (check.value?.key === key && check.value.state !== 'failed') return
  timer = setTimeout(async () => {
    check.value = { key, state: 'checking' }
    try {
      const { accountName } = await refundBankAccountAPI.check(refundBankAccountPayload(values.value))
      if (check.value?.key === key) check.value = { key, state: 'found', name: accountName }
    }
    catch (error) {
      if (check.value?.key !== key) return
      const message = error instanceof Error && error.message ? error.message : 'We could not check the account just now. Try again in a minute.'
      check.value = { key, state: 'failed', message }
    }
  }, 400)
})
onBeforeUnmount(() => clearTimeout(timer))

const selectedBank = computed(() => banks.value.find(bank => String(bank.id) === values.value.bankId) ?? null)
</script>

<template>
  <section v-if="given" aria-labelledby="refund-account-title" class="rounded-card border border-border bg-card p-5">
    <h2 id="refund-account-title" class="font-display text-lg font-normal tracking-tight">Your refund is being sent to your bank account</h2>
    <p class="mt-1.5 text-muted-foreground">
      {{ amount }} is going to <b class="font-medium text-foreground">{{ given }}</b>. It can take up to 10 business days to reach your account, and you will get an email when it has.
    </p>
  </section>

  <section v-else-if="needed" aria-labelledby="refund-account-title" class="rounded-card border border-warning/40 bg-card p-5">
    <h2 id="refund-account-title" class="font-display text-lg font-normal tracking-tight">Add a bank account for your refund</h2>
    <p class="mt-1.5 max-w-152 text-muted-foreground">
      Paystack will pay {{ amount }} into the account you give here.
    </p>

    <div v-if="banksQuery.isError.value && !banks.length" role="alert" class="mt-4 grid justify-items-start gap-2.75">
      <p class="text-muted-foreground">We could not load the list of banks.</p>
      <Button variant="line" size="pill-sm" :disabled="banksQuery.isFetching.value" @click="banksQuery.refetch()">
        {{ banksQuery.isFetching.value ? 'Trying again…' : 'Try again' }}
      </Button>
    </div>

    <form v-else :id="formId" novalidate class="mt-4.5" @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <div class="grid items-start gap-4.5 sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="bankId">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :class="canopyLabel">Bank</FieldLabel>
              <Combobox
                :model-value="selectedBank"
                by="id"
                :disabled="banksQuery.isPending.value"
                @update:model-value="(bank) => field.handleChange(bank ? String((bank as RefundBank).id) : '')"
                @update:open="(open) => { if (!open) field.handleBlur() }"
              >
                <ComboboxAnchor as-child class="w-full">
                  <ComboboxTrigger as-child>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      :class="[canopyTrigger, !selectedBank && 'text-placeholder hover:text-placeholder']"
                      :aria-invalid="isInvalid(field) || undefined"
                    >
                      <span class="truncate">{{ selectedBank?.name ?? (banksQuery.isPending.value ? 'Loading banks…' : 'Choose your bank') }}</span>
                      <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 opacity-50" />
                    </Button>
                  </ComboboxTrigger>
                </ComboboxAnchor>
                <ComboboxList class="w-(--reka-combobox-trigger-width) p-0" :class="canopyPanel" align="start">
                  <ComboboxInput placeholder="Search banks…" />
                  <ComboboxEmpty>No bank by that name.</ComboboxEmpty>
                  <ComboboxGroup class="max-h-64 overflow-y-auto p-1">
                    <ComboboxItem v-for="bank in banks" :key="bank.id" :value="bank">
                      <span class="min-w-0 flex-1 truncate">{{ bank.name }}</span>
                      <HugeiconsIcon v-if="selectedBank?.id === bank.id" :icon="Tick01Icon" class="size-4 text-brand" />
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="accountNumber">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="`${formId}-account`" :class="canopyLabel">Account number</FieldLabel>
              <Input
                :id="`${formId}-account`"
                :model-value="field.state.value"
                inputmode="numeric"
                autocomplete="off"
                maxlength="13"
                placeholder="10 digits"
                :class="authInput"
                :aria-invalid="isInvalid(field) || undefined"
                @blur="field.handleBlur"
                @update:model-value="(typed) => field.handleChange(accountNumberInput(String(typed ?? '')))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>

        <!-- the name the bank has, so a typo cannot send the money to a stranger -->
        <div aria-live="polite">
          <p v-if="currentCheck?.state === 'checking'" class="text-sm text-muted-foreground">Checking the account…</p>
          <div v-else-if="currentCheck?.state === 'found'" class="rounded-lg border border-brand/30 bg-mint px-4 py-3 text-deep">
            <p class="text-sm">Name on the account</p>
            <p class="font-medium">{{ currentCheck.name }}</p>
            <p class="mt-1 text-sm opacity-80">Is this you? If not, check the bank and the number before you send.</p>
          </div>
          <AuthFormError v-else-if="currentCheck?.state === 'failed'" :message="currentCheck.message" />
          <FieldDescription v-else :class="canopyHint">
            We show you the name on the account before anything is sent. The number goes to our payment provider, Paystack; we do not keep it.
          </FieldDescription>
        </div>

        <AuthFormError :message="sendError" />

        <div class="max-w-xs">
          <AuthSubmit :loading="submitting" :disabled="currentCheck?.state !== 'found'">
            Send my refund here
          </AuthSubmit>
        </div>
      </FieldGroup>
    </form>
  </section>
</template>
