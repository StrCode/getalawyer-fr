# Consultation Types Implementation

## Overview
This implementation provides a complete consultation types management system for lawyers, allowing them to create, edit, and manage the services they offer to clients.

## Features Implemented

### 1. API Client Integration
All consultation types endpoints are integrated through the existing API client pattern in `app/lib/api/index.ts`:

- `api.consultationTypes.getAll(includeInactive?)` - List all consultation types
- `api.consultationTypes.getById(id)` - Get single consultation type
- `api.consultationTypes.create(data)` - Create new consultation type
- `api.consultationTypes.update(id, data)` - Update consultation type
- `api.consultationTypes.delete(id)` - Delete consultation type
- `api.consultationTypes.activate(id)` - Activate consultation type
- `api.consultationTypes.deactivate(id)` - Deactivate consultation type

All endpoints:
- Use the httpClient from `app/lib/api/client.ts`
- Include credentials automatically
- Handle errors through the ApiError class
- Support retry logic with exponential backoff

### 2. Type Definitions
Located in `app/types/booking.ts`:

```typescript
export type MeetingType = 'video' | 'phone' | 'in_person' | 'any';

export interface ConsultationType {
  id: string;
  lawyerId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string; // Decimal as string
  currency: string;
  meetingType: MeetingType;
  officeAddress: string | null;
  defaultMeetingLink: string | null;
  bufferMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Composable
Located in `app/composables/useConsultationTypes.ts`:

Uses the API client from `app/lib/api/index.ts` and provides hooks for:
- `useConsultationTypesList(includeInactive)` - Fetch all consultation types
- `useConsultationType(id)` - Fetch single consultation type
- `useCreateConsultationType()` - Create mutation
- `useUpdateConsultationType()` - Update mutation
- `useDeleteConsultationType()` - Delete mutation
- `useActivateConsultationType()` - Activate mutation
- `useDeactivateConsultationType()` - Deactivate mutation

Uses TanStack Query for caching and state management.
All API calls go through the centralized httpClient with automatic credential handling.

### 4. UI Components

#### Main Page: `app/pages/dashboard/consultation-types/index.vue`
Features:
- Grid view of all consultation types
- Toggle to show/hide inactive types
- Create new consultation type button
- Edit, activate/deactivate, and delete actions
- Empty state when no consultation types exist
- Loading states
- Toast notifications for all actions

#### Modal Component: `app/components/ConsultationTypeModal.vue`
Features:
- Create and edit modes
- Form validation
- Conditional fields based on meeting type:
  - Office address (required for in-person)
  - Default meeting link (optional for video)
- Duration and buffer time dropdowns
- Price and currency inputs
- Active/inactive toggle
- Error handling and validation

#### Dashboard Card: `app/components/dashboard/ConsultationTypesCard.vue`
Features:
- Shows count of active consultation types
- Lists up to 3 consultation types
- Quick link to full management page
- Loading state

### 5. Navigation Updates

#### Dashboard Layout (`app/layouts/dashboard.vue`)
Added "Consultation Types" menu item to lawyer navigation with:
- Icon: `i-hugeicons-notebook`
- Route: `/dashboard/consultation-types`
- Active state tracking

#### Lawyer Dashboard (`app/components/LawyerDashboard.vue`)
Added:
- Consultation Types card in overview
- Quick action button to manage consultation types

## Usage

### For Lawyers

1. **Navigate to Consultation Types**
   - Click "Consultation Types" in the sidebar menu
   - Or click "Consultation Types" quick action on dashboard

2. **Create a Consultation Type**
   - Click "Create New" button
   - Fill in the form:
     - Name (required)
     - Description (optional)
     - Duration (required, 15 min - 8 hours)
     - Price (optional, default: 0 for free)
     - Currency (default: NGN)
     - Meeting Type (required: video, phone, in-person, any)
     - Office Address (required if in-person)
     - Default Meeting Link (optional for video)
     - Buffer Time (optional, 0-120 minutes)
     - Active status (default: true)
   - Click "Create"

3. **Edit a Consultation Type**
   - Click "Edit" button on any consultation type card
   - Update fields as needed
   - Click "Update"

4. **Activate/Deactivate**
   - Click "Activate" or "Deactivate" button
   - Deactivated types are hidden from clients but preserved in the system

5. **Delete a Consultation Type**
   - Click "Delete" button
   - Confirm deletion
   - If bookings exist, system will suggest deactivating instead

6. **View Inactive Types**
   - Toggle "Show inactive types" switch at the top of the page

## Validation Rules

- Name: 3-255 characters (required)
- Description: Max 1000 characters (optional)
- Duration: 15-480 minutes (required)
- Price: ≥ 0 (optional, default: 0)
- Currency: 3-letter code (optional, default: "NGN")
- Meeting Type: video, phone, in_person, or any (required)
- Office Address: Max 500 characters (required if meeting type is in_person)
- Default Meeting Link: Valid URL, max 500 characters (optional)
- Buffer Minutes: 0-120 (optional, default: 0)

## Error Handling

- 400: Validation errors
- 401: Unauthorized (not authenticated or not a lawyer)
- 404: Consultation type not found
- 409: Cannot delete (bookings exist) - suggests deactivating
- 500: Server errors

All errors display user-friendly toast notifications.

## Future Enhancements

Potential improvements:
1. Bulk operations (activate/deactivate multiple types)
2. Duplicate consultation type feature
3. Analytics on consultation type usage
4. Booking count per consultation type
5. Revenue tracking per consultation type
6. Custom fields for consultation types
7. Templates for common consultation types
8. Import/export consultation types

## Testing Checklist

- [ ] Create consultation type with all fields
- [ ] Create consultation type with minimal fields
- [ ] Create in-person consultation without office address (should fail)
- [ ] Create consultation with invalid duration (should fail)
- [ ] Create consultation with negative price (should fail)
- [ ] Fetch all consultation types
- [ ] Fetch including inactive types
- [ ] Update consultation type
- [ ] Delete consultation type (no bookings)
- [ ] Try to delete consultation type with bookings (should fail with 409)
- [ ] Deactivate consultation type
- [ ] Activate consultation type
- [ ] Try to access another lawyer's consultation type (should fail with 404)
- [ ] Verify navigation links work
- [ ] Verify dashboard card displays correctly
- [ ] Test form validation
- [ ] Test conditional field display (office address, meeting link)
