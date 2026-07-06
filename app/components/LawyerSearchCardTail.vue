<script setup lang="ts">
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { LawyerSearchResult } from '~/lib/api'
const props = withDefaults(
  defineProps<{
    lawyer: LawyerSearchResult
    snippetSource: string
    loggedIn: boolean
    isPending: boolean
    density?: 'grid' | 'row'
    hideSnippet?: boolean
    compactFooter?: boolean
    snippetClass?: string
    footerClass?: string
  }>(),
  {
    density: 'row',
    hideSnippet: false,
    compactFooter: false,
    snippetClass: '',
    footerClass: '',
  },
)

defineEmits<{ openProfile: [] }>()
</script>

<template>
  <div class="flex min-w-0 flex-col" :class="density === 'grid' ? 'gap-3' : 'gap-2.5'">
    <blockquote
      v-if="!hideSnippet && snippetSource"
      class="border-border/40 bg-muted/80 text-muted-foreground rounded-xl border px-3.5 py-2.5 text-left text-sm leading-relaxed"
      :class="[
        density === 'grid' ? 'text-center [&_p]:text-center' : '',
        snippetClass,
      ]"
    >
      <p class="line-clamp-2 text-pretty">
        {{ snippetSource }}
      </p>
    </blockquote>

    <div
      v-if="lawyer.specializations?.length"
      class="flex flex-wrap gap-1.5"
      :class="density === 'grid' ? 'justify-center' : ''"
    >
      <Badge
        v-for="spec in lawyer.specializations.slice(0, density === 'grid' ? 3 : 4)"
        :key="spec.id"
        variant="soft"
        class="rounded-full px-2.5 py-0.5 text-xs font-medium"
      >
        {{ spec.name }}
      </Badge>
      <Badge
        v-if="lawyer.specializations.length > (density === 'grid' ? 3 : 4)"
        variant="outline"
        class="rounded-full px-2.5 py-0.5 text-xs tabular-nums"
      >
        +{{ lawyer.specializations.length - (density === 'grid' ? 3 : 4) }}
      </Badge>
    </div>

    <footer
      class="mt-auto flex flex-col gap-2 border-border/70 border-t pt-3"
      :class="[
        compactFooter ? 'pt-2.5' : '',
        footerClass,
      ]"
    >
      <p
        v-if="!loggedIn && !isPending"
        class="text-muted-foreground text-center text-[0.6875rem] font-medium uppercase tracking-wide"
      >
        Sign in to view profile
      </p>
      <Button
        :variant="loggedIn ? 'default' : 'outline'"
        size="sm"
        class="w-full gap-2"
        @click.stop="$emit('openProfile')"
      >
        {{ loggedIn ? 'View profile' : 'Sign in & view' }}
        <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4 opacity-85" aria-hidden="true" />
      </Button>
    </footer>
  </div>
</template>
