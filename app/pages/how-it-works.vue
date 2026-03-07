<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface WorkflowStep {
  title: string
  description: string
  icon: string
  illustration?: string
}

// Loading state
const loading = ref(true)

// Define the 5 workflow steps as specified in the design document
const workflowSteps: WorkflowStep[] = [
  {
    title: 'Search for Lawyers',
    description: 'Browse our directory of verified lawyers by practice area, location, and consultation type',
    icon: 'i-heroicons-magnifying-glass'
  },
  {
    title: 'Review Profiles',
    description: 'Compare qualifications, experience, ratings, and client reviews',
    icon: 'i-heroicons-document-text'
  },
  {
    title: 'Book a Consultation',
    description: 'Schedule a video, phone, or in-person consultation at your convenience',
    icon: 'i-heroicons-calendar'
  },
  {
    title: 'Meet Your Lawyer',
    description: 'Discuss your legal needs and get expert advice',
    icon: 'i-heroicons-video-camera'
  },
  {
    title: 'Secure Representation',
    description: 'Hire your lawyer and manage your case through our platform',
    icon: 'i-heroicons-check-badge'
  }
]

// SEO metadata
useHead({
  title: 'How It Works - Find Your Lawyer',
  meta: [
    {
      name: 'description',
      content: 'Learn how to find and connect with qualified lawyers in 5 simple steps. Browse verified lawyers, review profiles, book consultations, and secure legal representation.'
    }
  ]
})

// Simulate loading (in real app, this would be data fetching)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<template>
  <div class="how-it-works-page">
    <NavigationBar />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <UContainer>
        <div class="hero-content">
          <h1 class="hero-title">
            How It Works
          </h1>
          <p class="hero-description">
            Find and connect with qualified lawyers in 5 simple steps
          </p>
        </div>
      </UContainer>
    </section>
    
    <!-- Workflow Steps Section -->
    <section class="workflow-steps-section">
      <UContainer>
        <!-- Loading State -->
        <div v-if="loading" class="workflow-steps">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-lg p-8 animate-pulse"
          >
            <div class="flex flex-col md:flex-row gap-6 items-center">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-16 w-16 shrink-0" />
              <div class="flex-1 space-y-4 w-full">
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-8 w-3/4" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actual Content -->
        <div v-else class="workflow-steps">
          <HowItWorksStep
            v-for="(step, index) in workflowSteps"
            :key="index"
            :step="step"
            :index="index"
          />
        </div>
      </UContainer>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
      <UContainer>
        <div class="cta-content">
          <h2 class="cta-title">
            Ready to Find Your Lawyer?
          </h2>
          <p class="cta-description">
            Start your search today and connect with qualified legal professionals
          </p>
          <UButton
            size="xl"
            to="/lawyers"
            class="cta-button"
          >
            Find Your Lawyer
          </UButton>
        </div>
      </UContainer>
    </section>
    
    <FooterSection />
  </div>
</template>

<style scoped>
.how-it-works-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgb(var(--color-primary-50)) 0%, rgb(var(--color-primary-100)) 100%);
  padding: 4rem 0;
  text-align: center;
}

.hero-content {
  max-width: 48rem;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: rgb(var(--color-gray-900));
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.25rem;
  color: rgb(var(--color-gray-600));
  line-height: 1.6;
}

/* Workflow Steps Section */
.workflow-steps-section {
  padding: 4rem 0;
  background-color: rgb(var(--color-gray-50));
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* CTA Section */
.cta-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, rgb(var(--color-primary-500)) 0%, rgb(var(--color-primary-600)) 100%);
  text-align: center;
}

.cta-content {
  max-width: 48rem;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.125rem;
  color: rgb(var(--color-primary-50));
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-button {
  font-size: 1.125rem;
  padding: 0.75rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-section {
    padding: 3rem 0;
  }
  
  .workflow-steps-section {
    padding: 3rem 0;
  }
  
  .cta-section {
    padding: 3rem 0;
  }
  
  .cta-title {
    font-size: 1.75rem;
  }
  
  .cta-description {
    font-size: 1rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .hero-section {
    background: linear-gradient(135deg, rgb(var(--color-primary-900)) 0%, rgb(var(--color-primary-800)) 100%);
  }
  
  .hero-title {
    color: rgb(var(--color-gray-100));
  }
  
  .hero-description {
    color: rgb(var(--color-gray-300));
  }
  
  .workflow-steps-section {
    background-color: rgb(var(--color-gray-900));
  }
}
</style>
