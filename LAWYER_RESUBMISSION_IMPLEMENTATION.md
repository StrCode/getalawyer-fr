# Lawyer Resubmission Implementation

## Overview
Implementation of the lawyer resubmission flow for rejected applications. This allows rejected lawyers to fix issues and resubmit their applications.

## Files Created

### 1. Pages
- **`app/pages/onboarding/lawyer/rejected.vue`** - Rejection page showing feedback and restart option
  - Displays rejection reason and detailed feedback
  - Shows "Fix and Resubmit" button
  - Provides help and support links
  - Handles restart flow

### 2. Components
- **`app/components/onboarding/RejectionFeedback.vue`** - Feedback banner component
  - Shows previous rejection feedback during onboarding
  - Highlights issues that need to be addressed
  - Can be used in any onboarding step

### 3. Composables
- **`app/composables/useOnboardingRestart.ts`** - Restart functionality
  - `useRestartApplication()` mutation for restarting applications
  - Handles API calls to restart endpoint
  - Invalidates relevant queries

### 4. Updates
- **`app/components/LawyerDashboard.vue`** - Added rejection detection
  - Checks application status on load
  - Redirects to rejection page if status is 'rejected'
  - Prevents access to dashboard features

## Features Implemented

### Rejection Page
✅ Status banner showing rejection
✅ Display rejection reason and feedback
✅ "Fix and Resubmit" button
✅ Help and support section
✅ Loading and error states
✅ Date formatting for review timestamp

### Dashboard Integration
✅ Automatic redirect for rejected lawyers
✅ Status checking on dashboard load
✅ Prevents access to dashboard features when rejected

### Resubmission Flow
✅ Restart button triggers API call
✅ Success notification
✅ Redirect to first onboarding step
✅ Error handling with user feedback

## User Flow

### 1. Lawyer Gets Rejected
```
Admin rejects application
  ↓
Lawyer logs in
  ↓
Dashboard detects rejected status
  ↓
Redirects to /onboarding/lawyer/rejected
```

### 2. Lawyer Views Rejection
```
Rejection page shows:
- Status banner (red)
- Detailed feedback from admin
- Review date
- Instructions on what to do next
- "Fix and Resubmit" button
```

### 3. Lawyer Restarts Application
```
Click "Fix and Resubmit"
  ↓
POST /api/onboarding/restart
  ↓
Success notification
  ↓
Redirect to /onboarding/lawyer/personal-information
```

### 4. Lawyer Updates Information
```
Go through onboarding steps:
- Personal Information
- NIN Verification (if needed)
- Professional Information (update documents)
- Practice Information
- Review & Submit
```

### 5. Lawyer Resubmits
```
Submit application
  ↓
Status changes: rejected → pending
  ↓
Admin reviews again
```

## Backend Requirements

### API Endpoint Needed
```typescript
POST /api/onboarding/restart

Request:
- Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Application restarted. You can now update your information.",
  "nextState": "personal_info"
}

Errors:
- 400: Can only restart rejected applications
- 401: Unauthorized
- 500: Server error
```

### Backend Logic Required
```typescript
// In onboarding service
async restart(userId: string) {
  // 1. Get current progress
  const progress = await this.repo.getProgress(userId);
  
  // 2. Verify state is 'rejected'
  if (progress.currentState !== 'rejected') {
    throw new Error('Can only restart rejected applications');
  }
  
  // 3. Update state to 'personal_info'
  await this.repo.updateProgress(userId, {
    currentState: 'personal_info',
    // Keep review_notes for history
    // Keep reviewed_by for history
    // Keep reviewed_at for history
  });
  
  // 4. Return success
  return {
    success: true,
    message: 'Application restarted',
    nextState: 'personal_info'
  };
}
```

