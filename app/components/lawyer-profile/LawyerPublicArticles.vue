<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import LawyerProfileSectionHeading from '@/components/lawyer-profile/LawyerProfileSectionHeading.vue'
import type { LawyerProfileArticle } from '~/types/lawyer-profile-editor'
defineProps<{
  articles: LawyerProfileArticle[]
}>()

function formatPublishedDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <section v-if="articles.length">
    <LawyerProfileSectionHeading title="Articles">
      <template #icon>
        <AppIcon :icon="appIcons.article" />
      </template>
    </LawyerProfileSectionHeading>
    <div class="space-y-4">
      <article
        v-for="item in articles"
        :key="item.id"
        class="rounded-2xl border border-border bg-card p-5 md:p-6"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h3 class="text-base font-semibold tracking-tight text-foreground">
            {{ item.title }}
          </h3>
          <p
            v-if="formatPublishedDate(item.publishedAt)"
            class="font-mono text-xs tabular-nums text-muted-foreground"
          >
            {{ formatPublishedDate(item.publishedAt) }}
          </p>
        </div>
        <p
          v-if="item.excerpt?.trim()"
          class="mt-3 text-sm font-medium text-muted-foreground"
        >
          {{ item.excerpt }}
        </p>
        <p
          class="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          :class="{ 'mt-3': !item.excerpt?.trim() }"
        >
          {{ item.body }}
        </p>
      </article>
    </div>
  </section>
</template>
