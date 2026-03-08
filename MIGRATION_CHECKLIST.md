# Onboarding Refactor - Migration Checklist

## ✅ Pre-Migration (Completed)

- [x] Create new `onboarding_progress` table schema
- [x] Create state machine logic
- [x] Create repository layer (data access)
- [x] Create service layer (business logic)
- [x] Create new API routes
- [x] Create error handling
- [x] Update schema exports
- [x] Create migration SQL file
- [x] Document changes

## 🔄 Migration Steps (To Do)

### 1. Database Migration

```bash
# Backup database first!
pg_dump your_database > backup_$(date +%Y%m%d).sql

# Run migration
cd src/db
bun run drizzle-kit push

# Or manually:
psql -d your_database -f migrations/0003_unified_onboarding.sql
```

### 2. Update Admin Dashboard

Files to update:
- `src/routes/admin.routes.ts` - Remove `registrationStatus` filters
- `src/services/admin.service.ts` - Update queries to use `onboarding_progress`
- `src/services/statistics.service.ts` - Keep `applicationStatus` queries (still works)

### 3. Update Frontend

Replace API endpoints:
```typescript
// OLD → NEW
/api/register/status → /api/onboarding/status
/api/register/step2 → /api/onboarding/steps/personal-info
/api/register/step3/verify-nin → /api/onboarding/nin/initiate
/api/register/step3/confirm → /api/onboarding/nin/confirm
/api/register/step4 → /api/onboarding/steps/professional-info
/api/register/step5 → /api/onboarding/steps/practice-info
/api/register/submit → /api/onboarding/submit
/api/register/summary → /api/onboarding/summary
```

Update response handling:
```typescript
// OLD
interface OldStatus {
  currentStep: number;
  registrationStatus: string;
  completedSteps: number[];
}

// NEW
interface NewStatus {
  currentState: 'personal_info' | 'nin_verification' | ...;
  completedSteps: string[];
  stepNumber: number;
  startedAt: string;
  lastActivityAt: string;
}
```

### 4. Remove Old Code (After Frontend Migration)

Once frontend is fully migrated:

```bash
# Remove old services
rm src/services/lawyer.service.ts
rm src/services/registration.service.ts

# Remove old routes
rm src/routes/registration.routes.ts
rm src/routes/lawyers.routes.ts  # Or refactor to remove onboarding endpoints

# Remove old validators (if not used elsewhere)
# Check usage first!
```

### 5. Testing

```bash
# Run tests
bun test

# Test each endpoint manually
curl -X GET http://localhost:3000/api/onboarding/status \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X PUT http://localhost:3000/api/onboarding/steps/personal-info \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe",...}'
```

### 6. Monitor & Rollback Plan

Monitor for errors:
```bash
# Check logs for errors
tail -f logs/app.log | grep "OnboardingError"

# Check database for stuck states
psql -d your_database -c "
  SELECT current_state, COUNT(*) 
  FROM onboarding_progress 
  GROUP BY current_state;
"
```

If issues arise:
1. Keep old `/api/register/*` routes active
2. Add feature flag to switch between systems
3. Restore from backup if needed

## 📋 Verification Checklist

After migration, verify:

- [ ] Users can start new onboarding
- [ ] Users can resume incomplete onboarding
- [ ] NIN verification works (both phases)
- [ ] Bar number uniqueness validation works
- [ ] Practice areas validation (1-5) works
- [ ] Submit button only enabled when all steps complete
- [ ] Admin can approve/reject applications
- [ ] Email notifications sent (if implemented)
- [ ] Dashboard statistics still work
- [ ] No TypeScript errors
- [ ] No runtime errors in logs

## 🚨 Breaking Changes

### For Frontend Developers

1. **State field renamed**: `registrationStatus` → `currentState`
2. **Step tracking changed**: `currentStep: number` → `stepNumber: number` + `currentState: string`
3. **Completed steps format**: `number[]` → `string[]`
4. **API endpoints changed**: `/api/register/*` → `/api/onboarding/*`
5. **HTTP methods changed**: Some `POST` → `PUT` for idempotency

### For Backend Developers

1. **Schema changes**: Multiple fields removed from `lawyers` table
2. **New table**: `onboarding_progress` must exist
3. **Enum changes**: `onboardingStepEnum` and `registrationStatusEnum` removed
4. **Service layer**: Use `OnboardingService` instead of `LawyerService`/`RegistrationService`

## 📞 Support

If you encounter issues:

1. Check `ONBOARDING_REFACTOR.md` for detailed documentation
2. Review code comments in service files
3. Check error logs for `OnboardingError` messages
4. Contact backend team for assistance

## 🎯 Success Criteria

Migration is successful when:

- [ ] All new users complete onboarding via new system
- [ ] No errors in production logs related to onboarding
- [ ] Admin dashboard shows correct statistics
- [ ] Old routes can be safely removed
- [ ] Frontend team confirms everything works
- [ ] QA team signs off on testing
