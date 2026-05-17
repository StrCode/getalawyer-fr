<script setup lang="ts">
import { useId } from 'vue'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { PhShieldCheck, PhIdentificationCard, PhCheckCircle, PhLock } from '@phosphor-icons/vue'
import { Label } from '~/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '~/components/ui/input-group'

import { LAWYER_STEP_CONTENT } from '~/lib/lawyer-onboarding-steps'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = LAWYER_STEP_CONTENT.nin_verification

const store = useLawyerOnboardingStore()
const state = store.ninVerification
const consentFieldId = useId()

const isAdminVerified = computed(() => !!state.verified)
const isSubmittedPending = computed(() => !!state.isSubmitted && !state.verified)

function onNinInput(e: Event) {
  const el = e.target as HTMLInputElement
  state.nin = el.value.replace(/\D/g, '')
}

onBeforeUnmount(() => {
  store.clearNinResubmitMode()
})
</script>

<template>
  <div class="w-full space-y-10 pb-20">
    <OnboardingClientStepHeader
      v-if="!isAdminVerified"
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />
    <!-- Admin verified: locked (cannot change NIN) -->
    <div v-if="isAdminVerified" class="text-center py-12">
      <div class="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 relative border-4 border-white shadow-sm">
        <PhLock class="w-10 h-10" weight="fill" />
      </div>
      <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-4">
        <PhShieldCheck class="w-4 h-4" weight="fill" />
        Verified by Getalawyer
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Identity verified</h2>
      <p class="text-base text-gray-600 max-w-md mx-auto font-medium">
        Your National Identification Number has been verified. It cannot be changed while your application is active.
      </p>
    </div>

    <!-- Submitted to server, pending admin — allow change until verified -->
    <div v-else-if="isSubmittedPending" class="space-y-10">
      <div class="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-8 text-center max-w-lg mx-auto">
        <div class="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 mb-4">
          <PhCheckCircle class="w-8 h-8 text-emerald-600" weight="fill" />
        </div>
        <p class="text-lg font-bold text-gray-900 mb-1">NIN already submitted</p>
        <p class="text-sm text-gray-600 mb-6">
          Your NIN is saved securely. You can continue, or replace it with a different number if you made a mistake — until it is verified by our team.
        </p>
        <Button
          type="button"
          variant="outline"
          class="font-semibold border-gray-300"
          @click="store.beginChangeNin()"
        >
          Change NIN
        </Button>
      </div>

      <div class="text-center text-sm text-gray-500 max-w-md mx-auto">
        Use <span class="font-semibold text-gray-700">Next</span> to continue to the next step without changing your NIN.
      </div>
    </div>

    <!-- NIN entry -->
    <div v-else class="space-y-8">
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
          <label class="text-3.5 font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight" for="nin-input">National Identity Number <span class="text-primary">*</span></label>
          <div class="w-full max-w-md space-y-2">
            <InputGroup
              class="h-12 max-w-md rounded-lg border-gray-200/80 bg-background shadow-sm transition-shadow has-[[data-slot=input-group-control]:focus-visible]:shadow-md"
            >
              <InputGroupInput
                id="nin-input"
                v-model="state.nin"
                placeholder="11-digit NIN"
                autocomplete="off"
                inputmode="numeric"
                maxlength="11"
                class="h-12 min-h-12 text-base tabular-nums md:text-sm"
                @input="onNinInput"
              />
              <InputGroupAddon>
                <PhIdentificationCard class="size-5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupText
                  class="text-2.5 font-bold uppercase tracking-widest tabular-nums"
                  :class="state.nin.length === 11 ? 'text-primary' : 'text-muted-foreground/60'"
                >
                  {{ state.nin.length }}/11
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p class="text-muted-foreground px-0.5 text-xs font-medium leading-relaxed">
              Enter your 11-digit National Identity Number.
            </p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
          <span class="text-3.5 font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Verification Consent <span class="text-primary">*</span></span>
          <div class="w-full max-w-md">
            <Label
              :for="consentFieldId"
              class="hover:bg-primary/8 flex cursor-pointer items-start gap-3.5 rounded-xl border border-primary/15 bg-primary/5 p-4 transition-all has-data-[state=checked]:border-primary/45 has-data-[state=checked]:bg-primary/10 has-data-[state=checked]:shadow-sm"
            >
              <Checkbox :id="consentFieldId" v-model="state.consent" class="mt-0.5" />
              <div class="grid min-w-0 flex-1 gap-1.5 font-normal">
                <p class="text-foreground text-sm font-medium leading-snug">
                  I consent to Getalawyer verifying my identity details with the National Identity Management Commission (NIMC) for professional background checks.
                </p>
                <p class="text-muted-foreground text-xs leading-relaxed">
                  Required to proceed. Used only for identity verification.
                </p>
              </div>
            </Label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
