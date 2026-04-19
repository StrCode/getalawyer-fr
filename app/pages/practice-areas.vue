<script setup lang="ts">
import {
  PhBriefcase,
  PhBuildings,
  PhCalculator,
  PhCurrencyDollar,
  PhFileText,
  PhGlobe,
  PhGlobeHemisphereWest,
  PhHeart,
  PhHouse,
  PhLightbulb,
  PhShieldCheck,
  PhUsersThree
} from '@phosphor-icons/vue'
import { ref, onMounted } from 'vue'
import type { PracticeArea } from '~/types/practice-area'

// SEO metadata
useHead({
  title: 'Practice Areas - GetaLawyer',
  meta: [
    {
      name: 'description',
      content: 'Explore all legal practice areas and find specialized lawyers across family law, criminal defense, corporate law, and more.'
    }
  ]
})

// Loading state
const loading = ref(true)

// Define 12 practice areas with icons, names, slugs, and lawyer counts
const practiceAreas: PracticeArea[] = [
  {
    id: '1',
    name: 'Family Law',
    slug: 'family-law',
    icon: PhUsersThree,
    lawyerCount: 245,
    description: 'Divorce, custody, adoption, and family matters'
  },
  {
    id: '2',
    name: 'Criminal Defense',
    slug: 'criminal-defense',
    icon: PhShieldCheck,
    lawyerCount: 189,
    description: 'Defense representation for criminal charges'
  },
  {
    id: '3',
    name: 'Corporate Law',
    slug: 'corporate-law',
    icon: PhBuildings,
    lawyerCount: 312,
    description: 'Business formation, contracts, and corporate matters'
  },
  {
    id: '4',
    name: 'Real Estate Law',
    slug: 'real-estate-law',
    icon: PhHouse,
    lawyerCount: 156,
    description: 'Property transactions, leases, and real estate disputes'
  },
  {
    id: '5',
    name: 'Personal Injury',
    slug: 'personal-injury',
    icon: PhHeart,
    lawyerCount: 203,
    description: 'Accident claims, medical malpractice, and injury compensation'
  },
  {
    id: '6',
    name: 'Employment Law',
    slug: 'employment-law',
    icon: PhBriefcase,
    lawyerCount: 178,
    description: 'Workplace disputes, discrimination, and labor rights'
  },
  {
    id: '7',
    name: 'Immigration Law',
    slug: 'immigration-law',
    icon: PhGlobe,
    lawyerCount: 134,
    description: 'Visas, citizenship, and immigration matters'
  },
  {
    id: '8',
    name: 'Intellectual Property',
    slug: 'intellectual-property',
    icon: PhLightbulb,
    lawyerCount: 167,
    description: 'Patents, trademarks, copyrights, and IP protection'
  },
  {
    id: '9',
    name: 'Estate Planning',
    slug: 'estate-planning',
    icon: PhFileText,
    lawyerCount: 142,
    description: 'Wills, trusts, and estate administration'
  },
  {
    id: '10',
    name: 'Tax Law',
    slug: 'tax-law',
    icon: PhCalculator,
    lawyerCount: 98,
    description: 'Tax planning, disputes, and compliance'
  },
  {
    id: '11',
    name: 'Bankruptcy Law',
    slug: 'bankruptcy-law',
    icon: PhCurrencyDollar,
    lawyerCount: 87,
    description: 'Debt relief, bankruptcy filings, and financial restructuring'
  },
  {
    id: '12',
    name: 'Environmental Law',
    slug: 'environmental-law',
    icon: PhGlobeHemisphereWest,
    lawyerCount: 76,
    description: 'Environmental regulations, compliance, and litigation'
  }
]

// Simulate loading (in real app, this would be data fetching)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Navigation -->
    <NavigationBar />

    <!-- Hero Section -->
    <section class="bg-linear-to-br from-primary-600 to-primary-800 pt-24 pb-16 text-white">
      <UContainer>
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="mb-4 font-bold text-4xl sm:text-5xl">
            Explore Legal Practice Areas
          </h1>
          <p class="text-primary-100 text-lg sm:text-xl">
            Find specialized lawyers across all areas of law
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Practice Areas Grid -->
    <section class="py-16">
      <UContainer>
        <!-- Loading State -->
        <div v-if="loading" class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="i in 12"
            :key="i"
            class="bg-white dark:bg-gray-800 p-6 rounded-lg animate-pulse"
          >
            <div class="flex items-start gap-4">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-lg w-12 h-12" />
              <div class="flex-1 space-y-3">
                <div class="bg-gray-200 dark:bg-gray-700 rounded w-3/4 h-6" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded w-1/2 h-4" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded w-full h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actual Content -->
        <PracticeAreaGrid v-else :areas="practiceAreas" :columns="3" />
      </UContainer>
    </section>

    <!-- Footer -->
    <FooterSection />
  </div>
</template>
