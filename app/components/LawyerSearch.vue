<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import type { ConsultationType } from '~/composables/useLawyerSearch'
import { useLawyerSearch } from '~/composables/useLawyerSearch'
import { useReducedMotion, getTransition } from '~/composables/useReducedMotion'

// Props interface
interface LawyerSearchProps {
  isScrolled?: boolean
  searchExpanded?: boolean
}

// Emits interface
interface SearchData {
  practiceArea: string | null
  location: string | null
  consultationType: ConsultationType | null
}

// Define props with defaults
const props = withDefaults(defineProps<LawyerSearchProps>(), {
  isScrolled: false,
  searchExpanded: false
})

// Define emits
const emit = defineEmits<{
  search: [data: SearchData]
  toggleExpanded: []
}>()

// Use the composable
const { searchState, updatePracticeArea, updateLocation, updateConsultationType, performSearch } = useLawyerSearch()

// Use reduced motion composable
const { prefersReducedMotion } = useReducedMotion()

// Local state for UI
const isOpen = ref(false)
const activeSection = ref<'practice-area' | 'location' | 'consultation-type' | null>(null)
const previousSection = ref<'practice-area' | 'location' | 'consultation-type' | null>(null)

// Practice area options
const practiceAreas = [
  'Corporate Law',
  'Family Law',
  'Criminal Defense',
  'Real Estate Law',
  'Immigration Law',
  'Intellectual Property',
  'Employment Law',
  'Tax Law'
]

// Consultation type options
const consultationTypes: { value: ConsultationType; label: string }[] = [
  { value: 'video', label: 'Video Consultation' },
  { value: 'phone', label: 'Phone Consultation' },
  { value: 'in-person', label: 'In-Person Meeting' }
]

// Computed display values
const displayText = computed(() => {
  if (props.isScrolled && (searchState.value.practiceArea || searchState.value.location || searchState.value.consultationType)) {
    const parts = []
    if (searchState.value.practiceArea) parts.push(searchState.value.practiceArea)
    if (searchState.value.location) parts.push(searchState.value.location)
    if (searchState.value.consultationType) {
      const type = consultationTypes.find(t => t.value === searchState.value.consultationType)
      if (type) parts.push(type.label)
    }
    return parts.join(' • ')
  }
  return 'Find a lawyer'
})

// Compute slide direction for animations
const slideDirection = computed(() => {
  const sections = ['practice-area', 'location', 'consultation-type']
  const currentIndex = activeSection.value ? sections.indexOf(activeSection.value) : -1
  const previousIndex = previousSection.value ? sections.indexOf(previousSection.value) : -1
  
  if (currentIndex > previousIndex) return 'right'
  if (currentIndex < previousIndex) return 'left'
  return 'right'
})

// Handle section clicks
const openSection = (section: 'practice-area' | 'location' | 'consultation-type') => {
  previousSection.value = activeSection.value
  activeSection.value = section
  isOpen.value = true
}

const closePopover = () => {
  isOpen.value = false
  previousSection.value = activeSection.value
  activeSection.value = null
}

// Handle selections with auto-advance
const selectPracticeArea = (area: string) => {
  updatePracticeArea(area)
  // Auto-advance to location
  previousSection.value = activeSection.value
  activeSection.value = 'location'
}

const selectLocation = (location: string) => {
  updateLocation(location)
  // Auto-advance to consultation type
  previousSection.value = activeSection.value
  activeSection.value = 'consultation-type'
}

const selectConsultationType = (type: ConsultationType) => {
  updateConsultationType(type)
  closePopover()
}

// Handle search
const handleSearch = () => {
  performSearch()
  emit('search', {
    practiceArea: searchState.value.practiceArea,
    location: searchState.value.location,
    consultationType: searchState.value.consultationType
  })
}

// Handle toggle expanded
const handleToggleExpanded = () => {
  emit('toggleExpanded')
}
</script>

