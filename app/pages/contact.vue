<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'

/**
 * Contact. There is no endpoint that sends a message for the visitor, so the
 * form does not pretend to: it prepares the message and opens it in their own
 * email app, addressed to support. Nothing is "sent" by this page.
 */
definePageMeta({ layout: 'site' })

useHead({ title: 'Contact' })
useSeoMeta({
  description: 'Questions about finding a lawyer, your account or joining as a lawyer? Email the getalawyer team.',
})

const TOPICS = [
  { value: 'support', label: 'General support' },
  { value: 'client', label: 'I am a client (finding or contacting a lawyer)' },
  { value: 'lawyer', label: 'I am a lawyer (registration or billing)' },
  { value: 'partnership', label: 'Partnerships' },
]

const form = reactive({ name: '', topic: '', message: '' })

const mailtoHref = computed(() => {
  const topic = TOPICS.find(item => item.value === form.topic)?.label ?? 'General support'
  const subject = encodeURIComponent(`[${topic}] Message from ${form.name.trim() || 'the contact page'}`)
  const body = encodeURIComponent(form.message.trim())
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
})

// Runs only when the browser has accepted the required fields.
function openInEmailApp() {
  window.location.href = mailtoHref.value
}

const label = 'text-[0.9rem] font-semibold'
const card = 'rounded-card border border-border bg-card p-[clamp(1.2rem,2.4vw,1.6rem)]'
</script>

<template>
  <div class="pb-[clamp(3.5rem,7vw,6.5rem)]">
    <header class="max-w-[54rem] pt-[clamp(1.5rem,4vw,3.25rem)] pb-[clamp(1.5rem,3vw,2.5rem)]">
      <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">Contact</div>
      <h1 class="mt-[0.9rem] text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
        Get in touch. <em class="text-brand not-italic">We read every message.</em>
      </h1>
      <p class="mt-[1.2rem] max-w-[40rem] text-[1.15rem] text-muted-foreground">
        Whether you are looking for a lawyer, already have an account, or want to join as a lawyer, write to us and we will help.
      </p>
    </header>

    <div class="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-start gap-[1.1rem] max-tab:grid-cols-1">
      <div class="grid gap-[1.1rem]">
        <a :href="`mailto:${SUPPORT_EMAIL}`" :class="card" class="group/mail flex items-start gap-4 transition-[translate,box-shadow,border-color] duration-200 ease-canopy hover:-translate-y-[3px] hover:border-brand">
          <span class="grid size-12 flex-none place-items-center rounded-[1rem] bg-mint text-deep"><CanopyGlyph name="mail" :size="22" /></span>
          <span class="min-w-0">
            <b class="block font-display text-[1.3rem] font-[650] tracking-[-0.02em]">Email support</b>
            <span class="mt-1 block text-muted-foreground">We usually reply within 24 hours.</span>
            <span class="mt-3 inline-flex items-center gap-2 font-semibold break-all text-brand underline underline-offset-[3px]">{{ SUPPORT_EMAIL }}</span>
          </span>
        </a>

        <div :class="card">
          <div class="flex items-start gap-4">
            <span class="grid size-12 flex-none place-items-center rounded-[1rem] bg-mint text-deep"><CanopyGlyph name="pin" :size="22" /></span>
            <div>
              <b class="block font-display text-[1.3rem] font-[650] tracking-[-0.02em]">Lagos office</b>
              <p class="mt-1 text-muted-foreground">14a Admiralty Way<br>Lekki Phase 1, Lagos, Nigeria</p>
            </div>
          </div>
          <div class="relative mt-4 h-56 overflow-hidden rounded-[1.25rem] bg-stone">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7174665476313!2d3.4542289153723365!3d6.430296795345719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf57416301aa3%3A0x6b139db0bb145b2e!2sAdmiralty%20Way%2C%20Lekki%20Phase%20I%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1689000000000!5m2!1sen!2sus"
              title="Map showing Admiralty Way, Lekki Phase 1, Lagos"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="absolute inset-0 size-full border-0 grayscale dark:invert-[0.92] dark:hue-rotate-180"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-[1.1rem] max-sm:grid-cols-1">
          <NuxtLink to="/find-lawyers" :class="card" class="[transition:border-color_0.2s] hover:border-brand">
            <b class="block font-display text-[1.12rem] font-[650] tracking-[-0.02em]">Looking for a lawyer?</b>
            <span class="mt-1 block text-[0.95rem] text-muted-foreground">Search the directory and message one free. →</span>
          </NuxtLink>
          <NuxtLink to="/for-lawyers" :class="card" class="[transition:border-color_0.2s] hover:border-brand">
            <b class="block font-display text-[1.12rem] font-[650] tracking-[-0.02em]">Are you a lawyer?</b>
            <span class="mt-1 block text-[0.95rem] text-muted-foreground">See what membership includes. →</span>
          </NuxtLink>
        </div>
      </div>

      <section aria-labelledby="contact-form-title" class="rounded-card bg-stone p-[clamp(1.4rem,3vw,2.25rem)]">
        <h2 id="contact-form-title" class="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-[650] tracking-[-0.035em]">Write to us</h2>
        <p class="mt-2 max-w-[34rem] text-muted-foreground">
          Fill this in and we will open the message in your email app, addressed to our team. You press send there.
        </p>

        <form class="mt-[1.4rem] grid gap-[1.1rem]" @submit.prevent="openInEmailApp">
          <div class="grid gap-2">
            <label for="contact-name" :class="label">Your name</label>
            <Input id="contact-name" v-model="form.name" required autocomplete="name" placeholder="Ada Obi" :class="authInput" />
          </div>
          <!-- the select's own wrapper is sized to its content; stretch it to the field -->
          <div class="grid gap-2 *:data-[slot=native-select-wrapper]:w-full">
            <label for="contact-topic" :class="label">What is it about?</label>
            <NativeSelect id="contact-topic" v-model="form.topic" required class="h-[3.25rem] rounded-[1rem] border-border bg-card px-4 text-[1.02rem] shadow-none dark:bg-card">
              <NativeSelectOption value="" disabled>Choose a topic</NativeSelectOption>
              <NativeSelectOption v-for="topic in TOPICS" :key="topic.value" :value="topic.value">{{ topic.label }}</NativeSelectOption>
            </NativeSelect>
          </div>
          <div class="grid gap-2">
            <label for="contact-message" :class="label">Message</label>
            <Textarea
              id="contact-message"
              v-model="form.message"
              required
              rows="6"
              placeholder="How can we help?"
              class="min-h-[9.5rem] resize-y rounded-[1rem] border-border bg-card px-4 py-3 text-[1.02rem] shadow-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-mint"
            />
          </div>
          <Button type="submit" variant="canopy" size="pill" class="group/btn mt-[0.3rem] h-[3.25rem] w-full justify-between pr-2 pl-[1.4rem]">
            Continue in your email app<CanopyArrowChip />
          </Button>
          <p class="text-[0.85rem] text-muted-foreground">
            No email app on this device? Write to <a :href="`mailto:${SUPPORT_EMAIL}`" class="font-semibold text-brand underline underline-offset-[3px]">{{ SUPPORT_EMAIL }}</a> from any mailbox.
          </p>
        </form>
      </section>
    </div>
  </div>
</template>
