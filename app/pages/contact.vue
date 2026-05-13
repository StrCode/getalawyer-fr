<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Contact Us — getalawyer',
  description: 'Have a question? We are here to help. Reach out to the getalawyer team.',
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

const handleSubmit = () => {
  isSubmitting.value = true
  // Mock API call
  setTimeout(() => {
    isSubmitting.value = false
    isSuccess.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      isSuccess.value = false
    }, 5000)
  }, 1000)
}
</script>

<template>
  <div class="bg-brand-cream min-h-screen">
    
    <!-- Header -->
    <section class="bg-brand-green-900 text-brand-cream py-[80px] relative overflow-hidden">
      <!-- Radial glow -->
      <div class="absolute pointer-events-none" style="top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(134,194,142,0.08) 0%,transparent 70%);" />
      
      <div class="max-w-[1280px] mx-auto px-8 relative text-center">
        <h1 class="font-heading font-medium tracking-[-0.02em] mb-4" style="font-size:clamp(36px,4.5vw,56px);">
          Contact our team
        </h1>
        <p class="text-[18px] max-w-[560px] mx-auto leading-[1.5]" style="color:rgba(244,241,232,0.7);">
          Whether you're a lawyer looking to join or a client needing support, we're here to help.
        </p>
      </div>
    </section>

    <!-- Content -->
    <section class="py-[80px]">
      <div class="max-w-[1000px] mx-auto px-8">
        <div class="grid md:grid-cols-2 gap-16">
          
          <!-- Left: Info -->
          <div>
            <h2 class="font-heading font-medium text-brand-green-900 text-[28px] mb-6">Get in touch</h2>
            <p class="text-[16px] text-brand-ink-soft leading-[1.6] mb-10">
              Fill out the form and our support team will get back to you within 24 hours. For immediate assistance regarding an ongoing booking, please use the live chat in your dashboard.
            </p>

            <div class="space-y-8">
              <!-- Contact Item -->
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-brand-green-100 text-brand-green-700 rounded-full flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h4 class="font-semibold text-brand-green-900 text-[15px] mb-1">Email us</h4>
                  <p class="text-[14px] text-brand-ink-soft mb-1">We're here to help you.</p>
                  <a href="mailto:support@getalawyer.com.ng" class="text-[15px] font-medium text-brand-green-700 no-underline hover:underline">support@getalawyer.com.ng</a>
                </div>
              </div>

              <!-- Contact Item -->
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-brand-green-100 text-brand-green-700 rounded-full flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h4 class="font-semibold text-brand-green-900 text-[15px] mb-1">Lagos Office</h4>
                  <p class="text-[14px] text-brand-ink-soft mb-1">Come say hello.</p>
                  <p class="text-[15px] text-brand-ink-soft font-medium">14a Admiralty Way<br>Lekki Phase 1, Lagos</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Form -->
          <div class="bg-white rounded-[24px] border border-brand-line p-8 shadow-sm">
            <form @submit.prevent="handleSubmit" class="space-y-5">
              
              <div v-if="isSuccess" class="bg-brand-green-100 text-brand-green-900 p-4 rounded-[12px] text-[14px] font-medium border border-brand-green-300/30 flex items-start gap-3">
                <svg class="w-5 h-5 text-brand-green-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Thanks for reaching out! We'll get back to you shortly.
              </div>

              <div class="grid grid-cols-2 gap-5">
                <div class="col-span-2 sm:col-span-1 space-y-1.5">
                  <label class="text-[13px] font-semibold text-brand-ink-soft uppercase tracking-[0.05em]">Name</label>
                  <input v-model="form.name" required type="text" class="w-full bg-transparent border border-brand-line rounded-[12px] px-4 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-colors" placeholder="Jane Doe" />
                </div>
                <div class="col-span-2 sm:col-span-1 space-y-1.5">
                  <label class="text-[13px] font-semibold text-brand-ink-soft uppercase tracking-[0.05em]">Email</label>
                  <input v-model="form.email" required type="email" class="w-full bg-transparent border border-brand-line rounded-[12px] px-4 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-colors" placeholder="jane@example.com" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-semibold text-brand-ink-soft uppercase tracking-[0.05em]">Subject</label>
                <select v-model="form.subject" required class="w-full bg-transparent border border-brand-line rounded-[12px] px-4 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-colors appearance-none" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A554D%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em;">
                  <option value="" disabled selected>How can we help?</option>
                  <option value="support">General Support</option>
                  <option value="lawyer">I'm a lawyer (Registration/Billing)</option>
                  <option value="client">I'm a client (Booking issues)</option>
                  <option value="partnership">Partnerships</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[13px] font-semibold text-brand-ink-soft uppercase tracking-[0.05em]">Message</label>
                <textarea v-model="form.message" required rows="4" class="w-full bg-transparent border border-brand-line rounded-[12px] px-4 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 transition-colors resize-none" placeholder="Write your message here..."></textarea>
              </div>

              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full bg-brand-green-700 hover:bg-brand-green-900 disabled:opacity-70 text-brand-cream border-none py-[14px] rounded-full font-sans text-[15px] font-medium cursor-pointer transition-colors duration-200 mt-2 flex items-center justify-center"
              >
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Sending...
                </span>
                <span v-else>Send message</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>