<template>
  <div class="lawyer-search-container">
    <!-- Main search bar with motion-v animations -->
    <motion.div
      class="search-bar"
      :animate="{
        scale: isScrolled ? 0.88 : 1,
        y: isScrolled ? -2 : 0
      }"
      :transition="getTransition(prefersReducedMotion, {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      })"
      @click="!isScrolled && !isOpen ? openSection('practice-area') : null"
    >
      <!-- Expanded search fields (visible when not scrolled) -->
      <div v-if="!isScrolled" class="search-fields">
        <!-- Practice Area Field -->
        <button
          type="button"
          class="search-field"
          :class="{ 'active': activeSection === 'practice-area' }"
          @click.stop="openSection('practice-area')"
        >
          <!-- Active indicator with layoutId -->
          <motion.div
            v-if="activeSection === 'practice-area'"
            layoutId="activeIndicator"
            class="active-indicator"
          />
          <div class="field-content">
            <span class="field-label">Practice Area</span>
            <span class="field-value">{{ searchState.practiceArea || 'Select area' }}</span>
          </div>
        </button>

        <div class="field-divider"></div>

        <!-- Location Field -->
        <button
          type="button"
          class="search-field"
          :class="{ 'active': activeSection === 'location' }"
          @click.stop="openSection('location')"
        >
          <!-- Active indicator with layoutId -->
          <motion.div
            v-if="activeSection === 'location'"
            layoutId="activeIndicator"
            class="active-indicator"
            :transition="getTransition(prefersReducedMotion, { duration: 0.3, ease: [0.4, 0, 0.2, 1] })"
          />
          <div class="field-content">
            <span class="field-label">Location</span>
            <span class="field-value">{{ searchState.location || 'Enter location' }}</span>
          </div>
        </</div>
        </button>

        <div class="field-divider" />

        <!-- Consultation Type Field -->
        <button
          type="button"
          class="search-field"
          :class="{ 'active': activeSection === 'consultation-type' }"
          @click.stop="openSection('consultation-type')"
        >
          <!-- Active indicator with layoutId -->
          <motion.div
            v-if="activeSection === 'consultation-type'"
            layoutId="activeIndicator"
            class="active-indicator"
            :transition="getTransition(prefersReducedMotion, { duration: 0.3, ease: [0.4, 0, 0.2, 1] })"
          />
          <div class="field-content">
            <span class="field-label">Consultation Type</span>
            <span class="field-value">
              {{ searchState.consultationType ? consultationTypes.find(t => t.value === searchState.consultationType)?.label : 'Select type' }}
            </span>
          </div>
        </button>

        <!-- Search Button -->
        <button
          type="button"
          class="search-button"
          @click.stop="handleSearch"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- Collapsed pill view when scrolled -->
      <motion.div
        v-if="isScrolled"
        class="collapsed-pill"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="getTransition(prefersReducedMotion, { duration: 0.2 })"
        @click="handleToggleExpanded"
      >
        <span class="pill-text">{{ displayText }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </motion.div>

    <!-- Animated Popover -->
    <Transition name="popover">
      <motion.div
        v-if="isOpen && !isScrolled"
        class="search-popover"
        @click.stop
      >
        <!-- Practice Area Section -->
        <motion.div
          v-if="activeSection === 'practice-area'"
          class="popover-content"
          :initial="{ opacity: 0, x: slideDirection === 'right' ? 20 : -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: slideDirection === 'right' ? -20 : 20 }"
          :transition="getTransition(prefersReducedMotion, { duration: 0.2, ease: [0.4, 0, 0.2, 1] })"
        >
          <h3 class="popover-title">
            Select Practice Area
          </h3>
          <div class="options-grid">
            <button
              v-for="area in practiceAreas"
              :key="area"
              type="button"
              class="option-button"
              :class="{ 'selected': searchState.practiceArea === area }"
              @click="selectPracticeArea(area)"
            >
              {{ area }}
            </button>
          </div>
        </motion.div>

        <!-- Location Section -->
        <motion.div
          v-if="activeSection === 'location'"
          class="popover-content"
          :initial="{ opacity: 0, x: slideDirection === 'right' ? 20 : -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: slideDirection === 'right' ? -20 : 20 }"
          :transition="getTransition(prefersReducedMotion, { duration: 0.2, ease: [0.4, 0, 0.2, 1] })"
        >
          <h3 class="popover-title">
            Enter Location
          </h3>
          <input
            type="text"
            class="location-input"
            placeholder="City, State, or ZIP code"
            :value="searchState.location || ''"
            @input="updateLocation(($event.target as HTMLInputElement).value)"
            @keyup.enter="selectLocation(($event.target as HTMLInputElement).value)"
          >
          <button
            v-if="searchState.location"
            type="button"
            class="continue-button"
            @click="selectLocation(searchState.location)"
          >
            Continue
          </button>
        </motion.div>

        <!-- Consultation Type Section -->
        <motion.div
          v-if="activeSection === 'consultation-type'"
          class="popover-content"
          :initial="{ opacity: 0, x: slideDirection === 'right' ? 20 : -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: slideDirection === 'right' ? -20 : 20 }"
          :transition="getTransition(prefersReducedMotion, { duration: 0.2, ease: [0.4, 0, 0.2, 1] })"
        >
          <h3 class="popover-title">
            Select Consultation Type
          </h3>
          <div class="options-list">
            <button
              v-for="type in consultationTypes"
              :key="type.value"
              type="button"
              class="option-list-button"
              :class="{ 'selected': searchState.consultationType === type.value }"
              @click="selectConsultationType(type.value)"
            >
              <span class="option-icon">
                <svg v-if="type.value === 'video'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="type.value === 'phone'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </motion.div>

        <!-- Close button -->
        <button
          type="button"
          class="close-button"
          @click="closePopover"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </Transition>

    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen && !isScrolled"
        class="search-backdrop"
        @click="closePopover"
      />
    </Transition>
  </div>
</template>

<style scoped>
.lawyer-search-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Search Bar */
.search-bar {
  position: relative;
  background: white;
  border-radius: 9999px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-fields {
  display: flex;
  align-items: center;
  gap: 0;
}

.search-field {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 9999px;
  transition: background-color 0.2s;
  position: relative;
}

.search-field:hover {
  background-color: rgba(15, 39, 68, 0.05);
}

.search-field.active {
  background-color: rgba(15, 39, 68, 0.08);
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #c9a84c 0%, #d4b866 100%);
  border-radius: 9999px;
  box-shadow: 3px 0px 8px 2px rgba(24, 24, 27, 0.10);
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f2744;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #64748b;
}

.field-divider {
  width: 1px;
  height: 32px;
  background-color: #e2e8f0;
}

.search-button {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #c9a84c 0%, #d4b866 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3);
}

/* Collapsed Pill */
.collapsed-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
}

.pill-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #0f2744;
  font-weight: 500;
}

