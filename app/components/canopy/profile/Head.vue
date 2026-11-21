<script setup lang="ts">
import type { LawyerProfile } from '~/types/lawyer'

/**
 * Top of a lawyer's profile: photo or initials, main practice area, name with
 * the verified mark, the one-line summary and the facts a client checks first.
 * Under it, one row saying what getalawyer checked. A check is listed only when
 * the profile data says it was done.
 */
const props = defineProps<{
  lawyer: LawyerProfile
  /** "Ikeja, Lagos" */
  location: string
  yearsAtBar: number
  accepting: boolean
}>()

const area = computed(() => props.lawyer.specializations[0]?.name ?? 'Legal services')
const summary = computed(() => props.lawyer.profile?.about.headline?.trim() ?? '')
const firm = computed(() => props.lawyer.practiceInfo?.firmName?.trim() ?? '')
const yearOfCall = computed(() => props.lawyer.professionalInfo?.yearOfCall)
const approved = computed(() => props.lawyer.applicationStatus === 'approved')
const initials = computed(() =>
  props.lawyer.name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2),
)

const checks = computed(() => [
  props.lawyer.ninVerified && { title: 'Identity checked', detail: 'National Identification Number' },
  props.lawyer.professionalInfo?.enrolmentVerified && { title: 'Enrolment checked', detail: 'Supreme Court of Nigeria roll' },
  approved.value && { title: 'Profile approved', detail: 'Reviewed by getalawyer' },
].filter(Boolean) as Array<{ title: string, detail: string }>)

const CHECK_COLUMNS = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'] as const
</script>

<template>
  <div>
    <header class="grid grid-cols-[10.5rem_minmax(0,1fr)] items-center gap-4.5 lg:gap-6.25 xl:gap-7.5 max-sm:grid-cols-[6rem_minmax(0,1fr)] max-sm:items-start">
      <div class="grid aspect-4/5 place-items-center overflow-hidden rounded-2xl bg-mint max-sm:rounded-card">
        <NuxtImg
          v-if="lawyer.image"
          :src="lawyer.image"
          width="336"
          height="420"
          sizes="96px sm:168px"
          :alt="`Portrait of ${lawyer.name}`"
          class="size-full object-cover object-[50%_15%]"
        />
        <span v-else aria-hidden="true" class="font-display text-5xl font-normal tracking-tight text-deep max-sm:text-3xl">{{ initials }}</span>
      </div>

      <div class="min-w-0">
        <p class="text-xs font-medium tracking-widest text-brand uppercase">{{ area }}</p>
        <!-- the no-break space keeps the mark beside the last word when a long name wraps -->
        <h1 class="mt-1.5 text-3xl md:text-4xl lg:text-5xl leading-none font-normal tracking-tighter text-balance">
          {{ lawyer.name }}<template v-if="approved">&nbsp;<span class="inline-block align-middle"><CanopyVerifiedTick big /></span></template>
        </h1>
        <p v-if="summary" class="mt-2.5 max-w-136 text-lg">{{ summary }}</p>
        <ul class="mt-3.5 flex flex-wrap gap-x-5.5 gap-y-1.75 text-base text-muted-foreground">
          <li class="inline-flex items-center gap-1.75"><CanopyGlyph name="pin" class="flex-none text-brand" />{{ location }}</li>
          <li v-if="firm" class="inline-flex items-center gap-1.75"><CanopyGlyph name="office" class="flex-none text-brand" />{{ firm }}</li>
          <li v-if="yearOfCall" class="inline-flex items-center gap-1.75">
            <CanopyGlyph name="clock" class="flex-none text-brand" />Called to the Bar {{ yearOfCall }}<template v-if="yearsAtBar > 0"> · {{ yearsAtBar }} {{ yearsAtBar === 1 ? 'year' : 'years' }}</template>
          </li>
        </ul>
        <p v-if="accepting" class="mt-4 inline-flex items-center gap-2 rounded-full bg-mint px-3.5 py-1.5 text-sm font-medium text-deep">
          <i class="size-2 rounded-full bg-primary" />Accepting new clients
        </p>
      </div>
    </header>

    <ul
      v-if="checks.length"
      aria-label="What has been verified"
      class="mt-6.5 grid grid-cols-1 rounded-card border border-border bg-card"
      :class="CHECK_COLUMNS[checks.length]"
    >
      <li
        v-for="check in checks"
        :key="check.title"
        class="flex items-center gap-3 px-4.5 py-4 not-first:border-t not-first:border-border sm:not-first:border-t-0 sm:not-first:border-l"
      >
        <span class="grid size-7.5 flex-none place-items-center rounded-full bg-primary text-white"><CanopyGlyph name="tick" :size="13" :stroke="3.4" /></span>
        <div class="min-w-0">
          <b class="block text-base">{{ check.title }}</b>
          <small class="text-sm text-muted-foreground">{{ check.detail }}</small>
        </div>
      </li>
    </ul>
  </div>
</template>
