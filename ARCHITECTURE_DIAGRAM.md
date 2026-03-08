# Architecture Diagram - Unified Onboarding

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React/Next.js)                 │
│  - Onboarding wizard UI                                          │
│  - Step-by-step forms                                            │
│  - Progress indicator                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Hono)                            │
│  /api/onboarding/*                                               │
│  - Authentication middleware                                     │
│  - Request validation (Zod)                                      │
│  - Error handling                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Service Layer (Business Logic)                 │
│  OnboardingService                                               │
│  - State validation                                              │
│  - Business rules                                                │
│  - Transaction coordination                                      │
└────────────┬───────────────────────────┬────────────────────────┘
             │                           │
             ↓                           ↓
┌────────────────────────┐   ┌──────────────────────────────────┐
│   State Machine        │   │   Repository Layer (Data Access) │
│  - State transitions   │   │  - Database queries              │
│  - Validation rules    │   │  - No business logic             │
│  - Pure functions      │   │  - Transaction support           │
└────────────────────────┘   └──────────┬───────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                       │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ onboarding_      │  │ lawyers          │                    │
│  │ progress         │  │ - id             │                    │
│  │ - user_id (PK)   │  │ - user_id        │                    │
│  │ - current_state  │  │ - app_status     │                    │
│  │ - completed_steps│  │ - nin_verified   │                    │
│  │ - timestamps     │  │ - timestamps     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ lawyer_personal_ │  │ lawyer_nin_      │                    │
│  │ info             │  │ verification     │                    │
│  │ - lawyer_id      │  │ - lawyer_id      │                    │
│  │ - first_name     │  │ - nin            │                    │
│  │ - last_name      │  │ - verified       │                    │
│  │ - dob, gender    │  │ - verified_at    │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ lawyer_          │  │ lawyer_practice_ │                    │
│  │ professional_    │  │ info             │                    │
│  │ info             │  │ - lawyer_id      │                    │
│  │ - lawyer_id      │  │ - firm_name      │                    │
│  │ - bar_number     │  │ - office_address │                    │
│  │ - year_of_call   │  │ - states         │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## State Machine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      State Machine                               │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ not_started  │ ← Initial state
    └──────┬───────┘
           │ START
           ↓
    ┌──────────────┐
    │ personal_    │ ← Step 1: Name, DOB, Gender, Location
    │ info         │
    └──────┬───────┘
           │ NEXT
           ↓
    ┌──────────────┐
    │ nin_         │ ← Step 2: Two-phase NIN verification
    │ verification │   Phase 1: API call → photo
    └──────┬───────┘   Phase 2: User confirms
           │ NEXT
           ↓
    ┌──────────────┐
    │ professional_│ ← Step 3: Bar credentials, education
    │ info         │
    └──────┬───────┘
           │ NEXT
           ↓
    ┌──────────────┐
    │ practice_    │ ← Step 4: Firm, specializations, office
    │ info         │
    └──────┬───────┘
           │ NEXT
           ↓
    ┌──────────────┐
    │ review       │ ← Step 5: Review all data
    └──────┬───────┘
           │ SUBMIT
           ↓
    ┌──────────────┐
    │ submitted    │ ← Awaiting admin review
    └──────┬───────┘
           │ APPROVE / REJECT
           ↓
    ┌──────────────┐     ┌──────────────┐
    │ approved     │     │ rejected     │
    └──────────────┘     └──────┬───────┘
                                │ RESTART
                                └─────────┐
                                          ↓
                                   (back to personal_info)
```

## Request Flow Example

### Saving Personal Info

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ PUT /api/onboarding/steps/personal-info
       │ { firstName, lastName, ... }
       ↓
┌─────────────────────────────────────────────┐
│  Routes (onboarding.routes.ts)              │
│  - authMiddleware (verify JWT)              │
│  - personalInfoValidator (validate input)   │
└──────┬──────────────────────────────────────┘
       │ service.savePersonalInfo(userId, data)
       ↓
┌─────────────────────────────────────────────┐
│  Service (onboarding.service.ts)            │
│  1. Get current progress                    │
│  2. Validate state = 'personal_info'        │
│  3. Start transaction                       │
│  4. Save data via repository                │
│  5. Advance state to 'nin_verification'     │
│  6. Commit transaction                      │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│  Repository (onboarding.repository.ts)      │
│  - upsertPersonalInfo(lawyerId, data)       │
│  - updateProgress(userId, { state, steps }) │
└──────┬──────────────────────────────────────┘
       │ SQL queries
       ↓
┌─────────────────────────────────────────────┐
│  Database (PostgreSQL)                      │
│  - INSERT/UPDATE lawyer_personal_info       │
│  - UPDATE onboarding_progress               │
└──────┬──────────────────────────────────────┘
       │ Success
       ↓
┌─────────────┐
│  Frontend   │ ← { success: true, message: "..." }
└─────────────┘
```

## Data Flow

### Onboarding Progress Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│  onboarding_progress (Single Source of Truth)                   │
├─────────────────────────────────────────────────────────────────┤
│  user_id: "uuid-123"                                            │
│  current_state: "professional_info"                             │
│  completed_steps: ["personal_info", "nin_verification"]         │
│  started_at: "2024-01-01T10:00:00Z"                            │
│  last_activity_at: "2024-01-01T10:15:00Z"                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ References
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  lawyers (Core Identity)                                        │
├─────────────────────────────────────────────────────────────────┤
│  id: "lawyer-456"                                               │
│  user_id: "uuid-123"                                            │
│  application_status: "pending"                                  │
│  nin_verified: true                                             │
│  submitted_at: null                                             │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Has Many
                           ↓
┌──────────────────────┐  ┌──────────────────────┐
│ lawyer_personal_info │  │ lawyer_nin_          │
│ - first_name: "John" │  │ verification         │
│ - last_name: "Doe"   │  │ - nin: "12345..."    │
│ - dob: "1990-01-01"  │  │ - verified: true     │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ lawyer_professional_ │  │ lawyer_practice_info │
│ info                 │  │ - firm_name: "..."   │
│ - bar_number: "..."  │  │ - office_address     │
│ - year_of_call: 2015 │  │ - states: [...]      │
└──────────────────────┘  └──────────────────────┘
```

## Error Handling Flow

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ PUT /api/onboarding/steps/professional-info
       │ (but user is on personal_info step)
       ↓
┌─────────────────────────────────────────────┐
│  Service                                    │
│  - Check current state                      │
│  - State = 'personal_info'                  │
│  - Expected = 'professional_info'           │
│  - Throw OnboardingError.wrongStep()        │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│  Routes (Error Handler)                     │
│  - Catch OnboardingError                    │
│  - Extract statusCode (403)                 │
│  - Return JSON error response               │
└──────┬──────────────────────────────────────┘
       │
       ↓
┌─────────────┐
│  Frontend   │ ← {
└─────────────┘     error: "Cannot save...",
                    code: "WRONG_STEP",
                    current: "personal_info",
                    attempted: "professional_info"
                  }
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Production                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   API Server │────▶│   Database   │
│  (Vercel)    │     │  (Railway)   │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ↓
                     ┌──────────────┐
                     │  External    │
                     │  Services    │
                     │  - Youverify │
                     │  - Cloudinary│
                     │  - Email     │
                     └──────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Network (HTTPS, CORS)                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication (JWT, Better Auth)                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Authorization (User can only access own data)         │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: Input Validation (Zod schemas)                        │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Business Logic (State machine validation)             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  Layer 6: Database (Constraints, foreign keys)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│  Optimization Strategies                                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Database Indices                                            │
│     - idx_onboarding_progress_current_state                     │
│     - idx_lawyers_application_status                            │
│     - idx_lawyers_user_id                                       │
│                                                                  │
│  2. Query Optimization                                          │
│     - Use transactions for multi-table updates                  │
│     - Batch queries where possible                              │
│     - Limit result sets                                         │
│                                                                  │
│  3. Caching (Future)                                            │
│     - Cache user progress in Redis                              │
│     - Cache specializations list                                │
│     - Cache validation rules                                    │
│                                                                  │
│  4. API Design                                                  │
│     - Use PUT for idempotency                                   │
│     - Return minimal data                                       │
│     - Paginate large result sets                                │
└─────────────────────────────────────────────────────────────────┘
```

---

**Legend**:
- `→` HTTP request
- `↓` Function call / Data flow
- `┌─┐` Component boundary
- `├─┤` Section divider
