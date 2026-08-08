<script setup lang="ts">
/**
 * Shared frame for the legal pages (/terms, /privacy, /ndpa): narrow prose
 * column, effective date, and consistent section typography.
 */
defineProps<{
  title: string
  effectiveDate: string
  intro?: string
}>()
</script>

<template>
  <div class="bg-background pb-24 font-sans text-foreground">
    <header class="border-b border-border bg-background">
      <div class="mx-auto max-w-3xl px-6 pb-10 pt-14 md:px-8">
        <p class="eyebrow text-primary-strong">Legal</p>
       <h1 class="mt-3 text-4xl font-medium text-balance text-foreground md:text-5xl">
          {{ title }}
        </h1>
        <p class="mt-4 text-sm text-muted-foreground">
          Effective {{ effectiveDate }}
        </p>
        <p v-if="intro" class="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {{ intro }}
        </p>
      </div>
    </header>

    <article
      class="mx-auto max-w-3xl px-6 pt-10 md:px-8
        [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground
        [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
        [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground
        [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:leading-relaxed [&_li]:text-muted-foreground
        [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline"
    >
      <slot />
    </article>
  </div>
</template>
