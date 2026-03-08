# Onboarding Refactor - State Machine Implementation

## Overview

This refactor consolidates the two separate onboarding systems into a single, unified state machine-based approach.

## What Changed

### Before (Problems)
- **Two separate systems**: `LawyerService` (3-step) and `RegistrationService` (7-step)
- **Scattered state tracking**: `onboardingStep`, `registrationStatus`, `applicationStatus` fields
- **Data fragmentation**: Lawyer data spread across multiple tables without clear ownership
- **Inconsistent validation**: Step validation logic duplicated across services
- **Hard to maintain**: Changes required updates in multiple places

### After (Solutions)
- **Single unified system**: One `OnboardingService` with clear state machine
- **Centralized state**: `onboarding_progress` table as single source of truth
- **Clear separation**: Repository (DB) → Service (logic) → Routes (API)
- **State machine pattern**: Explicit state transitions with validation
- **Easy to extend**: Add new steps by updating state machine config

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     State Machine                            │
│  not_started → personal_info → nin_verification →           │
│  professional_info → practice_info → review → submitted     │
│                                                    ↓         │
│                                          approved  rejected  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   OnboardingService                          │
│  - Validates state transitions                               │
│  - Enforces business rules                                   │
│  - Coordinates data persistence                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 OnboardingRepository                         │
│  - Pure data access layer                                    │
│  - No business logic                                         │
│  - Handles all DB operations                                 │
└─────────────────────────────────────────────────────────────┘
```

## New File Structure

```
src/
├── db/schema/
│   └── onboarding-progress.ts          # New progress tracking table
├── errors/
│   └── onboarding-error.ts             # Centralized error handling
├── repositories/
│   └── onboarding.repository.ts        # Data access layer
├── services/onboarding/
│   ├── state-machine.ts                # State transition logic
│   └── onboarding.service.ts           # Business logic
└── routes/
    └── onboarding.routes.ts            # API endpoints
