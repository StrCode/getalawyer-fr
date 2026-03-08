<script setup lang="ts">
import type { LawyerSearchResult } from '~/lib/api'

interface Props {
  lawyer: LawyerSearchResult
}

const props = defineProps<Props>()

// Generate initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate gradient
const getAvatarGradient = (name: string) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}

const viewProfile = () => {
  navigateTo(`/lawyers/${props.lawyer.id}`)
}
</script>

<template>
  <div class="lawyer-search-card" @click="viewProfile">
    <div class="card-header">
      <!-- Avatar -->
      <div
        class="card-avatar"
        :style="{ background: getAvatarGradient(lawyer.name) }"
      >
        {{ getInitials(lawyer.name) }}
      </div>

      <!-- Info -->
      <div class="card-info">
        <h3 class="lawyer-name">{{ lawyer.name }}</h3>
        <p class="lawyer-location">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
          {{ lawyer.state }}, {{ lawyer.country }}
        </p>
        <p class="lawyer-experience">
          <UIcon name="i-heroicons-briefcase" class="w-4 h-4" />
          {{ lawyer.yearsOfExperience }} years experience
        </p>
      </div>

      <!-- Bar Association Badge -->
      <div class="bar-badge">
        <UIcon name="i-heroicons-check-badge-solid" class="w-5 h-5 text-green-600" />
        <span class="badge-text">Verified</span>
      </div>
    </div>

    <!-- Experience Description -->
    <p v-if="lawyer.experienceDescription" class="experience-desc">
      {{ lawyer.experienceDescription }}
    </p>

    <!-- Specializations -->
    <div v-if="lawyer.specializations.length" class="specializations">
      <UBadge
        v-for="spec in lawyer.specializations.slice(0, 3)"
        :key="spec.id"
        color="neutral"
        variant="soft"
        class="spec-badge"
      >
        {{ spec.name }}
        <span v-if="spec.yearsOfExperience" class="spec-years">
          ({{ spec.yearsOfExperience }}y)
        </span>
      </UBadge>
      <span v-if="lawyer.specializations.length > 3" class="more-specs">
        +{{ lawyer.specializations.length - 3 }} more
      </span>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="bar-info">
        <UIcon name="i-heroicons-identification" class="w-4 h-4 text-gray-500" />
        <span>{{ lawyer.barAssociation }}</span>
      </div>
      <UButton
        color="primary"
        size="sm"
        trailing-icon="i-heroicons-arrow-right"
        @click.stop="viewProfile"
      >
        View Profile
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.lawyer-search-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;
}

.lawyer-search-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
}

.card-avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.lawyer-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.lawyer-location,
.lawyer-experience {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.bar-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.badge-text {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
}

.experience-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 12px;
}

.specializations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.spec-badge {
  font-size: 12px;
}

.spec-years {
  opacity: 0.7;
  margin-left: 2px;
}

.more-specs {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.bar-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 640px) {
  .lawyer-search-card {
    padding: 16px;
  }

  .card-header {
    gap: 12px;
  }

  .card-avatar {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .lawyer-name {
    font-size: 16px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .bar-info {
    justify-content: center;
  }
}
</style>
