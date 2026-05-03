<script setup lang="ts">
import { PhClock, PhEnvelopeSimple } from '@phosphor-icons/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({
  layout: 'home',
})

const supportEmail = 'support@getalawyer.ng'

useHead({
  title: 'Contact us — GetaLawyer',
  meta: [
    {
      name: 'description',
      content:
        'Reach the GetaLawyer team for account help, verification questions, or general support. We respond by email as soon as we can.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-background pb-16">
    <section
      class="border-border border-b bg-marketing-canvas pb-14 pt-26 dark:bg-muted/40 sm:pt-28"
    >
      <div class="mx-auto max-w-3xl px-6 text-center sm:px-8 lg:px-10">
        <h1 class="text-balance text-3xl font-bold tracking-tight text-foreground md:text-[2rem] lg:text-[2.25rem]">
          Contact us
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
          Questions about finding a lawyer, your account, or joining as a legal professional? Send us a message—we read every email.
        </p>
      </div>
    </section>

    <section class="py-14 md:py-16">
      <div class="mx-auto grid max-w-3xl gap-6 px-6 sm:px-8 lg:px-10">
        <Card>
          <CardHeader>
            <div class="flex items-start gap-3">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand"
                aria-hidden="true"
              >
                <PhEnvelopeSimple class="size-6" weight="regular" />
              </span>
              <div class="space-y-1">
                <CardTitle class="text-lg">
                  Email
                </CardTitle>
                <CardDescription>
                  The fastest way to reach us. Include your registered email address if the request is account-related.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              :href="`mailto:${supportEmail}`"
              class="inline-flex rounded-lg px-3 py-2 text-base font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
            >
              {{ supportEmail }}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-start gap-3">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <PhClock class="size-6" weight="regular" />
              </span>
              <div class="space-y-1">
                <CardTitle class="text-lg">
                  Response time
                </CardTitle>
                <CardDescription>
                  We typically reply within one to two business days. Complex verification or escalations may take a bit longer.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </section>

    <FooterSection />
  </div>
</template>
