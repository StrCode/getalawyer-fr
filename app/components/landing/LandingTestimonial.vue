<script setup lang="ts">
// No props needed
</script>

<template>
  <section class="bg-background py-12 md:py-24">
    <div class="max-w-7xl mx-auto px-6 md:px-8">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white/40 border border-border/50 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <!-- Subtle decorative element -->
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-muted/50 rounded-full blur-3xl"></div>
          
          <!-- Eyebrow -->
          <p class="text-sm font-semibold text-primary tracking-[0.08em] uppercase mb-8 relative z-10">Trusted across Nigeria</p>
  
          <!-- Quote -->
          <p class="font-heading font-normal text-sidebar leading-[1.25] tracking-[-0.015em] mb-10 relative z-10" style="font-size:clamp(28px,3.5vw,42px);">
            "I needed a property lawyer urgently for a tenancy dispute.
            <em class="italic"> Booked one within 30 minutes</em> — the credentials were already verified, the fees were clear. No back-and-forth, no guesswork."
          </p>
  
          <!-- Attribution -->
          <div class="inline-flex items-center gap-3.5 relative z-10">
            <!-- Avatar -->
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-4 shrink-0"
              style="background:linear-gradient(135deg,#D4A574,#B5894E);"
            >TA</div>
            <div class="text-left">
              <strong class="block font-semibold text-sidebar">Tobi Adeyemi</strong>
              <span class="text-3.5 text-muted-foreground">Client · Lekki, Lagos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
