<script setup lang="ts">
import { JusticeScale01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import LawyerProfileSectionHeading from '@/components/lawyer-profile/LawyerProfileSectionHeading.vue'
import type { LawyerSpecialization } from '~/types/lawyer'
defineProps<{
  specializations: LawyerSpecialization[]
}>()
</script>

<template>
  <section v-if="specializations.length">
    <LawyerProfileSectionHeading title="Practice areas">
      <template #icon>
        <HugeiconsIcon :icon="JusticeScale01Icon" />
      </template>
    </LawyerProfileSectionHeading>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="spec in specializations"
        :key="spec.id"
        class="rounded-2xl border border-border bg-card p-5"
      >
        <div class="mb-1 flex items-start justify-between gap-3">
         <h3 class="text-base font-semibold text-foreground">
            {{ spec.name }}
          </h3>
          <Badge
            v-if="spec.yearsOfExperience != null"
            variant="verified"
            class="shrink-0 tabular-nums"
          >
            {{ spec.yearsOfExperience }} yrs
          </Badge>
        </div>
        <p
          v-if="spec.description"
          class="text-sm leading-relaxed text-muted-foreground"
        >
          {{ spec.description }}
        </p>
      </div>
    </div>
  </section>
</template>
