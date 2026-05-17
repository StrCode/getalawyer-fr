<script setup lang="ts">
import DashboardAgendaRail from '@/components/dashboard/DashboardAgendaRail.vue'
import DashboardBookingRow from '@/components/dashboard/DashboardBookingRow.vue'
import DashboardNextAppointment from '@/components/dashboard/DashboardNextAppointment.vue'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks.vue'
import type { DashboardQuickLink } from '@/components/dashboard/DashboardQuickLinks.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import { Button } from '@/components/ui/button'
import {
  PhBriefcase,
  PhCalendarDots,
  PhCheckCircle,
  PhClock,
  PhMagnifyingGlass,
  PhScales,
  PhCircleNotch,
  PhUsersThree,
} from '@phosphor-icons/vue'

const BRAND_GREEN = '#1F4D2C'

const { session } = useAuth()
const { useClientBookings } = useBookings()
const { data: bookingsData, isPending } = useClientBookings()
const { getNextBooking, sortBookingsByDate } = useBookingDisplay()

const firstName = computed(() => session.value?.user.name?.split(' ')[0] ?? 'vous')

const bookings = computed(() => bookingsData.value ?? [])

const nextBooking = computed(() => getNextBooking(bookings.value))

const recentBookings = computed(() => {
  const sorted = sortBookingsByDate(bookings.value)
  return sorted.filter(b => b.id !== nextBooking.value?.id).slice(0, 3)
})

const stats = computed(() => {
  const list = bookings.value
  return {
    total: list.length,
    confirmed: list.filter(b => b.status === 'confirmed').length,
    pending: list.filter(b => b.status === 'pending').length,
    completed: list.filter(b => b.status === 'completed').length,
  }
})

const quickLinks: DashboardQuickLink[] = [
  {
    label: 'Trouver un avocat',
    description: 'Parcourir les professionnels vérifiés',
    to: '/find-lawyers',
    icon: PhMagnifyingGlass,
  },
  {
    label: 'Mes rendez-vous',
    description: 'Consulter toutes les réservations',
    to: '/dashboard/bookings',
    icon: PhCalendarDots,
  },
  {
    label: 'Mes avocats',
    description: 'Professionnels enregistrés',
    to: '/dashboard/my-lawyers',
    icon: PhUsersThree,
  },
  {
    label: 'Mes dossiers',
    description: 'Suivre vos affaires en cours',
    to: '/dashboard/cases',
    icon: PhBriefcase,
  },
]

const hasBookings = computed(() => bookings.value.length > 0)
const showFullEmpty = computed(() => !isPending.value && !hasBookings.value)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="font-heading font-semibold text-foreground text-2xl tracking-tight">
          Bonjour, {{ firstName }}
        </h1>
        <p class="mt-1 text-muted-foreground text-sm">
          Voici le résumé de vos consultations juridiques
        </p>
      </div>
      <Button as-child>
        <NuxtLink to="/find-lawyers" class="gap-2">
          <PhMagnifyingGlass class="size-4" />
          Trouver un avocat
        </NuxtLink>
      </Button>
    </div>

    <!-- Quick links -->
    <DashboardQuickLinks title="Accès rapide" :links="quickLinks" />

    <template v-if="!isPending">
      <!-- Hero: next appointment -->
      <DashboardNextAppointment
        :booking="nextBooking"
        :person-name="nextBooking?.lawyer?.name"
        :person-image="nextBooking?.lawyer?.profilePicture"
      />

      <!-- Empty state (no bookings at all) -->
      <EmptyState
        v-if="showFullEmpty"
        :icon="PhCalendarDots"
        title="Aucune consultation pour le moment"
        description="Parcourez notre annuaire d'avocats vérifiés et réservez votre premier rendez-vous en ligne."
      >
        <template #actions>
          <Button as-child>
            <NuxtLink to="/find-lawyers" class="gap-2">
              <PhMagnifyingGlass class="size-4" />
              Parcourir les avocats
            </NuxtLink>
          </Button>
          <Button as-child variant="outline">
            <NuxtLink to="/practice-areas" class="gap-2">
              <PhScales class="size-4" />
              Domaines de droit
            </NuxtLink>
          </Button>
        </template>
      </EmptyState>

      <!-- Main grid: stats + list | agenda -->
      <div
        v-else
        class="gap-6 grid grid-cols-1 xl:grid-cols-[1fr_280px]"
      >
        <div class="space-y-6">
          <div class="gap-4 grid grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Réservations"
              :value="stats.total"
              :icon="PhCalendarDots"
              :color="BRAND_GREEN"
              :subtitle="stats.total === 0 ? 'Aucune pour l\'instant' : 'Toutes périodes'"
            />
            <StatCard
              label="Confirmées"
              :value="stats.confirmed"
              :icon="PhClock"
              color="#2D6B3E"
              :subtitle="stats.confirmed === 0 ? 'Aucune active' : 'En cours'"
            />
            <StatCard
              label="En attente"
              :value="stats.pending"
              :icon="PhCalendarDots"
              color="#b45309"
              :subtitle="stats.pending === 0 ? 'Rien en attente' : 'À confirmer'"
            />
            <StatCard
              label="Terminées"
              :value="stats.completed"
              :icon="PhCheckCircle"
              :color="BRAND_GREEN"
              :subtitle="stats.completed === 0 ? 'Aucune encore' : 'Consultations passées'"
            />
          </div>

          <section v-if="recentBookings.length > 0" class="space-y-3">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold text-foreground text-lg">Consultations récentes</h2>
              <Button as-child variant="ghost" size="sm">
                <NuxtLink to="/dashboard/bookings">Tout voir</NuxtLink>
              </Button>
            </div>
            <DashboardBookingRow
              v-for="booking in recentBookings"
              :key="booking.id"
              :booking="booking"
              :person-name="booking.lawyer?.name ?? 'Avocat'"
              :person-image="booking.lawyer?.profilePicture"
              :subtitle="booking.consultationType?.name"
              @click="navigateTo(`/dashboard/bookings/${booking.id}`)"
            />
          </section>
        </div>

        <DashboardAgendaRail
          :bookings="bookings"
          :person-label="(b) => b.lawyer?.name ?? 'Avocat'"
        />
      </div>
    </template>

    <div v-else class="flex justify-center py-16">
      <PhCircleNotch class="size-8 text-muted-foreground animate-spin" />
    </div>
  </div>
</template>
