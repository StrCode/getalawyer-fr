# API Migration Implementation Summary

## Overview
Complete implementation of API layer with TanStack Query for GetALawyer Nuxt application.

## What Was Implemented

### 1. Dependencies
✅ **Already Installed:**
- `@tanstack/vue-query` (v5.62.7)
- Query client already configured in `app/lib/query-client.ts`
- Plugin already set up in `app/plugins/query-client.ts`

### 2. Constants Created
- ✅ **`app/constants/nigeria-states-lgas.ts`** - Nigerian states and LGAs with helper functions
- ✅ **`app/constants/registration.ts`** - Registration constants, steps, error messages, validation rules

### 3. Types Created
- ✅ **`app/types/availability.ts`** - Availability, schedules, exceptions, time slots
- ✅ **`app/types/booking.ts`** - Bookings, consultation types, booking statuses
- ✅ **`app/types/registration.ts`** - Registration forms, responses, NIN verification
- ✅ **Updated `app/types/index.ts`** - Export all new types

### 4. Composables Created (with TanStack Query)

#### ✅ useAvailability
**File:** `app/composables/useAvailability.ts`

**Queries:**
- `useAvailabilitySchedule()` - Get lawyer's weekly schedule
- `useAvailabilityExceptions()` - Get availability exceptions
- `useAvailableSlots(lawyerId, consultationTypeId, startDate, endDate)` - Get available time slots

**Mutations:**
- `useUpdateAvailabilitySchedule()` - Update weekly schedule
- `useCreateAvailabilityException()` - Create exception with optimistic updates
- `useDeleteAvailabilityException()` - Delete exception with optimistic updates

**Features:**
- Automatic cache invalidation
- Optimistic updates for exceptions
- Dependent queries for available slots

#### ✅ useBookings
**File:** `app/composables/useBookings.ts`

**Client Queries:**
- `useClientBookings()` - Get all client bookings
- `useClientBooking(id)` - Get single client booking

**Client Mutations:**
- `useCreateBooking()` - Create new booking
- `useUpdateClientBooking()` - Update client booking

**Lawyer Queries:**
- `useLawyerBookings()` - Get all lawyer bookings
- `useLawyerBooking(id)` - Get single lawyer booking

**Lawyer Mutations:**
- `useUpdateLawyerBooking()` - Update lawyer booking with optimistic updates

**Features:**
- Separate client and lawyer endpoints
- Optimistic updates for lawyer bookings
- Automatic cache invalidation

#### ✅ useRegistration
**File:** `app/composables/useRegistration.ts`

**Queries:**
- `useRegistrationStatus()` - Get current registration status
- `usePersonalInfo()` - Get Step 2 data
- `useProfessionalInfo()` - Get Step 4 data
- `usePracticeInfo()` - Get Step 5 data
- `useRegistrationSummary()` - Get Step 7 summary

**Mutations:**
- `useSavePersonalInfo()` - Save Step 2
- `useVerifyNIN()` - Verify NIN (Step 3)
- `useConfirmNIN()` - Confirm NIN (Step 3)
- `useSaveProfessionalInfo()` - Save Step 4
- `useSavePracticeInfo()` - Save Step 5
- `useSubmitApplication()` - Submit application (Step 7)

**Features:**
- Complete 6-step registration flow
- Status tracking
- Automatic cache invalidation after each step
- NIN verification workflow

### 5. Existing Infrastructure

**Already Available:**
- ✅ HTTP Client (`app/lib/api/client.ts`) with retry logic and error handling
- ✅ Query Client (`app/lib/query-client.ts`) with default configuration
- ✅ Query Keys Factory in query client
- ✅ Plugin setup (`app/plugins/query-client.ts`)
- ✅ ApiError class and ApiResponse type

## Usage Examples

### Availability Management

```vue
<script setup lang="ts">
import { useAvailability } from '~/composables/useAvailability'

const { useAvailabilitySchedule, useUpdateAvailabilitySchedule } = useAvailability()

// Query
const { data: schedule, isPending, error } = useAvailabilitySchedule()

// Mutation
const updateSchedule = useUpdateAvailabilitySchedule()

const handleUpdate = async (newSchedule: WeeklySchedule) => {
  try {
    await updateSchedule.mutateAsync(newSchedule)
    // Success
  } catch (error) {
    // Error handling
  }
}
</script>

<template>
  <div>
    <div v-if="isPending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <pre>{{ schedule }}</pre>
      <button 
        @click="handleUpdate(newSchedule)"
        :disabled="updateSchedule.isPending.value"
      >
        Update
      </button>
    </div>
  </div>
</template>
```

### Booking Management

```vue
<script setup lang="ts">
import { useBookings } from '~/composables/useBookings'

const { useLawyerBookings, useUpdateLawyerBooking } = useBookings()

const { data: bookings, isPending } = useLawyerBookings()
const updateBooking = useUpdateLawyerBooking()

const handleConfirm = async (bookingId: string) => {
  await updateBooking.mutateAsync({
    id: bookingId,
    data: { status: 'confirmed' },
  })
}
</script>
```

