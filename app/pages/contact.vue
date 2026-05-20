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
  setTimeout(() => {
    isSubmitting.value = false
    isSuccess.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
    setTimeout(() => { isSuccess.value = false }, 5000)
  }, 1000)
}
</script>

<template>
  <div class="bg-background min-h-screen pb-32">
    
    <!-- Hero / Header -->
    <section class="pt-36 pb-20 px-6 md:px-8 max-w-7xl mx-auto">
      <div class="max-w-2xl">
        <h1 class="font-serif text-[64px] md:text-20 leading-[1.05] text-sidebar mb-6 tracking-tight">
          Get in touch.
        </h1>
        <p class="text-5 text-muted-foreground leading-[1.5]">
          Whether you're a lawyer looking to join our network or a client needing support, our team in Lagos is ready to assist you.
        </p>
      </div>
    </section>

    <!-- Content Split -->
    <section class="max-w-7xl mx-auto px-6 md:px-8">
      <div class="grid lg:grid-cols-12 gap-10 lg:gap-20 items-start">
        
        <!-- Left: Contact Details & Map -->
        <div class="lg:col-span-5 flex flex-col gap-8">
          
          <!-- Email Card -->
          <a href="mailto:support@getalawyer.com.ng" class="group block p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-md hover:border-sidebar-primary transition-all duration-300 no-underline relative overflow-hidden">
            <div class="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-6 text-primary transition-transform duration-300 group-hover:scale-110">
              <PhIcon name="ph:envelope-simple" class="w-7 h-7" />
            </div>
            <h3 class="font-sans font-semibold text-5 text-sidebar mb-2">Email support</h3>
            <p class="text-4 text-muted-foreground mb-8 leading-[1.5]">Our team usually responds within 24 hours.</p>
            <div class="text-[17px] font-medium text-primary group-hover:text-sidebar transition-colors inline-flex items-center gap-2">
              support@getalawyer.com.ng <PhIcon name="ph:arrow-right" class="w-4 h-4" />
            </div>
          </a>

          <!-- Office / Map Card -->
          <div class="p-4 rounded-3xl bg-white border border-border shadow-sm">
            <div class="rounded-3xl overflow-hidden mb-6 h-[240px] bg-border/30 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7174665476313!2d3.4542289153723365!3d6.430296795345719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf57416301aa3%3A0x6b139db0bb145b2e!2sAdmiralty%20Way%2C%20Lekki%20Phase%20I%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1689000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
                class="absolute inset-0 grayscale contrast-[1.1] opacity-90"
              ></iframe>
            </div>
            <div class="px-4 pb-4">
              <div class="flex items-center gap-2 mb-2">
                <PhIcon name="ph:map-pin-fill" class="w-5 h-5 text-primary" />
                <h3 class="font-sans font-semibold text-5 text-sidebar">Lagos HQ</h3>
              </div>
              <p class="text-4 text-muted-foreground leading-[1.6]">
                14a Admiralty Way<br>Lekki Phase 1, Lagos, Nigeria
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Sleek Form -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-10 md:p-14 border border-border shadow-sm">
          <h2 class="font-serif text-[36px] text-sidebar mb-10">Send a message</h2>
          
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
            
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
              <div v-if="isSuccess" class="bg-muted text-sidebar p-5 rounded-2xl text-4 font-medium border border-sidebar-primary/30 flex items-start gap-3">
                <PhIcon name="ph:check-circle-fill" class="w-6 h-6 text-primary shrink-0" />
                Thanks for reaching out! Our team will get back to you shortly.
              </div>
            </Transition>

            <div class="grid md:grid-cols-2 gap-6">
              <!-- Name -->
              <div class="flex flex-col gap-2.5">
                <label class="text-4 font-medium text-foreground">Full name</label>
                <input v-model="form.name" required type="text" class="w-full bg-background/50 border border-border/50 hover:border-border focus:border-sidebar-accent focus:bg-white rounded-2xl px-5 py-5 text-4 text-foreground outline-none transition-all" placeholder="Jane Doe" />
              </div>
              
              <!-- Email -->
              <div class="flex flex-col gap-2.5">
                <label class="text-4 font-medium text-foreground">Email address</label>
                <input v-model="form.email" required type="email" class="w-full bg-background/50 border border-border/50 hover:border-border focus:border-sidebar-accent focus:bg-white rounded-2xl px-5 py-5 text-4 text-foreground outline-none transition-all" placeholder="jane@example.com" />
              </div>
            </div>

            <!-- Subject -->
            <div class="flex flex-col gap-2.5">
              <label class="text-4 font-medium text-foreground">Subject</label>
              <div class="relative">
                <select v-model="form.subject" required class="w-full bg-background/50 border border-border/50 hover:border-border focus:border-sidebar-accent focus:bg-white rounded-2xl px-5 py-5 text-4 text-foreground outline-none transition-all appearance-none cursor-pointer">
                  <option value="" disabled selected>Select a topic</option>
                  <option value="support">General Support</option>
                  <option value="lawyer">I'm a lawyer (Registration/Billing)</option>
                  <option value="client">I'm a client (Booking issues)</option>
                  <option value="partnership">Partnerships</option>
                </select>
                <PhIcon name="ph:caret-down" class="w-5 h-5 text-muted-foreground absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <!-- Message -->
            <div class="flex flex-col gap-2.5">
              <label class="text-4 font-medium text-foreground">Message</label>
              <textarea v-model="form.message" required rows="5" class="w-full bg-background/50 border border-border/50 hover:border-border focus:border-sidebar-accent focus:bg-white rounded-2xl px-5 py-5 text-4 text-foreground outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="mt-6 w-full bg-primary hover:bg-sidebar disabled:opacity-70 text-sidebar-foreground border-none py-5 rounded-2xl font-sans text-4 font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            >
              <template v-if="isSubmitting">
                <PhIcon name="ph:spinner-gap" class="w-5 h-5 animate-spin" />
                Sending...
              </template>
              <template v-else>
                Send message
              </template>
            </button>
          </form>
        </div>

      </div>
    </section>

  </div>
</template>
