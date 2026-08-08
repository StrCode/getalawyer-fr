<script setup lang="ts">
import { ArrowDown01Icon, ArrowRight01Icon, Location01Icon, Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Contact Us — getalawyer',
  description: 'Have a question? We are here to help. Reach out to the getalawyer team.',
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const showUnavailableNotice = ref(false)

const SUPPORT_EMAIL = 'support@getalawyer.com.ng'

const mailtoHref = computed(() => {
  const subject = encodeURIComponent(`[${form.value.subject || 'support'}] Message from ${form.value.name || 'the contact form'}`)
  const body = encodeURIComponent(form.value.message)
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
})

// No sending endpoint exists yet — never fake a success. The draft is kept
// and handed to the user's mail client instead.
const handleSubmit = () => {
  showUnavailableNotice.value = true
}
</script>

<template>
  <div class="min-h-screen bg-background pb-32">

    <!-- Editorial split -->
    <section class="mx-auto max-w-7xl px-6 pt-32 pb-20 md:px-8">
      <div class="grid items-start gap-12 lg:grid-cols-12 lg:gap-20">

        <!-- Left: copy & trust -->
        <div class="lg:col-span-5">
          <p class="eyebrow mb-4 text-primary-strong">Contact</p>
         <h1 class="text-4xl font-medium md:text-5xl mb-6 text-foreground">
            Get in touch.
          </h1>
          <p class="mb-12 text-lg leading-relaxed text-muted-foreground">
            Whether you're a lawyer looking to join our network or a client needing support, our team in Lagos is ready to assist you.
          </p>

          <!-- Email Card -->
          <a
            href="mailto:support@getalawyer.com.ng"
            class="group relative mb-6 block overflow-hidden rounded-2xl border border-border bg-card p-8 no-underline shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md"
          >
            <div class="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted text-primary transition-transform duration-300 group-hover:scale-105">
              <HugeiconsIcon :icon="Mail01Icon" class="size-7" />
            </div>
           <h3 class="mb-2 text-lg font-semibold text-foreground">Email support</h3>
            <p class="mb-8 text-sm leading-relaxed text-muted-foreground">Our team usually responds within 24 hours.</p>
            <div class="inline-flex items-center gap-2 text-base font-medium text-primary transition-colors group-hover:text-foreground">
              support@getalawyer.com.ng <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4" />
            </div>
          </a>

          <!-- Office / Map Card -->
          <div class="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div class="relative mb-6 h-[240px] overflow-hidden rounded-xl bg-accent">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7174665476313!2d3.4542289153723365!3d6.430296795345719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf57416301aa3%3A0x6b139db0bb145b2e!2sAdmiralty%20Way%2C%20Lekki%20Phase%20I%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1689000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                class="absolute inset-0 opacity-90 contrast-[1.1] grayscale"
              ></iframe>
            </div>
            <div class="px-2 pb-2">
              <div class="mb-2 flex items-center gap-2">
                <HugeiconsIcon :icon="Location01Icon" class="size-5 text-primary" />
               <h3 class="text-lg font-semibold text-foreground">Lagos HQ</h3>
              </div>
              <p class="text-sm leading-relaxed text-muted-foreground">
                14a Admiralty Way<br>Lekki Phase 1, Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>

        <!-- Right: contact form -->
        <div class="rounded-2xl border border-border bg-card p-8 shadow-sm md:p-12 lg:col-span-7">
         <h2 class="text-2xl font-medium md:text-3xl mb-8 text-foreground">Send a message</h2>

          <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">

            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
              <Alert v-if="showUnavailableNotice" variant="info">
                <HugeiconsIcon :icon="Mail01Icon" class="size-4" aria-hidden="true" />
                <AlertTitle>Direct sending isn't available yet</AlertTitle>
                <AlertDescription>
                  <p>
                    Your message hasn't been sent. Email us instead — we usually respond within 24 hours.
                  </p>
                  <Button as-child variant="outline" size="sm" class="mt-2 w-fit">
                    <a :href="mailtoHref">Open in your email app</a>
                  </Button>
                </AlertDescription>
              </Alert>
            </Transition>

            <div class="grid gap-6 md:grid-cols-2">
              <!-- Name -->
              <div class="flex flex-col gap-2.5">
                <label for="contact-name" class="text-sm font-medium text-foreground">Full name</label>
                <input id="contact-name" v-model="form.name" required type="text" class="w-full rounded-xl border border-border bg-muted/60 px-5 py-4 text-base text-foreground outline-none transition-all hover:border-border focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10" placeholder="Jane Doe" />
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-2.5">
                <label for="contact-email" class="text-sm font-medium text-foreground">Email address</label>
                <input id="contact-email" v-model="form.email" required type="email" class="w-full rounded-xl border border-border bg-muted/60 px-5 py-4 text-base text-foreground outline-none transition-all hover:border-border focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10" placeholder="jane@example.com" />
              </div>
            </div>

            <!-- Subject -->
            <div class="flex flex-col gap-2.5">
              <label for="contact-subject" class="text-sm font-medium text-foreground">Subject</label>
              <div class="relative">
                <select id="contact-subject" v-model="form.subject" required class="w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted/60 px-5 py-4 text-base text-foreground outline-none transition-all hover:border-border focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10">
                  <option value="" disabled selected>Select a topic</option>
                  <option value="support">General Support</option>
                  <option value="lawyer">I'm a lawyer (Registration/Billing)</option>
                  <option value="client">I'm a client (Help finding or contacting a lawyer)</option>
                  <option value="partnership">Partnerships</option>
                </select>
                <HugeiconsIcon :icon="ArrowDown01Icon" class="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <!-- Message -->
            <div class="flex flex-col gap-2.5">
              <label for="contact-message" class="text-sm font-medium text-foreground">Message</label>
              <textarea id="contact-message" v-model="form.message" required rows="5" class="w-full resize-none rounded-xl border border-border bg-muted/60 px-5 py-4 text-base text-foreground outline-none transition-all hover:border-border focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10" placeholder="How can we help you?"></textarea>
            </div>

            <!-- Submit -->
            <Button
              type="submit"
              size="lg"
              class="mt-2 w-full cursor-pointer"
            >
              Send message
            </Button>
          </form>
        </div>

      </div>
    </section>

  </div>
</template>
