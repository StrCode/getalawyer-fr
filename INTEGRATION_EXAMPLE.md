# Integration Example: Updating Registration Pages

## Before (Current Implementation)

```vue
<script setup lang="ts">
import { z } from 'zod'

const config = useRuntimeConfig()
const formData = ref({ firstName: '', lastName: '', ... })
const isSubmitting = ref(false)

// Manual fetch with useFetch
const { data: existingData } = await useFetch<any>(
  `${config.public.apiUrl}/api/register/step2`,
  { credentials: 'include' }
)

if (existingData.value) {
  formData.value = { ...formData.value, ...existingData.value }
}

// Manual submit
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await $fetch(`${config.public.apiUrl}/api/register/step2`, {
      method: 'POST',
      credentials: 'include',
      body: formData.value,
    })
    await navigateTo('/register/step3')
  } catch (err) {
    // Error handling
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## After (With TanStack Query)

```vue
<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'

const { usePersonalInfo, useSavePersonalInfo } = useRegistration()

// Query - automatically fetches and caches
const { data: existingData, isPending: isLoading } = usePersonalInfo()

// Mutation - handles loading state and errors
const savePersonalInfo = useSavePersonalInfo()

const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: '',
  state: '',
  lga: '',
})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { ...formData.value, ...data }
  }
}, { immediate: true })

// Submit with mutation
const handleSubmit = async () => {
  try {
    schema.parse(formData.value)
    errors.value = {}
    
    await savePersonalInfo.mutateAsync(formData.value)
    await navigateTo('/register/step3')
  } catch (err) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    }
  }
}
</script>

<template>
  <div>
    <!-- Loading state from query -->
    <div v-if="isLoading">Loading your information...</div>
    
    <form v-else @submit.prevent="handleSubmit">
      <!-- Form fields -->
      
      <button 
        type="submit" 
        :disabled="savePersonalInfo.isPending.value"
      >
        {{ savePersonalInfo.isPending.value ? 'Saving...' : 'Continue' }}
      </button>
      
      <!-- Error from mutation -->
      <div v-if="savePersonalInfo.error.value">
        {{ savePersonalInfo.error.value.message }}
      </div>
    </form>
  </div>
</template>
```

## Benefits of TanStack Query Approach

### 1. Automatic Loading States
```typescript
// Before
const isSubmitting = ref(false)
isSubmitting.value = true
// ... do work
isSubmitting.value = false

// After
const mutation = useSavePersonalInfo()
mutation.isPending.value // Automatically managed
```

### 2. Automatic Error Handling
```typescript
// Before
try {
  await $fetch(...)
} catch (error) {
  // Manual error handling
}

// After
const mutation = useSavePersonalInfo()
mutation.error.value // Automatically captured
```

### 3. Automatic Cache Management
```typescript
// Before
// Need to manually refetch or update state

// After
// Automatically invalidates related queries
// Other components using the same data get updated
```

### 4. Optimistic Updates (for bookings)
```typescript
const { useUpdateLawyerBooking } = useBookings()
const updateBooking = useUpdateLawyerBooking()

// UI updates immediately, rolls back on error
await updateBooking.mutateAsync({ id, data: { status: 'confirmed' } })
```

## Complete Step 2 Example

```vue
<script setup lang="ts">
import { z } from 'zod'
import { useRegistration } from '~/composables/useRegistration'
import { NIGERIA_STATES, getLGAsForState } from '~/constants/nigeria-states-lgas'
import { GENDER_OPTIONS } from '~/constants/registration'

definePageMeta({
  middleware: ['auth', 'registration-guard'],
  layout: 'registration',
})

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().refine(
    (date) => {
      const birthDate = new Date(date)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      return age >= 18
    },
    { message: 'You must be at least 18 years old' }
  ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  state: z.string().min(1, 'Please select a state'),
  lga: z.string().min(1, 'Please select an LGA'),
})

// Use registration composable
const { usePersonalInfo, useSavePersonalInfo } = useRegistration()

