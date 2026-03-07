<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Benefit {
  title: string
  description: string
  icon: string
  features: string[]
}

interface Testimonial {
  name: string
  title: string
  location: string
  quote: string
  avatar?: string
}

// Loading state
const loading = ref(true)

// Define the 4 benefits as specified in the design document
const benefits: Benefit[] = [
  {
    title: 'Bar-Verified Credentials',
    description: 'Build trust with verified bar credentials',
    icon: 'i-heroicons-shield-check',
    features: [
      'Automated bar verification',
      'Verified badge on profile',
      'Increased client confidence'
    ]
  },
  {
    title: 'Smart Booking Calendar',
    description: 'Manage your availability effortlessly',
    icon: 'i-heroicons-calendar-days',
    features: [
      'Sync with your calendar',
      'Automated reminders',
      'Flexible scheduling'
    ]
  },
  {
    title: 'Direct Client Communication',
    description: 'Secure messaging and video consultations',
    icon: 'i-heroicons-chat-bubble-left-right',
    features: [
      'Encrypted messaging',
      'Video consultation platform',
      'Document sharing'
    ]
  },
  {
    title: 'Zero Commission Model',
    description: 'Keep 100% of your consultation fees',
    icon: 'i-heroicons-currency-dollar',
    features: [
      'No commission fees',
      'Direct payments',
      'Transparent pricing'
    ]
  }
]

// Define testimonials from lawyers
const testimonials: Testimonial[] = [
  {
    name: 'Sarah Mitchell',
    title: 'Family Law Attorney',
    location: 'New York, NY',
    quote: 'LexConnect has transformed my practice. The verified credentials give clients confidence, and the zero commission model means I keep what I earn.'
  },
  {
    name: 'Michael Chen',
    title: 'Corporate Law Specialist',
    location: 'San Francisco, CA',
    quote: 'The smart booking calendar syncs perfectly with my schedule. I\'ve connected with more clients in 3 months than I did all last year.'
  },
  {
    name: 'Jennifer Rodriguez',
    title: 'Criminal Defense Attorney',
    location: 'Chicago, IL',
    quote: 'Direct client communication through secure messaging has streamlined my consultation process. Highly recommend to any lawyer looking to grow their practice.'
  }
]

