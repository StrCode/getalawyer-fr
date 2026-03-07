# Better Auth & API Layer Guide

## Table of Contents
1. [Better Auth Client Setup](#better-auth-client-setup)
2. [API Layer Architecture](#api-layer-architecture)
3. [Composables (React Hooks)](#composables-react-hooks)
4. [API Routes Reference](#api-routes-reference)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Better Auth Client Setup

### Installation

The project uses Better Auth v1.4.6 for authentication:

```json
{
  "dependencies": {
    "better-auth": "^1.4.6"
  }
}
```

### Configuration

**File:** `src/lib/auth-client.ts`

```typescript
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  fetchOptions: {
    credentials: "include", // Required for cookie-based sessions
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
        onboarding_completed: {
          type: "boolean",
        },
      },
    }),
    emailOTPClient(),
  ],
});
```

### Exported Methods


```typescript
// Exported from auth-client.ts
export const {
  getSession,    // Get current session
  useSession,    // React hook for session
  signIn,        // Sign in user
  signUp,        // Register new user
  signOut,       // Sign out user
  forgetPassword,// Request password reset
  resetPassword, // Reset password with token
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
```

### Usage Examples

#### Using the Session Hook

```typescript
import { useSession } from '@/lib/auth-client';

function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  
  if (!session) return <div>Not authenticated</div>;
  
  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>Role: {session.user.role}</p>
      <p>Onboarding: {session.user.onboarding_completed ? 'Complete' : 'Pending'}</p>
    </div>
  );
}
```

#### Sign In

```typescript
import { signIn } from '@/lib/auth-client';

async function handleLogin(email: string, password: string) {
  const result = await signIn.email({
    email,
    password,
    rememberMe: true,
  });
  
  if (result.error) {
    console.error('Login failed:', result.error);
  }
}
```


#### Sign Up

```typescript
import { signUp } from '@/lib/auth-client';

async function handleRegister(email: string, password: string, name: string) {
  const result = await signUp.email({
    email,
    password,
    name,
  });
  
  if (result.error) {
    console.error('Registration failed:', result.error);
  }
}
```

#### Sign Out

```typescript
import { signOut } from '@/lib/auth-client';

async function handleLogout() {
  await signOut();
  // Redirect to login page
}
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000
BETTER_AUTH_SECRET=<random-256-bit-key>
BETTER_AUTH_URL=http://localhost:3000/api/auth
```

---

## API Layer Architecture

### HTTP Client Configuration

**File:** `src/lib/api/client.ts`

The API layer is built on a custom HTTP client with the following features:

- Automatic retry logic with exponential backoff
- Cookie-based authentication
- Type-safe request/response handling
- FormData support for file uploads
- Centralized error handling

### Core HTTP Client

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const httpClient = {
  // Unauthenticated GET
  get: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  
  // Authenticated GET (includes credentials)
  getAuth: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  
  // Authenticated POST
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => Promise<T>
  
  // POST with FormData (for file uploads)
  postFormData: <T>(endpoint: string, formData: FormData, options?: RequestInit) => Promise<T>
  
  // POST returning Blob (for file downloads)
  postBlob: (endpoint: string, data?: unknown, options?: RequestInit) => Promise<Blob>
  
  // Authenticated PUT
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => Promise<T>
  
  // Authenticated PATCH
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) => Promise<T>
  
  // Authenticated DELETE
  delete: <T>(endpoint: string, options?: RequestInit) => Promise<T>
}
```


### Retry Configuration

```typescript
interface RetryConfig {
  maxRetries: number;        // Default: 0 (TanStack Query handles retries)
  baseDelay: number;         // Default: 1000ms
  maxDelay: number;          // Default: 10000ms
  retryableStatuses: number[]; // [408, 429, 500, 502, 503, 504]
}
```

### Error Handling

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### API Response Format

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: string;
}
```

### API Namespaces

The API is organized into logical namespaces:

```typescript
export const api = {
  countries: { ... },      // Country and state data
  checks: { ... },         // Onboarding status checks
  auth: { ... },           // Authentication (legacy, use better-auth)
  specialization: { ... }, // Legal specializations
  client: { ... },         // Client profile management
  lawyer: { ... },         // Lawyer onboarding and profile
  subscriptions: { ... },  // Subscription management
  search: { ... },         // Lawyer search
};
```

---

## Composables (React Hooks)

### TanStack Query Configuration

**File:** `src/lib/query-client.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
```


### Query Key Factory

```typescript
export const queryKeys = {
  consultationTypes: {
    all: ['consultation-types'] as const,
    detail: (id: string) => ['consultation-types', id] as const,
  },
  availability: {
    schedule: ['availability', 'schedule'] as const,
    exceptions: ['availability', 'exceptions'] as const,
  },
  bookings: {
    client: ['bookings', 'client'] as const,
    lawyer: ['bookings', 'lawyer'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  availableSlots: (lawyerId: string, consultationTypeId: string, startDate: string, endDate: string) =>
    ['available-slots', lawyerId, consultationTypeId, startDate, endDate] as const,
  lawyers: {
    all: ['lawyers'] as const,
    detail: (id: string) => ['lawyers', id] as const,
    public: (id: string) => ['lawyers', 'public', id] as const,
  },
  calendar: {
    connection: ['calendar', 'connection'] as const,
  },
  registration: {
    status: ['registration', 'status'] as const,
    step2: ['registration', 'step2'] as const,
    step4: ['registration', 'step4'] as const,
    step5: ['registration', 'step5'] as const,
    summary: ['registration', 'summary'] as const,
  },
};
```

### Available Hooks

#### Booking Hooks

**File:** `src/lib/hooks/useBookings.ts`

```typescript
// Query: Fetch lawyer bookings
export function useLawyerBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.lawyer,
    queryFn: getLawyerBookings,
  });
}

// Mutation: Update lawyer booking with optimistic updates
export function useUpdateLawyerBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLawyerBookingInput }) =>
      updateLawyerBooking(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update logic
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
    },
    onSettled: () => {
      // Refetch to ensure consistency
    },
  });
}
```


#### Lawyer Hooks

**File:** `src/lib/hooks/useLawyers.ts`

```typescript
// Query: Fetch all lawyers with 5-minute stale time
export function useLawyers() {
  return useQuery({
    queryKey: queryKeys.lawyers.all,
    queryFn: getLawyers,
    staleTime: 5 * 60 * 1000,
  });
}

// Query: Fetch single lawyer with consultation types
export function useLawyer(id: string) {
  return useQuery({
    queryKey: queryKeys.lawyers.detail(id),
    queryFn: () => getLawyer(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Query: Fetch public lawyer profile
export function usePublicLawyerProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.lawyers.public(id),
    queryFn: () => getPublicLawyerProfile(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
```

#### Availability Hooks

**File:** `src/lib/hooks/useAvailability.ts`

```typescript
// Query: Fetch availability schedule
export function useAvailabilitySchedule() {
  return useQuery({
    queryKey: queryKeys.availability.schedule,
    queryFn: getAvailabilitySchedule,
  });
}

// Mutation: Update availability schedule
export function useUpdateAvailabilitySchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (schedule: WeeklySchedule) => updateAvailabilitySchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}

// Query: Fetch availability exceptions
export function useAvailabilityExceptions() {
  return useQuery({
    queryKey: queryKeys.availability.exceptions,
    queryFn: getAvailabilityExceptions,
  });
}

// Mutation: Create availability exception with optimistic updates
export function useCreateAvailabilityException() { ... }

// Mutation: Delete availability exception with optimistic updates
export function useDeleteAvailabilityException() { ... }
```


#### Consultation Type Hooks

**File:** `src/lib/hooks/useConsultationTypes.ts`

```typescript
// Query: Fetch all consultation types
export function useConsultationTypes() { ... }

// Query: Fetch single consultation type
export function useConsultationType(id: string) { ... }

// Mutation: Create consultation type
export function useCreateConsultationType() { ... }

// Mutation: Update consultation type
export function useUpdateConsultationType() { ... }

// Mutation: Delete consultation type
export function useDeleteConsultationType() { ... }
```

#### Calendar Hooks

**File:** `src/lib/hooks/useCalendar.ts`

```typescript
// Query: Fetch calendar connection
export function useCalendarConnection() { ... }

// Mutation: Connect calendar
export function useConnectCalendar() { ... }

// Mutation: Disconnect calendar
export function useDisconnectCalendar() { ... }
```

### Hook Usage Example

```typescript
import { useLawyers } from '@/lib/hooks/useLawyers';
import { useUpdateLawyerBooking } from '@/lib/hooks/useBookings';

function LawyerList() {
  const { data: lawyers, isLoading, error } = useLawyers();
  const updateBooking = useUpdateLawyerBooking();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const handleUpdateBooking = async (id: string, status: string) => {
    await updateBooking.mutateAsync({
      id,
      data: { status }
    });
  };
  
  return (
    <div>
      {lawyers?.map(lawyer => (
        <div key={lawyer.id}>{lawyer.name}</div>
      ))}
    </div>
  );
}
```

---

## API Routes Reference

### Authentication Routes

**Base URL:** `/api/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/sign-up` | No | Register new user |
| POST | `/api/auth/sign-in` | No | Sign in user |
| POST | `/api/auth/sign-out` | Yes | Sign out user |
| GET | `/api/auth/session` | Yes | Get current session |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/verify-otp` | No | Verify OTP code |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/resend-otp` | No | Resend OTP code |
| GET | `/api/auth/google` | No | Google OAuth redirect |
| GET | `/api/auth/apple` | No | Apple OAuth redirect |
| GET | `/api/auth/callback/google` | No | Google OAuth callback |
| GET | `/api/auth/callback/apple` | No | Apple OAuth callback |


#### Sign Up

```typescript
POST /api/auth/sign-up

Request:
{
  email: string;
  password: string;
  name: string;
  role?: 'client' | 'lawyer';
}

Response:
{
  user: User;
  session: Session;
}
```

#### Sign In

```typescript
POST /api/auth/sign-in

Request:
{
  email: string;
  password: string;
  rememberMe?: boolean;
}

Response:
{
  user: User;
  session: Session;
}
```

#### Get Session

```typescript
GET /api/auth/session

Response:
{
  user: User;
  session: Session;
} | null
```

#### Forgot Password

```typescript
POST /api/auth/forgot-password

Request:
{
  email: string;
}

Response:
{
  success: boolean;
  message: string;
}
```

#### Verify OTP

```typescript
POST /api/auth/verify-otp

Request:
{
  email: string;
  otp: string;
}

Response:
{
  token: string;
}
```

#### Reset Password

```typescript
POST /api/auth/reset-password

Request:
{
  token: string;
  password: string;
}

Response:
{
  success: boolean;
}
```


### Client Routes

**Base URL:** `/api/clients`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/clients/me` | Yes | Get client profile |
| PATCH | `/api/clients/me` | Yes | Update client profile |
| POST | `/api/clients/upload-avatar` | Yes | Upload profile avatar |
| POST | `/api/clients/onboarding/complete` | Yes | Complete client onboarding |

#### Get Client Profile

```typescript
GET /api/clients/me

Response:
{
  success: boolean;
  profile: {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    onboardingCompleted: boolean;
    clientId: string;
    company: string | null;
    country: string;
    state: string;
    phoneNumber: string | null;
    clientCreatedAt: string;
  };
}
```

#### Update Client Profile

```typescript
PATCH /api/clients/me

Request:
{
  name: string;
  state: string;
  country: string;
}

Response:
{
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}
```

#### Upload Avatar

```typescript
POST /api/clients/upload-avatar
Content-Type: multipart/form-data

Request:
FormData {
  image: File
}

Response:
{
  success: boolean;
  imageUrl: string;
}
```

#### Complete Onboarding

```typescript
POST /api/clients/onboarding/complete

Request:
{
  country: string;
  state: string;
  specializationIds: string[];
}

Response:
{
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}
```


### Lawyer Routes

**Base URL:** `/api/lawyers`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/lawyers` | No | Get all lawyers |
| GET | `/api/lawyers/:id` | No | Get lawyer by ID |
| GET | `/api/public/lawyers/:id` | No | Get public lawyer profile |
| GET | `/api/lawyers/:id/profile` | No | Get lawyer profile with details |
| GET | `/api/lawyers/:id/available-slots` | No | Get available booking slots |
| GET | `/api/lawyers/profile` | Yes | Get own lawyer profile |
| GET | `/api/lawyers/onboarding/status` | Yes | Get onboarding status |
| PATCH | `/api/lawyers/onboarding/practice-info` | Yes | Save practice information |
| PATCH | `/api/lawyers/onboarding/documents` | Yes | Save documents |
| POST | `/api/lawyers/onboarding/complete` | Yes | Complete onboarding |
| POST | `/api/lawyers/upload-document` | Yes | Upload document |
| GET | `/api/lawyers/documents` | Yes | Get uploaded documents |
| DELETE | `/api/lawyers/documents/:id` | Yes | Delete document |
| PATCH | `/api/lawyers/documents/:id` | Yes | Update document metadata |

#### Get All Lawyers

```typescript
GET /api/lawyers

Response:
{
  success: boolean;
  data: LawyerListItem[];
}
```

#### Get Lawyer Profile

```typescript
GET /api/lawyers/:id/profile

Response:
{
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    yearsOfExperience: number;
    barLicenseNumber: string;
    specializations: Specialization[];
    consultationTypes: ConsultationType[];
    rating: number;
    reviewCount: number;
  };
}
```

#### Get Onboarding Status

```typescript
GET /api/lawyers/onboarding/status

Response:
{
  currentStep: 'practice_info' | 'documents' | 'specializations' | 'submitted';
  lawyer: Lawyer | null;
  documents: LawyerDocument[];
  specializations: Specialization[];
}
```

#### Save Practice Information

```typescript
PATCH /api/lawyers/onboarding/practice-info

Request:
{
  phoneNumber: string;
  country: string;
  state: string;
  yearsOfExperience: number;
  barLicenseNumber: string;
  barAssociation: string;
  licenseStatus: string;
}

Response:
{
  success: boolean;
  data: Lawyer;
}
```


#### Save Documents

```typescript
PATCH /api/lawyers/onboarding/documents

Request:
{
  documents: Array<{
    type: 'bar_license' | 'certification';
    url: string;
    publicId: string;
    originalName?: string;
  }>;
}

Response:
{
  success: boolean;
  message: string;
}
```

#### Complete Onboarding

```typescript
POST /api/lawyers/onboarding/complete

Request:
{
  specializations: Array<{
    specializationId: string;
    yearsOfExperience: number;
  }>;
  experienceDescription?: string;
}

Response:
{
  success: boolean;
  data: {
    lawyerId: string;
    specializationCount: number;
    status: 'pending';
  };
}
```

#### Upload Document

```typescript
POST /api/lawyers/upload-document
Content-Type: multipart/form-data

Request:
FormData {
  document: File;
  type: 'bar_license' | 'certification';
}

Response:
{
  success: boolean;
  message: string;
  document: {
    id: string;
    type: string;
    url: string;
    publicId: string;
    originalName: string;
    createdAt: string;
  };
}
```

#### Get Available Slots

```typescript
GET /api/lawyers/:lawyerId/available-slots?consultationTypeId=xxx&startDate=2024-01-01&endDate=2024-01-31

Response:
{
  success: boolean;
  data: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
}
```


### Booking Routes

**Base URL:** `/api/bookings` (Client) | `/api/lawyer/bookings` (Lawyer)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/bookings` | Yes (Client) | Get client bookings |
| GET | `/api/bookings/:id` | Yes (Client) | Get client booking by ID |
| POST | `/api/bookings` | Yes (Client) | Create new booking |
| PUT | `/api/bookings/:id` | Yes (Client) | Update client booking |
| GET | `/api/lawyer/bookings` | Yes (Lawyer) | Get lawyer bookings |
| GET | `/api/lawyer/bookings/:id` | Yes (Lawyer) | Get lawyer booking by ID |
| PUT | `/api/lawyer/bookings/:id` | Yes (Lawyer) | Update lawyer booking |

#### Get Client Bookings

```typescript
GET /api/bookings

Response:
{
  success: boolean;
  data: Booking[];
}
```

#### Create Booking

```typescript
POST /api/bookings

Request:
{
  lawyerId: string;
  consultationTypeId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  notes?: string;
}

Response:
{
  success: boolean;
  data: Booking;
}
```

#### Update Client Booking

```typescript
PUT /api/bookings/:id

Request:
{
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

Response:
{
  success: boolean;
  data: Booking;
}
```

#### Update Lawyer Booking

```typescript
PUT /api/lawyer/bookings/:id

Request:
{
  status: 'confirmed' | 'rejected' | 'completed';
  notes?: string;
}

Response:
{
  success: boolean;
  data: Booking;
}
```


### Consultation Type Routes

**Base URL:** `/api/consultation-types`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/consultation-types` | Yes | Get all consultation types |
| GET | `/api/consultation-types/:id` | Yes | Get consultation type by ID |
| POST | `/api/consultation-types` | Yes (Lawyer) | Create consultation type |
| PUT | `/api/consultation-types/:id` | Yes (Lawyer) | Update consultation type |
| DELETE | `/api/consultation-types/:id` | Yes (Lawyer) | Delete consultation type |

#### Get Consultation Types

```typescript
GET /api/consultation-types

Response:
{
  success: boolean;
  data: Array<{
    id: string;
    lawyerId: string;
    name: string;
    description: string;
    duration: number; // minutes
    price: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### Create Consultation Type

```typescript
POST /api/consultation-types

Request:
{
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency: string;
  isActive: boolean;
}

Response:
{
  success: boolean;
  data: ConsultationType;
}
```

#### Update Consultation Type

```typescript
PUT /api/consultation-types/:id

Request:
{
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  currency?: string;
  isActive?: boolean;
}

Response:
{
  success: boolean;
  data: ConsultationType;
}
```

#### Delete Consultation Type

```typescript
DELETE /api/consultation-types/:id

Response:
{
  success: boolean;
  message: string;
}
```


### Availability Routes

**Base URL:** `/api/lawyer/availability`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/lawyer/availability/schedule` | Yes (Lawyer) | Get weekly schedule |
| POST | `/api/lawyer/availability/schedule` | Yes (Lawyer) | Update weekly schedule |
| GET | `/api/lawyer/availability/exceptions` | Yes (Lawyer) | Get availability exceptions |
| POST | `/api/lawyer/availability/exceptions` | Yes (Lawyer) | Create exception |
| DELETE | `/api/lawyer/availability/exceptions/:id` | Yes (Lawyer) | Delete exception |

#### Get Availability Schedule

```typescript
GET /api/lawyer/availability/schedule

Response:
{
  success: boolean;
  data: {
    monday?: Array<{ startTime: string; endTime: string }>;
    tuesday?: Array<{ startTime: string; endTime: string }>;
    wednesday?: Array<{ startTime: string; endTime: string }>;
    thursday?: Array<{ startTime: string; endTime: string }>;
    friday?: Array<{ startTime: string; endTime: string }>;
    saturday?: Array<{ startTime: string; endTime: string }>;
    sunday?: Array<{ startTime: string; endTime: string }>;
  };
}
```

#### Update Availability Schedule

```typescript
POST /api/lawyer/availability/schedule

Request:
{
  monday?: Array<{ startTime: string; endTime: string }>;
  tuesday?: Array<{ startTime: string; endTime: string }>;
  // ... other days
}

Response:
{
  success: boolean;
  data: WeeklySchedule;
}
```

#### Get Availability Exceptions

```typescript
GET /api/lawyer/availability/exceptions

Response:
{
  success: boolean;
  data: Array<{
    id: string;
    lawyerId: string;
    startDate: string;
    endDate: string;
    reason: string;
    createdAt: string;
  }>;
}
```

#### Create Availability Exception

```typescript
POST /api/lawyer/availability/exceptions

Request:
{
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  reason: string;
}

Response:
{
  success: boolean;
  data: AvailabilityException;
}
```

#### Delete Availability Exception

```typescript
DELETE /api/lawyer/availability/exceptions/:id

Response:
{
  success: boolean;
  message: string;
}
```


### Calendar Integration Routes

**Base URL:** `/api/lawyer/calendar`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/lawyer/calendar` | Yes (Lawyer) | Get calendar connection |
| POST | `/api/lawyer/calendar` | Yes (Lawyer) | Connect calendar |
| DELETE | `/api/lawyer/calendar` | Yes (Lawyer) | Disconnect calendar |

#### Get Calendar Connection

```typescript
GET /api/lawyer/calendar

Response:
{
  success: boolean;
  data: {
    id: string;
    lawyerId: string;
    provider: 'google' | 'outlook';
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}
```

#### Connect Calendar

```typescript
POST /api/lawyer/calendar

Request:
{
  provider: 'google' | 'outlook';
  accessToken: string;
  refreshToken: string;
  email: string;
}

Response:
{
  success: boolean;
  data: CalendarConnection;
}
```

#### Disconnect Calendar

```typescript
DELETE /api/lawyer/calendar

Response:
{
  success: boolean;
  message: string;
}
```


### Subscription Routes

**Base URL:** `/api/subscriptions`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/subscriptions/initialize` | Yes | Initialize subscription payment |
| GET | `/api/subscriptions/status` | Yes | Get subscription status |
| GET | `/api/subscriptions/verify/:reference` | Yes | Verify payment |

#### Initialize Subscription

```typescript
POST /api/subscriptions/initialize

Response:
{
  success: boolean;
  data: {
    redirectUrl: string;
    reference: string;
    subscriptionId: string;
  };
}
```

#### Get Subscription Status

```typescript
GET /api/subscriptions/status

Response:
{
  success: boolean;
  data: {
    hasActiveSubscription: boolean;
    subscription: {
      id: string;
      status: 'active' | 'pending' | 'expired' | 'cancelled' | 'failed_renewal';
      subscriptionStartDate: string;
      subscriptionEndDate: string;
      nextBillingDate: string;
      daysRemaining: number;
      cardLast4: string;
      bank: string;
      autoRenewEnabled: boolean;
    } | null;
  };
}
```

#### Verify Payment

```typescript
GET /api/subscriptions/verify/:reference

Response:
{
  success: boolean;
  data: {
    status: 'active' | 'pending' | 'error';
    subscription?: {
      id: string;
      status: string;
      subscriptionEndDate: string;
    };
    message?: string;
  };
}
```


### Search Routes

**Base URL:** `/api/search`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/search/lawyers` | No | Search lawyers |
| GET | `/api/search/autocomplete` | No | Get autocomplete suggestions |
| GET | `/api/search/filters` | No | Get available filters |

#### Search Lawyers

```typescript
GET /api/search/lawyers?q=criminal&specializations=uuid1,uuid2&minExperience=5&maxExperience=10&page=1&limit=20&sortBy=relevance

Query Parameters:
- q: string (search query)
- specializations: string[] (comma-separated UUIDs)
- minExperience: number
- maxExperience: number
- page: number (default: 1)
- limit: number (default: 20)
- sortBy: 'relevance' | 'experience' | 'recent'

Response:
{
  success: boolean;
  data: {
    lawyers: LawyerSearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

#### Autocomplete

```typescript
GET /api/search/autocomplete?q=crim

Response:
{
  success: boolean;
  data: {
    suggestions: Array<{
      type: 'lawyer' | 'specialization';
      id: string;
      name: string;
      highlight: string;
    }>;
  };
}
```

#### Get Filters

```typescript
GET /api/search/filters?q=criminal&minExperience=5

Response:
{
  success: boolean;
  data: {
    specializations: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    experienceRanges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
  };
}
```


### Specialization Routes

**Base URL:** `/api/specializations`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/specializations` | No | Get all specializations |
| GET | `/api/specializations/:id` | No | Get specialization by ID |

#### Get All Specializations

```typescript
GET /api/specializations

Response:
{
  specializations: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

#### Get Specialization by ID

```typescript
GET /api/specializations/:id

Response:
{
  specialization: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### Country Routes

**Base URL:** `/api/countries`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/countries` | Yes | Get all countries |
| GET | `/api/countries/:code/states` | Yes | Get states by country code |

#### Get Countries

```typescript
GET /api/countries

Response:
{
  success: boolean;
  data: Array<{
    code2: string;
    code3: string;
    name: string;
    capital: string;
    region: string;
    subregion: string;
    states: State[];
  }>;
}
```

#### Get States by Country

```typescript
GET /api/countries/:code/states

Response:
{
  success: boolean;
  data: Array<{
    code: string;
    name: string;
    subdivision: string;
  }>;
}
```


### Registration Routes

**Base URL:** `/api/register`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/register/status` | Yes | Get registration status |
| GET | `/api/register/step2` | Yes | Get personal info |
| POST | `/api/register/step2` | Yes | Save personal info |
| POST | `/api/register/step3/verify-nin` | Yes | Verify NIN |
| POST | `/api/register/step3/confirm` | Yes | Confirm NIN |
| GET | `/api/register/step4` | Yes | Get professional info |
| POST | `/api/register/step4` | Yes | Save professional info |
| GET | `/api/register/step5` | Yes | Get practice info |
| POST | `/api/register/step5` | Yes | Save practice info |
| GET | `/api/register/summary` | Yes | Get registration summary |
| POST | `/api/register/submit` | Yes | Submit application |

#### Get Registration Status

```typescript
GET /api/register/status

Response:
{
  success: boolean;
  registration_status: 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'submitted' | 'approved' | 'rejected';
}
```

#### Save Personal Information

```typescript
POST /api/register/step2

Request:
{
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  state: string;
  lga: string;
}

Response:
{
  success: boolean;
  registration_status: 'step3';
}
```

#### Verify NIN

```typescript
POST /api/register/step3/verify-nin

Request:
{
  nin: string;
  consent: boolean;
}

Response:
{
  success: boolean;
  data: {
    firstName: string;
    middleName: string;
    lastName: string;
    image: string; // Base64
    dateOfBirth: string;
    gender: string;
    mobile: string;
    address: {
      addressLine: string;
      town: string;
      lga: string;
      state: string;
    };
    idNumber: string;
  };
}
```


#### Save Professional Information

```typescript
POST /api/register/step4

Request:
{
  barNumber: string;
  yearOfCall: number;
  lawSchool: string;
  university: string;
  llbYear: number;
}

Response:
{
  success: boolean;
  registration_status: 'step5';
}
```

#### Save Practice Information

```typescript
POST /api/register/step5

Request:
{
  practiceType: 'solo' | 'firm';
  firmName?: string;
  practiceAreas: string[]; // Specialization UUIDs
  statesOfPractice: string[];
  officeAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

Response:
{
  success: boolean;
  registration_status: 'step6';
}
```

#### Get Registration Summary

```typescript
GET /api/register/summary

Response:
{
  success: boolean;
  data: {
    personal: PersonalInfoFormData;
    nin: {
      nin: string;
      firstName: string;
      middleName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      mobile: string;
      addressLine: string;
      town: string;
      lga: string;
      state: string;
      imageUrl?: string;
      nameMatch: boolean;
      dobMatch: boolean;
      verifiedAt: string;
    };
    professional: ProfessionalInfoFormData;
    practice: {
      id: string;
      lawyerId: string;
      firmName?: string;
      statesOfPractice: string[];
      officeStreet: string;
      officeCity: string;
      officeState: string;
      officePostalCode: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}
```


#### Submit Application

```typescript
POST /api/register/submit

Response:
{
  success: boolean;
  message: string;
  application_id: string;
}
```

### Onboarding Check Routes

**Base URL:** `/api/boards`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/boards` | Yes | Check onboarding status |

#### Check Onboarding Status

```typescript
GET /api/boards

Response:
{
  success: boolean;
  onboarding_completed: boolean;
}
```

---

## Error Handling

### ApiError Class

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Error Response Format

```typescript
{
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: string;
}
```

### Common HTTP Status Codes

| Status | Description | Retry |
|--------|-------------|-------|
| 400 | Bad Request | No |
| 401 | Unauthorized | No |
| 403 | Forbidden | No |
| 404 | Not Found | No |
| 408 | Request Timeout | Yes |
| 429 | Too Many Requests | Yes |
| 500 | Internal Server Error | Yes |
| 502 | Bad Gateway | Yes |
| 503 | Service Unavailable | Yes |
| 504 | Gateway Timeout | Yes |


### Error Handling in Components

```typescript
import { ApiError } from '@/lib/api/client';
import { useLawyers } from '@/lib/hooks/useLawyers';

function LawyerList() {
  const { data, error, isLoading } = useLawyers();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    if (error instanceof ApiError) {
      // Handle API errors
      if (error.status === 401) {
        return <div>Please log in to continue</div>;
      }
      if (error.status === 403) {
        return <div>You don't have permission to view this</div>;
      }
      if (error.status >= 500) {
        return <div>Server error. Please try again later.</div>;
      }
      return <div>Error: {error.message}</div>;
    }
    // Handle network errors
    return <div>Network error. Please check your connection.</div>;
  }
  
  return <div>{/* Render lawyers */}</div>;
}
```

### Mutation Error Handling

```typescript
import { useUpdateLawyerBooking } from '@/lib/hooks/useBookings';
import { ApiError } from '@/lib/api/client';

function BookingActions({ bookingId }: { bookingId: string }) {
  const updateBooking = useUpdateLawyerBooking();
  
  const handleConfirm = async () => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { status: 'confirmed' }
      });
      // Success - show toast notification
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific error codes
        if (error.code === 'BOOKING_CONFLICT') {
          alert('This time slot is no longer available');
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    }
  };
  
  return (
    <button onClick={handleConfirm} disabled={updateBooking.isPending}>
      {updateBooking.isPending ? 'Confirming...' : 'Confirm Booking'}
    </button>
  );
}
```

---

## Best Practices

### 1. Use Composables (Hooks) Instead of Direct API Calls

❌ **Don't:**
```typescript
import { httpClient } from '@/lib/api/client';

function MyComponent() {
  const [lawyers, setLawyers] = useState([]);
  
  useEffect(() => {
    httpClient.get('/api/lawyers').then(setLawyers);
  }, []);
}
```

✅ **Do:**
```typescript
import { useLawyers } from '@/lib/hooks/useLawyers';

function MyComponent() {
  const { data: lawyers, isLoading } = useLawyers();
}
```


### 2. Use Query Keys from queryKeys Factory

❌ **Don't:**
```typescript
useQuery({
  queryKey: ['lawyers', id],
  queryFn: () => getLawyer(id),
});
```

✅ **Do:**
```typescript
import { queryKeys } from '@/lib/query-client';

useQuery({
  queryKey: queryKeys.lawyers.detail(id),
  queryFn: () => getLawyer(id),
});
```

### 3. Implement Optimistic Updates for Better UX

```typescript
export function useUpdateLawyerBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateLawyerBooking(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.lawyer });
      
      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(queryKeys.bookings.lawyer);
      
      // Optimistically update
      if (previousBookings) {
        queryClient.setQueryData(
          queryKeys.bookings.lawyer,
          previousBookings.map(booking =>
            booking.id === id ? { ...booking, ...data } : booking
          )
        );
      }
      
      return { previousBookings };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKeys.bookings.lawyer, context.previousBookings);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lawyer });
    },
  });
}
```

### 4. Handle Loading and Error States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useLawyers();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorAlert error={error} />;
  }
  
  return <LawyerList lawyers={data} />;
}
```

### 5. Use Proper Authentication Methods

❌ **Don't:**
```typescript
// Don't use httpClient.get for authenticated endpoints
httpClient.get('/api/clients/me');
```

✅ **Do:**
```typescript
// Use httpClient.getAuth for authenticated endpoints
httpClient.getAuth('/api/clients/me');

// Or better, use the API wrapper
api.client.getProfile();
```


### 6. Invalidate Related Queries After Mutations

```typescript
export function useUpdateAvailabilitySchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (schedule) => updateAvailabilitySchedule(schedule),
    onSuccess: () => {
      // Invalidate schedule cache
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.schedule });
      
      // Invalidate related queries (available slots depend on schedule)
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
  });
}
```

### 7. Use Stale-While-Revalidate for Better Performance

```typescript
export function useLawyers() {
  return useQuery({
    queryKey: queryKeys.lawyers.all,
    queryFn: getLawyers,
    // Data is fresh for 5 minutes, but will revalidate in background
    staleTime: 5 * 60 * 1000,
  });
}
```

### 8. Handle File Uploads Properly

```typescript
// Use postFormData for file uploads
const formData = new FormData();
formData.append('image', file);

const response = await httpClient.postFormData('/api/clients/upload-avatar', formData);
```

### 9. Use Type-Safe API Calls

```typescript
// Define types for request and response
interface UpdateProfileRequest {
  name: string;
  state: string;
  country: string;
}

interface ProfileResponse {
  success: boolean;
  profile: Profile;
}

// Use types in API calls
const response = await httpClient.patch<ProfileResponse>(
  '/api/clients/me',
  data as UpdateProfileRequest
);
```

### 10. Implement Proper Session Management

```typescript
import { useSession } from '@/lib/auth-client';
import { Navigate } from '@tanstack/react-router';

function ProtectedRoute({ children }) {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return <LoadingSpinner />;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

---

## Quick Reference

### Import Paths

```typescript
// Auth Client
import { authClient, useSession, signIn, signOut } from '@/lib/auth-client';

// HTTP Client
import { httpClient, ApiError } from '@/lib/api/client';

// API Wrapper
import { api } from '@/lib/api/client';

// Hooks
import { useLawyers, useLawyer } from '@/lib/hooks/useLawyers';
import { useLawyerBookings, useUpdateLawyerBooking } from '@/lib/hooks/useBookings';
import { useAvailabilitySchedule } from '@/lib/hooks/useAvailability';
import { useConsultationTypes } from '@/lib/hooks/useConsultationTypes';
import { useCalendarConnection } from '@/lib/hooks/useCalendar';

// Query Client
import { queryClient, queryKeys } from '@/lib/query-client';
```

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=<random-256-bit-key>
BETTER_AUTH_URL=http://localhost:3000/api/auth

# Database
DATABASE_URL=<database-connection-string>

# NIN Verification
NIN_API_KEY=<nin-api-key>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

---

## Additional Resources

- [Better Auth Documentation](https://better-auth.com/)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack Router Documentation](https://tanstack.com/router)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

