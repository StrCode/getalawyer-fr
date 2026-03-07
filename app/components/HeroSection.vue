<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'

interface Props {
  isScrolled?: boolean
  searchExpanded?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  isScrolled: false,
  searchExpanded: false,
})

const emit = defineEmits<{
  search: [data: { practiceArea: string | null; location: string | null; consultationType: string | null }]
  toggleExpanded: []
  quickSearchTag: [tag: string]
}>()

// Search bar state — Care.com / Airbnb field-focus model
const activeField = ref<string | null>(null)
const practiceArea = ref('')
const location = ref('')
const consultationType = ref<'video' | 'phone' | 'in-person' | ''>('')

const focusField = (f: string) => { activeField.value = f }
const blurField = () => { setTimeout(() => { activeField.value = null }, 160) }

const handleSearch = () => {
  emit('search', {
    practiceArea: practiceArea.value || null,
    location: location.value || null,
    consultationType: consultationType.value || null,
  })
}

const quickSearchTags = ['Family Law', 'Criminal Defense', 'Real Estate', 'Immigration', 'Corporate Law']
const handleTag = (tag: string) => {
  practiceArea.value = tag
  emit('quickSearchTag', tag)
}

const statistics = [
  { value: '2,500+', label: 'Verified Lawyers' },
  { value: '50+', label: 'Practice Areas' },
  { value: '10k+', label: 'Consultations' },
  { value: '4.8★', label: 'Avg Rating' },
]

const consultationOptions = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'in-person', label: 'In-Person', icon: '🤝' },
]
</script>

