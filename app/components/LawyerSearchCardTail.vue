<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'

const props = withDefaults(
  defineProps<{
    lawyer: LawyerSearchResult
    snippetSource: string
    loggedIn: boolean
    isPending: boolean
    hideSnippet?: boolean
    compactFooter?: boolean
    snippetClass?: string
    footerClass?: string
  }>(),
  {
    hideSnippet: false,
    compactFooter: false,
    snippetClass: '',
    footerClass: '',
  },
)

defineEmits<{ openProfile: [] }>()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3">
    <blockquote
      v-if="!hideSnippet && snippetSource"
      class="border-border/60 bg-muted/30 text-muted-foreground rounded-xl border border-l-[3px] border-l-primary/50 px-3.5 py-2.5 text-left text-sm leading-relaxed"
      :class="snippetClass"
    >
      <p class="line-clamp-3 text-pretty">
        {{ snippetSource }}
      </p>
    </blockquote>

    <div v-if="lawyer.specializations?.length" class="flex flex-wrap gap-1.5">
      <UBadge
        v-for="spec in lawyer.specializations.slice(0, 4)"
        :key="spec.id"
        color="neutral"
        variant="soft"
        class="rounded-md px-2 py-px text-[0.7rem] font-medium"
      >
        {{ spec.name }}
        <span v-if="spec.yearsOfExperience" class="ms-1 tabular-nums opacity-65">
          {{ spec.yearsOfExperience }}y
        </span>
      </UBadge>
      <UBadge
        v-if="lawyer.specializations.length > 4"
        color="neutral"
        variant="outline"
        class="rounded-md px-2 py-px text-[0.7rem] tabular-nums"
      >
        +{{ lawyer.specializations.length - 4 }}
      </UBadge>
    </div>

    <footer
      class="border-border/70 mt-auto flex flex-col gap-2 border-t border-dashed pt-4 sm:flex-row sm:items-center sm:justify-between sm:border-solid"
      :class="[compactFooter ? 'pt-3' : '', footerClass]"
    >
      <p
        v-if="!loggedIn && !isPending"
        class="text-muted-foreground text-[0.7rem] font-medium uppercase tracking-wide"
      >
        Sign in to view profile
      </p>
      <Button
        :variant="loggedIn ? 'default' : 'outline'"
        :size="compactFooter ? 'sm' : 'sm'"
        class="w-full gap-2 sm:ms-auto sm:w-auto sm:justify-center"
        @click.stop="$emit('openProfile')"
      >
        {{ loggedIn ? 'View profile' : 'Sign in & view' }}
        <PhIcon name="i-heroicons-arrow-right" class="size-4 opacity-85" aria-hidden="true" />
      </Button>
    </footer>
  </div>
</template>
