<template>
  <div class="p-6">
    <UPageHeader 
      title="Bookings"
      description="Manage your consultations and appointments here."
      :links="links"
      :ui="{
        root: 'border-none py-0',
        title: 'font-semibold !text-3xl leading-6 tracking-tight',
        description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
      }"
    />
    
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-hugeicons-loading-03" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    <div v-else-if="isError" class="py-12 text-center text-red-500">
      Error loading bookings. Please try again later.
    </div>
    <UTabs 
      v-else
      v-model="activeTab"
      default-value="all"
      color="neutral" 
      size="md" 
      variant="link" 
      :items="tabItems"
      :ui="{
        root: 'py-6',
        list: 'gap-6',
        label: 'font-medium text-sm leading-5 tracking-tight text-center data-[state=active]:text-[#007AFC]',
        trigger: 'justify-start px-0 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866] hover:data-[state=inactive]:not-disabled:text-[#525866]',
        indicator: 'absolute transition-[translate,40%] duration-200 bg-[#007AFC]',
        content: 'py-3.5'
      }"
    >
      <template #all>
        <BookingList 
          title="All Bookings"
          :bookings="bookings || []" 
          :pagination="pagination"
          @update:pagination="p => pagination = p"
        />
      </template>

      <template #upcoming>
        <BookingList 
          title="Upcoming Consultations"
          :bookings="upcomingBookings || []" 
          :pagination="pagination"
          @update:pagination="p => pagination = p"
        />
      </template>

      <template #pending>
        <BookingList 
          title="Pending Approvals"
          :bookings="pendingBookings" 
          :pagination="pagination"
          @update:pagination="p => pagination = p"
        />
      </template>
    </UTabs>

    <BookingModal v-model:open="isBookingModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h, resolveComponent } from 'vue'
import type { ButtonProps, TabsItem } from '@nuxt/ui'
import { useBookings } from '~/composables/useBookings'
import type { Booking } from '~/types'
import { getPaginationRowModel } from '@tanstack/vue-table'

