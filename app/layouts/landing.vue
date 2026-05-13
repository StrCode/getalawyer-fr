<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const { authModal, authTab, openModal, closeModal } = useLandingModal()

const isScrolled = ref(false)
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 20
      ticking = false
    })
    ticking = true
  }
}
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="font-sans text-brand-ink bg-brand-cream antialiased">

    <!-- ══ AUTH MODAL ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="authModal"
          @click.self="closeModal"
          class="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-brand-green-900/85 backdrop-blur-md"
        >
          <div class="bg-white rounded-[20px] w-full max-w-[480px] overflow-hidden shadow-2xl animate-modal">

            <!-- Header -->
            <div class="bg-brand-green-900 px-8 py-6 flex justify-between items-center">
              <div class="font-heading text-[1.3rem] font-medium text-brand-cream">
                {{ authTab === 'signin' ? 'Welcome back' : 'Join getalawyer' }}
              </div>
              <button @click="closeModal" class="w-8 h-8 rounded-full flex items-center justify-center text-brand-cream/70 hover:text-brand-cream hover:bg-white/10 transition-colors border-none cursor-pointer bg-transparent text-lg">✕</button>
            </div>

            <!-- Body -->
            <div class="p-8">
              <!-- Tabs -->
              <div class="flex bg-slate-100 rounded-[10px] p-1 mb-6">
                <button @click="authTab = 'signin'"
                  :class="['flex-1 py-2.5 rounded-[7px] text-[14px] font-medium border-none cursor-pointer font-sans transition-all', authTab === 'signin' ? 'bg-white text-brand-green-900 shadow-sm' : 'bg-transparent text-brand-ink-soft']"
                >Sign in</button>
                <button @click="authTab = 'signup'"
                  :class="['flex-1 py-2.5 rounded-[7px] text-[14px] font-medium border-none cursor-pointer font-sans transition-all', authTab === 'signup' ? 'bg-white text-brand-green-900 shadow-sm' : 'bg-transparent text-brand-ink-soft']"
                >Create account</button>
              </div>

              <!-- Sign In -->
              <template v-if="authTab === 'signin'">
                <div class="mb-4">
                  <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">Email address</label>
                  <input type="email" placeholder="you@example.com" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] text-brand-ink outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                </div>
                <div class="mb-5">
                  <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">Password</label>
                  <input type="password" placeholder="••••••••" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] text-brand-ink outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                </div>
                <button class="w-full bg-brand-green-700 hover:bg-brand-green-900 text-brand-cream border-none py-[14px] rounded-full font-sans text-[15px] font-medium cursor-pointer transition-colors duration-200">Sign in</button>
                <p class="text-center text-[13px] text-brand-ink-soft mt-4">
                  No account? <a @click="authTab = 'signup'" class="text-brand-green-700 cursor-pointer underline">Create one free</a>
                </p>
              </template>

              <!-- Sign Up -->
              <template v-else>
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">First name</label>
                    <input type="text" placeholder="John" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">Last name</label>
                    <input type="text" placeholder="Doe" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">Email address</label>
                  <input type="email" placeholder="you@example.com" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                </div>
                <div class="mb-4">
                  <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">I am a</label>
                  <select class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] outline-none focus:border-brand-green-700 transition-colors bg-white text-brand-ink">
                    <option>Client seeking legal help</option>
                    <option>Lawyer / Legal Professional</option>
                  </select>
                </div>
                <div class="mb-5">
                  <label class="block text-[12px] font-semibold text-brand-ink-soft tracking-[0.05em] uppercase mb-1.5">Password</label>
                  <input type="password" placeholder="Create a strong password" class="w-full border border-brand-line rounded-lg px-[18px] py-[14px] font-sans text-[15px] outline-none focus:border-brand-green-700 transition-colors bg-transparent" />
                </div>
                <button class="w-full bg-brand-green-700 hover:bg-brand-green-900 text-brand-cream border-none py-[14px] rounded-full font-sans text-[15px] font-medium cursor-pointer transition-colors duration-200">Create free account</button>
                <p class="text-center text-[13px] text-brand-ink-soft mt-4">
                  Already have an account? <a @click="authTab = 'signin'" class="text-brand-green-700 cursor-pointer underline">Sign in</a>
                </p>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ NAV ══════════════════════════════════════════════════ -->
    <LandingNav :is-scrolled="isScrolled" @open-modal="openModal" />

    <!-- ══ PAGE CONTENT ══════════════════════════════════════════ -->
    <slot />

    <!-- ══ FOOTER ════════════════════════════════════════════════ -->
    <LandingFooter />
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
.animate-modal { animation: modal-in 0.25s ease; }
</style>
