# Migration Notes - Critical Changes

## ✅ Fixed Issues

### 1. UUID vs TEXT Type Mismatch
**Problem**: `onboarding_progress.user_id` was defined as `uuid` but `user.id` is `text`
**Solution**: Changed to `text` type to match the user table

### 2. Data Migration Added
**Problem**: Dropping columns would lose existing data
**Solution**: Added data migration step that:
- Maps old `registration_status` values to new `current_state`
- Builds `completed_steps` array based on progress
- Preserves timestamps and user associations

### 3. NIN Service Integration
**Problem**: NIN verification was mocked
**Solution**: Integrated actual Youverify API with:
- Proper error handling
- Timeout management (15s)
- Status code mapping
- Response validation

### 4. Removed Old Registration System
**Problem**: Two competing onboarding systems
**Solution**: 
- Removed `/api/register/*` routes from index.ts
- Kept `/api/lawyers/*` but deprecated onboarding endpoints
- All onboarding endpoints return 410 Gone with migration instructions

## 🔄 Migration SQL Changes

The migration now:

1. **Creates** `onboarding_progress` table with correct types
2. **Migrates** existing data from `lawyers` table
3. **Maps** old states to new states:
   - `step1` → `not_started`
   - `step2` → `personal_info`
   - `step3` → `nin_verification`
   - `step4` → `professional_info`
   - `step5` → `practice_info`
   - `step6` → `review`
   - `submitted` → `submitted`
   - `approved` → `approved`
   - `rejected` → `rejected`
4. **Drops** old columns (after data is migrated)
5. **Creates** new indices

## 📝 API Changes

### Removed Endpoints

All these now return `410 Gone`:

```
GET    /api/lawyers/onboarding/status
PATCH  /api/lawyers/onboarding/practice-info
PATCH  /api/lawyers/onboarding/documents
POST   /api/lawyers/onboarding/complete
POST   /api/lawyers/onboarding/verify-nin
DELETE /api/lawyers/onboarding/cleanup
GET    /api/lawyers/documents
POST   /api/lawyers/upload-document
DELETE /api/lawyers/documents/:id

POST   /api/register/step1
GET    /api/register/step2
POST   /api/register/step2
POST   /api/register/step3/verify-nin
POST   /api/register/step3/confirm
GET    /api/register/step4
POST   /api/register/step4
GET    /api/register/step5
POST   /api/register/step5
GET    /api/register/summary
POST   /api/register/submit
GET    /api/register/status
```

### New Endpoints

Use these instead:

```
GET    /api/onboarding/status
GET    /api/onboarding/summary
PUT    /api/onboarding/steps/personal-info
POST   /api/onboarding/nin/initiate
POST   /api/onboarding/nin/confirm
PUT    /api/onboarding/steps/professional-info
PUT    /api/onboarding/steps/practice-info
POST   /api/onboarding/submit
DELETE /api/onboarding
```

## 🚀 Running the Migration

### Step 1: Backup Database

```bash
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Run Migration

```bash
bun run db:push
```

This will:
- Show you the changes
- Ask for confirmation
- Migrate existing data
- Drop old columns
- Create new structure

### Step 3: Verify Migration

```bash
# Check onboarding_progress table exists
bun run db:studio

# Verify data was migrated
psql -d your_database -c "SELECT current_state, COUNT(*) FROM onboarding_progress GROUP BY current_state;"
```

### Step 4: Update Frontend

Replace all old API calls with new ones. The deprecated endpoints will return helpful error messages with the new endpoint URLs.

## ⚠️ Breaking Changes

### For Frontend

1. **Endpoint URLs changed** - All `/api/register/*` and `/api/lawyers/onboarding/*` moved to `/api/onboarding/*`
2. **HTTP methods changed** - Some `POST`/`PATCH` became `PUT` for idempotency
3. **Response format changed**:
   ```typescript
   // OLD
   { currentStep: number, registrationStatus: string }
   
   // NEW
   { currentState: string, stepNumber: number, completedSteps: string[] }
   ```

### For Backend

1. **Schema changes** - Multiple columns removed from `lawyers` table
2. **Service layer** - Use `OnboardingService` instead of `LawyerService`/`RegistrationService`
3. **State tracking** - Use `onboarding_progress` table instead of `lawyers.registration_status`

## 🧪 Testing After Migration

```bash
# Test new endpoints
curl http://localhost:3000/api/onboarding/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify old endpoints return 410
curl http://localhost:3000/api/register/status \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: { error: "...", newEndpoints: {...} }
```

## 📊 Data Preservation

The migration preserves:
- ✅ User associations
- ✅ Progress state
- ✅ Submission timestamps
- ✅ All data in separate tables (personal_info, professional_info, etc.)

The migration removes:
- ❌ Redundant fields from `lawyers` table (now in separate tables)
- ❌ Old enum types
- ❌ Unused indices

## 🔙 Rollback Plan

If you need to rollback:

1. Restore from backup:
   ```bash
   psql -d your_database < backup_YYYYMMDD.sql
   ```

2. Revert code changes:
   ```bash
   git revert HEAD
   ```

3. Keep old endpoints active temporarily by not removing them

## ✅ Success Criteria

Migration is successful when:

- [ ] `onboarding_progress` table exists
- [ ] All existing users have records in `onboarding_progress`
- [ ] Old columns removed from `lawyers` table
- [ ] New endpoints work correctly
- [ ] Old endpoints return 410 with helpful messages
- [ ] No errors in application logs
- [ ] Frontend can complete full onboarding flow

## 📞 Support

If you encounter issues:

1. Check application logs for errors
2. Verify database schema with `bun run db:studio`
3. Test endpoints with curl/Postman
4. Review this document for troubleshooting steps
5. Contact backend team if issues persist
