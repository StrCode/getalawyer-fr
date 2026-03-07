<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'search', data: { careType: string; location: string; when: string; time: string }): void
}

const emit = defineEmits<Emits>()

const careType = ref('Lawyer')
const location = ref('94025')
const when = ref('')
const time = ref('')

const handleSearch = () => {
  emit('search', {
    careType: careType.value,
    location: location.value,
    when: when.value,
    time: time.value
  })
}
</script>

<template>
  <div class="search-bar-wrapper">
    <div class="search-bar-container">
      <div class="search-bar">
        <div class="search-field">
          <span class="field-label">Care type</span>
          <span class="field-value">{{ careType }}</span>
        </div>
        
        <div class="search-field">
          <span class="field-label">Where</span>
          <span class="field-value">{{ location }}</span>
        </div>
        
        <div class="search-field">
          <span class="field-label">When</span>
          <span class="field-value placeholder">Add Dates</span>
        </div>
        
        <div class="search-field no-border">
          <span class="field-label">Time</span>
          <span class="field-value placeholder">Add times</span>
        </div>
        
        <button class="search-button" @click="handleSearch">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path 
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" 
              stroke="white" 
              stroke-width="2.5" 
              fill="none" 
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  background: white;
  padding: 16px 32px 0;
  border-bottom: 1px solid #e0e0e0;
}

.search-bar-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  border: 1.5px solid #e0e0e0;
  border-radius: 50px;
  background: white;
  overflow: hidden;
  margin-bottom: -1px;
}

.search-field {
  flex: 1;
  padding: 10px 20px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-field:hover {
  background: #f9f9f6;
}

.search-field.no-border {
  border-right: none;
}

.field-label {
  font-size: 10px;
  color: #888;
  font-weight: 600;
  display: block;
  margin-bottom: 1px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.field-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.field-value.placeholder {
  color: #bbb;
}

.search-button {
  background: #1d6b44;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}

.search-button:hover {
  background: #154a2f;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    border-radius: 12px;
  }
  
  .search-field {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
  }
  
  .search-field:last-of-type {
    border-bottom: none;
  }
  
  .search-button {
    width: 100%;
    border-radius: 8px;
    margin: 8px;
  }
}
</style>
