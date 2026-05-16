<script setup lang="ts">
const emit = defineEmits<{ openModal: [] }>()

interface Lawyer {
  initials: string; avatarBg: string; name: string; specialty: string
  badge: string; location: string; experience: string; rating: string
  stars: string; tags: string[]
}

const lawyers: Lawyer[] = [
  { initials:'AI', avatarBg:'#e8c97a', name:'Adaeze Ihejirika, Esq.', specialty:'Corporate & Business Law', badge:'✓ Verified',  location:'Lagos, NG',       experience:'12 yrs exp.', rating:'4.9', stars:'★★★★★', tags:['M&A','Contracts','Startups'] },
  { initials:'OB', avatarBg:'#93c5fd', name:'Olumide Bankole, SAN',   specialty:'Criminal Defense',         badge:'✓ Featured', location:'Abuja, NG',       experience:'20 yrs exp.', rating:'5.0', stars:'★★★★★', tags:['Federal Court','Appeals','Fraud'] },
  { initials:'FK', avatarBg:'#86efac', name:'Fatima Kwara-Ibrahim',    specialty:'Family & Matrimonial Law', badge:'✓ Verified',  location:'Kano, NG',        experience:'8 yrs exp.',  rating:'4.8', stars:'★★★★★', tags:['Divorce','Custody','Inheritance'] },
  { initials:'CE', avatarBg:'#fca5a5', name:'Chukwuemeka Eze',         specialty:'Immigration Law',          badge:'✓ Verified',  location:'Remote / Online', experience:'15 yrs exp.', rating:'4.7', stars:'★★★★☆', tags:['Visas','Asylum','Work Permits'] },
]
</script>

<template>
  <section id="lawyers" class="bg-white py-12 md:py-24 px-[5%]">
    <!-- Header -->
    <p class="text-center text-[0.78rem] font-semibold tracking-0.5 uppercase text-brand-blue mb-3">Verified Professionals</p>
    <h2 class="font-heading font-bold text-brand-navy text-center mb-2.5 leading-[1.15]" style="font-size:clamp(2rem,4vw,3rem);">Featured Lawyers</h2>
    <p class="text-center text-slate-600 text-[1rem] max-w-lg mx-auto mb-16 leading-[1.7]">
      Hand-verified, highly rated legal professionals ready to take your consultation.
    </p>

    <!-- Grid -->
    <div class="grid gap-6 max-w-6xl mx-auto" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));">
      <div
        v-for="lawyer in lawyers"
        :key="lawyer.name"
        class="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer bg-white hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,39,68,0.12)]"
      >
        <!-- Navy header -->
        <div class="bg-brand-navy px-6 py-5 flex items-center gap-4 relative">
          <div
            class="w-14 h-14 rounded-full border-2 border-brand-gold flex items-center justify-center font-heading text-[1.3rem] font-bold text-brand-navy shrink-0"
            :style="{ background: lawyer.avatarBg }"
          >{{ lawyer.initials }}</div>
          <div>
            <div class="font-semibold text-[1rem] text-white mb-0.5">{{ lawyer.name }}</div>
            <div class="text-[0.8rem] text-brand-gold-light">{{ lawyer.specialty }}</div>
          </div>
          <span class="absolute top-4 right-4 text-[0.7rem] font-semibold px-2.5 py-1 rounded-full tracking-[0.5px]"
            style="background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);color:#e8c97a;">
            {{ lawyer.badge }}
          </span>
        </div>

        <!-- Body -->
        <div class="px-6 pt-5 pb-6">
          <!-- Meta -->
          <div class="flex flex-wrap gap-4 mb-4">
            <span class="flex items-center gap-1 text-[0.8rem] text-slate-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ lawyer.location }}
            </span>
            <span class="flex items-center gap-1 text-[0.8rem] text-slate-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ lawyer.experience }}
            </span>
            <span class="flex items-center gap-1 text-[0.8rem] font-semibold text-slate-800">
              <span class="text-amber-400 text-[0.75rem]">{{ lawyer.stars }}</span>
              {{ lawyer.rating }}
            </span>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            <span
              v-for="tag in lawyer.tags" :key="tag"
              class="bg-slate-100 text-slate-600 text-[0.75rem] px-2.5 py-1 rounded-full"
            >{{ tag }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2.5">
            <button
              @click="emit('openModal')"
              class="flex-1 bg-brand-navy hover:bg-brand-blue text-white border-none py-2.5 rounded-lg font-sans text-[0.85rem] font-semibold cursor-pointer transition-colors duration-200"
            >Book Consultation</button>
            <button
              @click="emit('openModal')"
              class="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none px-4 py-2.5 rounded-lg font-sans text-[0.85rem] font-medium cursor-pointer transition-colors duration-200"
            >Profile</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
