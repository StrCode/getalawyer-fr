<template>
  <div class="flex justify-center items-center bg-[#f1f3f4] px-4 py-12 min-h-screen font-sans">
    <div class="w-full max-w-xl">

      <!-- Heading -->
      <div class="mb-6">
        <h1 class="mb-2 font-bold text-[28px] text-gray-900 tracking-tight">Set your availability</h1>
        <p class="text-gray-500 text-sm leading-relaxed">Define ranges of time when you are available</p>
        <p class="text-gray-500 text-sm">You can customise all of this later in the availability page.</p>
      </div>

      <!-- Progress -->
      <div class="mb-6">
        <span class="block mb-2 text-gray-500 text-xs">Step 3 of 4</span>
        <div class="flex gap-1.5">
          <div
            v-for="i in 4"
            :key="i"
            class="flex-1 rounded-full h-[3px]"
            :class="i <= 3 ? 'bg-gray-900' : 'bg-gray-300'"
          />
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white shadow-sm px-8 py-8 border border-gray-100 rounded-2xl">

        <!-- Day rows -->
        <div class="mb-8 divide-y divide-gray-100">
          <div
            v-for="day in days"
            :key="day.name"
            class="flex flex-wrap items-start gap-3 py-3"
          >
            <!-- Toggle -->
            <label class="flex items-center mt-0.5 cursor-pointer shrink-0">
              <input type="checkbox" v-model="day.enabled" class="sr-only peer" />
              <div
                class="relative rounded-full w-9 h-[22px] transition-colors duration-200"
                :class="day.enabled ? 'bg-gray-900' : 'bg-gray-300'"
              >
                <div
                  class="top-[3px] absolute bg-white shadow rounded-full w-4 h-4 transition-transform duration-200"
                  :class="day.enabled ? 'translate-x-[19px]' : 'translate-x-[3px]'"
                />
              </div>
            </label>

            <!-- Day name -->
            <span class="pt-1 w-[90px] font-medium text-gray-900 text-sm shrink-0">{{ day.name }}</span>

            <!-- Slots -->
            <template v-if="day.enabled">
              <div class="flex flex-col flex-1 gap-1.5">
                <div v-for="(slot, idx) in day.slots" :key="idx" class="flex items-center gap-2">
                  <select
                    v-model="slot.start"
                    class="bg-white px-2.5 border border-gray-200 focus:border-gray-900 rounded-lg outline-none w-[100px] h-[34px] text-[13px] text-gray-900 transition-colors appearance-none cursor-pointer"
                  >
                    <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                  </select>
                  <span class="text-gray-400 text-sm">–</span>
                  <select
                    v-model="slot.end"
                    class="bg-white px-2.5 border border-gray-200 focus:border-gray-900 rounded-lg outline-none w-[100px] h-[34px] text-[13px] text-gray-900 transition-colors appearance-none cursor-pointer"
                  >
                    <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1 pt-1 shrink-0">
                <button
                  @click="addSlot(day)"
                  title="Add time slot"
                  class="flex justify-center items-center hover:bg-gray-100 rounded-md w-[30px] h-[30px] text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
                <button
                  @click="copySlots(day)"
                  title="Copy to all days"
                  class="flex justify-center items-center hover:bg-gray-100 rounded-md w-[30px] h-[30px] text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="4.5" y="1" width="9" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                    <path d="M2 4.5v7A1.5 1.5 0 003.5 13H11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- Next Step button -->
        <button
          @click="$emit('next')"
          class="flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 rounded-xl w-full h-[50px] font-semibold text-[15px] text-white tracking-tight transition-colors"
        >
          Next Step
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['next'])

const timeOptions = (() => {
  const times = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h < 12 ? 'am' : 'pm'
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
      const min = m === 0 ? '00' : '30'
      times.push(`${hour}:${min}${period}`)
    }
  }
  return times
})()

const days = ref([
  { name: 'Monday',    enabled: true,  slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Tuesday',   enabled: true,  slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Wednesday', enabled: true,  slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Thursday',  enabled: true,  slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Friday',    enabled: true,  slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Saturday',  enabled: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
  { name: 'Sunday',    enabled: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
])

function addSlot(day) {
  day.slots.push({ start: '9:00am', end: '5:00pm' })
}

function copySlots(sourceDay) {
  days.value.forEach(day => {
    if (day.name !== sourceDay.name && day.enabled) {
      day.slots = sourceDay.slots.map(s => ({ ...s }))
    }
  })
}
</script>