<script setup lang="ts">
</script>

<template>
  <section class="bg-canvas py-16 md:py-32">
    <div class="mx-auto max-w-7xl px-6 md:px-8">

      <!-- Split Card CTA -->
      <div class="relative flex flex-col overflow-hidden rounded-2xl bg-ink shadow-lg lg:flex-row">

        <!-- Text Side -->
        <div class="relative z-10 flex flex-1 flex-col justify-center p-10 md:p-14 lg:p-20">
          <p class="text-eyebrow mb-4 text-brass">Ready when you are</p>
          <h2 class="display-xl mb-6 max-w-xl text-ink-foreground">
            Get the legal help you need, from someone you can trust.
          </h2>
          <p class="mb-10 max-w-lg text-xl leading-normal text-ink-muted">
            Verified lawyers. Transparent pricing. Booking in minutes. Take the stress out of finding legal representation today.
          </p>

          <div class="flex flex-wrap gap-4">
            <Button variant="brass" size="lg" as-child>
              <NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink>
            </Button>
            <Button
              variant="outline"
              size="lg"
              as-child
              class="border-ink-border bg-transparent text-ink-foreground hover:border-ink-foreground/60 hover:bg-white/5 hover:text-ink-foreground"
            >
              <NuxtLink to="/for-lawyers">I'm a lawyer</NuxtLink>
            </Button>
          </div>
        </div>

        <!-- Image Side -->
        <div class="relative h-80 lg:h-auto lg:w-[45%]">
          <NuxtImg
            src="/final-cta-handshake.jpg"
            alt="Lawyer and client shaking hands in trust"
            class="absolute inset-0 size-full object-cover opacity-90 mix-blend-luminosity"
            sizes="sm:100vw lg:800px"
            format="webp"
            loading="lazy"
          />
          <!-- Color wash -->
          <div class="absolute inset-0 bg-ink/20 mix-blend-multiply" />

          <!-- Gradient fades to blend the image into the ink card -->
          <div class="absolute inset-0 hidden bg-linear-to-r from-ink via-ink/60 to-transparent lg:block" />
          <div class="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-transparent lg:hidden" />
        </div>

      </div>

    </div>
  </section>
</template>