// SEO metadata
useHead({
  title: 'For Lawyers - Join LexConnect',
  meta: [
    {
      name: 'description',
      content: 'Grow your legal practice with LexConnect. Bar-verified credentials, smart booking calendar, direct client communication, and zero commission fees. Join thousands of lawyers connecting with clients.'
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
  <div class="for-lawyers-page">
    <NavigationBar />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <UContainer>
        <div class="hero-content">
          <h1 class="hero-title">
            Grow Your Practice with LexConnect
          </h1>
          <p class="hero-description">
            Join thousands of lawyers connecting with clients who need your expertise
          </p>
          <UButton
            size="xl"
            to="/auth/register?role=lawyer"
            class="hero-cta-button"
          >
            Register as a Lawyer
          </UButton>
        </div>
      </UContainer>
    </section>
    
    <!-- Benefits Section -->
    <section class="benefits-section">
      <UContainer>
        <div class="section-header">
          <h2 class="section-title">
            Why Join LexConnect?
          </h2>
          <p class="section-description">
            Everything you need to grow your practice and connect with clients
          </p>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="benefits-grid">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div class="space-y-4">
              <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-12 w-12" />
              <div class="bg-gray-200 dark:bg-gray-700 rounded h-6 w-3/4" />
              <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
              <div class="space-y-2">
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-5/6" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-4/5" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actual Content -->
        <div v-else class="benefits-grid">
          <BenefitCard
            v-for="benefit in benefits"
            :key="benefit.title"
            :benefit="benefit"
          />
        </div>
      </UContainer>
    </section>
    
    <!-- Pricing Section -->
    <section class="pricing-section">
      <UContainer>
        <div class="pricing-content">
          <h2 class="pricing-title">
            Transparent Pricing
          </h2>
          <p class="pricing-subtitle">
            Simple, straightforward pricing with no hidden fees
          </p>
          
          <UCard class="pricing-card">
            <div class="pricing-details">
              <div class="pricing-header">
                <h3 class="pricing-plan-name">
                  Professional Plan
                </h3>
                <div class="pricing-amount">
                  <span class="price">$99</span>
                  <span class="period">/month</span>
                </div>
              </div>
              
              <ul class="pricing-features">
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Unlimited client consultations</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Bar verification and verified badge</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Smart booking calendar integration</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Secure messaging and video consultations</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Zero commission on consultation fees</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Profile customization and analytics</span>
                </li>
                <li class="pricing-feature">
                  <UIcon name="i-heroicons-check-circle" class="feature-icon" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <div class="pricing-note">
                <UIcon name="i-heroicons-information-circle" class="info-icon" />
                <p>Keep 100% of your consultation fees. We only charge a flat monthly subscription.</p>
              </div>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>
    
    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <UContainer>
        <div class="section-header">
          <h2 class="section-title">
            What Lawyers Say
          </h2>
          <p class="section-description">
            Hear from lawyers who have grown their practice with LexConnect
          </p>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="testimonials-grid">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-5/6" />
                <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-4/5" />
              </div>
              <div class="flex gap-4 items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-12 w-12 shrink-0" />
                <div class="flex-1 space-y-2">
                  <div class="bg-gray-200 dark:bg-gray-700 rounded h-4 w-2/3" />
                  <div class="bg-gray-200 dark:bg-gray-700 rounded h-3 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actual Content -->
        <div v-else class="testimonials-grid">
          <UCard
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="testimonial-card"
          >
            <div class="testimonial-content">
              <p class="testimonial-quote">
                "{{ testimonial.quote }}"
              </p>
              
              <div class="testimonial-author">
                <div class="author-avatar">
                  <UAvatar
                    v-if="testimonial.avatar"
                    :src="testimonial.avatar"
                    :alt="testimonial.name"
                    size="lg"
                  />
                  <UAvatar
                    v-else
                    :alt="testimonial.name"
                    size="lg"
                  />
                </div>
                
                <div class="author-info">
                  <p class="author-name">{{ testimonial.name }}</p>
                  <p class="author-title">{{ testimonial.title }}</p>
                  <p class="author-location">{{ testimonial.location }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>
    
    <!-- Final CTA Section -->
    <section class="final-cta-section">
      <UContainer>
        <div class="final-cta-content">
          <h2 class="final-cta-title">
            Ready to Get Started?
          </h2>
          <p class="final-cta-description">
            Join LexConnect today and start connecting with clients who need your expertise
          </p>
          <UButton
            size="xl"
            to="/auth/register?role=lawyer"
            class="final-cta-button"
          >
            Register as a Lawyer
          </UButton>
        </div>
      </UContainer>
    </section>
    
    <FooterSection />
  </div>
</template>

<style scoped>
.for-lawyers-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, rgb(var(--color-primary-50)) 0%, rgb(var(--color-primary-100)) 100%);
  padding: 5rem 0;
  text-align: center;
}

.hero-content {
  max-width: 48rem;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: rgb(var(--color-gray-900));
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.5rem;
  color: rgb(var(--color-gray-600));
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-cta-button {
  font-size: 1.125rem;
  padding: 0.875rem 2.5rem;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-gray-900));
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.25rem;
  color: rgb(var(--color-gray-600));
  max-width: 40rem;
  margin: 0 auto;
}

/* Benefits Section */
.benefits-section {
  padding: 5rem 0;
  background-color: white;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

/* Pricing Section */
.pricing-section {
  padding: 5rem 0;
  background-color: rgb(var(--color-gray-50));
}

.pricing-content {
  max-width: 48rem;
  margin: 0 auto;
  text-align: center;
}

.pricing-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(var(--color-gray-900));
  margin-bottom: 0.5rem;
}

.pricing-subtitle {
  font-size: 1.25rem;
  color: rgb(var(--color-gray-600));
  margin-bottom: 3rem;
}

.pricing-card {
  text-align: left;
}

.pricing-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pricing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgb(var(--color-gray-200));
}

.pricing-plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--color-gray-900));
  margin: 0;
}