### Database State Changes
```sql
-- Before restart (rejected state)
onboarding_progress:
  current_state = 'rejected'
  review_notes = 'Reason: ...\n\nFeedback: ...'
  reviewed_by = 'admin-id'
  reviewed_at = '2025-02-07T10:00:00Z'

lawyers:
  application_status = 'rejected'

-- After restart
onboarding_progress:
  current_state = 'personal_info'
  review_notes = 'Reason: ...' (preserved)
  reviewed_by = 'admin-id' (preserved)
  reviewed_at = '2025-02-07T10:00:00Z' (preserved)

lawyers:
  application_status = 'rejected' (stays until resubmit)

-- After resubmit
onboarding_progress:
  current_state = 'submitted'
  submitted_at = '2025-02-08T14:00:00Z'

lawyers:
  application_status = 'pending'
  submitted_at = '2025-02-08T14:00:00Z'
```

## Integration Points

### 1. Onboarding Steps
To show rejection feedback in onboarding steps, add:

```vue
<template>
  <div>
    <!-- Add this at the top of each onboarding step -->
    <RejectionFeedback :feedback="previousRejectionFeedback" />
    
    <!-- Rest of the form -->
  </div>
</template>

<script setup>
import RejectionFeedback from '~/components/onboarding/RejectionFeedback.vue'

// Fetch previous rejection feedback
const previousRejectionFeedback = ref(null)

onMounted(async () => {
  // TODO: Fetch from API
  // const response = await fetch('/api/onboarding/status')
  // previousRejectionFeedback.value = response.data.reviewNotes
})
</script>
```

### 2. Auth Middleware
The auth middleware should allow access to rejection page:

```typescript
// In auth.ts middleware
if (userType === 'lawyer') {
  const applicationStatus = (user as any).applicationStatus
  
  if (applicationStatus === 'rejected') {
    // Allow access to rejection page and onboarding
    if (!to.path.startsWith('/onboarding/lawyer')) {
      return navigateTo('/onboarding/lawyer/rejected', { replace: true })
    }
  }
}
```

### 3. Session Data
Ensure the session includes `applicationStatus`:

```typescript
// In auth-client.ts or session handler
inferAdditionalFields({
  user: {
    userType: { type: "string" },
    role: { type: "string", required: false },
    onboarding_completed: { type: "boolean" },
    applicationStatus: { type: "string", required: false } // Add this
  }
})
```

## Testing Checklist

### Frontend Testing
- [ ] Rejected lawyer sees rejection page on login
- [ ] Rejection page displays feedback correctly
- [ ] "Fix and Resubmit" button works
- [ ] Redirect to onboarding works
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Help links are functional

### Backend Testing (When Implemented)
- [ ] POST /api/onboarding/restart works
- [ ] Only rejected applications can restart
- [ ] State changes from rejected → personal_info
- [ ] Review notes are preserved
- [ ] Resubmit changes status to pending
- [ ] Multiple restart cycles work
- [ ] Approved lawyers cannot restart

### Integration Testing
- [ ] Full flow: reject → restart → update → resubmit
- [ ] Dashboard redirect works
- [ ] Onboarding steps accessible after restart
- [ ] Previous data is preserved
- [ ] Admin can see resubmitted application

## UI/UX Considerations

### Rejection Page
- Clear status indicator (red banner with icon)
- Detailed feedback in readable format
- Step-by-step instructions
- Prominent action button
- Help and support access

### During Onboarding
- Show previous feedback as reminder
- Highlight fields that need attention
- Preserve previously entered data
- Clear progress indication

### Notifications
- Success message on restart
- Error messages if restart fails
- Confirmation before leaving page

## Next Steps

### Immediate
1. Implement backend `/api/onboarding/restart` endpoint
2. Add `applicationStatus` to session data
3. Update auth middleware for rejection handling
4. Test the complete flow

### Future Enhancements
1. Email notification when application is rejected
2. Track number of resubmissions
3. Admin notes history view
4. Highlight specific fields that need updates
5. Allow partial saves during resubmission
6. Add resubmission deadline (e.g., 30 days)

## Notes
- All previous data is preserved for audit purposes
- Review notes are kept for history
- Lawyers can restart multiple times if needed
- Status only changes to 'pending' after resubmit, not on restart
- Dashboard access is blocked until application is approved
