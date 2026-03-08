# Client Booking Routes Documentation

Base Path: `/api/bookings`

All routes require client authentication via `authMiddleware` and `clientMiddleware`.

---

## 1. Create Booking

**Endpoint:** `POST /api/bookings`

**Description:** Create a new booking for a consultation with a lawyer.

**Authentication:** Required (Client)

**Request Body:**
```json
{
  "lawyerId": "uuid",
  "consultationTypeId": "uuid",
  "scheduledDate": "2025-02-15",
  "scheduledStartTime": "14:00:00",
  "meetingType": "video",
  "meetingUrl": "https://zoom.us/j/123456",
  "clientNotes": "I need help with...",
  "timezone": "Africa/Lagos"
}
```

**Success Response (201):**
```json
{
  "booking": {
    "id": "uuid",
    "bookingReference": "BOOK-2025-ABC123",
    "status": "pending",
    "clientId": "uuid",
    "lawyerId": "uuid",
    "consultationTypeId": "uuid",
    "scheduledDate": "2025-02-15",
    "scheduledStartTime": "14:00:00",
    "meetingType": "video",
    "meetingUrl": "https://zoom.us/j/123456",
    "clientNotes": "I need help with...",
    "timezone": "Africa/Lagos",
    "createdAt": "2025-02-10T10:00:00Z",
    "updatedAt": "2025-02-10T10:00:00Z"
  },
  "message": "Booking created successfully"
}
```

**Error Responses:**
- `409 Conflict` - Slot not available
- `429 Too Many Requests` - Booking limit reached
- `400 Bad Request` - Invalid consultation type, missing meeting URL/location/phone, or invalid meeting URL
- `500 Internal Server Error` - Failed to create booking

---

## 2. Get All Bookings

**Endpoint:** `GET /api/bookings`

**Description:** Get all bookings for the authenticated client with optional filtering.

**Authentication:** Required (Client)

**Query Parameters:**
- `status` (optional): Comma-separated list of statuses (e.g., "pending,confirmed")
- `upcoming` (optional): Boolean, default: false

**Example:** `GET /api/bookings?status=pending,confirmed&upcoming=true`

**Success Response (200):**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "bookingReference": "BOOK-2025-ABC123",
      "status": "pending",
      "clientId": "uuid",
      "lawyerId": "uuid",
      "consultationTypeId": "uuid",
      "scheduledDate": "2025-02-15",
      "scheduledStartTime": "14:00:00",
      "scheduledEndTime": "15:00:00",
      "meetingType": "video",
      "meetingUrl": "https://zoom.us/j/123456",
      "clientNotes": "I need help with...",
      "timezone": "Africa/Lagos",
      "createdAt": "2025-02-10T10:00:00Z",
      "updatedAt": "2025-02-10T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch bookings

---

## 3. Get Booking by ID

**Endpoint:** `GET /api/bookings/:id`

**Description:** Get details of a specific booking. Verifies client ownership.

**Authentication:** Required (Client)

**Path Parameters:**
- `id`: Booking UUID

**Success Response (200):**
```json
{
  "booking": {
    "id": "uuid",
    "bookingReference": "BOOK-2025-ABC123",
    "status": "pending",
    "clientId": "uuid",
    "lawyerId": "uuid",
    "consultationTypeId": "uuid",
    "scheduledDate": "2025-02-15",
    "scheduledStartTime": "14:00:00",
    "scheduledEndTime": "15:00:00",
    "meetingType": "video",
    "meetingUrl": "https://zoom.us/j/123456",
    "clientNotes": "I need help with...",
    "timezone": "Africa/Lagos",
    "createdAt": "2025-02-10T10:00:00Z",
    "updatedAt": "2025-02-10T10:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Booking not found
- `403 Forbidden` - Access denied (not the booking owner)
- `500 Internal Server Error` - Failed to fetch booking

---

## 4. Cancel Booking

**Endpoint:** `PUT /api/bookings/:id/cancel`

**Description:** Cancel an existing booking. Verifies client ownership.

**Authentication:** Required (Client)

**Path Parameters:**
- `id`: Booking UUID

**Request Body:**
```json
{
  "reason": "Optional cancellation reason"
}
```

**Success Response (200):**
```json
{
  "booking": {
    "id": "uuid",
    "bookingReference": "BOOK-2025-ABC123",
    "status": "cancelled",
    "cancellationReason": "Optional cancellation reason",
    "cancelledAt": "2025-02-12T10:00:00Z",
    "cancelledBy": "client",
    "clientId": "uuid",
    "lawyerId": "uuid",
    "scheduledDate": "2025-02-15",
    "scheduledStartTime": "14:00:00",
    "updatedAt": "2025-02-12T10:00:00Z"
  },
  "message": "Booking cancelled successfully"
}
```

**Error Responses:**
- `404 Not Found` - Booking not found or access denied
- `400 Bad Request` - Already cancelled, booking completed, or cancellation window passed
- `500 Internal Server Error` - Failed to cancel booking

---

## 5. Reschedule Booking

**Endpoint:** `PUT /api/bookings/:id/reschedule`

**Description:** Reschedule an existing booking to a new date and time. Verifies client ownership.

**Authentication:** Required (Client)

**Path Parameters:**
- `id`: Booking UUID

**Request Body:**
```json
{
  "newDate": "2025-02-16",
  "newStartTime": "15:00:00"
}
```

**Success Response (200):**
```json
{
  "booking": {
    "id": "uuid",
    "bookingReference": "BOOK-2025-ABC123",
    "status": "pending",
    "clientId": "uuid",
    "lawyerId": "uuid",
    "scheduledDate": "2025-02-16",
    "scheduledStartTime": "15:00:00",
    "scheduledEndTime": "16:00:00",
    "rescheduledAt": "2025-02-12T10:00:00Z",
    "updatedAt": "2025-02-12T10:00:00Z"
  },
  "message": "Booking rescheduled successfully"
}
```

**Error Responses:**
- `404 Not Found` - Booking not found or access denied
- `400 Bad Request` - Booking cancelled, booking completed, reschedule window passed, or new slot not available
- `500 Internal Server Error` - Failed to reschedule booking

---

## 6. Get Upcoming Bookings

**Endpoint:** `GET /api/bookings/upcoming`

**Description:** Get all upcoming bookings for the authenticated client.

**Authentication:** Required (Client)

**Success Response (200):**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "bookingReference": "BOOK-2025-ABC123",
      "status": "confirmed",
      "clientId": "uuid",
      "lawyerId": "uuid",
      "consultationTypeId": "uuid",
      "scheduledDate": "2025-02-15",
      "scheduledStartTime": "14:00:00",
      "scheduledEndTime": "15:00:00",
      "meetingType": "video",
      "meetingUrl": "https://zoom.us/j/123456",
      "timezone": "Africa/Lagos",
      "createdAt": "2025-02-10T10:00:00Z",
      "updatedAt": "2025-02-10T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch upcoming bookings

---

## Booking Status Values

- `pending` - Booking created, awaiting lawyer confirmation
- `confirmed` - Lawyer has confirmed the booking
- `cancelled` - Booking has been cancelled
- `completed` - Consultation has been completed
- `no_show` - Client did not show up for the consultation

## Meeting Types

- `video` - Video consultation (requires `meetingUrl`)
- `in_person` - In-person consultation (requires `meetingLocation`)
- `phone` - Phone consultation (requires `phoneNumber`)
