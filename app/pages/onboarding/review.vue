<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { formatScnForDisplay } from '~/lib/scn'
import {
  PhNotePencil,
  PhCheckCircle,
  PhXCircle,
  PhClock
} from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
// Use computed to ensure reactivity to summary changes
const summary = computed(() => store.summary)

const { data: specData } = useSpecializations()
const specializations = computed(() => specData.value || [])

/** `practiceAreas` in the draft are specialization ids — resolve to labels for display */
const practiceAreaRows = computed(() => {
  const ids = summary.value?.practice?.practiceAreas ?? []
  const list = specializations.value
  return ids.map((id: string) => ({
    id,
    name: list.find((s: { id: string; name: string }) => s.id === id)?.name ?? id
  }))
})

// Format helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatScn = (raw: string | undefined) => {
  const s = formatScnForDisplay(raw)
  return s || 'Not provided'
}

/** Street, city, state, postal — comma-separated; omits empty parts */
const officeAddressFull = computed(() => {
  const a = summary.value?.practice?.officeAddress
  if (!a) return 'N/A'
  const parts = [a.street, a.city, a.state, a.postalCode]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
  return parts.length ? parts.join(', ') : 'N/A'
})

/** Mirrors `nin-verification.vue`: verified | submitted & pending | needs action */
const ninDisplay = computed(() => {
  const n = summary.value?.ninVerification
  if (!n) {
    return { variant: 'action' as const, label: 'Action required' }
  }
  if (n.verified) {
    return { variant: 'verified' as const, label: 'Verified' }
  }
  if (n.isSubmitted) {
    return { variant: 'pending' as const, label: 'Awaiting verification' }
  }
  return { variant: 'action' as const, label: 'Action required' }
})
</script>

<template>
  <div v-if="summary" class="space-y-12 pb-20">
    <!-- Header Section -->
    <div class="mb-10 text-center">
      <div class="mx-auto w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 relative border-4 border-white shadow-sm">
         <PhNotePencil class="w-10 h-10" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Review your application</h1>
      <p class="text-sm text-gray-600 max-w-md mx-auto font-medium">Please take a moment to double-check your information before submitting your application for professional review.</p>
    </div>

    <div class="space-y-10">
      <!-- Summary Section: Personal Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Basic Information</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/personal-info">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.firstName }} {{ summary.personal?.lastName }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug capitalize">{{ summary.personal?.gender || 'N/A' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ formatDate(summary.personal?.dateOfBirth) }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Identity Status</p>
              <div class="flex items-center gap-1.5 pt-0.5">
                  <PhCheckCircle
                    v-if="ninDisplay.variant === 'verified'"
                    class="h-4 w-4 shrink-0 text-primary"
                    weight="fill"
                  />
                  <PhClock
                    v-else-if="ninDisplay.variant === 'pending'"
                    class="h-4 w-4 shrink-0 text-emerald-600"
                    weight="fill"
                  />
                  <PhXCircle v-else class="h-4 w-4 shrink-0 text-red-500" weight="fill" />
                  <span
                    class="text-[11px] font-bold"
                    :class="{
                      'text-primary': ninDisplay.variant === 'verified',
                      'text-emerald-700': ninDisplay.variant === 'pending',
                      'text-red-600': ninDisplay.variant === 'action'
                    }"
                  >
                    {{ ninDisplay.label }}
                  </span>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current State</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.state || 'N/A' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">LGA</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.personal?.lga || 'N/A' }}</p>
           </div>
        </div>
      </section>

      <!-- Summary Section: Professional Info -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Professional Background</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/professional-information">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Supreme Court enrolment (SCN)</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug font-mono">{{ formatScn(summary.professional?.barNumber) }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year of Call</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.yearOfCall || 'Not provided' }}</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">University & LLB Year</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.university }} ({{ summary.professional?.llbYear }})</p>
           </div>
           <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Law School</p>
              <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.professional?.lawSchool }}</p>
           </div>
        </div>
      </section>

      <!-- Summary Section: Practice Details -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 class="etsy-label border-b-2 border-primary pb-2 font-bold uppercase tracking-wider text-xs">Practice Details</h3>
           <Button variant="link" class="text-primary font-bold underline px-0 h-auto" as-child>
             <NuxtLink to="/onboarding/practice-information">Edit</NuxtLink>
           </Button>
        </div>
        
        <div class="space-y-4">
           <div class="bg-gray-50/50 p-5 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-bold">Practice Areas</p>
              <div class="flex flex-wrap gap-2">
                 <span
                   v-for="row in practiceAreaRows"
                   :key="row.id"
                   class="px-2 py-0.5 bg-white border border-gray-100 rounded-md text-[10px] font-bold text-gray-700 shadow-sm ring-1 ring-black/5"
                 >
                    {{ row.name }}
                 </span>
              </div>
           </div>
           
           <div class="grid grid-cols-1 gap-6">
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50 md:max-w-xl">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Firm Name</p>
                 <p class="text-[13px] font-bold text-gray-900 leading-snug">{{ summary.practice?.firmName || 'Solo Practitioner' }}</p>
              </div>
              <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50">
                 <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office address</p>
                 <p class="text-[13px] font-bold leading-snug text-gray-900">
                   {{ officeAddressFull }}
                 </p>
              </div>
           </div>
        </div>
      </section>

      <div class="pt-10 border-t border-gray-100 text-center">
         <p class="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed italic font-medium">
            Once submitted, your application will enter a pending state for manual administrative review. This usually takes 1-2 business days.
         </p>
      </div>
    </div>
  </div>
</template>
