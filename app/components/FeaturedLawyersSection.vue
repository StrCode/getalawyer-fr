<script setup lang="ts">
import LawyerCard from './LawyerCard.vue'
import type { Lawyer } from './LawyerCard.vue'

// Sample lawyer data
const featuredLawyers: Lawyer[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    specialty: 'Corporate Law',
    location: 'New York, NY',
    yearsExperience: 15,
    rating: 4.9,
    practiceAreas: ['Mergers & Acquisitions', 'Corporate Governance', 'Securities'],
    verified: true
  },
  {
    id: '2',
    name: 'David Chen',
    specialty: 'Family Law',
    location: 'Los Angeles, CA',
    yearsExperience: 12,
    rating: 4.8,
    practiceAreas: ['Divorce', 'Child Custody', 'Adoption'],
    avatar: 'https://i.pravatar.cc/150?img=12',
    verified: true
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    specialty: 'Criminal Defense',
    location: 'Chicago, IL',
    yearsExperience: 18,
    rating: 4.9,
    practiceAreas: ['White Collar Crime', 'DUI Defense', 'Appeals'],
    verified: true
  },
  {
    id: '4',
    name: 'Michael Thompson',
    specialty: 'Real Estate Law',
    location: 'Miami, FL',
    yearsExperience: 10,
    rating: 4.7,
    practiceAreas: ['Commercial Real Estate', 'Property Disputes', 'Zoning'],
    avatar: 'https://i.pravatar.cc/150?img=33',
    verified: true
  },
  {
    id: '5',
    name: 'Jennifer Park',
    specialty: 'Immigration Law',
    location: 'San Francisco, CA',
    yearsExperience: 14,
    rating: 4.8,
    practiceAreas: ['Visa Applications', 'Citizenship', 'Deportation Defense'],
    verified: true
  },
  {
    id: '6',
    name: 'Robert Williams',
    specialty: 'Intellectual Property',
    location: 'Boston, MA',
    yearsExperience: 20,
    rating: 4.9,
    practiceAreas: ['Patent Law', 'Trademark', 'Copyright'],
    avatar: 'https://i.pravatar.cc/150?img=52',
    verified: true
  },
  {
    id: '7',
    name: 'Amanda Foster',
    specialty: 'Employment Law',
    location: 'Seattle, WA',
    yearsExperience: 11,
    rating: 4.8,
    practiceAreas: ['Workplace Discrimination', 'Wrongful Termination', 'Contracts'],
    verified: true
  },
  {
    id: '8',
    name: 'James Anderson',
    specialty: 'Tax Law',
    location: 'Austin, TX',
    yearsExperience: 16,
    rating: 4.7,
    practiceAreas: ['Tax Planning', 'IRS Disputes', 'Estate Tax'],
    avatar: 'https://i.pravatar.cc/150?img=68',
    verified: true
  }
]
</script>

<template>
  <section id="featured-lawyers" class="bg-white py-16 md:py-24">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <p class="mb-3 font-medium text-gold text-sm uppercase tracking-wide">
          Featured Professionals
        </p>
        <h2 class="mb-4 font-playfair font-bold text-navy text-3xl md:text-4xl">
          Meet Our Top-Rated Lawyers
        </h2>
        <p class="mx-auto max-w-2xl text-gray-600 text-lg">
          Connect with experienced legal professionals who are ready to help you navigate your legal
          challenges with expertise and care.
        </p>
      </div>

      <!-- Lawyers Grid -->
      <div
        class="gap-6 md:gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"
      >
        <LawyerCard
          v-for="lawyer in featuredLawyers"
          :key="lawyer.id"
          :lawyer="lawyer"
        />
      </div>
    </div>
  </section>
</template>
