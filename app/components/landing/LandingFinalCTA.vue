<script setup lang="ts">
</script>

<template>
  <section class="bg-background py-16 md:py-32">
    <div class="max-w-7xl mx-auto px-6 md:px-8">
      
      <!-- Split Card CTA -->
      <div class="bg-sidebar rounded-3xl overflow-hidden flex flex-col lg:flex-row relative shadow-[0_24px_64px_-16px_rgba(15,46,26,0.15)]">
        
        <!-- Text Side -->
        <div class="flex-1 p-12 lg:p-20 flex flex-col justify-center relative z-10">
          <p class="text-sm font-semibold text-sidebar-primary tracking-[0.08em] uppercase mb-4">Ready when you are</p>
          <h2 class="font-heading font-medium text-sidebar-foreground leading-[1.05] tracking-[-0.02em] mb-6" style="font-size:clamp(36px,4vw,52px);max-width:540px;">
            Get the legal help you need, from someone you can trust.
          </h2>
          <p class="text-5 leading-normal mb-10 max-w-lg" style="color:rgba(244,241,232,0.85);">
            Verified lawyers. Transparent pricing. Booking in minutes. Take the stress out of finding legal representation today.
          </p>
          
          <div class="flex gap-4 flex-wrap">
            <NuxtLink
              to="/find-lawyers"
              class="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-full bg-background text-sidebar font-medium text-4 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer font-sans shadow-sm no-underline"
            >Find a lawyer</NuxtLink>
            <NuxtLink
              to="/for-lawyers"
              class="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-full bg-transparent text-sidebar-foreground font-medium text-4 border border-sidebar-foreground/30 hover:border-sidebar-foreground transition-all duration-200 cursor-pointer font-sans no-underline"
            >I'm a lawyer</NuxtLink>
          </div>
        </div>

        <!-- Image Side -->
        <div class="lg:w-[45%] h-96 lg:h-auto relative">
          <NuxtImg 
            src="/final-cta-handshake.jpg" 
            alt="Lawyer and client shaking hands in trust" 
            class="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
            sizes="sm:100vw lg:800px"
            format="webp"
            loading="lazy"
          />
          <!-- Green color wash to make the image fit the brand perfectly -->
          <div class="absolute inset-0 bg-sidebar/20 mix-blend-multiply"></div>
          
          <!-- Gradient fades to blend the image seamlessly into the solid green card -->
          <div class="absolute inset-0 bg-linear-to-r from-sidebar via-sidebar/60 to-transparent lg:block hidden"></div>
          <div class="absolute inset-0 bg-linear-to-t from-sidebar via-sidebar/60 to-transparent lg:hidden block"></div>
        </div>

      </div>
      
    </div>
  </section>
</template>