<template>
  <section
    id="hero"
    class="relative min-h-screen flex items-center justify-center overflow-hidden"
    style="background: linear-gradient(160deg, #0d3320 0%, #1a5c3a 45%, #154a2f 100%)"
  >
    <!-- Subtle texture dots -->
    <div class="absolute inset-0 opacity-[0.04]"
      style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;" />

    <!-- Glow blob -->
    <div class="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
      style="background: radial-gradient(circle, #4caf78, transparent)" />

    <div class="relative z-10 w-full max-w-[860px] mx-auto px-6 text-center py-32">

      <!-- Verified badge — staggered in -->
      <motion.div
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.05 }"
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8 text-sm font-medium text-white/90"
      >
        <span class="w-2 h-2 rounded-full bg-[#4caf78] animate-pulse" />
        All lawyers are bar-verified
      </motion.div>

      <!-- Headline -->
      <motion.h1
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }"
        class="text-white font-bold mb-5 leading-[1.12] tracking-tight"
        style="font-size: clamp(2.4rem, 5vw, 3.8rem); font-family: 'DM Sans', sans-serif;"
      >
        Find the Right<br>
        <span style="color: #81c995;">Lawyer</span>, Fast.
      </motion.h1>

      <!-- Subtitle -->
      <motion.p
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.18 }"
        class="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
      >
        Connect with verified legal professionals for video, phone, or in-person consultations.
      </motion.p>

      <!-- ── Search Bar (Care.com / Airbnb style) ── -->
      <motion.div
        :initial="{ opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.55, delay: 0.26 }"
        class="mb-5"
      >
        <motion.div
          :animate="{
            boxShadow: activeField
              ? '0 12px 48px rgba(0,0,0,0.28)'
              : '0 4px 20px rgba(0,0,0,0.18)',
            scale: activeField ? 1.01 : 1,
          }"
          :transition="{ duration: 0.22, ease: 'easeOut' }"
          class="flex items-stretch bg-white rounded-full overflow-hidden search-bar-responsive"
          :class="activeField ? 'ring-2 ring-[#4caf78]/60' : ''"
        >
          <!-- Practice Area -->
          <motion.div
            @click="focusField('area')"
            @blur.capture="blurField"
            :animate="{
              backgroundColor: activeField === 'area' ? '#f2faf4' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-[1.4] px-5 py-3.5 cursor-text border-r border-neutral-200 rounded-l-full search-field"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Practice Area</div>
            <input
              v-model="practiceArea"
              placeholder="e.g. Family Law"
              class="w-full text-sm font-medium text-neutral-900 bg-transparent border-none outline-none placeholder-neutral-300 font-[DM_Sans]"
              @focus="focusField('area')"
              @blur="blurField"
            />
          </motion.div>

          <!-- Location -->
          <motion.div
            @click="focusField('location')"
            :animate="{
              backgroundColor: activeField === 'location' ? '#f2faf4' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-[1] px-5 py-3.5 cursor-text border-r border-neutral-200 search-field"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Location</div>
            <input
              v-model="location"
              placeholder="City or ZIP"
              class="w-full text-sm font-medium text-neutral-900 bg-transparent border-none outline-none placeholder-neutral-300 font-[DM_Sans]"
              @focus="focusField('location')"
              @blur="blurField"
            />
          </motion.div>

          <!-- Consultation Type -->
          <motion.div
            @click="focusField('type')"
            :animate="{
              backgroundColor: activeField === 'type' ? '#f2faf4' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-[1] px-5 py-3.5 cursor-pointer search-field"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Consultation</div>
            <div class="flex gap-2 mt-0.5 consultation-buttons">
              <button
                v-for="opt in consultationOptions"
                :key="opt.value"
                @click.stop="consultationType = (consultationType === opt.value ? '' : opt.value as any)"
                class="text-xs px-2.5 py-1 rounded-full border font-medium font-[DM_Sans] transition-all duration-150"
                :class="consultationType === opt.value
                  ? 'bg-[#1d6b44] text-white border-[#1d6b44]'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'"
              >
                {{ opt.label }}
              </button>
            </div>
          </motion.div>

          <!-- Search button -->
          <div class="flex items-center pr-2 pl-2 bg-white search-button-wrapper">
            <motion.button
              :whileHover="{ scale: 1.06 }"
              :whileTap="{ scale: 0.94 }"
              :transition="{ type: 'spring', stiffness: 420, damping: 18 }"
              @click="handleSearch"
              class="w-11 h-11 rounded-full bg-[#1d6b44] hover:bg-[#154a2f] border-none cursor-pointer flex items-center justify-center transition-colors duration-150 flex-shrink-0"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <!-- Quick tags -->
      <motion.div
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.38 }"
        class="flex flex-wrap items-center justify-center gap-2 mb-14"
      >
        <span class="text-xs text-white/50 font-medium">Popular:</span>
        <motion.button
          v-for="tag in quickSearchTags"
          :key="tag"
          :whileHover="{ y: -2, backgroundColor: 'rgba(129,201,149,0.18)', borderColor: '#81c995' }"
          :whileTap="{ scale: 0.96 }"
          :transition="{ duration: 0.15 }"
          @click="handleTag(tag)"
          class="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white backdrop-blur-sm cursor-pointer font-[DM_Sans]"
        >
          {{ tag }}
        </motion.button>
      </motion.div>

      <!-- Stats bar -->
      <motion.div
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.46 }"
        class="grid grid-cols-4 gap-4 max-w-lg mx-auto"
      >
        <div
          v-for="(stat, i) in statistics"
          :key="i"
          class="text-center"
          :class="i < statistics.length - 1 ? 'border-r border-white/15' : ''"
        >
          <div class="text-xl font-bold text-white mb-0.5">{{ stat.value }}</div>
          <div class="text-xs text-white/50 font-medium">{{ stat.label }}</div>
        </div>
      </motion.div>
    </div>

    <!-- Bottom fade -->
    <div class="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
      style="background: linear-gradient(to bottom, transparent, #f9f9f6)" />
  </section>
</template>


<style scoped>
/* Responsive adjustments for search bar */
@media (max-width: 768px) {
  .search-bar-responsive {
    flex-direction: column;
    border-radius: 16px !important;
  }
  
  .search-field {
    border-right: none !important;
    border-bottom: 1px solid #e5e5e5;
    border-radius: 0 !important;
    padding: 16px 20px !important;
  }
  
  .search-field:first-child {
    border-radius: 16px 16px 0 0 !important;
  }
  
  .search-field:last-of-type {
    border-bottom: none;
  }
  
  .consultation-buttons {
    flex-wrap: wrap;
  }
  
  .search-button-wrapper {
    padding: 12px !important;
    border-radius: 0 0 16px 16px !important;
  }
  
  .search-button-wrapper button {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
  }
}

@media (max-width: 640px) {
  #hero {
    min-height: auto;
    padding: 80px 0 60px;
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 16px !important;
  }
  
  .grid-cols-4 > div:nth-child(2) {
    border-right: none !important;
  }
  
  .grid-cols-4 > div:nth-child(1),
  .grid-cols-4 > div:nth-child(3) {
    border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
  
  .grid-cols-4 > div:nth-child(1),
  .grid-cols-4 > div:nth-child(2) {
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }
}
</style>
