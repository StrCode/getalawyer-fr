# API & Authentication Layer

This directory contains the Better Auth client and API integration layer for the Nuxt application.

## Structure

```
lib/
├── auth-client.ts       # Better Auth client configuration
├── api/
│   ├── client.ts        # HTTP client with retry logic
│   └── index.ts         # API endpoints organized by namespace
├── query-client.ts      # TanStack Query configuration
└── README.md           # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
NUXT_PUBLIC_API_URL=http://localhost:3000
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
```

### 3. Using Authentication

```vue
<script setup lang="ts">
import { useSession, signIn, signOut } from '~/lib/auth-client';

const { data: session, isPending } = useSession();

async function handleLogin() {
  await signIn.email({
    email: 'user@example.com',
    password: 'password',
    rememberMe: true,
  });
}

async function handleLogout() {
  await signOut();
}
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="session">
    <p>Welcome, {{ session.user.name }}</p>
    <button @click="handleLogout">Sign Out</button>
  </div>
  <div v-else>
    <button @click="handleLogin">Sign In</button>
  </div>
</template>
```

### 4. Using API with Composables

```vue
<script setup lang="ts">
import { useLawyers } from '~/composables/useLawyers';
import { useSpecializations } from '~/composables/useSpecializations';

const { data: lawyers, isLoading, error } = useLawyers();
const { data: specializations } = useSpecializations();
</script>

<template>
  <div v-if="isLoading">Loading lawyers...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="lawyer in lawyers" :key="lawyer.id">
      {{ lawyer.name }}
    </div>
  </div>
</template>
```

### 5. Direct API Calls

```typescript
import { api } from '~/lib/api';

// Get all lawyers
const response = await api.lawyer.getAll();
const lawyers = response.data;

// Search lawyers
const searchResults = await api.search.lawyers({
  q: 'criminal',
  specializations: ['uuid1', 'uuid2'],
  minExperience: 5,
  page: 1,
  limit: 20,
});

// Create booking
const booking = await api.bookings.createBooking({
  lawyerId: 'lawyer-uuid',
  consultationTypeId: 'consultation-uuid',
  startTime: '2024-01-01T10:00:00Z',
  endTime: '2024-01-01T11:00:00Z',
  notes: 'Need legal advice',
});
```

## Available Composables

### Authentication
- `useSession()` - Get current user session

### Lawyers
- `useLawyers()` - Fetch all lawyers
- `useLawyer(id)` - Fetch single lawyer
- `usePublicLawyerProfile(id)` - Fetch public lawyer profile
- `useLawyerProfile()` - Fetch own lawyer profile (authenticated)

### Specializations
- `useSpecializations()` - Fetch all specializations
- `useSpecialization(id)` - Fetch single specialization

## API Namespaces

- `api.countries` - Country and state data
- `api.specialization` - Legal specializations
- `api.client` - Client profile management
- `api.lawyer` - Lawyer profiles and onboarding
- `api.bookings` - Booking management
- `api.consultationTypes` - Consultation type management
- `api.search` - Lawyer search
- `api.checks` - Onboarding status checks

## Error Handling

```typescript
import { ApiError } from '~/lib/api/client';

try {
  const response = await api.lawyer.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}
```

## Query Keys

Use the query key factory for consistent cache management:

```typescript
import { queryKeys } from '~/lib/query-client';

// Invalidate lawyer cache
queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.all });

// Invalidate specific lawyer
queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.detail('lawyer-id') });
```

## Best Practices

1. **Use composables** instead of direct API calls for better caching and reactivity
2. **Use query keys** from the factory for consistent cache management
3. **Handle loading and error states** in your components
4. **Implement optimistic updates** for better UX in mutations
5. **Use proper authentication methods** (getAuth, post, etc.) for protected endpoints

For more details, see the [Better Auth & API Layer Guide](../../../better-auth-api-guide.md).
