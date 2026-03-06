<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { CalendarDate, type DateValue as InternationalizedDateValue } from '@internationalized/date'

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{
  isScrolled?: boolean
  searchExpanded?: boolean
}>()

// ─── Element refs ─────────────────────────────────────────────────────────────
const searchBarContainer = ref<HTMLElement | null>(null)
const checkInBtn         = ref<HTMLElement | null>(null)
const checkOutBtn        = ref<HTMLElement | null>(null)

// ─── Popover state ────────────────────────────────────────────────────────────
const isOpen          = ref(false)
const activeSection   = ref<string | null>(null)
const previousSection = ref<string | null>(null)

// ─── Selected values ──────────────────────────────────────────────────────────
const selectedWhere    = ref<string | null>(null)
const selectedCheckIn  = ref<string | null>(null)
const selectedCheckOut = ref<string | null>(null)
const selectedGuests   = ref<string | null>(null)

// ─── Guest counts ─────────────────────────────────────────────────────────────
const guestCounts = ref({ adults: 0, children: 0, infants: 0, pets: 0 })

// ─── Date picker ──────────────────────────────────────────────────────────────
const selectedCheckInDate = ref<InternationalizedDateValue | null>(null)
const selectedCheckOutDate = ref<InternationalizedDateValue | null>(null)
const currentMonth = ref(new Date())
const calendarMode = ref('dates')
const selectedMonthCount = ref(3)

const nextMonthDate = computed(() => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  return d
})

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

const goToPreviousMonth = () => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}

const goToNextMonth = () => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

