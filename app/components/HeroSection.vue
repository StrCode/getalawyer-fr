<script setup lang="ts">
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
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
    class="relative min-h-[auto] sm:min-h-screen pt-[80px] pb-[60px] sm:py-0 flex items-center justify-center overflow-hidden bg-[#fafafa]"
  >
    <!-- Subtle texture dots -->
    <div class="absolute inset-0 opacity-[0.03]"
      style="background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 28px 28px;" />

    <!-- Glow blob -->
    <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[80px] pointer-events-none"
      style="background: radial-gradient(circle, #1d6b44, transparent)" />

    <div class="relative z-10 w-full max-w-[860px] mx-auto px-6 text-center py-32">

      <!-- Verified badge — staggered in -->
      <motion.div
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.05 }"
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-white shadow-sm mb-8 text-sm font-medium text-neutral-600"
      >
        <span class="w-2 h-2 rounded-full bg-[#1d6b44] animate-pulse" />
        All lawyers are bar-verified
      </motion.div>

      <!-- Headline -->
      <motion.h1
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }"
        class="text-neutral-900 font-bold mb-5 leading-[1.12] tracking-tight font-dm"
        style="font-size: clamp(2.4rem, 5vw, 3.8rem);"
      >
        Find the Right<br>
        <span class="text-[#1d6b44]">Lawyer</span>, Fast.
      </motion.h1>

      <!-- Subtitle -->
      <motion.p
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.18 }"
        class="text-neutral-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
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
              ? '0 12px 32px rgba(0,0,0,0.08)'
              : '0 4px 12px rgba(0,0,0,0.03)',
            scale: activeField ? 1.01 : 1,
          }"
          :transition="{ duration: 0.22, ease: 'easeOut' }"
          class="flex flex-col md:flex-row items-stretch bg-white rounded-[16px] md:rounded-full overflow-hidden border border-neutral-200/60"
          :class="activeField ? 'border-[#1d6b44]/30 ring-1 ring-[#1d6b44]/10' : ''"
        >
          <!-- Practice Area -->
          <motion.div
            @click="focusField('area')"
            @blur.capture="blurField"
            :animate="{
              backgroundColor: activeField === 'area' ? '#fdfdfd' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-1 md:flex-[1.4] px-5 py-4 md:py-3.5 cursor-text border-b md:border-b-0 md:border-r border-neutral-200 md:border-neutral-100 rounded-t-[16px] md:rounded-t-none md:rounded-l-full"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Practice Area</div>
            <input
              v-model="practiceArea"
              placeholder="e.g. Family Law"
              class="w-full text-sm font-medium text-neutral-900 bg-transparent border-none outline-none placeholder-neutral-300 font-dm"
              @focus="focusField('area')"
              @blur="blurField"
            />
          </motion.div>

          <!-- Location -->
          <motion.div
            @click="focusField('location')"
            :animate="{
              backgroundColor: activeField === 'location' ? '#fdfdfd' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-1 px-5 py-4 md:py-3.5 cursor-text border-b md:border-b-0 md:border-r border-neutral-200 md:border-neutral-100"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Location</div>
            <input
              v-model="location"
              placeholder="City or ZIP"
              class="w-full text-sm font-medium text-neutral-900 bg-transparent border-none outline-none placeholder-neutral-300 font-dm"
              @focus="focusField('location')"
              @blur="blurField"
            />
          </motion.div>

          <!-- Consultation Type -->
          <motion.div
            @click="focusField('type')"
            :animate="{
              backgroundColor: activeField === 'type' ? '#fdfdfd' : '#ffffff',
            }"
            :transition="{ duration: 0.18 }"
            class="flex-1 px-5 py-4 md:py-3.5 cursor-pointer border-none"
          >
            <div class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Consultation</div>
            <div class="flex flex-wrap md:flex-nowrap gap-2 mt-0.5">
              <button
                v-for="opt in consultationOptions"
                :key="opt.value"
                @click.stop="consultationType = (consultationType === opt.value ? '' : opt.value as any)"
                class="text-xs px-2.5 py-1 rounded-full border font-medium font-dm transition-all duration-150"
                :class="consultationType === opt.value
                  ? 'bg-[#1d6b44] text-white border-[#1d6b44]'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'"
              >
                {{ opt.label }}
              </button>
            </div>
          </motion.div>

          <!-- Search button -->
          <div class="flex items-center p-3 md:py-0 md:px-2 bg-white rounded-b-[16px] md:rounded-none">
            <motion.button
              :whileHover="{ scale: 1.04 }"
              :whileTap="{ scale: 0.96 }"
              :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
              @click="handleSearch"
              class="w-full h-12 md:w-11 md:h-11 rounded-xl md:rounded-full bg-[#1d6b44] hover:bg-[#154a2f] border-none cursor-pointer flex items-center justify-center transition-colors duration-150 shrink-0 text-white"
            >
              <PhMagnifyingGlass class="w-4 h-4" />
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
        <span class="text-xs text-neutral-400 font-medium">Popular:</span>
        <motion.button
          v-for="tag in quickSearchTags"
          :key="tag"
          :whileHover="{ y: -2, backgroundColor: '#f9f9f9', borderColor: '#e5e5e5' }"
          :whileTap="{ scale: 0.96 }"
          :transition="{ duration: 0.15 }"
          @click="handleTag(tag)"
          class="px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-600 cursor-pointer font-dm shadow-sm"
        >
          {{ tag }}
        </motion.button>
      </motion.div>

      <!-- Stats bar -->
      <motion.div
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.46 }"
        class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 max-w-lg mx-auto"
      >
        <div
          v-for="(stat, i) in statistics"
          :key="i"
          class="text-center border-neutral-200"
          :class="[
            (i === 0 || i === 2) ? 'border-r' : '',
            i === 1 ? 'border-r-0 sm:border-r' : '',
            i < 2 ? 'border-b sm:border-b-0 pb-4 sm:pb-0' : ''
          ]"
        >
          <div class="text-xl font-bold text-neutral-900 mb-0.5">{{ stat.value }}</div>
          <div class="text-xs text-neutral-500 font-medium">{{ stat.label }}</div>
        </div>
      </motion.div>
    </div>

    <!-- Bottom fade -->
    <div class="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
      style="background: linear-gradient(to bottom, transparent, #ffffff)" />
  </section>
</template>

