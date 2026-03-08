This PR implements Phase 2 of Milestone 5A, delivering a complete consultation booking system with availability management, time slot calculation, and full booking lifecycle management.

Summary
Adds 12 new service files implementing consultation booking infrastructure with support for:

Consultation type management (CRUD operations for lawyer service offerings)
Weekly availability schedules with exceptions (vacations, blocks)
Intelligent time slot calculation algorithm with conflict detection
Complete booking lifecycle (create, confirm, cancel, reschedule, complete, no-show)
Client and lawyer-specific endpoints with proper authorization
Automatic no-show detection and status management
Audit trail for all booking status changes
Key Features
Consultation Management

Lawyers can create multiple consultation types with different durations, prices, and meeting formats (video/phone/in-person)
Support for default meeting links and office addresses
Soft delete functionality with ability to reactivate
Protection against deleting types with existing bookings
Availability System

Weekly recurring schedules (set Mon-Fri 9-5pm, etc)
Bulk schedule operations for efficiency
Date-specific exceptions for vacations, holidays, or special availability
Full-day or partial-day blocks
Combined calendar view showing schedules and exceptions
Smart Slot Calculation

Generates all possible time slots based on consultation duration and buffer times
Filters out unavailable slots due to: outside working hours, during exceptions/vacations, already booked, too soon (minimum notice), too far ahead (max booking window), conflicting with synced calendar events
Returns both available and unavailable slots with reasons for unavailability
"Next available" feature to quickly find earliest open slot
Booking Lifecycle

Unique booking references (BOOK-2025-ABC123 format)
Status workflow: pending → confirmed → completed (or cancelled/no-show)
Client booking limits (max 5 pending/upcoming per client)
Cancellation policy enforcement (24-hour notice requirement)
Reschedule validation (checks new slot availability)
Meeting type-specific validation (URL for video, location for in-person, phone for calls)
Automatic no-show marking after grace period (30 minutes)
Complete audit trail via booking_status_history table
Business Rules Enforced

Minimum booking notice: 2 hours
Maximum booking window: 30 days ahead
Cancellation notice: 24 hours
No-show grace period: 30 minutes
Max pending bookings per client: 5
Buffer time between appointments: configurable per consultation type
API Endpoints (28 total)
Consultation Types (9 endpoints)

POST /api/lawyer/consultation-types
GET /api/lawyer/consultation-types
GET /api/lawyer/consultation-types/:id
PUT /api/lawyer/consultation-types/:id
DELETE /api/lawyer/consultation-types/:id
POST /api/lawyer/consultation-types/:id/deactivate
POST /api/lawyer/consultation-types/:id/activate
GET /api/lawyers/:lawyerId/consultation-types (public)
GET /api/lawyers/:lawyerId/consultation-types/:id (public)
Availability Management (9 endpoints)

GET /api/lawyer/availability/schedule
POST /api/lawyer/availability/schedule
POST /api/lawyer/availability/schedule/bulk
DELETE /api/lawyer/availability/schedule/:id
GET /api/lawyer/availability/exceptions
POST /api/lawyer/availability/exceptions
POST /api/lawyer/availability/exceptions/bulk
DELETE /api/lawyer/availability/exceptions/:id
GET /api/lawyer/availability/range
Available Slots (4 endpoints - public)

GET /api/lawyers/:lawyerId/available-slots
GET /api/lawyers/:lawyerId/available-slots/range
GET /api/lawyers/:lawyerId/available-slots/check
GET /api/lawyers/:lawyerId/next-available
Client Bookings (6 endpoints)

POST /api/bookings
GET /api/bookings
GET /api/bookings/:id
GET /api/bookings/upcoming
PUT /api/bookings/:id/cancel
PUT /api/bookings/:id/reschedule
Lawyer Bookings (7 endpoints)

GET /api/lawyer/bookings
GET /api/lawyer/bookings/:id
GET /api/lawyer/bookings/upcoming
PUT /api/lawyer/bookings/:id/confirm
PUT /api/lawyer/bookings/:id/complete
PUT /api/lawyer/bookings/:id/no-show
PUT /api/lawyer/bookings/:id/cancel
Integration Notes
Prerequisites from Phase 1:

Database schemas (availability, consultation-types, bookings, calendar-integrations, system-config)
ConfigService for system configuration
TimeUtils for date/time manipulation
BookingUtils for reference generation and validation
Authentication Required:

All lawyer endpoints expect X-Lawyer-Id header (replace with actual auth middleware)
All client endpoints expect X-Client-Id header (replace with actual auth middleware)
Public endpoints require no authentication
File Locations:

Copy service files to src/services/
Copy validator files to src/validators/
Copy route files to src/routes/
Register routes in main application file
Database Dependencies:

Uses Drizzle ORM with existing schema definitions
All operations use transactions where necessary
Proper foreign key relationships enforced
Review Focus Areas
Business logic validation in services (availability checking, conflict detection)
Error handling patterns across all endpoints
Transaction boundaries for data consistency
Input validation schemas completeness
Authorization checks in route handlers
Algorithm correctness in slot calculation