// Format date for display
const formatDate = (date: InternationalizedDateValue | null) => {
  if (!date) return null
  const jsDate = new Date(date.year, date.month - 1, date.day)
  return jsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Convert Date to CalendarDate
const toCalendarDate = (date: Date): InternationalizedDateValue => {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

// Handle date selections
const handleCheckInSelect = (date: any) => {
  if (!date) return
  selectedCheckInDate.value = date
  selectedCheckIn.value = formatDate(date)
  
  // If check-out is before check-in, clear it
  if (selectedCheckOutDate.value) {
    const checkInJs = new Date(date.year, date.month - 1, date.day)
    const checkOutJs = new Date(selectedCheckOutDate.value.year, selectedCheckOutDate.value.month - 1, selectedCheckOutDate.value.day)
    if (checkOutJs <= checkInJs) {
      selectedCheckOutDate.value = null
      selectedCheckOut.value = null
    }
  }
  
  // Auto-advance to check-out
  setTimeout(() => openSection('check-out'), 300)
}

const handleCheckOutSelect = (date: any) => {
  if (!date) return
  selectedCheckOutDate.value = date
  selectedCheckOut.value = formatDate(date)
  
  // Auto-advance to guests
  setTimeout(() => openSection('guests'), 300)
}

// Format month range based on selected month count
const formatMonthRange = () => {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + selectedMonthCount.value)
  
  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`
}

// Clear dates function
const clearDates = () => {
  selectedCheckInDate.value = null
  selectedCheckOutDate.value = null
  selectedCheckIn.value = null
  selectedCheckOut.value = null
  selectedMonthCount.value = 3
}

// Watch for month count changes and update dates
watch(selectedMonthCount, (newCount) => {
  if (calendarMode.value === 'months') {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + newCount)
    
    selectedCheckInDate.value = toCalendarDate(startDate)
    selectedCheckOutDate.value = toCalendarDate(endDate)
    selectedCheckIn.value = formatDate(selectedCheckInDate.value)
    selectedCheckOut.value = formatDate(selectedCheckOutDate.value)
  }
})

// ─── Locations ────────────────────────────────────────────────────────────────
const locations = [
  { name: 'Maitama, Abuja', icon: 'i-hugeicons-building-03' },
  { name: 'Asokoro, Abuja', icon: 'i-hugeicons-building-03' },
  { name: 'Lekki, Lagos', icon: 'i-hugeicons-building-03' },
  { name: 'Victoria Island, Lagos', icon: 'i-hugeicons-building-03' },
]

const searchQuery = ref('')

// ─── Popover sizing ───────────────────────────────────────────────────────────
const popoverWidth = computed(() => {
  switch (activeSection.value) {
    case 'where':    return 320
    case 'check-in': return 800
    case 'check-out':return 800
    case 'guests':   return 380
    default:         return 320
  }
})

// Calculate slide direction for animations
const slideDirection = computed(() => {
  const order = ['where', 'check-in', 'check-out', 'guests']
  const prevIndex = order.indexOf(previousSection.value || '')
  const currIndex = order.indexOf(activeSection.value || '')
  return currIndex > prevIndex ? 'right' : 'left'
})

// ─── Popover position ─────────────────────────────────────────────────────────
const popoverPosition = ref({ x: 0, y: 0 })

const updatePopoverPosition = () => {
  const container = searchBarContainer.value
  if (!container) return

  const barElement = container.querySelector('form') as HTMLElement | null
  if (!barElement) return

  const containerRect = container.getBoundingClientRect()
  const barRect       = barElement.getBoundingClientRect()
  const sideOffset    = 8

  // For check-in and check-out, center the popover if it's wider than the bar
  if (activeSection.value === 'check-in' || activeSection.value === 'check-out') {
    const barWidth = barRect.width
    const popoverW = popoverWidth.value
    
    // If popover is wider than bar, center it
    if (popoverW > barWidth) {
      const centerOffset = (popoverW - barWidth) / 2
      popoverPosition.value = {
        x: barRect.left - containerRect.left - centerOffset,
        y: barRect.bottom - containerRect.top + sideOffset
      }
    } else {
      // Otherwise align to start of bar
      popoverPosition.value = {
        x: barRect.left - containerRect.left,
        y: barRect.bottom - containerRect.top + sideOffset
      }
    }
    return
  }

  // For guests, align to the right edge
  if (activeSection.value === 'guests') {
    popoverPosition.value = {
      x: barRect.right - containerRect.left - popoverWidth.value,
      y: barRect.bottom - containerRect.top + sideOffset
    }
    return
  }

  // For where, align to the left edge
  if (activeSection.value === 'where') {
    popoverPosition.value = {
      x: barRect.left - containerRect.left,
      y: barRect.bottom - containerRect.top + sideOffset
    }
    return
  }
}

const combinedCardStyle = ref({ left: '0px', width: '0px', height: '0px', top: '0px' })

const updateCombinedCardStyle = () => {
  const ci = checkInBtn.value
  const co = checkOutBtn.value
  if (!ci || !co) return
  combinedCardStyle.value = {
    left:   `${ci.offsetLeft}px`,
    width:  `${ci.offsetWidth + co.offsetWidth + 8}px`,
    height: `${ci.offsetHeight}px`,
    top:    `${ci.offsetTop}px`,
  }
}

watch(activeSection, (newSection) => {
  if (newSection) {
    nextTick(() => {
      updatePopoverPosition()
      if (newSection === 'check-out') updateCombinedCardStyle()
    })
  }
}, { flush: 'post' })

// Watch for scroll state changes - close popover when scroll state changes
watch(() => props.isScrolled, (newValue, oldValue) => {
  // Close popover whenever scroll state changes (scrolling up OR down)
  if (newValue !== oldValue && isOpen.value) {
    isOpen.value = false
    activeSection.value = null
  }
})

const handleClickOutside = (e: MouseEvent) => {
  const target    = e.target as HTMLElement
  const container = searchBarContainer.value
  if (isOpen.value && container && !container.contains(target)) {
    isOpen.value        = false
    activeSection.value = null
  }
}

let resizeTimeout: ReturnType<typeof setTimeout> | null = null
const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(updatePopoverPosition, 150)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})

const openSection = (section: string) => {
  previousSection.value = activeSection.value
  activeSection.value   = section
  isOpen.value          = true
}

const selectWhere = (location: string) => {
  selectedWhere.value = location
  setTimeout(() => openSection('check-in'), 200)
}

const incrementGuests = (type: keyof typeof guestCounts.value) => {
  guestCounts.value[type]++
  updateGuestsDisplay()
}

const decrementGuests = (type: keyof typeof guestCounts.value) => {
  if (guestCounts.value[type] > 0) {
    guestCounts.value[type]--
    updateGuestsDisplay()
  }
}

const updateGuestsDisplay = () => {
  const { adults, children, infants, pets } = guestCounts.value
  const totalGuests = adults + children + infants

  if (totalGuests === 0 && pets === 0) { selectedGuests.value = null; return }

  const parts: string[] = []
  if (totalGuests === 1)     parts.push('1 guest')
  else if (totalGuests > 1)  parts.push(`${totalGuests} guests`)
  if (pets === 1)            parts.push('1 pet')
  else if (pets > 1)         parts.push(`${pets} pets`)
  selectedGuests.value = parts.join(', ')
}

const emit = defineEmits<{
  search: [data: {
    where: string | null
    checkIn: string | null
    checkOut: string | null
    guests: string | null
  }]
  toggleExpanded: []
}>()

const performSearch = () => {
  emit('search', {
    where: selectedWhere.value,
    checkIn: selectedCheckIn.value,
    checkOut: selectedCheckOut.value,
    guests: selectedGuests.value
  })
  isOpen.value = false
  activeSection.value = null
}

// Determine if we should show the full search form
const showFullSearch = computed(() => {
  return !props.isScrolled || props.searchExpanded
})
</script>

<template>
  <div class="flex justify-center items-center">
    <div ref="searchBarContainer" class="relative">
      <motion.div
        :initial="false"
        :animate="{
          scale: (props.isScrolled && !props.searchExpanded) ? 0.88 : 1,
          y: (props.isScrolled && !props.searchExpanded) ? -2 : 0,
        }"
        :transition="{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }"
        style="transform-origin: center center;"
      >
        <!-- Compact Search Pill (when scrolled and NOT expanded) -->
        <button
          v-if="props.isScrolled && !props.searchExpanded"
          type="button"
          @click="emit('toggleExpanded')"
          class="group z-50 relative flex items-center gap-5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] px-7 py-3.5 rounded-full ring-1 ring-gray-300 transition-all duration-300"
        >
          <div class="flex items-center gap-4 text-[15px]">
            <span class="font-medium text-gray-900">{{ selectedWhere || 'Anywhere' }}</span>
            <span class="text-gray-300">|</span>
            <span class="font-medium text-gray-900">{{ selectedCheckIn || 'Anytime' }}</span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-500">{{ selectedGuests || 'Add guests' }}</span>
          </div>
          <UIcon name="i-hugeicons-search-02" class="w-7 h-7 text-gray-700" />
        </button>

        <!-- Full Search Bar (when not scrolled OR when expanded) -->
        <form
          v-else
          class="group relative flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] rounded-full ring-1 ring-gray-200 transition-colors duration-300"
          :class="[
            activeSection ? 'bg-[#F1F3F5]' : 'bg-white',
            props.searchExpanded ? 'z-50' : ''
          ]"
          @submit.prevent
        >
        <motion.div
          v-if="activeSection === 'check-out'"
          class="z-0 absolute bg-white shadow-[3px_0px_8px_2px_rgba(24,24,27,0.10)] rounded-full pointer-events-none"
          :style="combinedCardStyle"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }"
        />

        <!-- WHERE -->
        <button
          type="button"
          @click="openSection('where')"
          class="relative flex flex-col items-start gap-0 px-8 py-3.5 rounded-full transition-colors"
          :class="activeSection && activeSection !== 'where' ? 'hover:bg-white/50' : (activeSection ? '' : 'hover:bg-[#F1F3F5]')"
        >
          <motion.div
            v-if="activeSection === 'where'"
            layoutId="activeIndicator"
            class="absolute inset-0 bg-white shadow-[3px_0px_8px_2px_rgba(24,24,27,0.10)] rounded-full"
            :transition="{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }"
          />
          <span class="z-10 relative font-semibold text-[12px] text-gray-900">Where</span>
          <span class="z-10 relative text-[14px] text-gray-500 whitespace-nowrap">
            {{ selectedWhere || 'Search destinations' }}
          </span>
        </button>

        <div
          class="bg-gray-300 w-px h-8 transition-opacity duration-300 shrink-0"
          :class="activeSection ? 'opacity-0' : 'opacity-100'"
        />

        <!-- CHECK IN -->
        <button
          ref="checkInBtn"
          type="button"
          @click="openSection('check-in')"
          class="relative flex flex-col items-start gap-0 px-8 py-3.5 rounded-full transition-colors"
          :class="activeSection && activeSection !== 'check-in' && activeSection !== 'check-out' ? 'hover:bg-white/50' : (activeSection ? '' : 'hover:bg-[#F1F3F5]')"
        >
          <motion.div
            v-if="activeSection === 'check-in'"
            layoutId="activeIndicator"
            class="absolute inset-0 bg-white shadow-[3px_0px_8px_2px_rgba(24,24,27,0.10)] rounded-full"
            :transition="{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }"
          />
          <span class="z-10 relative font-semibold text-[12px] text-gray-900">Check in</span>
          <span class="z-10 relative text-[14px] text-gray-500 whitespace-nowrap">
            {{ selectedCheckIn || 'Add dates' }}
          </span>
        </button>

        <div
          class="bg-gray-300 w-px h-8 transition-opacity duration-300 shrink-0"
          :class="(activeSection === 'check-out' || activeSection === 'check-in') ? 'opacity-0' : 'opacity-100'"
        />

        <!-- CHECK OUT -->
        <button
          ref="checkOutBtn"
          type="button"
          @click="openSection('check-out')"
          class="relative flex flex-col items-start gap-0 px-8 py-3.5 rounded-full transition-colors"
          :class="activeSection && activeSection !== 'check-out' && activeSection !== 'check-in' ? 'hover:bg-white/50' : (activeSection ? '' : 'hover:bg-[#F1F3F5]')"
        >
          <span class="z-10 relative font-semibold text-[12px] text-gray-900">Check out</span>
          <span class="z-10 relative text-[14px] text-gray-500 whitespace-nowrap">
            {{ selectedCheckOut || 'Add dates' }}
          </span>
        </button>

        <div
          class="bg-gray-300 w-px h-8 transition-opacity duration-300 shrink-0"
          :class="activeSection ? 'opacity-0' : 'opacity-100'"
        />

        <!-- GUESTS -->
        <button
          type="button"
          @click="openSection('guests')"
          class="relative flex items-center gap-3 py-3.5 pr-8 pl-8 rounded-full transition-colors"
          :class="activeSection && activeSection !== 'guests' ? 'hover:bg-white/50' : (activeSection ? '' : 'hover:bg-[#F1F3F5]')"
        >
          <motion.div
            v-if="activeSection === 'guests'"
            layoutId="activeIndicator"
            class="absolute inset-0 bg-white shadow-[3px_0px_8px_2px_rgba(24,24,27,0.10)] rounded-full"
            :transition="{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }"
          />
          <div class="z-10 relative flex flex-col items-start gap-0">
            <span class="font-semibold text-[12px] text-gray-900">Who</span>
            <span class="text-[14px] text-gray-500 whitespace-nowrap">
              {{ selectedGuests || 'Add guests' }}
            </span>
          </div>
        </button>
      </form>
      </motion.div>

      <!-- ─── Animated Popover ──────────────────────────────────────── -->
      <motion.div
        v-if="isOpen"
        class="z-50 absolute bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden"
        :animate="{
          x:       popoverPosition.x,
          y:       popoverPosition.y,
          width:   popoverWidth,
          opacity: 1,
        }"
        :initial="{
          x:       popoverPosition.x,
          y:       popoverPosition.y,
          width:   popoverWidth,
          opacity: 0,
        }"
        :transition="{
          x:       { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
          y:       { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
          width:   { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
          opacity: { duration: 0.15 },
        }"
        style="top: 0; left: 0; will-change: transform, width, opacity;"
      >
        <div class="p-4">
          <!-- Shared tab switcher for check-in/check-out -->
          <div
            v-if="activeSection === 'check-in' || activeSection === 'check-out'"
            class="flex justify-center mb-4"
          >
            <UTabs
              v-model="calendarMode"
              default-value="dates"
              :content="false"
              :items="[
                { value: 'dates', label: 'Dates' },
                { value: 'months', label: 'Months' }
              ]"
              color="neutral"
              size="sm"
              :ui="{
                list: 'bg-[#F1F3F5] rounded-full p-1',
                trigger: 'px-6 py-2 rounded-full font-medium text-sm data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600',
                indicator: 'bg-white rounded-full shadow-sm'
              }"
            />
          </div>

          <!-- Content with directional slide animation -->
          <AnimatePresence mode="wait">
            <motion.div
              :key="activeSection || 'none'"
              :initial="{ opacity: 0, x: slideDirection === 'right' ? 20 : -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: slideDirection === 'right' ? -20 : 20 }"
              :transition="{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }"
            >
              <!-- WHERE content -->
              <div v-if="activeSection === 'where'" class="space-y-3">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search destinations"
                  class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                />
                
                <!-- Nearby Option -->
                <motion.button
                  @click="selectWhere('Nearby')"
                  class="flex items-center gap-3 hover:bg-gray-50 px-3 py-3 rounded-lg w-full text-left transition-colors"
                  :initial="{ opacity: 0, x: -10 }"
                  :animate="{ opacity: 1, x: 0 }"
                  :transition="{ duration: 0.2 }"
                  :whileHover="{ scale: 1.01, x: 2 }"
                  :whileTap="{ scale: 0.99 }"
                >
                  <div class="flex justify-center items-center bg-blue-50 rounded-lg w-10 h-10">
                    <UIcon name="i-hugeicons-location-05" class="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div class="font-medium text-sm">Nearby</div>
                    <div class="text-gray-500 text-xs">Find what's around you</div>
                  </div>
                </motion.button>

                <!-- Location Options -->
                <motion.button
                  v-for="(location, index) in locations" 
                  :key="location.name"
                  @click="selectWhere(location.name)"
                  class="flex items-center gap-3 hover:bg-gray-50 px-3 py-3 rounded-lg w-full text-left transition-colors"
                  :class="{ 'bg-gray-50 font-medium': selectedWhere === location.name }"
                  :initial="{ opacity: 0, x: -10 }"
                  :animate="{ opacity: 1, x: 0 }"
                  :transition="{ delay: (index + 1) * 0.05, duration: 0.2 }"
                  :whileHover="{ scale: 1.01, x: 2 }"
                  :whileTap="{ scale: 0.99 }"
                >
                  <div class="flex justify-center items-center bg-gray-100 rounded-lg w-10 h-10">
                    <UIcon :name="location.icon" class="w-5 h-5 text-gray-600" />
                  </div>
                  <div class="font-medium text-sm">{{ location.name }}</div>
                </motion.button>
              </div>

              <!-- Check In Content -->
              <div v-else-if="activeSection === 'check-in'">
                <!-- Dates View: Dual Calendar -->
                <div v-if="calendarMode === 'dates'" class="flex gap-8">
                  <!-- First Calendar -->
                  <div class="flex-1">
                    <div class="flex justify-between items-center mb-4">
                      <button @click="goToPreviousMonth" class="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                        <UIcon name="i-hugeicons-arrow-left-01" class="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 class="font-semibold text-gray-900">{{ formatMonthYear(currentMonth) }}</h3>
                      <div class="w-7"></div>
                    </div>
                    <UCalendar
                      v-model="selectedCheckInDate as any"
                      :min-value="toCalendarDate(new Date()) as any"
                      @update:model-value="handleCheckInSelect"
                    />
                  </div>

                  <!-- Second Calendar -->
                  <div class="flex-1">
                    <div class="flex justify-between items-center mb-4">
                      <div class="w-7"></div>
                      <h3 class="font-semibold text-gray-900">{{ formatMonthYear(nextMonthDate) }}</h3>
                      <button @click="goToNextMonth" class="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                        <UIcon name="i-hugeicons-arrow-right-01" class="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <UCalendar
                      v-model="selectedCheckInDate as any"
                      :min-value="toCalendarDate(new Date()) as any"
                      :default-value="toCalendarDate(nextMonthDate) as any"
                      @update:model-value="handleCheckInSelect"
                    />
                  </div>
                </div>

                <!-- Months View: Slider -->
                <div v-else class="px-4 py-8">
                  <div class="flex flex-col items-center gap-6">
                    <div class="text-center">
                      <div class="font-bold text-gray-900 text-8xl">{{ selectedMonthCount }}</div>
                      <div class="mt-2 font-medium text-gray-500 text-sm uppercase tracking-wide">MONTHS</div>
                    </div>
                    <div class="w-full max-w-md">
                      <USlider
                        v-model="selectedMonthCount"
                        :min="1"
                        :max="12"
                        :step="1"
                        color="primary"
                        size="md"
                      />
                    </div>
                    <div class="font-medium text-gray-700 text-center">
                      Range: {{ formatMonthRange() }}
                    </div>
                    <UButton
                      label="Clear dates"
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      @click="clearDates"
                    />
                  </div>
                </div>
              </div>

              <!-- Check Out Content -->
              <div v-else-if="activeSection === 'check-out'">
                <div v-if="calendarMode === 'dates'" class="flex gap-8">
                  <div class="flex-1">
                    <div class="flex justify-between items-center mb-4">
                      <button @click="goToPreviousMonth" class="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                        <UIcon name="i-hugeicons-arrow-left-01" class="w-5 h-5 text-gray-600" />
                      </button>
                      <h3 class="font-semibold text-gray-900">{{ formatMonthYear(currentMonth) }}</h3>
                      <div class="w-7"></div>
                    </div>
                    <UCalendar
                      v-model="selectedCheckOutDate as any"
                      :min-value="(selectedCheckInDate as any) || toCalendarDate(new Date()) as any"
                      @update:model-value="handleCheckOutSelect"
                    />
                  </div>

                  <div class="flex-1">
                    <div class="flex justify-between items-center mb-4">
                      <div class="w-7"></div>
                      <h3 class="font-semibold text-gray-900">{{ formatMonthYear(nextMonthDate) }}</h3>
                      <button @click="goToNextMonth" class="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                        <UIcon name="i-hugeicons-arrow-right-01" class="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <UCalendar
                      v-model="selectedCheckOutDate as any"
                      :min-value="(selectedCheckInDate as any) || toCalendarDate(new Date()) as any"
                      :default-value="toCalendarDate(nextMonthDate) as any"
                      @update:model-value="handleCheckOutSelect"
                    />
                  </div>
                </div>

                <div v-else class="px-4 py-8">
                  <div class="flex flex-col items-center gap-6">
                    <div class="py-6 text-center">
                      <div class="font-medium text-[#1C1C1E] text-8xl leading-none">{{ selectedMonthCount }}</div>
                      <div class="mt-1 font-medium text-[#868C98] text-sm uppercase tracking-wide">MONTHS</div>
                    </div>
                    <div class="w-full max-w-md">
                      <USlider
                        v-model="selectedMonthCount"
                        :min="1"
                        :max="12"
                        :step="1"
                        color="primary"
                        size="md"
                      />
                    </div>
                    <USeparator/>
                    <div class="font-medium text-[#1C1C1E] text-sm text-center">
                      Range: {{ formatMonthRange() }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Guests Content -->
              <div v-else-if="activeSection === 'guests'" class="space-y-0">
                <div class="flex justify-between items-center py-4 border-gray-200 border-b">
                  <div>
                    <div class="font-medium text-[#1C1C1E] text-sm leading-5 tracking-[-0.006em]">Adults</div>
                    <div class="font-normal text-[#3A3A3C] text-xs leading-4 tracking-normal">Ages 13 or above</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="decrementGuests('adults')"
                      :disabled="guestCounts.adults === 0"
                      class="flex justify-center items-center border border-gray-300 rounded-full size-8 transition-colors"
                      :class="guestCounts.adults === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'"
                    >
                      <UIcon name="i-hugeicons-minus-sign" class="w-4 h-4 text-gray-600" />
                    </button>
                    <span class="w-6 font-medium text-gray-900 text-sm text-center">{{ guestCounts.adults }}</span>
                    <button
                      @click="incrementGuests('adults')"
                      class="flex justify-center items-center border border-gray-300 hover:border-gray-400 rounded-full size-8 transition-colors"
                    >
                      <UIcon name="i-hugeicons-add-01" class="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div class="flex justify-between items-center py-4 border-gray-200 border-b">
                  <div>
                    <div class="font-medium text-[#1C1C1E] text-sm leading-5 tracking-[-0.006em]">Children</div>
                    <div class="font-normal text-[#3A3A3C] text-xs leading-4 tracking-normal">Ages 2-12</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="decrementGuests('children')"
                      :disabled="guestCounts.children === 0"
                      class="flex justify-center items-center border border-gray-300 rounded-full size-8 transition-colors"
                      :class="guestCounts.children === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'"
                    >
                      <UIcon name="i-hugeicons-minus-sign" class="w-4 h-4 text-gray-600" />
                    </button>
                    <span class="w-6 font-medium text-gray-900 text-sm text-center">{{ guestCounts.children }}</span>
                    <button
                      @click="incrementGuests('children')"
                      class="flex justify-center items-center border border-gray-300 hover:border-gray-400 rounded-full size-8 transition-colors"
                    >
                      <UIcon name="i-hugeicons-add-01" class="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div class="flex justify-between items-center py-4 border-gray-200 border-b">
                  <div>
                    <div class="font-medium text-[#1C1C1E] text-sm leading-5 tracking-[-0.006em]">Infants</div>
                    <div class="font-normal text-[#3A3A3C] text-xs leading-4 tracking-normal">Under 2</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="decrementGuests('infants')"
                      :disabled="guestCounts.infants === 0"
                      class="flex justify-center items-center border border-gray-300 rounded-full size-8 transition-colors"
                      :class="guestCounts.infants === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'"
                    >
                      <UIcon name="i-hugeicons-minus-sign" class="w-4 h-4 text-gray-600" />
                    </button>
                    <span class="w-6 font-medium text-gray-900 text-sm text-center">{{ guestCounts.infants }}</span>
                    <button
                      @click="incrementGuests('infants')"
                      class="flex justify-center items-center border border-gray-300 hover:border-gray-400 rounded-full size-8 transition-colors"
                    >
                      <UIcon name="i-hugeicons-add-01" class="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div class="flex justify-between items-center py-4">
                  <div>
                    <div class="font-medium text-[#1C1C1E] text-sm leading-5 tracking-[-0.006em]">Pets</div>
                    <div class="font-normal text-[#3A3A3C] text-xs leading-4 tracking-normal">Bringing an animal?</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="decrementGuests('pets')"
                      :disabled="guestCounts.pets === 0"
                      class="flex justify-center items-center border border-gray-300 rounded-full size-8 transition-colors"
                      :class="guestCounts.pets === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'"
                    >
                      <UIcon name="i-hugeicons-minus-sign" class="w-4 h-4 text-gray-600" />
                    </button>
                    <span class="w-6 font-medium text-gray-900 text-sm text-center">{{ guestCounts.pets }}</span>
                    <button
                      @click="incrementGuests('pets')"
                      class="flex justify-center items-center border border-gray-300 hover:border-gray-400 rounded-full size-8 transition-colors"
                    >
                      <UIcon name="i-hugeicons-add-01" class="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  </div>
</template>
