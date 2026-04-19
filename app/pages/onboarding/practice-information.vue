<script setup lang="ts">
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useSpecializations } from '~/composables/useSpecializations'
import { 
  PhCircleNotch, 
  PhMagnifyingGlass, 
  PhX, 
  PhCheck,
  PhMapPin,
  PhCheckCircle,
  PhCaretDown
} from '@phosphor-icons/vue'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth']
})

const store = useLawyerOnboardingStore()
const state = store.practiceInfo

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializations = computed(() => specData.value || [])

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter((s: any) =>
    s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

const nigerianStatesOptions = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT Abuja'
]

const selectedCount = computed(() => state.practiceAreas.length)
const progressPercent = computed(() => (selectedCount.value / 5) * 100)
const isSelected = (id: string) => state.practiceAreas.includes(id)
const isDisabled = (id: string) => !isSelected(id) && selectedCount.value >= 5
const nameById = (id: string) => specializations.value.find((s: any) => s.id === id)?.name ?? id

const toggle = (id: string) => {
  const areas = state.practiceAreas
  state.practiceAreas = areas.includes(id) ? areas.filter(s => s !== id) : [...areas, id]
}

const toggleState = (s: string) => {
  if (state.statesOfPractice.includes(s)) {
    state.statesOfPractice = state.statesOfPractice.filter(item => item !== s)
  } else {
    state.statesOfPractice = [...state.statesOfPractice, s]
  }
}

// We rely on the layout's "Next" button to trigger the store's saveStep('practice-information')
</script>

