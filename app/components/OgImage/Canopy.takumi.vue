<script setup lang="ts">
/**
 * The image shown when a getalawyer page is shared (WhatsApp, X, LinkedIn,
 * Facebook): the site's own look, near-white ground, the green mark, the
 * page's title in the heading face and a line of description in the text face.
 * Rendered by Takumi (the `.takumi` suffix) at 1200 x 630. Pages set it through
 * usePageSeo; the fonts come from @nuxt/fonts (declared `global` in nuxt.config).
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  /** A short label above the title, e.g. a lawyer's practice area. */
  eyebrow?: string
  /** A person's photo (a lawyer's profile), shown round on the right. */
  photo?: string
}>(), {
  title: 'Find a lawyer you can trust, wherever you are',
  description: 'Verified Nigerian lawyers. Message one free, then book a consultation.',
  eyebrow: '',
  photo: '',
})
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between"
    style="background-color: #FAFAFA; color: #171717; padding: 72px 80px; font-family: 'Onest', 'Inter';"
  >
    <div class="flex items-center" style="gap: 18px;">
      <svg viewBox="35.11 405.89 166.81 150.8" xmlns="http://www.w3.org/2000/svg" width="62" height="56" fill="#239261">
        <path d="M161.36,438.01h-7.1c-0.18-0.91-0.35-1.82-0.51-2.71c-2.7-14.46-5.49-29.41-36.92-29.41c-31.15,0-34.13,15.29-37.01,30.08c-0.13,0.67-0.26,1.35-0.4,2.04h-7.81c-20.13,0-36.5,16.37-36.5,36.5v55.33c0,14.81,12.05,26.85,26.85,26.85h113v-75.91H90.05c-7.75,0-14.05,6.3-14.05,14.05v5.06v7.59v0.62h0.03c0.33,9.35,8.02,16.87,17.45,16.87h43.61v-12.33H93.48c-2.84,0-5.15-2.31-5.15-5.15v-7.59v-5.06c0-0.95,0.77-1.72,1.72-1.72h72.58v51.24H61.96c-8.01,0-14.52-6.51-14.52-14.52v-55.33c0-13.33,10.84-24.17,24.17-24.17h89.75c15.57,0,28.23,12.67,28.23,28.23v62.2h12.33v-62.2C201.93,456.21,183.73,438.01,161.36,438.01zM116.83,418.22c20.47,0,22.15,5.28,24.54,17.97H92.34C94.87,423.52,96.93,418.22,116.83,418.22z" />
      </svg>
      <span style="font-family: 'Mona Sans', 'Inter'; font-size: 40px; letter-spacing: -0.02em;">getalawyer</span>
    </div>

    <div class="flex items-center justify-between" style="gap: 56px;">
    <div class="flex flex-col" :style="{ gap: '22px', maxWidth: photo ? '760px' : '980px' }">
      <span v-if="eyebrow" style="font-size: 26px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #007A55;">{{ eyebrow }}</span>
      <span style="font-family: 'Mona Sans', 'Inter'; font-size: 72px; line-height: 1.05; letter-spacing: -0.03em;">{{ title }}</span>
      <span v-if="description" style="font-size: 32px; line-height: 1.35; color: #4D4D4D;">{{ description }}</span>
    </div>
    <img v-if="photo" :src="photo" alt="" width="236" height="236" style="width: 236px; height: 236px; border-radius: 999px; object-fit: cover; border: 6px solid #FFFFFF; flex-shrink: 0;">
    </div>

    <div class="flex items-center justify-between" style="font-size: 26px; color: #4D4D4D;">
      <span>getalawyer.ng</span>
      <span class="flex items-center" style="gap: 12px;">
        <span style="width: 14px; height: 14px; border-radius: 999px; background-color: #CDF36B; border: 2px solid #239261;" />
        Every lawyer is identity and enrolment checked
      </span>
    </div>
  </div>
</template>
