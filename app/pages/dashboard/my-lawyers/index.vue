<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import ClientMyLawyersList from '@/components/dashboard/ClientMyLawyersList.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import { deriveClientLawyers } from '~/lib/client-derived-lawyers'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', middleware: ['auth'] })

useHead({
  title: 'My Lawyers — GetALawyer',
})

const { session } = useAuth()
const userId = computed(() => session.value?.user.id ?? null)

const { useClientBookings } = useBookings()
const { data: bookings, isPending: bookingsPending } = useClientBookings()

const { useConversations } = useMessaging()
const { data: conversations, isPending: conversationsPending } = useConversations()

const lawyers = computed(() =>
  deriveClientLawyers(bookings.value ?? [], conversations.value ?? [], userId.value),
)

const isLoading = computed(() => bookingsPending.value || conversationsPending.value)
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6">
    <AppPageHeader
      title="My lawyers"
      description="Lawyers you have booked or messaged on GetALawyer."
    >
      <template #actions>
        <Button
          as-child
          class="cursor-pointer"
        >
          <NuxtLink
            to="/find-lawyers"
            class="gap-2"
          >
            <AppIcon
              :icon="appIcons.magnifyingGlass"
              class="size-4"
            />
            Find a lawyer
          </NuxtLink>
        </Button>
      </template>
    </AppPageHeader>

    <div
      v-if="isLoading"
      class="space-y-4"
    >
      <Skeleton
        v-for="i in 3"
        :key="i"
        class="h-28 w-full rounded-xl"
      />
    </div>

    <EmptyState
      v-else-if="lawyers.length === 0"
      :icon="appIcons.userCircle"
      title="No lawyers yet"
      description="After you book a consultation or message a lawyer, they will appear here for quick access."
    >
      <template #actions>
        <Button
          as-child
          class="cursor-pointer"
        >
          <NuxtLink to="/find-lawyers">
            Browse lawyers
          </NuxtLink>
        </Button>
      </template>
    </EmptyState>

    <ClientMyLawyersList
      v-else
      :lawyers="lawyers"
    />
  </div>
</template>