/* Popover */
.search-popover {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.popover-content {
  position: relative;
}

.popover-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f2744;
  margin-bottom: 16px;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 9999px;
  transition: background-color 0.2s, color 0.2s;
}

.close-button:hover {
  background-color: rgba(15, 39, 68, 0.05);
  color: #0f2744;
}

/* Options Grid */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.option-button {
  padding: 12px 16px;
  background: #faf8f4;
  border: 2px solid transparent;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f2744;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:hover {
  background: #f0ede5;
  border-color: #c9a84c;
}

.option-button.selected {
  background: #0f2744;
  color: white;
  border-color: #0f2744;
}

/* Location Input */
.location-input {
  width: 100%;
  padding: 14px 16px;
  background: #faf8f4;
  border: 2px solid transparent;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #0f2744;
  transition: border-color 0.2s;
}

.location-input:focus {
  outline: none;
  border-color: #c9a84c;
}

.continue-button {
  margin-top: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #c9a84c 0%, #d4b866 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3);
}

/* Options List */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-list-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #faf8f4;
  border: 2px solid transparent;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f2744;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option-list-button:hover {
  background: #f0ede5;
  border-color: #c9a84c;
}

.option-list-button.selected {
  background: #0f2744;
  color: white;
  border-color: #0f2744;
}

.option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Backdrop */
.search-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 40;
}

/* Transitions */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-popover {
    display: none;
  }
  
  .search-fields {
    flex-direction: column;
    gap: 8px;
  }
  
  .field-divider {
    display: none;
  }
  
  .search-field {
    width: 100%;
  }
}
</style>
