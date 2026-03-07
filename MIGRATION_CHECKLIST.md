# API Migration Checklist

## ✅ Phase 1: Setup (COMPLETE)

- [x] Verify `@tanstack/vue-query` is installed (v5.62.7)
- [x] Verify query client is configured
- [x] Verify plugin is set up

## ✅ Phase 2: Constants (COMPLETE)

- [x] Create `app/constants/nigeria-states-lgas.ts`
- [x] Create `app/constants/registration.ts`
- [x] Add helper functions for states/LGAs

## ✅ Phase 3: Types (COMPLETE)

- [x] Create `app/types/availability.ts`
- [x] Create `app/types/booking.ts`
- [x] Create `app/types/registration.ts`
- [x] Update `app/types/index.ts` to export new types

## ✅ Phase 4: Composables (COMPLETE)

- [x] Create `app/composables/useAvailability.ts`
  - [x] Queries: schedule, exceptions, available slots
  - [x] Mutations: update schedule, create/delete exceptions
  - [x] Optimistic updates
- [x] Create `app/composables/useBookings.ts`
  - [x] Client queries and mutations
  - [x] Lawyer queries and mutations
  - [x] Optimistic updates
- [x] Create `app/composables/useRegistration.ts`
  - [x] All step queries (2, 4, 5, 7)
  - [x] All step mutations
  - [x] NIN verification workflow
  - [x] Status tracking

## 🔄 Phase 5: Integration (COMPLETE ✅)

### Registration Pages

- [x] Update `app/pages/register/step2.vue`
  - [x] Replace `useFetch` with `usePersonalInfo()`
  - [x] Replace manual submit with `useSavePersonalInfo()`
  - [x] Use constants for states/LGAs
  - [x] Test form submission
  
- [x] Update `app/pages/register/step3.vue`
  - [x] Replace manual API calls with `useVerifyNIN()`
  - [x] Replace manual API calls with `useConfirmNIN()`
  - [x] Test NIN verification flow
  
- [x] Update `app/pages/register/step4.vue`
  - [x] Replace `useFetch` with `useProfessionalInfo()`
  - [x] Replace manual submit with `useSaveProfessionalInfo()`
  - [x] Use constants for law schools
  - [x] Test form submission
  
- [x] Update `app/pages/register/step5.vue`
  - [x] Replace `useFetch` with `usePracticeInfo()`
  - [x] Replace manual submit with `useSavePracticeInfo()`
  - [x] Use constants for practice types
  - [x] Test form submission
  
- [x] Update `app/pages/register/step7.vue`
  - [x] Replace `useFetch` with `useRegistrationSummary()`
  - [x] Replace manual submit with `useSubmitApplication()`
  - [x] Test application submission

### Dashboard Components

- [x] Update `app/components/LawyerDashboard.vue`
  - [x] Use `useLawyerBookings()` for bookings
  - [x] Use `useAvailabilitySchedule()` for schedule
  - [x] Test booking management
  
- [x] Update `app/components/ClientDashboard.vue`
  - [x] Use `useClientBookings()` for bookings
  - [x] Test booking display

### Client Onboarding

- [x] Update `app/pages/onboarding/client/location.vue`
  - [x] Use `useCountries()` query instead of `useFetch`
  - [x] Test location selection
  
- [x] Update `app/pages/onboarding/client/specializations.vue`
  - [x] Use `useSpecializations()` query instead of `useFetch`
  - [x] Use `useCompleteOnboarding()` mutation
  - [x] Remove manual `isSubmitting` state
  - [x] Test specialization selection

## 📋 Phase 6: Testing

### Unit Tests
- [ ] Test `useAvailability` composable
- [ ] Test `useBookings` composable
- [ ] Test `useRegistration` composable
- [ ] Test constants helper functions

### Integration Tests
- [ ] Test complete registration flow
- [ ] Test booking creation flow
- [ ] Test availability management flow
- [ ] Test error handling
- [ ] Test optimistic updates

### E2E Tests
- [ ] Test lawyer registration journey
- [ ] Test client onboarding journey
- [ ] Test booking journey
- [ ] Test availability management journey

## 🔧 Phase 7: Optional Enhancements

- [ ] Install `@tanstack/vue-query-devtools`
- [ ] Add DevTools to layout
- [ ] Create additional composables:
  - [ ] `useCalendar` for calendar integration
  - [ ] `useConsultationTypes` for consultation type management
  - [ ] Enhanced `useLawyers` for search/filtering
- [ ] Add query prefetching on hover
- [ ] Add infinite scroll for lists
- [ ] Add suspense mode for loading states

## 📚 Phase 8: Documentation

- [x] Create API migration summary
- [x] Create integration examples
- [x] Create migration checklist
- [ ] Update developer documentation
- [ ] Add inline code comments
- [ ] Create troubleshooting guide

## 🚀 Phase 9: Deployment

- [ ] Test on staging environment
- [ ] Monitor query performance
- [ ] Check cache hit rates
- [ ] Verify error handling
- [ ] Deploy to production
- [ ] Monitor production metrics

## Common Issues & Solutions

### Issue: Query not refetching
**Solution:** Check `staleTime` and `gcTime` settings in query client

### Issue: Mutation not invalidating cache
**Solution:** Verify query keys match between query and invalidation

### Issue: Optimistic update not rolling back
**Solution:** Check `onError` handler and context return value

### Issue: Type errors with query data
**Solution:** Ensure API response types match expected types

### Issue: Loading state not updating
**Solution:** Use `.value` to access reactive refs in Vue 3

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/vue/overview)
- [Vue Query DevTools](https://tanstack.com/query/latest/docs/vue/devtools)
- [Query Key Patterns](https://tkdodo.eu/blog/effective-react-query-keys)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/vue/guides/optimistic-updates)

## Notes

- All composables follow the same pattern for consistency
- Query keys are centralized in `app/lib/query-client.ts`
- Error handling uses existing `ApiError` class
- Optimistic updates are used for better UX where appropriate
- All mutations automatically invalidate related queries

## Success Criteria

- [ ] All registration pages use new composables
- [ ] All dashboard components use new composables
- [ ] No manual loading state management
- [ ] No manual error state management
- [ ] All queries properly cached
- [ ] All mutations properly invalidate cache
- [ ] Optimistic updates work correctly
- [ ] Error handling works correctly
- [ ] Type safety maintained throughout
- [ ] Performance improved or maintained
