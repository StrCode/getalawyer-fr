import { httpClient } from './client'
import type { LawyerSearchResult } from './index'

export interface ClientDashboardStats {
  upcomingConsultations: number
  pendingConfirmation: number
  completedConsultations: number
  activeCases: number
  unreadMessages: number
  unreadNotifications: number
  connectedLawyers: number
}

export interface ClientDashboardConnectedLawyer {
  lawyerProfileId: string
  userId: string
  name: string
  image: string | null
}

export interface ClientDashboardUpcomingConsultation {
  id: string
  bookingReference: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  scheduledDate: string
  scheduledStartTime: string
  scheduledEndTime: string
  meetingType: string
  lawyer: {
    id: string
    name: string
    profilePicture: string | null
  } | null
  consultationType: {
    id: string
    name: string
  } | null
}

export interface ClientDashboardResponse {
  profile: {
    id: string
    name: string
    email: string
    image: string | null
    specializations?: Array<{ id: string; name: string }>
    country?: string | null
    state?: string | null
  }
  stats: ClientDashboardStats
  recommendedLawyers: LawyerSearchResult[]
  connectedLawyers: ClientDashboardConnectedLawyer[]
  recentSearches: never[]
  upcomingConsultations: ClientDashboardUpcomingConsultation[]
}

const BASE_PATH = '/api/dashboard'

export const dashboardAPI = {
  getClientDashboard: () =>
    httpClient.getAuth<ClientDashboardResponse>(`${BASE_PATH}/client`),
}