### Registration Flow

```vue
<script setup lang="ts">
import { useRegistration } from '~/composables/useRegistration'

const { usePersonalInfo, useSavePersonalInfo } = useRegistration()

const { data: personalInfo } = usePersonalInfo()
const savePersonalInfo = useSavePersonalInfo()

const formData = ref({
  firstName: '',
  lastName: '',
  // ... other fields
})

const handleSubmit = async () => {
  try {
    await savePersonalInfo.mutateAsync(formData.value)
    await navigateTo('/register/step3')
  } catch (error) {
    // Error handling
  }
}
</script>
```

## Key Features

### TanStack Query Benefits
1. **Automatic Caching** - Smart background refetching
2. **Optimistic Updates** - Instant UI feedback with rollback
3. **Request Deduplication** - Prevents duplicate API calls
4. **Query Invalidation** - Automatic cache updates
5. **Loading States** - Built-in pending/error states
6. **Type Safety** - Full TypeScript support

### Query Key Pattern
All query keys are centralized in `app/lib/query-client.ts`:

```typescript
export const queryKeys = {
  availability: {
    schedule: ['availability', 'schedule'] as const,
    exceptions: ['availability', 'exceptions'] as const,
  },
  bookings: {
    client: ['bookings', 'client'] as const,
    lawyer: ['bookings', 'lawyer'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  registration: {
    status: ['registration', 'status'] as const,
    step2: ['registration', 'step2'] as const,
    // ... more keys
  },
}
```

### Error Handling
All composables use the existing `ApiError` class:

```typescript
try {
  await mutation.mutateAsync(data)
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      await navigateTo('/login')
    }
    // Handle specific error codes
  }
}
```

## What's NOT Included (Yet)

These composables can be added when needed:

- ❌ **useCalendar** - Calendar integration (Google Calendar)
- ❌ **useConsultationTypes** - Consultation type CRUD
- ❌ **Enhanced useLawyers** - Lawyer search and filtering (basic version exists)

## Integration with Existing Code

### Onboarding Pages
The registration pages (`app/pages/register/step*.vue`) can now use:

```typescript
import { useRegistration } from '~/composables/useRegistration'

const { usePersonalInfo, useSavePersonalInfo } = useRegistration()
```

### Dashboard Components
Lawyer and client dashboards can use:

```typescript
import { useBookings } from '~/composables/useBookings'
import { useAvailability } from '~/composables/useAvailability'
```

## Testing Checklist

- [ ] Test availability schedule CRUD
- [ ] Test availability exceptions CRUD
- [ ] Test available slots query
- [ ] Test client booking flow
- [ ] Test lawyer booking management
- [ ] Test registration Step 2 (Personal Info)
- [ ] Test registration Step 3 (NIN Verification)
- [ ] Test registration Step 4 (Professional Info)
- [ ] Test registration Step 5 (Practice Info)
- [ ] Test registration Step 7 (Review & Submit)
- [ ] Test optimistic updates
- [ ] Test error handling
- [ ] Test cache invalidation
- [ ] Test query dependencies

## Next Steps

1. **Update Registration Pages** - Replace existing API calls with new composables
2. **Update Dashboard Components** - Use new composables for bookings and availability
3. **Add Remaining Composables** - Calendar, consultation types if needed
4. **Add Tests** - Unit tests for composables
5. **Add DevTools** - Install `@tanstack/vue-query-devtools` for debugging

## DevTools Setup (Optional)

```bash
npm install @tanstack/vue-query-devtools
```

```vue
<!-- app.vue or layout -->
<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <div>
    <NuxtPage />
    <VueQueryDevtools />
  </div>
</template>
```

## Notes

- All composables follow the same pattern for consistency
- Query keys are centralized for easy cache management
- Optimistic updates are used where appropriate for better UX
- Error handling uses the existing ApiError class
- All mutations automatically invalidate related queries
- Dependent queries use `enabled` option for conditional fetching
- Reactive parameters use `computed()` for proper reactivity

## File Structure

```
app/
├── constants/
│   ├── nigeria-states-lgas.ts ✅
│   └── registration.ts ✅
├── types/
│   ├── availability.ts ✅
│   ├── booking.ts ✅
│   ├── registration.ts ✅
│   └── index.ts ✅ (updated)
├── composables/
│   ├── useAvailability.ts ✅
│   ├── useBookings.ts ✅
│   └── useRegistration.ts ✅
├── lib/
│   ├── api/
│   │   └── client.ts ✅ (existing)
│   └── query-client.ts ✅ (existing)
└── plugins/
    └── query-client.ts ✅ (existing)
```

## Conclusion

The API layer is now fully set up with TanStack Query, providing:
- Type-safe API calls
- Automatic caching and refetching
- Optimistic updates
- Centralized error handling
- Consistent patterns across all composables

All registration pages and dashboard components can now be updated to use these composables for a better developer experience and improved performance.
