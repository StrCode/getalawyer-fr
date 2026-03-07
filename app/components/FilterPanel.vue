<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FilterState } from '~/types/filter'
import type { ConsultationType } from '~/types/lawyer'

interface Props {
  modelValue: FilterState
  practiceAreas: Array<{ name: string; slug: string }>
  loading?: boolean
  isMobile?: boolean
  isOpen?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: FilterState): void
  (e: 'reset'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localFilters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Local state for name search
const firstNameInput = ref('')
const lastInitialInput = ref('')

// Count active filters
const activeFilterCount = computed(() => {
  const f = localFilters.value
  let count = 0
  if (f.keywords) count++
  if (f.lawyerName) count++
  if (f.practiceAreas.length > 0) count++
  if (f.location) count++
  if (f.consultationTypes.length > 0) count++
  if (f.minRating) count++
  if (f.minExperience) count++
  if (f.priceRange.min || f.priceRange.max) count++
  if (f.certifications && f.certifications.length > 0) count++
  if (f.languages && f.languages.length > 0) count++
  return count
})

const applyNameSearch = () => {
  const name = firstNameInput.value.trim() + (lastInitialInput.value.trim() ? ' ' + lastInitialInput.value.trim() : '')
  localFilters.value = { ...localFilters.value, lawyerName: name }
}

const clearNameSearch = () => {
  firstNameInput.value = ''
  lastInitialInput.value = ''
  localFilters.value = { ...localFilters.value, lawyerName: '' }
}

const handleReset = () => {
  firstNameInput.value = ''
  lastInitialInput.value = ''
  emit('reset')
}
</script>

<template>
  <!-- Mobile Drawer Overlay -->
  <div v-if="isMobile && isOpen" class="mobile-overlay" @click="emit('close')" />
  
  <!-- Filter Panel (Sidebar on desktop, Drawer on mobile) -->
  <aside class="filter-panel" :class="{ 'mobile-drawer': isMobile, 'drawer-open': isMobile && isOpen }">
    <!-- Header -->
    <div class="filter-header">
      <span class="filter-title">Filters ({{ activeFilterCount }})</span>
      <div class="header-actions">
        <button v-if="activeFilterCount > 0" class="clear-all-btn" @click="handleReset">
          Clear all
        </button>
        <button v-if="isMobile" class="close-btn" @click="emit('close')" aria-label="Close filters">
          ✕
        </button>
      </div>
    </div>

    <!-- Smart Keywords -->
    <div class="filter-section">
      <div class="section-label">
        Smart keywords
        <span class="info-icon">ⓘ</span>
        <span class="ai-badge">
          <span class="sparkle">✦</span>
          Powered by AI (Beta)
        </span>
      </div>
      <input
        v-model="localFilters.keywords"
        type="text"
        class="filter-input"
        placeholder="Example: arts and crafts, meal prep"
        :disabled="loading"
      />
      <button v-if="localFilters.keywords" class="apply-btn" :disabled="loading">
        Apply keyword
      </button>
    </div>

    <!-- Search by Name -->
    <div class="filter-section">
      <div class="section-label">
        Search by name
        <span class="new-badge">New</span>
      </div>
      <div class="name-search-grid">
        <div>
          <input
            v-model="firstNameInput"
            type="text"
            class="filter-input"
            placeholder="Example: John"
            :disabled="loading"
          />
          <div class="input-label">First Name</div>
        </div>
        <div>
          <input
            v-model="lastInitialInput"
            type="text"
            class="filter-input text-center"
            placeholder="A"
            maxlength="1"
            :disabled="loading"
          />
          <div class="input-label">Last Initial</div>
        </div>
      </div>
      <button
        class="search-name-btn"
        :disabled="!firstNameInput && !lastInitialInput || loading"
        @click="applyNameSearch"
      >
        Search Name
      </button>
      <button
        v-if="localFilters.lawyerName"
        class="clear-btn"
        @click="clearNameSearch"
      >
        Clear
      </button>
    </div>

    <!-- Pay Rate -->
    <div class="filter-section">
      <div class="section-label">Pay rate</div>
      <div class="pay-rate-display">
        ${{ localFilters.priceRange.min ?? 18 }}–${{ localFilters.priceRange.max ?? 50 }}
        <span class="rate-unit">/ hour</span>
      </div>
      <input
        type="range"
        class="range-slider"
        :value="localFilters.priceRange.max ?? 50"
        min="18"
        max="100"
        :disabled="loading"
        @input="(e) => {
          const val = parseInt((e.target as HTMLInputElement).value)
          localFilters = {
            ...localFilters,
            priceRange: { min: 18, max: val }
          }
        }"
      />
    </div>

    <!-- Number of Children (adapted for lawyers) -->
    <div class="filter-section">
      <div class="section-label">Practice areas</div>
      <div class="checkbox-list">
        <label
          v-for="area in practiceAreas.slice(0, 5)"
          :key="area.slug"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :checked="localFilters.practiceAreas.includes(area.slug)"
            :disabled="loading"
            @change="(e) => {
              const checked = (e.target as HTMLInputElement).checked
              const areas = checked
                ? [...localFilters.practiceAreas, area.slug]
                : localFilters.practiceAreas.filter(a => a !== area.slug)
              localFilters = { ...localFilters, practiceAreas: areas }
            }"
          />
          <span>{{ area.name }}</span>
        </label>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.filter-panel {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

/* Mobile Drawer Styles */
.filter-panel.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  bottom: 0;
  width: 85%;
  max-width: 400px;
  z-index: 50;
  border-radius: 0;
  border: none;
  overflow-y: auto;
  transition: right 0.3s ease-out;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

.filter-panel.mobile-drawer.drawer-open {
  right: 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}

.clear-all-btn {
  font-size: 13px;
  color: #1d6b44;
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
}

.close-btn {
  font-size: 24px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f2f2f2;
}

.filter-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1a1a1a;
}

.info-icon {
  font-size: 14px;
  color: #bbb;
  cursor: pointer;
}

.ai-badge {
  font-size: 10px;
  font-weight: 600;
  color: #888;
  background: #f2f2f2;
  padding: 2px 8px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.sparkle {
  font-size: 10px;
}

.new-badge {
  background: #e8f5e9;
  color: #1d6b44;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  margin-left: 4px;
}

.filter-input {
  width: 100%;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  color: #1a1a1a;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: #1d6b44;
}

.filter-input::placeholder {
  color: #888;
}

.filter-input:disabled {
  background: #f9f9f6;
  cursor: not-allowed;
}

.text-center {
  text-align: center;
}

.apply-btn {
  width: 100%;
  background: #1d6b44;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.apply-btn:hover:not(:disabled) {
  background: #154a2f;
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.name-search-grid {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 8px;
  margin-bottom: 10px;
}

.input-label {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
  text-align: center;
}

.search-name-btn {
  width: 100%;
  background: #f2f2f2;
  color: #888;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 4px;
}

.search-name-btn:not(:disabled) {
  background: #1d6b44;
  color: white;
  cursor: pointer;
}

.search-name-btn:not(:disabled):hover {
  background: #154a2f;
}

.search-name-btn:disabled {
  cursor: not-allowed;
}

.clear-btn {
  font-size: 13px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 0;
}

.pay-rate-display {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.rate-unit {
  font-size: 14px;
  font-weight: 400;
  color: #888;
}

.range-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #1a1a1a 0%, #1a1a1a 35%, #e0e0e0 35%, #e0e0e0 100%);
  outline: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1a1a1a;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1a1a1a;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