// Add subcomponent locally to clean up the template
const BookingList = defineComponent({
  props: {
    title: String,
    bookings: { type: Array as PropType<Booking[]>, required: true },
    pagination: Object
  },
  emits: ['update:pagination'],
  setup(props, { emit }) {
    const tableApi = ref()
    const columns = [
      {
        accessorKey: 'bookingReference',
        header: 'Reference',
        cell: ({ row }: any) => h('span', { class: 'font-medium text-gray-900' }, row.original.bookingReference || `REQ-${row.original.id.substring(0,6).toUpperCase()}`)
      },
      {
        accessorKey: 'lawyer',
        header: 'Lawyer / Consultation',
        cell: ({ row }: any) => h('div', {}, [
          h('div', { class: 'text-sm font-medium text-gray-900' }, row.original.lawyer?.name || 'Assigned Lawyer'),
          h('div', { class: 'text-[#525866] text-sm' }, row.original.consultationType?.name || 'General Consultation')
        ])
      },
      {
        accessorKey: 'scheduledDate',
        header: 'Date & Time',
        cell: ({ row }: any) => h('div', {}, [
          h('div', { class: 'text-sm font-medium text-gray-900' }, new Date(row.original.scheduledDate || row.original.createdAt).toLocaleDateString()),
          h('div', { class: 'text-[#525866] text-sm' }, row.original.scheduledStartTime || 'TBD')
        ])
      },
      {
        accessorKey: 'meetingType',
        header: 'Meeting Type',
        cell: ({ row }: any) => {
          const t = row.original.meetingType
          const UBadge = resolveComponent('UBadge') as any
          return h(UBadge, { variant: 'subtle', color: 'gray', size: 'sm' }, () => [
            h('span', {}, t === 'video' ? 'Video Call' : t === 'in_person' ? 'In Person' : 'Phone Call')
          ])
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: any) => {
          const status = row.original.status as string
          const color = status === 'confirmed' ? 'success' : status === 'pending' ? 'warning' : status === 'cancelled' ? 'error' : 'neutral'
          const bg = color === 'success' ? 'bg-green-500' : color === 'warning' ? 'bg-orange-500' : color === 'error' ? 'bg-red-500' : 'bg-gray-500'
          const UBadge = resolveComponent('UBadge') as any
          
          return h(UBadge, { 
            color, 
            variant: 'subtle', 
            size: 'sm',
            class: 'inline-flex items-center gap-1.5 capitalize'
          }, () => [
            h('span', { class: `w-1.5 h-1.5 rounded-full ${bg}` }),
            h('span', {}, status.replace('_', ' '))
          ])
        }
      },
      {
        id: 'actions',
        header: '',
        meta: { class: { td: 'text-right' } },
        cell: ({ row }: any) => {
          const UButton = resolveComponent('UButton') as any
          const UDropdownMenu = resolveComponent('UDropdownMenu') as any
          const items = [
            { label: 'View Details', icon: 'i-hugeicons-eye', to: `/dashboard/bookings/${row.original.id}` },
            { label: 'Reschedule', icon: 'i-hugeicons-calendar-01' },
            { label: 'Cancel Booking', icon: 'i-hugeicons-cancel-01', color: 'red' }
          ]
          return h('div', [
            h(UDropdownMenu, {
              content: { align: 'end' },
              items,
              ui: { group: 'p-1', label: 'font-medium text-sm leading-5 tracking-normal', item: 'p-2' }
            }, {
              default: () => h(UButton, { icon: 'i-hugeicons-more-vertical', color: 'neutral', variant: 'ghost', size: 'lg' })
            })
          ])
        }
      }
    ]

    return () => {
      const UCard = resolveComponent('UCard') as any
      const UInput = resolveComponent('UInput') as any
      const UTable = resolveComponent('UTable') as any
      const UPagination = resolveComponent('UPagination') as any

      return h('div', {}, [
        h(UCard, { ui: { body: 'rounded-none sm:p-0' } }, () => [
          h('div', { class: 'flex justify-between items-center gap-1.5 px-6 py-5' }, [
            h('div', {}, [
              h('span', { class: 'font-medium text-[#1C1C1E] text-[20px] leading-6 tracking-tight' }, props.title),
              h('span', { class: 'ml-2 font-normal text-[#8E8E93] text-sm leading-5' }, `Total ${props.bookings.length}`)
            ]),
            h('div', { class: 'flex items-center gap-3' }, [
              h(UInput, { 
                icon: 'i-hugeicons-search-01', 
                placeholder: 'Search bookings', 
                class: 'w-64',
                ui: { base: 'placeholder:font-normal placeholder:text-sm placeholder:leading-5 placeholder:tracking-tight placeholder:text-[#8E8E93]', leadingIcon: 'p-2.5 size-3' }
              })
            ])
          ]),
          h(UTable, {
            ref: (el: any) => tableApi.value = el,
            data: props.bookings,
            columns,
            pagination: props.pagination,
            'onUpdate:pagination': (val: any) => emit('update:pagination', val),
            paginationOptions: { getPaginationRowModel: getPaginationRowModel() },
            ui: {
              root: 'border border-gray-200 border-x-0 rounded-none overflow-hidden',
              thead: 'bg-gray-50',
              th: 'text-left text-sm font-medium leading-tight text-[#525866] tracking-normal',
              td: 'text-sm text-gray-900'
            }
          })
        ]),
        h('div', { class: 'flex justify-center mt-4' }, [
          h(UPagination, {
            page: (tableApi.value?.tableApi?.getState().pagination.pageIndex || 0) + 1,
            itemsPerPage: tableApi.value?.tableApi?.getState().pagination.pageSize || 10,
            total: tableApi.value?.tableApi?.getFilteredRowModel().rows.length || 0,
            'onUpdate:page': (p: number) => tableApi.value?.tableApi?.setPageIndex(p - 1)
          })
        ])
      ])
    }
  }
})

useHead({
  title: 'Bookings - LexConnect',
  meta: [
    { name: 'description', content: 'Manage your legal consultations and bookings' }
  ]
})

definePageMeta({
  layout: 'dashboard',
})

const isBookingModalOpen = ref(false)
const activeTab = ref('all')

const { useClientBookings, useUpcomingBookings } = useBookings()
const { data: bookings, isLoading, isError } = useClientBookings()
const { data: upcomingBookings } = useUpcomingBookings()

const pendingBookings = computed(() => {
  return bookings.value?.filter(b => b.status === 'pending') || []
})

const tabItems = computed<TabsItem[]>(() => [
  { label: 'All Bookings', value: 'all', slot: 'all' },
  { label: 'Upcoming', value: 'upcoming', slot: 'upcoming' },
  { 
    label: 'Pending Approvals', 
    value: 'pending', 
    slot: 'pending',
    badge: pendingBookings.value.length > 0 ? pendingBookings.value.length.toString() : undefined,
    ui: { trailingBadge: 'border-0 ring-0 rounded-full text-white bg-orange-400' }
  }
])

const links = ref<ButtonProps[]>([
  {
    label: 'New Booking',
    icon: 'i-hugeicons-add-01',
    onClick: () => { isBookingModalOpen.value = true },
    color: 'secondary',
    class: 'font-medium py-2.5 px-3 rounded-lg text-white text-sm leading-5 tracking-tight bg-[#007AFC] shadow-xs hover:bg-blue-600 transition-colors'
  }
])

const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>
