<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        label="Total Bookings"
        :value="stats.totalBookings"
        change="+12.4%"
        trend="up"
        icon="💰"
        accent="#00e5a0"
      />
      <DashboardStatCard
        label="Active Cases"
        :value="stats.activeCases"
        change="+3.1%"
        trend="up"
        icon="👥"
        accent="#6c8cff"
      />
      <DashboardStatCard
        label="Upcoming"
        :value="stats.upcoming"
        change="-0.8%"
        trend="down"
        icon="📅"
        accent="#ff5e7e"
      />
      <DashboardStatCard
        label="Completed"
        :value="stats.completed"
        change="+0.5%"
        trend="up"
        icon="✅"
        accent="#ffb830"
      />
    </div>

    <!-- Charts and Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DashboardSparklineCard
        title="Weekly Activity"
        :data="[40, 65, 50, 80, 72, 90, 84]"
        accent="#00e5a0"
      />

      <DashboardActivityCard :events="activityEvents" />
    </div>

    <!-- Progress and Table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DashboardProgressCard
        title="Case Progress"
        :items="goalItems"
      />

      <DashboardTableCard
        title="Practice Areas"
        :rows="tableRows"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Fetch bookings data
const { useClientBookings } = useBookings()
const { data: bookingsData } = useClientBookings()

const stats = computed(() => {
  const bookings = bookingsData.value || []
  return {
    totalBookings: bookings.length.toString(),
    activeCases: bookings.filter(b => b.status === 'confirmed').length.toString(),
    upcoming: bookings.filter(b => b.status === 'pending').length.toString(),
    completed: bookings.filter(b => b.status === 'completed').length.toString(),
  }
})

const activityEvents = computed(() => [
  { text: 'Consultation scheduled — Estate Planning', time: '2m ago', color: '#00e5a0' },
  { text: 'Document received — Contract review', time: '9m ago', color: '#6c8cff' },
  { text: 'Lawyer responded — Family Law case', time: '21m ago', color: '#ffb830' },
  { text: 'Payment processed — Consultation fee', time: '1h ago', color: '#00e5a0' },
  { text: 'Case update received', time: '2h ago', color: '#6c8cff' },
])

const goalItems = [
  { name: 'Estate Planning', pct: 84, color: '#00e5a0' },
  { name: 'Family Law', pct: 61, color: '#6c8cff' },
  { name: 'Contract Review', pct: 77, color: '#ffb830' },
  { name: 'Consultation', pct: 90, color: '#00e5a0' },
]

const tableRows = [
  { channel: 'Estate Planning', sessions: '8', conv: '100%', rev: '$2,440', color: '#00e5a0', convClass: 'high' as const },
  { channel: 'Family Law', sessions: '5', conv: '80%', rev: '$1,800', color: '#6c8cff', convClass: 'mid' as const },
  { channel: 'Corporate Law', sessions: '3', conv: '100%', rev: '$1,200', color: '#ffb830', convClass: 'high' as const },
  { channel: 'Consultation', sessions: '12', conv: '75%', rev: '$900', color: '#ff5e7e', convClass: 'low' as const },
]
</script>
