<script setup lang="ts">
/**
 * Beside the settings on a wide screen: the account's other pages, so the page
 * links to them instead of only saying they exist.
 */
const props = defineProps<{ role: 'lawyer' | 'client' }>()

const links = computed(() =>
  props.role === 'lawyer'
    ? [
        { to: '/dashboard/profile', label: 'Your profile', hint: 'What clients see in the directory' },
        { to: '/dashboard/subscription', label: 'Membership', hint: 'Your plan, card and receipts' },
        { to: '/dashboard/availability', label: 'Availability', hint: 'The hours clients can book you' },
        { to: '/dashboard/consultation-types', label: 'Consultations', hint: 'What you offer and what it costs' },
      ]
    : [
        { to: '/dashboard/bookings', label: 'Bookings', hint: 'Consultations you have booked' },
        { to: '/dashboard/my-lawyers', label: 'My lawyers', hint: 'Lawyers you have written to' },
      ],
)
</script>

<template>
  <aside class="h-fit rounded-card bg-mint p-4.5 text-deep lg:p-5.75 xl:p-6" aria-labelledby="settings-elsewhere">
    <h2 id="settings-elsewhere" class="font-display text-lg font-normal tracking-tight">Elsewhere in your account</h2>
    <ul class="mt-3 divide-y divide-deep/10">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to" class="group flex items-center justify-between gap-3 py-3">
          <span class="min-w-0">
            <span class="block font-medium underline-offset-3 group-hover:underline">{{ link.label }}</span>
            <span class="block text-sm opacity-75">{{ link.hint }}</span>
          </span>
          <CanopyGlyph name="arrow" :size="16" class="flex-none transition-transform duration-200 ease-canopy group-hover:translate-x-0.5" />
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>