.pricing-amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.price {
  font-size: 3rem;
  font-weight: 700;
  color: rgb(var(--color-primary-600));
}

.period {
  font-size: 1.25rem;
  color: rgb(var(--color-gray-600));
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pricing-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: rgb(var(--color-gray-700));
}

.feature-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(var(--color-primary-500));
  flex-shrink: 0;
}

.pricing-note {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgb(var(--color-primary-50));
  border-radius: 0.5rem;
  align-items: flex-start;
}

.info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(var(--color-primary-600));
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.pricing-note p {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(var(--color-primary-900));
  line-height: 1.5;
}

/* Testimonials Section */
.testimonials-section {
  padding: 5rem 0;
  background-color: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  height: 100%;
}

.testimonial-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.testimonial-quote {
  font-size: 1.125rem;
  line-height: 1.6;
  color: rgb(var(--color-gray-700));
  font-style: italic;
  margin: 0;
  flex-grow: 1;
}

.testimonial-author {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--color-gray-200));
}

.author-avatar {
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  font-weight: 600;
  color: rgb(var(--color-gray-900));
  margin: 0;
}

.author-title {
  font-size: 0.875rem;
  color: rgb(var(--color-gray-600));
  margin: 0;
}

.author-location {
  font-size: 0.875rem;
  color: rgb(var(--color-gray-500));
  margin: 0;
}

/* Final CTA Section */
.final-cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, rgb(var(--color-primary-500)) 0%, rgb(var(--color-primary-600)) 100%);
  text-align: center;
}

.final-cta-content {
  max-width: 48rem;
  margin: 0 auto;
}

.final-cta-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.final-cta-description {
  font-size: 1.25rem;
  color: rgb(var(--color-primary-50));
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.final-cta-button {
  font-size: 1.125rem;
  padding: 0.875rem 2.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
  
  .benefits-section,
  .pricing-section,
  .testimonials-section,
  .final-cta-section {
    padding: 3rem 0;
  }
  
  .section-title,
  .pricing-title {
    font-size: 1.75rem;
  }
  
  .section-description,
  .pricing-subtitle {
    font-size: 1rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .final-cta-title {
    font-size: 2rem;
  }
  
  .final-cta-description {
    font-size: 1rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .hero-section {
    background: linear-gradient(135deg, rgb(var(--color-primary-900)) 0%, rgb(var(--color-primary-800)) 100%);
  }
  
  .hero-title,
  .section-title,
  .pricing-title {
    color: rgb(var(--color-gray-100));
  }
  
  .hero-description,
  .section-description,
  .pricing-subtitle {
    color: rgb(var(--color-gray-300));
  }
  
  .benefits-section {
    background-color: rgb(var(--color-gray-900));
  }
  
  .pricing-section {
    background-color: rgb(var(--color-gray-800));
  }
  
  .testimonials-section {
    background-color: rgb(var(--color-gray-900));
  }
  
  .pricing-plan-name {
    color: rgb(var(--color-gray-100));
  }
  
  .pricing-feature {
    color: rgb(var(--color-gray-300));
  }
  
  .testimonial-quote {
    color: rgb(var(--color-gray-300));
  }
  
  .author-name {
    color: rgb(var(--color-gray-100));
  }
  
  .author-title {
    color: rgb(var(--color-gray-400));
  }
  
  .author-location {
    color: rgb(var(--color-gray-500));
  }
}
</style>