// Query
const { data: existingData, isPending: isLoadingData } = usePersonalInfo()

// Mutation
const savePersonalInfo = useSavePersonalInfo()

// Form state
const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: '',
  state: '',
  lga: '',
})
const errors = ref<Record<string, string[]>>({})

// Populate form when data loads
watch(existingData, (data) => {
  if (data) {
    formData.value = { ...formData.value, ...data }
  }
}, { immediate: true })

// States and LGAs from constants
const states = NIGERIA_STATES
const lgas = computed(() => {
  if (!formData.value.state) return []
  return getLGAsForState(formData.value.state)
})

// Handle state change
const handleStateChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  formData.value.state = value
  formData.value.lga = '' // Reset LGA when state changes
}

// Submit form
const handleSubmit = async () => {
  try {
    schema.parse(formData.value)
    errors.value = {}
    
    await savePersonalInfo.mutateAsync(formData.value)
    await navigateTo('/register/step3')
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      errors.value = err.flatten().fieldErrors
    } else {
      console.error('Error submitting form:', err)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-gray-600">Step 2 of 6</span>
          <span class="text-gray-500">Personal Information</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary h-2 rounded-full transition-all" style="width: 33%"></div>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Personal Information</h1>
        <p class="text-gray-600">Please provide your personal details</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingData" class="text-center py-12">
        <Icon name="lucide:loader-circle" class="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
        <p class="text-sm text-gray-600">Loading your information...</p>
      </div>
      
      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-5 bg-white rounded-xl shadow-sm p-6 border">
        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.firstName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.firstName }"
          />
          <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">
            {{ errors.firstName[0] }}
          </p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium mb-1.5 text-gray-700">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.lastName"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            :class="{ 'border-red-500': errors.lastName }"
          />
          <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">
            {{ errors.lastName[0] }}
          </p>
        </div>

        <!-- More fields... -->

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="savePersonalInfo.isPending.value"
          class="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Icon v-if="savePersonalInfo.isPending.value" name="lucide:loader-circle" class="w-4 h-4 inline animate-spin mr-2" />
          {{ savePersonalInfo.isPending.value ? 'Saving...' : 'Continue to NIN Verification' }}
        </button>

        <!-- Error Message -->
        <div v-if="savePersonalInfo.error.value" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ savePersonalInfo.error.value.message }}</p>
        </div>
      </form>
    </div>
  </div>
</template>
```

## Migration Checklist for Each Page

### Step 2: Personal Information
- [x] Replace `useFetch` with `usePersonalInfo()`
- [x] Replace manual submit with `useSavePersonalInfo()`
- [x] Use constants for states/LGAs
- [x] Use mutation loading state
- [x] Use mutation error state

### Step 3: NIN Verification
- [ ] Replace manual API calls with `useVerifyNIN()` and `useConfirmNIN()`
- [ ] Use mutation loading states
- [ ] Handle verification result state

### Step 4: Professional Information
- [ ] Replace `useFetch` with `useProfessionalInfo()`
- [ ] Replace manual submit with `useSaveProfessionalInfo()`
- [ ] Use constants for law schools

### Step 5: Practice Information
- [ ] Replace `useFetch` with `usePracticeInfo()`
- [ ] Replace manual submit with `useSavePracticeInfo()`
- [ ] Use constants for practice types

### Step 7: Review & Submit
- [ ] Replace `useFetch` with `useRegistrationSummary()`
- [ ] Replace manual submit with `useSubmitApplication()`
- [ ] Handle submission success

## Key Takeaways

1. **Less Boilerplate** - No manual loading/error state management
2. **Better UX** - Automatic caching and optimistic updates
3. **Type Safety** - Full TypeScript support
4. **Consistency** - Same patterns across all pages
5. **Performance** - Automatic request deduplication and caching
6. **Developer Experience** - DevTools for debugging queries

## Next Steps

1. Update Step 2 page with new composable
2. Test the integration
3. Update remaining steps (3, 4, 5, 7)
4. Update dashboard components for bookings
5. Add DevTools for development