<template>
  <div v-if="isLoadingSpecs" class="flex justify-center py-20">
    <PhCircleNotch class="w-12 h-12 text-primary/20 animate-spin" />
  </div>

  <div v-else class="space-y-12 pb-20">
    <!-- Header Section -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Practice Details</h1>
      <p class="text-sm text-gray-600">Tell us about your law practice, office location, and areas of legal expertise.</p>
    </div>

    <div class="space-y-12">
      <!-- Law Firm Details -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">Law Firm Name <span class="text-gray-400 font-normal">(Optional)</span></label>
        <div class="w-full max-w-md">
           <Input v-model="state.firmName" placeholder="e.g. Adeyemi & Partners" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
           <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed">Leave empty if you are a Solo Practitioner.</p>
        </div>
      </div>

      <!-- Practice Areas -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3 pt-4">
        <div>
           <label class="text-[14px] font-bold text-gray-900 block tracking-tight">Practice Areas <span class="text-primary">*</span></label>
           <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed max-w-[180px]">Select up to 5 areas that match your legal specializations.</p>
        </div>
        
        <div class="space-y-4 w-full">
          <div class="relative w-full max-w-xl">
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <PhMagnifyingGlass class="w-5 h-5" />
              </div>
              <Input v-model="query" placeholder="Search legal areas..." class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full pl-10" />
            </div>
            
            <div class="mt-4 flex justify-between items-center px-1">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected ({{ selectedCount }}/5)</span>
              <div class="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div class="bg-primary h-full transition-all duration-300" :style="{ width: `${progressPercent}%` }" />
              </div>
            </div>

            <div v-if="selectedCount > 0" class="flex flex-wrap gap-2 mt-4">
              <button v-for="id in state.practiceAreas" :key="id" type="button" class="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 py-1.5 pr-2 pl-3 border border-primary/20 rounded-full font-bold text-primary text-[11px] transition-all cursor-pointer shadow-sm active:scale-95" @click="toggle(id)">
                {{ nameById(id) }}
                <PhX class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="mt-6 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                <div v-if="filtered.length === 0" class="py-10 text-center text-gray-400 text-sm italic">
                   No legal areas match "{{ query }}"
                </div>
                <div v-else class="max-h-[300px] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    v-for="spec in filtered" 
                    :key="spec.id" 
                    type="button" 
                    class="group p-3 border rounded-lg text-left transition-all duration-150 relative" 
                    :class="isSelected(spec.id) ? 'border-primary bg-primary/5' : isDisabled(spec.id) ? 'border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'" 
                    :disabled="isDisabled(spec.id)" 
                    @click="!isDisabled(spec.id) && toggle(spec.id)"
                  >
                    <p class="font-bold text-[13px] text-gray-900 mb-0.5 tracking-tight">{{ spec.name }}</p>
                    <p class="text-[10px] text-gray-400 line-clamp-1 leading-snug font-medium">{{ spec.description }}</p>
                    <div v-if="isSelected(spec.id)" class="absolute top-2 right-2">
                       <PhCheckCircle class="w-4.5 h-4.5 text-primary" />
                    </div>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- States of Practice -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3">
        <label class="text-[14px] font-bold text-gray-900 md:w-[180px] shrink-0 pt-3 tracking-tight">States of Practice <span class="text-primary">*</span></label>
        <div class="w-full max-w-xl">
           <Popover>
             <PopoverTrigger as-child>
               <div class="w-full h-12 px-4 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors bg-white">
                 <div class="flex items-center gap-2 overflow-hidden">
                   <PhMapPin class="w-5 h-5 text-gray-400 shrink-0" />
                   <div v-if="state.statesOfPractice.length === 0" class="text-gray-400 truncate font-medium">Select states where you practice</div>
                   <div v-else class="flex gap-1.5 overflow-hidden">
                     <span v-for="s in state.statesOfPractice.slice(0, 2)" :key="s" class="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-700 shrink-0">
                       {{ s }}
                     </span>
                     <span v-if="state.statesOfPractice.length > 2" class="text-[11px] font-bold text-gray-400 pt-0.5">
                       +{{ state.statesOfPractice.length - 2 }} more
                     </span>
                   </div>
                 </div>
                 <div class="text-gray-400">
                   <PhCaretDown class="w-4 h-4" />
                 </div>
               </div>
             </PopoverTrigger>
             <PopoverContent class="w-[var(--reka-popover-trigger-width)] p-0" align="start">
               <Command>
                 <CommandInput placeholder="Filter states..." />
                 <CommandList class="max-h-[300px]">
                   <CommandEmpty>No states found.</CommandEmpty>
                   <CommandGroup>
                     <CommandItem 
                        v-for="s in nigerianStatesOptions" 
                        :key="s" 
                        :value="s"
                        @select="toggleState(s)"
                        class="flex items-center gap-2 cursor-pointer"
                     >
                       <div class="w-4 h-4 border rounded flex items-center justify-center transition-colors" :class="state.statesOfPractice.includes(s) ? 'bg-primary border-primary' : 'border-gray-300'">
                         <PhCheck v-if="state.statesOfPractice.includes(s)" class="w-3 h-3 text-white" />
                       </div>
                       {{ s }}
                     </CommandItem>
                   </CommandGroup>
                 </CommandList>
               </Command>
             </PopoverContent>
           </Popover>
            <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed">List all states where you are currently licensed or actively practicing.</p>
        </div>
      </div>

      <!-- Office Address Section -->
      <div class="flex flex-col md:flex-row md:items-start gap-3 md:gap-12 py-3 pt-4">
        <div>
          <label class="text-[14px] font-bold text-gray-900 block tracking-tight">Primary office address <span class="text-primary">*</span></label>
          <p class="mt-2 text-[12px] text-gray-400 font-medium leading-relaxed max-w-[180px]">The physical location of your principal law office.</p>
        </div>
        
        <div class="space-y-6 max-w-xl">
          <div>
            <label class="text-[11px] font-bold mb-1.5 block uppercase tracking-wider text-gray-400">Street Address</label>
            <Input v-model="state.officeAddress.street" placeholder="e.g. 123 Marina Street" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold mb-1.5 block uppercase tracking-wider text-gray-400">City</label>
              <Input v-model="state.officeAddress.city" placeholder="Lagos" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
            <div>
              <label class="text-[11px] font-bold mb-1.5 block uppercase tracking-wider text-gray-400">State</label>
              <Input v-model="state.officeAddress.state" placeholder="Lagos State" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-full" />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold mb-1.5 block uppercase tracking-wider text-gray-400">Postal Code</label>
            <Input v-model="state.officeAddress.postalCode" placeholder="100001" class="h-12 rounded-lg border-gray-200 focus-visible:ring-primary/20 w-40" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
