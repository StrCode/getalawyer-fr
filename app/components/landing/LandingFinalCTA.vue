<script setup lang="ts">
const emit = defineEmits<{ openModal: [] }>()
</script>

<template>
  <section class="bg-brand-cream py-[120px]">
    <div class="max-w-[1280px] mx-auto px-8">
      
      <!-- Split Card CTA -->
      <div class="bg-brand-green-900 rounded-[32px] overflow-hidden flex flex-col lg:flex-row relative shadow-[0_24px_64px_-16px_rgba(15,46,26,0.15)]">
        
        <!-- Text Side -->
        <div class="flex-1 p-12 lg:p-[80px] flex flex-col justify-center relative z-10">
          <p class="text-[13px] font-semibold text-brand-green-300 tracking-[0.08em] uppercase mb-4">Ready when you are</p>
          <h2 class="font-heading font-medium text-brand-cream leading-[1.05] tracking-[-0.02em] mb-6" style="font-size:clamp(36px,4vw,52px);max-width:540px;">
            Get the legal help you need, from someone you can trust.
          </h2>
          <p class="text-[18px] leading-[1.5] mb-10 max-w-[480px]" style="color:rgba(244,241,232,0.85);">
            Verified lawyers. Transparent pricing. Booking in minutes. Take the stress out of finding legal representation today.
          </p>
          
          <div class="flex gap-4 flex-wrap">
            <button
              @click="emit('openModal')"
              class="inline-flex items-center justify-center gap-2 px-8 py-[18px] rounded-full bg-brand-cream text-brand-green-900 font-medium text-[16px] hover:bg-white hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer font-sans shadow-sm"
            >Find a lawyer</button>
            <NuxtLink
              to="/for-lawyers"
              class="inline-flex items-center justify-center gap-2 px-8 py-[18px] rounded-full bg-transparent text-brand-cream font-medium text-[16px] border border-brand-cream/30 hover:border-brand-cream transition-all duration-200 cursor-pointer font-sans no-underline"
            >I'm a lawyer</NuxtLink>
          </div>
        </div>

        <!-- Image Side -->
        <div class="lg:w-[45%] h-[400px] lg:h-auto relative">
          <img 
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600" 
            alt="Lawyer and client shaking hands in trust" 
            class="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
          />
          <!-- Green color wash to make the image fit the brand perfectly -->
          <div class="absolute inset-0 bg-brand-green-900/20 mix-blend-multiply"></div>
          
          <!-- Gradient fades to blend the image seamlessly into the solid green card -->
          <div class="absolute inset-0 bg-gradient-to-r from-brand-green-900 via-brand-green-900/60 to-transparent lg:block hidden"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-brand-green-900 via-brand-green-900/60 to-transparent lg:hidden block"></div>
        </div>

      </div>
      
    </div>
  </section>
</template>