```

## Database Changes

### New Table: `onboarding_progress`
```sql
CREATE TABLE onboarding_progress (
  user_id uuid PRIMARY KEY,
  current_state varchar(50) NOT NULL DEFAULT 'not_started',
  completed_steps jsonb NOT NULL DEFAULT '[]',
  started_at timestamp NOT NULL,
  last_activity_at timestamp NOT NULL,
  submitted_at timestamp,
  reviewed_at timestamp,
  reviewed_by uuid,
  review_notes varchar(1000)
);
```

### Removed from `lawyers` table:
- `onboarding_step` (replaced by `onboarding_progress.current_state`)
- `registration_status` (replaced by `onboarding_progress.current_state`)
- `phone_number` (moved to `lawyerPersonalInfo` or removed)
- `country`, `state` (moved to `lawyerPracticeInfo`)
- `years_of_experience` (moved to `lawyerPracticeInfo`)
- `bar_license_number`, `bar_association`, `license_status` (moved to `lawyerProfessionalInfo`)
- `experience_description` (removed, can be added to `lawyerPracticeInfo` if needed)

### Kept in `lawyers` table:
- `application_status` (needed for admin dashboard and statistics)
- `nin_verified`, `nin_verified_at` (quick lookup for verification status)
- `reviewed_by`, `reviewed_at`, `review_notes` (admin review tracking)
- `submitted_at` (application submission timestamp)

## API Changes

### New Endpoints (Recommended)

```
GET    /api/onboarding/status              # Get current progress
GET    /api/onboarding/summary             # Get all saved data
PUT    /api/onboarding/steps/personal-info # Save step 1
POST   /api/onboarding/nin/initiate        # Start NIN verification
POST   /api/onboarding/nin/confirm         # Confirm NIN
PUT    /api/onboarding/steps/professional-info # Save step 3
PUT    /api/onboarding/steps/practice-info # Save step 4
POST   /api/onboarding/submit              # Submit for review
DELETE /api/onboarding                     # Cleanup/restart
```

### Old Endpoints (Deprecated)

```
/api/register/*                            # Old 7-step flow
/api/lawyers/onboarding/*                  # Old 3-step flow
```

## Migration Steps

### 1. Run Database Migration

```bash
# Apply the migration
bun run drizzle-kit push

# Or manually run the SQL
psql -d your_database -f src/db/migrations/0003_unified_onboarding.sql
```

### 2. Update Frontend

Replace old API calls:

```typescript
// OLD
POST /api/register/step2
POST /api/register/step3/verify-nin
POST /api/register/step4

// NEW
PUT /api/onboarding/steps/personal-info
POST /api/onboarding/nin/initiate
PUT /api/onboarding/steps/professional-info
```

### 3. Update State Handling

```typescript
// OLD
const { registrationStatus, currentStep } = response.data;

// NEW
const { currentState, completedSteps, stepNumber } = response.data;
```

## State Machine Details

### States
- `not_started`: Initial state, no progress yet
- `personal_info`: Collecting name, DOB, gender, location
- `nin_verification`: Two-phase NIN verification with Youverify
- `professional_info`: Bar credentials and education
- `practice_info`: Firm details and specializations
- `review`: User reviews all data before submission
- `submitted`: Application submitted, awaiting admin review
- `approved`: Admin approved the application
- `rejected`: Admin rejected the application

### Transitions
- `START`: not_started → personal_info
- `NEXT`: Advance to next step (after saving current step)
- `BACK`: Return to previous step (only from nin_verification onwards)
- `SUBMIT`: review → submitted
- `APPROVE`: submitted → approved (admin only)
- `REJECT`: submitted → rejected (admin only)
- `RESTART`: rejected → personal_info (allow resubmission)

### Validation Rules
1. Must be on correct state to save step data
2. Cannot skip steps (enforced by state machine)
3. Cannot submit until all steps complete
4. Cannot modify after submission (unless rejected)

## Benefits

### For Developers
- **Single source of truth**: One place to check onboarding state
- **Type safety**: TypeScript enums for states and events
- **Easy testing**: Pure functions for state transitions
- **Clear boundaries**: Repository, service, and route layers
- **Extensible**: Add new steps by updating state machine config

### For Users
- **Consistent experience**: Same flow for all users
- **Resume capability**: Pick up where they left off
- **Clear progress**: Know exactly which step they're on
- **Validation feedback**: Immediate feedback on errors

### For Admins
- **Better tracking**: See exactly where users get stuck
- **Audit trail**: Complete history of state changes
- **Easy reporting**: Query by state for analytics

## Testing

```typescript
// Test state transitions
import { getNextState } from '@/services/onboarding/state-machine';

expect(getNextState('personal_info', 'NEXT')).toBe('nin_verification');
expect(() => getNextState('personal_info', 'SUBMIT')).toThrow();

// Test service logic
const service = new OnboardingService(mockRepo);
await service.savePersonalInfo(userId, validData);
const status = await service.getStatus(userId);
expect(status.currentState).toBe('nin_verification');
```

## Rollback Plan

If issues arise:

1. Keep old routes active during transition period
2. Feature flag to switch between old and new systems
3. Database migration is reversible (keep old columns temporarily)
4. Can run both systems in parallel during migration

## Future Enhancements

- [ ] Add event bus for email notifications
- [ ] Add analytics tracking for each state transition
- [ ] Add time-based reminders for incomplete onboarding
- [ ] Add admin dashboard for onboarding analytics
- [ ] Add A/B testing for different onboarding flows
- [ ] Add document upload step (currently removed)
- [ ] Add video verification step (future requirement)

## Questions?

Contact the development team or check the code comments in:
- `src/services/onboarding/state-machine.ts` - State machine logic
- `src/services/onboarding/onboarding.service.ts` - Business logic
- `src/repositories/onboarding.repository.ts` - Data access
