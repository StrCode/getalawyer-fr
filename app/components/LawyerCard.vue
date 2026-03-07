<script setup lang="ts">
import { ref } from 'vue'
import type { Lawyer } from '~/types/lawyer'

interface Props {
  lawyer: Lawyer
}

const props = defineProps<Props>()

const isFavorited = ref(false)

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}

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
    'linear-gradient(135deg, #a8c5a0, #6a9e6a)',
    'linear-gradient(135deg, #c5aaa0, #9e6a6a)',
    'linear-gradient(135deg, #b0a0c5, #6a5a9e)',
    'linear-gradient(135deg, #c5b0a0, #9e7a6a)',
    'linear-gradient(135deg, #a0b8c5, #5a8a9e)'
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}
</script>

<template>
  <div class="lawyer-card">
    <div class="card-top">
      <!-- Avatar -->
      <div
        v-if="lawyer.avatar"
        class="card-avatar"
      >
        <img :src="lawyer.avatar" :alt="lawyer.name" />
      </div>
      <div
        v-else
        class="card-avatar-placeholder"
        :style="{ background: getAvatarGradient(lawyer.name) }"
      >
        {{ getInitials(lawyer.name) }}
      </div>

      <!-- Info -->
      <div class="card-info">
        <div class="card-name">{{ lawyer.name }}</div>
        <div class="card-location">{{ lawyer.location }}</div>
        
        <!-- Rating or Experience -->
        <div v-if="lawyer.rating && lawyer.reviewCount" class="stars-display">
          <span v-for="i in 5" :key="i" class="star">★</span>
          <span class="review-count">({{ lawyer.reviewCount }})</span>
        </div>
        <div v-else class="card-exp">{{ lawyer.yearsExperience }} years of experience</div>

        <!-- Hired tag -->
        <div v-if="lawyer.reviewCount && lawyer.reviewCount > 0" class="hired-tag">
          🏠 Cared for {{ lawyer.reviewCount }} {{ lawyer.reviewCount === 1 ? 'family' : 'families' }}
        </div>
      </div>

      <!-- Price -->
      <div class="card-price">
        <span class="price-from">from</span>
        <span class="price-amount">${{ lawyer.priceRange.min }}</span>
        <span class="price-per">per hour</span>
      </div>
    </div>

    <!-- Badges -->
    <div class="badge-row">
      <span v-if="lawyer.verified" class="badge">Background Checked</span>
      <span v-for="cert in lawyer.certifications?.slice(0, 2)" :key="cert" class="badge premium">
        {{ cert === 'board-certified' ? 'Premium' : cert }}
      </span>
    </div>

    <!-- Bio -->
    <div v-if="lawyer.bio" class="card-bio">
      "{{ lawyer.bio.slice(0, 120) }}{{ lawyer.bio.length > 120 ? '…' : '' }}"
      <a href="#" @click.prevent>more</a>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="match-tags">
        <span class="match-tag">1 - 3 yrs</span>
        <span class="match-tag">${{ lawyer.priceRange.min }}-${{ lawyer.priceRange.max }}/hr</span>
        <span class="match-tag">2 children</span>
        <span class="more-matches">+2 more matches</span>
      </div>

      <div class="card-actions">
        <button 
          class="btn-heart" 
          :class="{ favorited: isFavorited }"
          @click="toggleFavorite"
        >
          {{ isFavorited ? '♥' : '♡' }}
        </button>
        <button class="btn-contact">
          Contact
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lawyer-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

@media (max-width: 640px) {
  .lawyer-card {
    padding: 16px;
  }
}

.lawyer-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.card-top {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

@media (max-width: 480px) {
  .card-top {
    gap: 12px;
  }
}

.card-avatar {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .card-avatar {
    width: 64px;
    height: 64px;
  }
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: white;
}

@media (max-width: 480px) {
  .card-avatar-placeholder {
    width: 64px;
    height: 64px;
    font-size: 22px;
  }
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 3px;
  color: #1a1a1a;
}

@media (max-width: 480px) {
  .card-name {
    font-size: 16px;
  }
}

.card-location {
  font-size: 13px;
  color: #555;
  margin-bottom: 5px;
}

@media (max-width: 480px) {
  .card-location {
    font-size: 12px;
  }
}

.card-exp {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.stars-display {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-bottom: 4px;
}

.star {
  color: #f5a623;
  font-size: 14px;
}

.review-count {
  font-size: 12px;
  color: #888;
  margin-left: 4px;
}

.hired-tag {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.card-price {
  text-align: right;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .card-price {
    text-align: left;
    margin-top: 8px;
  }
  
  .card-top {
    flex-wrap: wrap;
  }
}

.price-from {
  font-size: 11px;
  color: #888;
  display: block;
  margin-bottom: 2px;
}

.price-amount {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

@media (max-width: 480px) {
  .price-amount {
    font-size: 20px;
  }
}

.price-per {
  font-size: 12px;
  color: #888;
  display: block;
}

.badge-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #888;
}

.badge.premium {
  border-color: #c4a000;
  color: #8a6e00;
  background: #fff9e6;
}

.card-bio {
  font-size: 13.5px;
  color: #555;
  line-height: 1.55;
  margin-bottom: 14px;
}

@media (max-width: 480px) {
  .card-bio {
    font-size: 13px;
  }
}

.card-bio a {
  color: #1d6b44;
  font-weight: 600;
  text-decoration: none;
}

.card-bio a:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 640px) {
  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

.match-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .match-tags {
    justify-content: center;
  }
}

.match-tag {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-tag::before {
  content: '✓';
  color: #888;
  font-weight: 700;
}

.more-matches {
  font-size: 12px;
  font-weight: 700;
  color: #1d6b44;
  cursor: pointer;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .card-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.btn-heart {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #bbb;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.btn-heart:hover {
  color: #e91e63;
}

.btn-heart.favorited {
  color: #e91e63;
}

.btn-contact {
  background: #1d6b44;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

@media (max-width: 640px) {
  .btn-contact {
    flex: 1;
    padding: 12px 24px;
  }
}

.btn-contact:hover {
  background: #154a2f;
}
</style>
