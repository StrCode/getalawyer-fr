# Conversation Access Guide

## Where Conversations Are Accessed After Booking Confirmation

### Overview
When a lawyer confirms a booking, a `conversationId` is automatically created. This conversation enables pre-consultation messaging between the client and lawyer.

## Access Points

### 1. From Booking/Appointment Detail Pages ✅

#### Client Side
**Location:** `/dashboard/bookings/:id`
**File:** `app/pages/dashboard/bookings/[id].vue`

When a booking has a `conversationId`, a "Communication" card appears with:
- Description: "Message with [Lawyer Name] about this consultation"
- Button: "Open Conversation"
- Link: `/dashboard/messages?conversation=${conversationId}`

#### Lawyer Side
**Location:** `/dashboard/appointments/:id`
**File:** `app/pages/dashboard/appointments/[id].vue`

When an appointment has a `conversationId`, a "Communication" card appears with:
- Description: "Message with [Client Name] about this consultation"
- Button: "Open Conversation"
- Link: `/dashboard/messages?conversation=${conversationId}`

### 2. Messages Page (Central Hub) ✅

**Location:** `/dashboard/messages`
**File:** `app/pages/dashboard/messages/index.vue`

**Features:**
- **Conversations List Sidebar** - Shows all conversations (both pre-consultation and case-related)
- **Message Thread View** - Full messaging interface with the selected conversation
- **URL Query Support** - Can be accessed directly with `?conversation=uuid` parameter
- **Conversation Types:**
  - 🟠 **Consultation** badge - Pre-consultation conversations (from bookings)
  - 🟢 **Case** badge - Case-related conversations (after client hired)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Messages Page                                      │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Conversations│  Selected Conversation               │
│ List         │  ┌────────────────────────────────┐ │
│              │  │ Header: Name, Type, View Link │ │
│ • John Doe   │  ├────────────────────────────────┤ │
│   [2 unread] │  │                                │ │
│   Consultation│  │ Message Thread                │ │
│              │  │ (CaseMessaging Component)      │ │
│ • Jane Smith │  │                                │ │
│   Case       │  ├────────────────────────────────┤ │
│              │  │ Message Input                  │ │
│              │  └────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

## Conversation Flow

### Pre-Consultation Phase

1. **Booking Created** (status: pending)
   - No conversation yet
   - No messaging available

2. **Lawyer Confirms Booking** (status: confirmed)
   - ✅ `conversationId` created automatically
   - ✅ Conversation link appears in booking/appointment details
   - ✅ Both parties can now message each other

3. **Pre-Consultation Messaging**
   - Access via booking/appointment detail page → "Open Conversation" button
   - OR access via `/dashboard/messages` page
   - Share documents, ask questions, clarify scope
   - Real-time messaging with read receipts

4. **Consultation Occurs** (status: completed)
   - Conversation remains active
   - Can continue messaging

5. **Engagement Outcome Recorded**
   - **If Consultation Only:** Conversation preserved for reference
   - **If Client Hired:** Conversation linked to new case, continues seamlessly

### Post-Consultation Phase (If Client Hired)

6. **Case Created**
   - Same `conversationId` linked to case
   - All previous messages preserved
   - Conversation continues in case context
   - Access via case detail page OR messages page

## Navigation Paths

### Client Navigation
```
Dashboard
  └─ Bookings
      └─ Booking Detail
          └─ "Open Conversation" button
              └─ Messages Page (with conversation selected)
```

OR

```
Dashboard
  └─ Messages
      └─ Select conversation from list
          └─ Message thread opens
```

### Lawyer Navigation
```
Dashboard
  └─ Appointments
      └─ Appointment Detail
          └─ "Open Conversation" button
              └─ Messages Page (with conversation selected)
```

OR

```
Dashboard
  └─ Messages
      └─ Select conversation from list
          └─ Message thread opens
```

## Technical Implementation

### Components Used

1. **CaseMessaging.vue** (`app/components/case/CaseMessaging.vue`)
   - Reusable messaging component
   - Accepts `conversationId` prop for standalone conversations
   - Accepts `caseId` prop for case-related conversations
   - Handles message sending, receiving, and display
   - Shows read receipts and timestamps

2. **Messages Page** (`app/pages/dashboard/messages/index.vue`)
   - Conversations list sidebar
   - Message thread view
   - URL query parameter support
   - Conversation type badges

### API Endpoints

**Conversations List** (TODO - needs implementation):
```
GET /api/conversations
Response: {
  conversations: [
    {
      id: "conv-uuid",
      type: "booking" | "case",
      relatedId: "booking-uuid or case-uuid",
      caseId: "case-uuid" (if type is case),
      otherParty: { id: "user-uuid", name: "John Doe" },
      lastMessage: { content: "...", createdAt: "..." },
      unreadCount: 2,
      createdAt: "..."
    }
  ]
}
```

**Conversation Messages** (Already implemented via case messaging):
```
GET /api/conversations/:id/messages
POST /api/conversations/:id/messages
```

### Composables Used

- `useCaseMessaging()` - Handles message loading and sending
- `useAuth()` - Gets current user session

## Current Status

### ✅ Implemented
- Conversation link in booking/appointment detail pages
- CaseMessaging component with conversation support
- Messages page layout with sidebar and thread view
- URL query parameter support (`?conversation=uuid`)
- Conversation type badges
- Message thread display
- Message sending interface

### 🔄 Needs API Integration
- **GET /api/conversations** - Load user's conversations list
- Conversations should include:
  - Pre-consultation conversations (from confirmed bookings)
  - Case conversations (from hired engagements)
  - Unread message counts
  - Last message preview
  - Other party information

### 📝 Recommended Enhancements
1. Real-time updates for new messages (WebSocket/polling)
2. Typing indicators
3. File attachment support in conversations
4. Search within conversations
5. Archive/mute conversations
6. Push notifications for new messages
7. Mark all as read functionality

## User Experience

### Client Experience
1. Books consultation with lawyer
2. Lawyer confirms → Client receives notification
3. Client sees "Communication" card in booking details
4. Clicks "Open Conversation" → Redirected to messages page
5. Can message lawyer before consultation
6. After consultation, if hired, same conversation continues in case

### Lawyer Experience
1. Receives booking request
2. Confirms booking → Conversation automatically created
3. Sees "Communication" card in appointment details
4. Clicks "Open Conversation" → Redirected to messages page
5. Can message client before consultation
6. After consultation, records engagement outcome
7. If client hired, same conversation continues in case

## Summary

**Conversations are accessed from:**
1. ✅ Booking/Appointment detail pages (via "Open Conversation" button)
2. ✅ Messages page at `/dashboard/messages` (central hub for all conversations)
3. ✅ Direct URL with query parameter: `/dashboard/messages?conversation=uuid`

The messaging system seamlessly transitions from pre-consultation to case management, preserving all conversation history when a client is hired.
