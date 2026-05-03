import { getSessionFromBackend } from '../../utils/getSession'

/**
 * GET /api/lawyers/:id
 * Lawyer profile — requires authentication (same policy as `/lawyers/:id`).
 *
 * TODO: Connect to real database
 * - Import your database client (Prisma, Drizzle, etc.)
 * - Query lawyer data with all relations:
 *   - lawyerPersonalInfo
 *   - lawyerProfessionalInfo
 *   - lawyerPracticeInfo
 *   - lawyerSpecializations
 *   - lawyerDocuments
 *   - consultationTypes
 *   - availabilitySchedule
 *   - availabilityExceptions
 *
 * Currently returns MOCK DATA for testing
 */

export default defineEventHandler(async (event) => {
  const lawyerId = getRouterParam(event, 'id')

  if (!lawyerId) {
    throw createError({
      statusCode: 400,
      message: 'Invalid lawyer ID',
    })
  }

  const session = await getSessionFromBackend(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to view lawyer profiles',
    })
  }

  try {
    // TODO: Replace with actual database query
    // This is a mock response - you need to implement the actual database query
    // using Prisma or your database client
    
    // For now, return mock data to test the frontend
    const mockLawyer = {
      id: lawyerId,
      userId: 'user-uuid-here',
      name: 'Adebayo Johnson',
      email: 'adebayo.johnson@example.com',
      image: 'https://ui-avatars.com/api/?name=Adebayo+Johnson&size=200',
      applicationStatus: 'approved' as const,
      ninVerified: true,
      ninVerifiedAt: '2024-01-15T10:30:00.000Z',
      personalInfo: {
        firstName: 'Adebayo',
        lastName: 'Johnson',
        middleName: 'Oluwaseun',
        dateOfBirth: '1985-03-15T00:00:00.000Z',
        gender: 'male',
        state: 'Lagos',
        lga: 'Ikeja',
      },
      professionalInfo: {
        barNumber: 'SCN/123456/2010',
        yearOfCall: 2010,
        lawSchool: 'Nigerian Law School, Lagos Campus',
        university: 'University of Lagos',
        llbYear: 2009,
      },
      practiceInfo: {
        firmName: 'Johnson & Associates Legal Practitioners',
        statesOfPractice: ['Lagos', 'Abuja', 'Rivers'],
        officeStreet: '15 Adeola Odeku Street',
        officeCity: 'Victoria Island',
        officeState: 'Lagos',
        officePostalCode: '101241',
      },
      specializations: [
        {
          id: 'spec-uuid-1',
          name: 'Corporate Law',
          description: 'Business formation, contracts, mergers and acquisitions',
          yearsOfExperience: 8,
        },
        {
          id: 'spec-uuid-2',
          name: 'Intellectual Property',
          description: 'Trademark, copyright, and patent law',
          yearsOfExperience: 5,
        },
      ],
      documents: [
        {
          id: 'doc-uuid-1',
          type: 'bar_license' as const,
          url: 'https://example.com/bar_license.pdf',
          originalName: 'bar_license_scn_123456.pdf',
        },
      ],
      consultationTypes: [
        {
          id: 'consult-uuid-1',
          name: '30-min Initial Consultation',
          description: 'Free initial consultation to discuss your legal needs',
          durationMinutes: 30,
          price: '0.00',
          currency: 'NGN',
          meetingType: 'any' as const,
          defaultMeetingLink: null,
          officeAddress: null,
          isActive: true,
          bufferMinutes: 15,
        },
        {
          id: 'consult-uuid-2',
          name: '1-Hour Legal Consultation',
          description: 'In-depth consultation for complex legal matters',
          durationMinutes: 60,
          price: '25000.00',
          currency: 'NGN',
          meetingType: 'video' as const,
          defaultMeetingLink: 'https://zoom.us/j/lawyer-room',
          officeAddress: null,
          isActive: true,
          bufferMinutes: 15,
        },
      ],
      availability: {
        schedule: [
          {
            id: 'sched-uuid-1',
            dayOfWeek: '1' as const,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true,
          },
          {
            id: 'sched-uuid-2',
            dayOfWeek: '2' as const,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true,
          },
          {
            id: 'sched-uuid-3',
            dayOfWeek: '3' as const,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true,
          },
          {
            id: 'sched-uuid-4',
            dayOfWeek: '4' as const,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true,
          },
          {
            id: 'sched-uuid-5',
            dayOfWeek: '5' as const,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true,
          },
        ],
        exceptions: [],
      },
      createdAt: '2024-01-01T08:00:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
      submittedAt: '2024-01-10T14:20:00.000Z',
      reviewedAt: '2024-01-15T10:30:00.000Z',
      reviewedBy: 'admin-user-uuid',
      reviewNotes: null,
    }

    return {
      success: true,
      authenticated: true,
      data: mockLawyer,
    }
  } catch (error) {
    console.error('Error fetching lawyer profile:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch lawyer details',
    })
  }
})
