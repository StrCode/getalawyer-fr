<script setup lang="ts">
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import DashboardConsultationTypesCard from '@/components/dashboard/ConsultationTypesCard.vue'
import DashboardAvailabilityCard from '@/components/dashboard/AvailabilityCard.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Button } from '@/components/ui/button'
import {
  PhCalendarDots,
  PhCheckCircle,
  PhCircleNotch,
  PhClock,
  PhCurrencyEur,
  PhFileText,
  PhUserCircle,
} from '@phosphor-icons/vue'

const BRAND_GREEN = '#1F4D2C'

const { session } = useAuth()
const router = useRouter()

const applicationStatus = computed(() => (session.value?.user as { applicationStatus?: string })?.applicationStatus)

watch(applicationStatus, (status) => {
  if (status === 'rejected') {
    router.push('/onboarding/lawyer/rejected')
  }
}, { immediate: true })

const { useLawyerBookings } = useBookings()
const { data: bookings, isPending: isLoadingBookings } = useLawyerBookings()
const { getNextBooking, sortBookingsByDate } = useBookingDisplay()

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'vous')

const bookingsList = computed(() => bookings.value ?? [])
const nextBooking = computed(() => getNextBooking(bookingsList.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookingsList.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

const stats = computed(() => {
  const list = bookingsList.value
  return {
    active: list.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    pending: list.filter(b => b.status === 'pending').length,
    completed: list.filter(b => b.status === 'completed').length,
  }
})

const quickLinks: DashboardQuickLink[] = [
  {
    label: 'Rendez-vous',
    description: 'Gérer les réservations',
    to: '/dashboard/appointments',
    icon: PhCalendarDots,
  },
  {
    label: 'Types de consultation',
    description: 'Modifier vos prestations',
    to: '/dashboard/consultation-types',
    icon: PhFileText,
  },
  {
    label: 'Disponibilités',
    description: 'Ajuster votre planning',
    to: '/dashboard/availability',
    icon: PhClock,
  },
  {
    label: 'Profil',
    description: 'Mettre à jour vos informations',
    to: '/dashboard/profile',
    icon: PhUserCircle,
  },
]

const showFullEmpty = computed(() => !isLoadingBookings.value && bookingsList.value.length === 0)

function handleConfirm(bookingId: string) {
  // TODO: wire confirm mutation
  console.log('Confirm booking:', bookingId)
}

function handleDecline(bookingId: string) {
  // TODO: wire decline mutation
  console.log('Decline booking:', bookingId)
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="font-heading font-semibold text-foreground text-2xl tracking-tight">
          Bonjour, {{ firstName }}
        </h1>
        <p class="mt-1 text-muted-foreground text-sm">
          Gérez vos consultations et développez votre activité
        </p>
      </div>
      <Button as-child variant="outline">
        <NuxtLink to="/dashboard/profile" class="gap-2">
          <PhUserCircle class="size-4" />
          Mon profil
        </NuxtLink>
      </Button>
    </div>

    <DashboardQuickLinks title="Accès rapide" :links="quickLinks" />

    <template v-if="!isLoadingBookings">
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.client?.name"
        :consultation-name="nextBooking?.consultationType?.name"
        :detail-path="nextBooking ? `/dashboard/appointments/${nextBooking.id}` : undefined"
        empty-title="Aucune consultation à venir"
        empty-description="Complétez votre profil et définissez vos disponibilités pour recevoir des demandes."
        empty-cta-label="Compléter le profil"
        empty-cta-to="/dashboard/profile"
      />

      <EmptyState
        v-if="showFullEmpty"
        :icon="PhCalendarDots"
        title="Aucune consultation pour le moment"
        description="Vos demandes de rendez-vous apparaîtront ici. Vérifiez que votre profil et vos disponibilités sont à jour."
      >
        <template #actions>
          <Button as-child>
            <NuxtLink to="/dashboard/profile">Compléter le profil</NuxtLink>
          </Button>
          <Button as-child variant="outline">
            <NuxtLink to="/dashboard/availability">Définir les disponibilités</NuxtLink>
          </Button>
        </template>
      </EmptyState>

      <div
        v-else
        class="gap-6 grid grid-cols-1 xl:grid-cols-[1fr_280px]"
      >
        <div class="space-y-6">
          <div class="gap-4 grid grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Actives"
              :value="stats.active"
              :icon="PhCalendarDots"
              :color="BRAND_GREEN"
              :subtitle="stats.active === 0 ? 'Aucune en cours' : 'Confirmées ou en attente'"
            />
            <StatCard
              label="En attente"
              :value="stats.pending"
              :icon="PhClock"
              color="#b45309"
              :subtitle="stats.pending === 0 ? 'Aucune demande' : 'À traiter'"
            />
            <StatCard
              label="Terminées"
              :value="stats.completed"
              :icon="PhCheckCircle"
              :color="BRAND_GREEN"
              subtitle="Ce mois-ci"
            />
            <StatCard
              label="Revenus"
              value="0 €"
              :icon="PhCurrencyEur"
              color="#2D6B3E"
              subtitle="Ce mois-ci"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold text-foreground text-lg">Consultations récentes</h2>
              <Button as-child variant="ghost" size="sm">
                <NuxtLink to="/dashboard/appointments">Tout voir</NuxtLink>
              </Button>
            </div>

            <div
              v-for="booking in recentBookings"
              :key="booking.id"
              class="relative"
            >
              <DashboardBookingRow
                :booking="booking"
                :person-name="booking.client?.name ?? 'Client'"
                :subtitle="booking.consultationType?.name"
                @click="navigateTo(`/dashboard/appointments/${booking.id}`)"
              />
              <div
                v-if="booking.status === 'pending'"
                class="top-4 right-14 absolute flex flex-col gap-2"
                @click.stop
              >
                <Button size="sm" @click="handleConfirm(booking.id)">
                  Confirmer
                </Button>
                <Button size="sm" variant="ghost" @click="handleDecline(booking.id)">
                  Refuser
                </Button>
              </div>
            </div>
          </section>

          <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
            <section class="p-5 border border-border rounded-xl bg-card">
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-semibold text-foreground text-base">Types de consultation</h2>
                <Button as-child variant="ghost" size="sm">
                  <NuxtLink to="/dashboard/consultation-types">Gérer</NuxtLink>
                </Button>
              </div>
              <DashboardConsultationTypesCard />
            </section>
            <section class="p-5 border border-border rounded-xl bg-card">
              <div class="flex justify-between items-center mb-4">
                <h2 class="font-semibold text-foreground text-base">Disponibilités</h2>
                <Button as-child variant="ghost" size="sm">
                  <NuxtLink to="/dashboard/availability">Modifier</NuxtLink>
                </Button>
              </div>
              <DashboardAvailabilityCard />
            </section>
          </div>
        </div>

        <DashboardAgendaRail
          :bookings="bookingsList"
          :person-label="(b) => b.client?.name ?? 'Client'"
          list-path="/dashboard/appointments"
          item-path-prefix="/dashboard/appointments"
        />
      </div>
    </template>

    <div v-else class="flex justify-center py-16">
      <PhCircleNotch class="size-8 text-muted-foreground animate-spin" />
    </div>
  </div>
</template>
