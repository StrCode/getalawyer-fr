# Registration & Onboarding Routing Flow Documentation

**Project:** GetALawyer Frontend  
**Purpose:** Complete documentation of user registration and onboarding routing logic  
**Date:** March 7, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Entry Points](#entry-points)
3. [Client Registration Flow](#client-registration-flow)
4. [Lawyer Registration Flow](#lawyer-registration-flow)
5. [Route Guards & Redirects](#route-guards--redirects)
6. [Session & Role Detection](#session--role-detection)
7. [Flow Diagrams](#flow-diagrams)
8. [Implementation Details](#implementation-details)

---

## 1. Overview

The application has two distinct registration and onboarding flows:

1. **Client Flow** - Simple 2-step onboarding (location + specializations)
2. **Lawyer Flow** - Comprehensive 5-step registration (personal info → NIN → professional → practice → review)

The routing system automatically detects the user type and directs them to the appropriate flow.

---

## 2. Entry Points

### 2.1 Homepage (`/`)

**File:** `src/routes/index.tsx`

The homepage is the primary entry point where users choose their role:

```typescript
// Client Sign Up
<Link to="/register" search={{ type: "user" }}>
  Sign Up as Client
</Link>

// Lawyer Sign Up
<Link to="/register" search={{ type: "lawyer" }}>
  Sign Up as Lawyer
</Link>
```

**Key Points:**
- Uses URL search params to pass user type: `?type=user` or `?type=lawyer`
- Both links go to `/register` but with different type parameters
- The type parameter determines which registration flow to use

### 2.2 Register Route (`/register`)

**File:** `src/routes/(auth)/register.tsx`

This route validates the search params and renders the appropriate registration form:

```typescript
type RegisterSearch = {
  type?: "user" | "lawyer";
};

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type: search.type === "user" || search.type === "lawyer" 
        ? search.type 
        : undefined,
    };
  },
});

function RouteComponent() {
  const { type } = Route.useSearch();
  const [userType, _] = useState<"user" | "lawyer">(type || "user");
  
  return <RegisterForm userType={userType} />;
}
```

**Key Points:**
- Validates search params to ensure type is either "user" or "lawyer"
- Defaults to "user" if no type is provided
- Passes userType to RegisterForm component

---

## 3. Client Registration Flow

### Step 1: Account Creation (`/register?type=user`)

**File:** `src/components/auth/RegisterForm.tsx`

**Process:**
1. User enters name and email
2. System checks if email already exists
3. User creates password
4. Account is created with `role: "user"` and `onboarding_completed: false`

**Code:**
```typescript
const { error } = await authClient.signUp.email({
  name: registrationData.name,
  email: registrationData.email,
  password: value.password,
  userType, // "user"
  onboarding_completed: false,
});

if (!error) {
  if (userType === "user") {
    navigate({ to: "/onboarding/client-location" });
  }
}
```

**Navigation:**
- Success → `/onboarding/client-location`

### Step 2: Onboarding Router (`/onboarding`)

**File:** `src/routes/(protected)/onboarding/index.tsx`

This route acts as a router that checks the user's role and redirects accordingly:

```typescript
export const Route = createFileRoute("/(protected)/onboarding/")({
  beforeLoad: async ({ context }) => {
    const { session } = context;

    // If onboarding is already completed, redirect to dashboard
    if (session.user.onboarding_completed) {
      throw redirect({ to: "/dashboard", replace: true });
    }

    // Check user role and redirect to appropriate onboarding flow
    const userRole = session.user.role;

    if (userRole === "lawyer") {
      throw redirect({ to: "/register/step2" });
    } else {
      // Default to client onboarding for 'user' role
      throw redirect({ to: "/onboarding/client-location" });
    }
  },
});
```

**Key Points:**
- Protected route (requires authentication)
- Checks if onboarding is completed → redirect to dashboard
- Checks user role:
  - `role === "lawyer"` → `/register/step2`
  - `role === "user"` → `/onboarding/client-location`

### Step 3: Client Location (`/onboarding/client-location`)

**File:** `src/routes/(protected)/onboarding/(client)/client-location.tsx`

**Process:**
1. User selects their state and LGA (Local Government Area)
2. Data is saved to localStorage and backend
3. Navigate to specializations step

**Navigation:**
- Success → `/onboarding/client-specializations`

### Step 4: Client Specializations (`/onboarding/client-specializations`)

**File:** `src/routes/(protected)/onboarding/(client)/client-specializations.tsx`

**Process:**
1. User selects legal specializations they're interested in
2. Data is saved to backend
3. `onboarding_completed` is set to `true`
4. Navigate to dashboard

**Navigation:**
- Success → `/dashboard`

### Client Layout Route

**File:** `src/routes/(protected)/onboarding/(client)/route.tsx`

This layout wraps all client onboarding routes and provides:
- Header with logo and sign out button
- Redirect protection for lawyers
- Redirect protection for completed onboarding

```typescript
// Redirect if onboarding is already completed
useEffect(() => {
  if (!isPending && session?.user?.onboarding_completed) {
    navigate({ to: "/dashboard", replace: true });
  }
}, [session, isPending, navigate]);

// Redirect lawyers to lawyer registration
useEffect(() => {
  if (!isPending && session?.user?.role === "lawyer") {
    navigate({ to: "/register/step2", replace: true });
  }
}, [session, isPending, navigate]);
```

---

## 4. Lawyer Registration Flow

### Step 1: Account Creation (`/register?type=lawyer`)

**File:** `src/components/auth/RegisterForm.tsx`

**Process:**
1. User enters name and email
2. System checks if email already exists
3. User creates password
4. Account is created with `role: "lawyer"` and `onboarding_completed: false`

**Code:**
```typescript
const { error } = await authClient.signUp.email({
  name: registrationData.name,
  email: registrationData.email,
  password: value.password,
  userType, // "lawyer"
  onboarding_completed: false,
});

if (!error) {
  if (userType === "lawyer") {
    navigate({ to: "/register/step2" });
  }
}
```

**Navigation:**
- Success → `/register/step2`

### Step 2: Personal Information (`/register/step2`)

**File:** `src/routes/register/step2.tsx`  
**Component:** `src/components/registration/PersonalInfoForm.tsx`

**Process:**
1. User enters personal details:
   - First name, last name, middle name
   - Date of birth
   - Gender
   - State and LGA
2. Data is saved to backend
3. Registration status updated to `step2`

**Navigation:**
- Success → `/register/step3`

### Step 3: NIN Verification (`/register/step3`)

**File:** `src/routes/register/step3.tsx`  
**Component:** `src/components/registration/NINVerificationForm.tsx`

**Process:**
1. User enters National Identification Number (NIN)
2. User provides consent for verification
3. System verifies NIN with government database (or mock in dev)
4. User reviews verification results
5. User confirms or retries
6. Registration status updated to `step3`

**Navigation:**
- Success → `/register/step4`

### Step 4: Professional Information (`/register/step4`)

**File:** `src/routes/register/step4.tsx`  
**Component:** `src/components/registration/ProfessionalInfoForm.tsx`

**Process:**
1. User enters professional credentials:
   - Bar number
   - Year of call to bar
   - Law school
   - University
   - LLB graduation year
2. Data is saved to backend
3. Registration status updated to `step4`

**Navigation:**
- Success → `/register/step5`

### Step 5: Practice Information (`/register/step5`)

**File:** `src/routes/register/step5.tsx`  
**Component:** `src/components/registration/PracticeInfoForm.tsx`

**Process:**
1. User enters practice details:
   - Practice type (solo/firm)
   - Firm name (if applicable)
   - Practice areas/specializations
   - States of practice
   - Office address
2. Data is saved to backend
3. Registration status updated to `step5`

**Navigation:**
- Success → `/register/step7` (Review & Submit)

### Step 6: Review & Submit (`/register/step7`)

**File:** `src/routes/register/step7.tsx`  
**Component:** `src/components/registration/RegistrationSummary.tsx`

**Process:**
1. User reviews all entered information
2. User can edit any section (navigates back to that step)
3. User submits application
4. Registration status updated to `submitted`

**Navigation:**
- Success → `/register/pending`

### Step 7: Pending Approval (`/register/pending`)

**File:** `src/routes/register/pending.tsx`  
**Component:** `src/components/registration/PendingApprovalDashboard.tsx`

**Process:**
1. User sees pending approval message
2. User can view their submitted application
3. User waits for admin approval

**Navigation:**
- Once approved → `/dashboard` (automatic redirect)

### Lawyer Registration Parent Route

**File:** `src/routes/register/route.tsx`

This parent route handles direct access to `/register` for authenticated lawyers:

```typescript
export const Route = createFileRoute('/register')({
  beforeLoad: async ({ location }) => {
    // Only redirect if accessing /register directly
    if (location.pathname === '/register' || location.pathname === '/register/') {
      const session = await getSession();
      
      if (!session?.data?.user) {
        // Not authenticated - redirect to auth register page
        throw redirect({
          to: '/auth/register',
          search: { type: 'lawyer' },
        });
      }

      // Fetch registration status
      const statusResponse = await registrationAPI.getRegistrationStatus();
      const currentStatus = statusResponse.registration_status;

      // Redirect to correct route based on status
      const targetRoute = getRouteForStatus(currentStatus);
      throw redirect({ to: targetRoute });
    }
  },
});
```

**Key Points:**
- Checks authentication status
- Fetches current registration status from backend
- Redirects to appropriate step based on status
- Handles errors by defaulting to step 2

---

## 5. Route Guards & Redirects

### 5.1 Registration Route Guard

**File:** `src/lib/guards/registration-guards.ts`

```typescript
export async function registrationRouteGuard(requiredStep: number) {
  const session = await getSession();
  
  if (!session?.data?.user) {
    throw redirect({ to: '/login' });
  }

  if (session.data.user.role !== 'lawyer') {
    throw redirect({ to: '/dashboard' });
  }

  const statusResponse = await registrationAPI.getRegistrationStatus();
  const currentStatus = statusResponse.registration_status;

  // Check if user can access this step
  const canAccess = canAccessStep(currentStatus, requiredStep);
  
  if (!canAccess) {
    const targetRoute = getRouteForStatus(currentStatus);
    throw redirect({ to: targetRoute });
  }
}
```

**Applied to all lawyer registration steps:**
```typescript
export const Route = createFileRoute("/register/step2")({
  beforeLoad: async () => {
    await registrationRouteGuard(2);
  },
});
```

### 5.2 Status-Based Routing

**File:** `src/lib/guards/registration-guards.ts`

```typescript
export function getRouteForStatus(status: RegistrationStatus): string {
  switch (status) {
    case 'step1':
      return '/register'; // Will redirect to auth register
    case 'step2':
      return '/register/step2';
    case 'step3':
      return '/register/step3';
    case 'step4':
      return '/register/step4';
    case 'step5':
      return '/register/step5';
    case 'step7': // Review & Submit (step 6 removed)
      return '/register/step7';
    case 'submitted':
      return '/register/pending';
    case 'approved':
      return '/dashboard';
    case 'rejected':
      return '/register/rejected';
    default:
      return '/register/step2';
  }
}
```

### 5.3 Protected Route Context

**File:** `src/routes/(protected)/route.tsx`

All protected routes (onboarding and dashboard) inherit from this parent:

```typescript
export const Route = createFileRoute('/(protected)')({
  beforeLoad: async () => {
    const session = await getSession();
    
    if (!session?.data?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return { session: session.data };
  },
});
```

---

## 6. Session & Role Detection

### 6.1 User Roles

The system supports two user roles:
- `"user"` - Regular clients seeking legal services
- `"lawyer"` - Legal professionals providing services

### 6.2 Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "lawyer";
    onboarding_completed: boolean;
    // ... other fields
  };
}
```

### 6.3 Role-Based Redirects

**In RegisterForm:**
```typescript
const handleRegistrationComplete = (userType: "user" | "lawyer") => {
  if (userType === "user") {
    return "/dashboard"; // Actually goes to /onboarding/client-location
  } else {
    return "/register/step2"; // Lawyers start registration
  }
};
```

**In Onboarding Router:**
```typescript
if (userRole === "lawyer") {
  throw redirect({ to: "/register/step2" });
} else {
  throw redirect({ to: "/onboarding/client-location" });
}
```

**In Client Onboarding Layout:**
```typescript
// Redirect lawyers to lawyer registration
useEffect(() => {
  if (!isPending && session?.user?.role === "lawyer") {
    navigate({ to: "/register/step2", replace: true });
  }
}, [session, isPending, navigate]);
```

---

## 7. Flow Diagrams

### 7.1 Client Registration Flow

```
Homepage (/)
    ↓
    [Click "Sign Up as Client"]
    ↓
/register?type=user
    ↓
    [Enter name, email, password]
    ↓
Account Created (role: "user", onboarding_completed: false)
    ↓
/onboarding
    ↓
    [Role check: user]
    ↓
/onboarding/client-location
    ↓
    [Select state & LGA]
    ↓
/onboarding/client-specializations
    ↓
    [Select specializations]
    ↓
    [Set onboarding_completed: true]
    ↓
/dashboard (Client Dashboard)
```

### 7.2 Lawyer Registration Flow

```
Homepage (/)
    ↓
    [Click "Sign Up as Lawyer"]
    ↓
/register?type=lawyer
    ↓
    [Enter name, email, password]
    ↓
Account Created (role: "lawyer", onboarding_completed: false)
    ↓
/register/step2 (Personal Information)
    ↓
    [Enter personal details]
    ↓
/register/step3 (NIN Verification)
    ↓
    [Verify NIN]
    ↓
/register/step4 (Professional Information)
    ↓
    [Enter bar number, credentials]
    ↓
/register/step5 (Practice Information)
    ↓
    [Enter practice details]
    ↓
/register/step7 (Review & Submit)
    ↓
    [Review and submit]
    ↓
/register/pending (Pending Approval)
    ↓
    [Admin approves]
    ↓
/dashboard (Lawyer Dashboard)
```

### 7.3 Redirect Logic Flow

```
User accesses /register directly
    ↓
Is authenticated?
    ├─ No → /auth/register?type=lawyer
    └─ Yes
        ↓
        Fetch registration status
        ↓
        Get route for status
        ↓
        Redirect to appropriate step
```

```
User accesses /onboarding
    ↓
Is authenticated?
    ├─ No → /login
    └─ Yes
        ↓
        Is onboarding_completed?
        ├─ Yes → /dashboard
        └─ No
            ↓
            Check role
            ├─ lawyer → /register/step2
            └─ user → /onboarding/client-location
```

---

## 8. Implementation Details

### 8.1 URL Search Parameters

**Usage:**
```typescript
// Setting search params
<Link to="/register" search={{ type: "lawyer" }}>
  Sign Up as Lawyer
</Link>

// Reading search params
const { type } = Route.useSearch();
```

**Validation:**
```typescript
validateSearch: (search: Record<string, unknown>): RegisterSearch => {
  return {
    type: search.type === "user" || search.type === "lawyer" 
      ? search.type 
      : undefined,
  };
}
```

### 8.2 Registration Status Management

**Backend Statuses:**
- `step1` - Account created (not used, handled by auth)
- `step2` - Personal information
- `step3` - NIN verification
- `step4` - Professional information
- `step5` - Practice information
- `step7` - Review & submit (step 6 document upload removed)
- `submitted` - Application submitted
- `approved` - Application approved
- `rejected` - Application rejected

**Status Updates:**
Each step component updates the status after successful submission:
```typescript
const response = await registrationAPI.savePersonalInfo(data);
// Backend updates registration_status to 'step2'
```

### 8.3 Route Protection

**All lawyer registration routes are protected:**
```typescript
export const Route = createFileRoute("/register/step2")({
  beforeLoad: async () => {
    await registrationRouteGuard(2);
  },
});
```

**Client onboarding routes use layout protection:**
```typescript
// In layout component
useEffect(() => {
  if (!isPending && session?.user?.role === "lawyer") {
    navigate({ to: "/register/step2", replace: true });
  }
}, [session, isPending, navigate]);
```

### 8.4 Navigation Methods

**Programmatic Navigation:**
```typescript
import { useNavigate } from "@tanstack/react-router";

const navigate = useNavigate();
navigate({ to: "/register/step3" });
```

**Redirect in beforeLoad:**
```typescript
import { redirect } from "@tanstack/react-router";

throw redirect({ to: "/dashboard" });
```

**Link Component:**
```typescript
<Link to="/register" search={{ type: "lawyer" }}>
  Sign Up
</Link>
```

### 8.5 Session Management

**Getting Session:**
```typescript
import { getSession } from "@/lib/auth-client";

const session = await getSession();
const user = session?.data?.user;
```

**Using Session Hook:**
```typescript
import { authClient } from "@/lib/auth-client";

const { data: session, isPending } = authClient.useSession();
const user = session?.user;
```

### 8.6 LocalStorage Usage

**Client Onboarding:**
```typescript
// Save data
localStorage.setItem('client-onboarding-data', JSON.stringify(data));

// Retrieve data
const savedData = localStorage.getItem('client-onboarding-data');

// Clear on sign out
localStorage.removeItem('client-onboarding-data');
```

---

## 9. Key Takeaways

### For Client Registration:
1. Start at `/register?type=user`
2. Create account → automatically navigate to `/onboarding/client-location`
3. Complete 2-step onboarding (location + specializations)
4. Redirect to `/dashboard`

### For Lawyer Registration:
1. Start at `/register?type=lawyer`
2. Create account → automatically navigate to `/register/step2`
3. Complete 5-step registration (personal → NIN → professional → practice → review)
4. Submit application → `/register/pending`
5. Wait for approval → `/dashboard`

### Route Protection:
- All `/onboarding/*` routes require authentication
- All `/register/step*` routes require authentication AND lawyer role
- Client routes redirect lawyers to `/register/step2`
- Lawyer routes redirect clients to `/dashboard`
- Completed onboarding redirects to `/dashboard`

### Status-Based Routing:
- System tracks registration progress via `registration_status` field
- Direct access to `/register` redirects to current step
- Cannot skip steps (enforced by route guards)
- Can go back to edit previous steps from review page

---

## 10. Common Scenarios

### Scenario 1: Client Signs Up
```
1. Visit homepage → Click "Sign Up as Client"
2. /register?type=user → Enter details
3. Account created → Auto-navigate to /onboarding/client-location
4. Select location → Auto-navigate to /onboarding/client-specializations
5. Select specializations → Auto-navigate to /dashboard
```

### Scenario 2: Lawyer Signs Up
```
1. Visit homepage → Click "Sign Up as Lawyer"
2. /register?type=lawyer → Enter details
3. Account created → Auto-navigate to /register/step2
4. Complete step 2 → Auto-navigate to /register/step3
5. Complete step 3 → Auto-navigate to /register/step4
6. Complete step 4 → Auto-navigate to /register/step5
7. Complete step 5 → Auto-navigate to /register/step7
8. Submit application → Auto-navigate to /register/pending
9. Wait for approval → Auto-redirect to /dashboard
```

### Scenario 3: Lawyer Tries to Access Client Onboarding
```
1. Lawyer navigates to /onboarding/client-location
2. Layout detects role === "lawyer"
3. Auto-redirect to /register/step2
```

### Scenario 4: Client Tries to Access Lawyer Registration
```
1. Client navigates to /register/step2
2. Route guard detects role !== "lawyer"
3. Auto-redirect to /dashboard
```

### Scenario 5: Lawyer Refreshes Page Mid-Registration
```
1. Lawyer is on /register/step4
2. Refreshes page
3. Route guard checks registration_status
4. Status is "step3" (completed step 3)
5. Can access step 4 (next step)
6. Page loads normally
```

### Scenario 6: Lawyer Tries to Skip Steps
```
1. Lawyer is on /register/step2 (status: "step2")
2. Manually navigates to /register/step5
3. Route guard checks registration_status
4. Status is "step2" (hasn't completed step 3 or 4)
5. Auto-redirect to /register/step3 (next required step)
```

---

## 11. File Reference

### Core Routing Files
- `src/routes/index.tsx` - Homepage with role selection
- `src/routes/(auth)/register.tsx` - Registration entry point
- `src/routes/(protected)/onboarding/index.tsx` - Onboarding router
- `src/routes/register/route.tsx` - Lawyer registration parent route

### Client Onboarding Files
- `src/routes/(protected)/onboarding/(client)/route.tsx` - Client layout
- `src/routes/(protected)/onboarding/(client)/client-location.tsx` - Step 1
- `src/routes/(protected)/onboarding/(client)/client-specializations.tsx` - Step 2

### Lawyer Registration Files
- `src/routes/register/step2.tsx` - Personal information
- `src/routes/register/step3.tsx` - NIN verification
- `src/routes/register/step4.tsx` - Professional information
- `src/routes/register/step5.tsx` - Practice information
- `src/routes/register/step7.tsx` - Review & submit
- `src/routes/register/pending.tsx` - Pending approval

### Component Files
- `src/components/auth/RegisterForm.tsx` - Account creation form
- `src/components/registration/PersonalInfoForm.tsx`
- `src/components/registration/NINVerificationForm.tsx`
- `src/components/registration/ProfessionalInfoForm.tsx`
- `src/components/registration/PracticeInfoForm.tsx`
- `src/components/registration/RegistrationSummary.tsx`
- `src/components/registration/PendingApprovalDashboard.tsx`

### Guard & Utility Files
- `src/lib/guards/registration-guards.ts` - Route guards and status logic
- `src/lib/api/registration.ts` - Registration API calls
- `src/lib/auth-client.ts` - Authentication utilities

---

## Conclusion

The registration and onboarding system uses a combination of:
- URL search parameters for initial role selection
- Session-based role detection for routing
- Status-based progress tracking for lawyers
- Route guards for access control
- Automatic redirects for seamless user experience

The system ensures users always land on the correct page based on their role, authentication status, and registration progress.
