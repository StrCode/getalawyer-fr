<template>
  <div class="p-6">
    <UPageHeader 
      title="Listings"
      description="Manage your property listings here."
      :links="links"
      :ui="{
        root: 'border-none py-0',
        title: 'font-semibold !text-3xl leading-6 tracking-tight',
        description: 'font-normal text-sm leading-6 text-gray-600 mt-2'
      }"
    />
    
    <UTabs 
      v-model="activeTab"
      default-value="all-listings"
      color="neutral" 
      size="md" 
      variant="link" 
      :items="items"
      :ui="{
        root: 'py-6',
        list: 'gap-6',
        label: 'font-medium text-sm leading-5 tracking-tight text-center data-[state=active]:text-[#007AFC]',
        trigger: 'justify-start px-0 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866] hover:data-[state=inactive]:not-disabled:text-[#525866]',
        indicator: 'absolute transition-[translate,40%] duration-200 bg-[#007AFC]',
        content: 'py-3.5'
      }"
    >
      <!-- All Listings Tab -->
      <template #all-listings>
        <UCard :ui="{ 
          body: 'rounded-none sm:p-0'
          }">
          <div class="flex justify-between items-center gap-1.5 px-6 py-5">
            <div>
              <span class="font-medium text-[#1C1C1E] text-[20px] leading-6 tracking-tight">Properties</span>
              <span class="ml-2 font-normal text-[#8E8E93] text-sm leading-5">Total {{ listings.length }}</span>
            </div>
            <div class="flex items-center gap-3">
              <UInput 
                icon="i-hugeicons-search-01" 
                placeholder="Search properties" 
                class="w-64"
                :ui="{
                  base: 'placeholder:font-normal placeholder:text-sm placeholder:leading-5 placeholder:tracking-tight placeholder:text-[#8E8E93]',
                  leadingIcon: 'p-2.5 size-3',
                }"
              />
              <ListingsFilter 
                @apply="handleApplyFilters"
                @clear="handleClearFilters"
              />
            </div>
          </div>
          
          <UTable 
            ref="table"
            v-model:pagination="pagination"
            :data="listings" 
            :columns="columns"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
            :ui="{
              root: 'border border-gray-200 border-x-0 rounded-none overflow-hidden',
              thead: 'bg-gray-50',
              th: 'text-left text-sm font-medium leading-tight text-[#525866] tracking-normal',
              td: 'text-sm text-gray-900'
            }"
          />
        </UCard>
        
        <div class="flex justify-center mt-4">
          <UPagination 
            :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </template>

      <!-- Short Stay Tab -->
      <template #short-stay>
        <UCard :ui="{ 
          body: 'rounded-none sm:p-0'
          }">
          <div class="flex justify-between items-center gap-1.5 px-6 py-5">
            <div>
              <span class="font-medium text-[#1C1C1E] text-[20px] leading-6 tracking-tight">Short Stay Properties</span>
              <span class="ml-2 font-normal text-[#8E8E93] text-sm leading-5">Total {{ shortStayListings.length }}</span>
            </div>
            <div class="flex items-center gap-3">
              <UInput 
                icon="i-hugeicons-search-01" 
                placeholder="Search properties" 
                class="w-64"
                :ui="{
                  base: 'placeholder:font-normal placeholder:text-sm placeholder:leading-5 placeholder:tracking-tight placeholder:text-[#8E8E93]',
                  leadingIcon: 'p-2.5 size-3',
                }"
              />
              <ListingsFilter 
                @apply="handleApplyFilters"
                @clear="handleClearFilters"
              />
            </div>
          </div>
          
          <UTable 
            ref="shortStayTable"
            v-model:pagination="shortStayPagination"
            :data="shortStayListings" 
            :columns="columns"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
            :ui="{
              root: 'border border-gray-200 border-x-0 rounded-none overflow-hidden',
              thead: 'bg-gray-50',
              th: 'text-left text-sm font-medium leading-tight text-[#525866] tracking-normal',
              td: 'text-sm text-gray-900'
            }"
          />
        </UCard>
        
        <div class="flex justify-center mt-4">
          <UPagination 
            :page="(shortStayTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="shortStayTable?.tableApi?.getState().pagination.pageSize"
            :total="shortStayTable?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => shortStayTable?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </template>

      <!-- Rental Tab -->
      <template #rental>
        <UCard :ui="{ 
          body: 'rounded-none sm:p-0'
          }">
          <div class="flex justify-between items-center gap-1.5 px-6 py-5">
            <div>
              <span class="font-medium text-[#1C1C1E] text-[20px] leading-6 tracking-tight">Rental Properties</span>
              <span class="ml-2 font-normal text-[#8E8E93] text-sm leading-5">Total {{ rentalListings.length }}</span>
            </div>
            <div class="flex items-center gap-3">
              <UInput 
                icon="i-hugeicons-search-01" 
                placeholder="Search properties" 
                class="w-64"
                :ui="{
                  base: 'placeholder:font-normal placeholder:text-sm placeholder:leading-5 placeholder:tracking-tight placeholder:text-[#8E8E93]',
                  leadingIcon: 'p-2.5 size-3',
                }"
              />
              <ListingsFilter 
                @apply="handleApplyFilters"
                @clear="handleClearFilters"
              />
            </div>
          </div>
          
          <UTable 
            ref="rentalTable"
            v-model:pagination="rentalPagination"
            :data="rentalListings" 
            :columns="columns"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
            :ui="{
              root: 'border border-gray-200 border-x-0 rounded-none overflow-hidden',
              thead: 'bg-gray-50',
              th: 'text-left text-sm font-medium leading-tight text-[#525866] tracking-normal',
              td: 'text-sm text-gray-900'
            }"
          />
        </UCard>
        
        <div class="flex justify-center mt-4">
          <UPagination 
            :page="(rentalTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="rentalTable?.tableApi?.getState().pagination.pageSize"
            :total="rentalTable?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => rentalTable?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </template>

      <!-- Pending Approvals Tab -->
      <template #pending-approvals>
        <div class="space-y-6">
          <!-- Stats Cards -->
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatCard 
              label="Total Pending" 
              :value="pendingApprovals.length.toString()"
            />
            <DashboardStatCard 
              label="Pending This Week" 
              value="8"
            />
            <DashboardStatCard 
              label="Avg Review Time" 
              value="2.5 days"
            />
            <DashboardStatCard 
              label="Approval Rate" 
              value="92%"
            />
          </div>

          <!-- Pending Approvals Table -->
          <UCard :ui="{ 
            body: 'rounded-none sm:p-0'
            }">
            <div class="flex justify-between items-center gap-1.5 px-6 py-5">
              <div>
                <span class="font-medium text-[#1C1C1E] text-[20px] leading-6 tracking-tight">Pending Approvals</span>
                <span class="ml-2 font-normal text-[#8E8E93] text-sm leading-5">Total {{ pendingApprovals.length }}</span>
              </div>
              <div class="flex items-center gap-3">
                <UInput 
                  icon="i-hugeicons-search-01" 
                  placeholder="Search pending properties" 
                  class="w-64"
                  :ui="{
                    base: 'placeholder:font-normal placeholder:text-sm placeholder:leading-5 placeholder:tracking-tight placeholder:text-[#8E8E93]',
                    leadingIcon: 'p-2.5 size-3',
                  }"
                />
              </div>
            </div>
            
            <UTable 
              ref="pendingTable"
              v-model:pagination="pendingPagination"
              :data="pendingApprovals" 
              :columns="pendingColumns"
              :pagination-options="{
                getPaginationRowModel: getPaginationRowModel()
              }"
              :ui="{
                root: 'border border-gray-200 border-x-0 rounded-none overflow-hidden',
                thead: 'bg-gray-50',
                th: 'text-left text-sm font-medium leading-tight text-[#525866] tracking-normal',
                td: 'text-sm text-gray-900'
              }"
            />
          </UCard>
          
          <div class="flex justify-center mt-4">
            <UPagination 
              :page="(pendingTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="pendingTable?.tableApi?.getState().pagination.pageSize"
              :total="pendingTable?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => pendingTable?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { TabsItem } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { faker } from '@faker-js/faker'

useHead({
  title: 'Listings - Smart Stay Rentals',
  meta: [
    { name: 'description', content: 'Manage your property listings and pending approvals' }
  ]
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

definePageMeta({
  layout: 'dashboard',
})

type Property = {
  id: number
  name: string
  location: string
  image: string
  type: string
  status: 'Occupied' | 'Vacant'
  views: number
  reviews: number
}

type PendingApproval = {
  id: number
  name: string
  location: string
  image: string
  type: string
  price: number
  submittedBy: string
  date: string
}

const activeTab = ref('all-listings')

const items = ref<TabsItem[]>([
  {
    label: 'All Listings',
    value: 'all-listings',
    slot: 'all-listings'
  },
  {
    label: 'Short Stay',
    value: 'short-stay',
    slot: 'short-stay'
  },
  {
    label: 'Rental',
    value: 'rental',
    slot: 'rental'
  },
  {
    icon: 'i-ci-line-l',
    disabled: true
  },
  {
    icon: 'i-hugeicons-clock-05',
    label: 'Pending Approvals',
    value: 'pending-approvals',
    slot: 'pending-approvals',
    badge: '100',
    ui: { trailingBadge: 'border-0 ring-0 rounded-full text-white bg-red-400', 
    trailingBadgeSize: ''
  }
  },

])

const links = ref<ButtonProps[]>([
  {
    label: 'Add Property',
    icon: 'i-hugeicons-add-01',
    to: '/dashboard/listings/new',
    color: 'secondary',
    class: 'font-medium py-2.5 px-3 rounded-lg text-white text-sm leading-5 tracking-tight bg-[#007AFC] shadow-xs'
  }
])

// Filter handlers
type FilterData = {
  propertyTypes: string[]
  status: { occupied: boolean; vacant: boolean }
  bedrooms: number | string
  beds: number | string
  priceRange: { min: string; max: string }
}

function handleApplyFilters(filters: FilterData) {
  console.log('Applying filters:', filters)
  // TODO: Implement filter logic
}

function handleClearFilters() {
  console.log('Clearing filters')
  // TODO: Implement clear filter logic
}

const propertyTypes = ['House', 'Apartment', 'Guesthouse', 'Villa', 'Condo']
const statuses: ('Occupied' | 'Vacant')[] = ['Occupied', 'Vacant']

// Use a seeded faker to ensure consistent data between server and client
const seededFaker = faker
seededFaker.seed(123)

const listings = ref<Property[]>(
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: seededFaker.location.streetAddress({ useFullAddress: false }) + ' ' + seededFaker.helpers.arrayElement(['Condo', 'Apartment', 'House', 'Villa']),
    location: `${seededFaker.location.street()}, ${seededFaker.location.city()}, ${seededFaker.location.state()}`,
    image: `https://picsum.photos/seed/${seededFaker.string.alphanumeric(8)}/400/400`,
    type: seededFaker.helpers.arrayElement(propertyTypes),
    status: seededFaker.helpers.arrayElement(statuses),
    views: seededFaker.number.int({ min: 0, max: 100 }),
    reviews: seededFaker.number.int({ min: 0, max: 50 })
  }))
)

// Short Stay listings data
const shortStayListings = ref<Property[]>(
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 11,
    name: seededFaker.location.streetAddress({ useFullAddress: false }) + ' ' + seededFaker.helpers.arrayElement(['Condo', 'Apartment', 'House', 'Villa']),
    location: `${seededFaker.location.street()}, ${seededFaker.location.city()}, ${seededFaker.location.state()}`,
    image: `https://picsum.photos/seed/${seededFaker.string.alphanumeric(8)}/400/400`,
    type: seededFaker.helpers.arrayElement(propertyTypes),
    status: seededFaker.helpers.arrayElement(statuses),
    views: seededFaker.number.int({ min: 0, max: 100 }),
    reviews: seededFaker.number.int({ min: 0, max: 50 })
  }))
)

// Rental listings data
const rentalListings = ref<Property[]>(
  Array.from({ length: 6 }, (_, i) => ({
    id: i + 21,
    name: seededFaker.location.streetAddress({ useFullAddress: false }) + ' ' + seededFaker.helpers.arrayElement(['Condo', 'Apartment', 'House', 'Villa']),
    location: `${seededFaker.location.street()}, ${seededFaker.location.city()}, ${seededFaker.location.state()}`,
    image: `https://picsum.photos/seed/${seededFaker.string.alphanumeric(8)}/400/400`,
    type: seededFaker.helpers.arrayElement(propertyTypes),
    status: seededFaker.helpers.arrayElement(statuses),
    views: seededFaker.number.int({ min: 0, max: 100 }),
    reviews: seededFaker.number.int({ min: 0, max: 50 })
  }))
)

// Pending approvals data
const pendingApprovals = ref<PendingApproval[]>(
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: seededFaker.location.streetAddress({ useFullAddress: false }) + ' ' + seededFaker.helpers.arrayElement(['Condo', 'Apartment', 'House', 'Villa']),
    location: `${seededFaker.location.street()}, ${seededFaker.location.city()}, ${seededFaker.location.state()}`,
    image: `https://picsum.photos/seed/${seededFaker.string.alphanumeric(8)}/400/400`,
    type: seededFaker.helpers.arrayElement(propertyTypes),
    price: seededFaker.number.int({ min: 50000, max: 500000 }),
    submittedBy: seededFaker.person.fullName(),
    date: seededFaker.date.recent({ days: 30 }).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }))
)

const table = useTemplateRef('table')
const shortStayTable = useTemplateRef('shortStayTable')
const rentalTable = useTemplateRef('rentalTable')
const pendingTable = useTemplateRef('pendingTable')

const pagination = ref({
  pageIndex: 0,
  pageSize: 7
})

const shortStayPagination = ref({
  pageIndex: 0,
  pageSize: 7
})

const rentalPagination = ref({
  pageIndex: 0,
  pageSize: 7
})

const pendingPagination = ref({
  pageIndex: 0,
  pageSize: 7
})

const columns: TableColumn<Property>[] = [
  {
    accessorKey: 'name',
    header: 'Property',
    cell: ({ row }) => {
      const PropertyImagePreview = resolveComponent('PropertyImagePreview')
      return h('div', { class: 'flex items-center gap-3' }, [
        h(PropertyImagePreview, {
          image: row.original.image,
          title: row.original.name
        }),
        h('div', {}, [
          h('div', { class: 'text-sm font-medium text-gray-900' }, row.original.name),
          h('div', { class: 'text-[#525866] text-sm' }, row.original.location)
        ])
      ])
    }
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const color = status === 'Occupied' ? 'success' : 'warning'
      
      return h(UBadge, { 
        color, 
        variant: 'subtle', 
        size: 'sm',
        class: 'inline-flex items-center gap-1.5'
      }, () => [
        h('span', { 
          class: `w-1.5 h-1.5 rounded-full ${status === 'Occupied' ? 'bg-green-500' : 'bg-orange-500'}` 
        }),
        h('span', {}, status)
      ])
    }
  },
  {
    accessorKey: 'views',
    header: 'Views'
  },
  {
    accessorKey: 'reviews',
    header: 'Reviews & Ratings'
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h('div', [
        h(UDropdownMenu, {
          content: {
            align: 'end'
          },
          items: getRowItems(row),
          ui: {
            group: 'p-1 ',
            label: 'font-medium text-sm leading-5 tracking-normal text-[#525866]',
            leadingIcon: 'size-2.5 p-1',
            item: 'p-2',
          }
        }, {
          default: () => h(UButton, {
            icon: 'i-hugeicons-more-vertical',
            color: 'neutral',
            variant: 'ghost',
            size: 'lg'
          })
        })
      ])
    }
  }
]

// Pending approvals columns
const pendingColumns: TableColumn<PendingApproval>[] = [
  {
    accessorKey: 'name',
    header: 'Property',
    cell: ({ row }) => {
      const PropertyImagePreview = resolveComponent('PropertyImagePreview')
      return h('div', { class: 'flex items-center gap-3' }, [
        h(PropertyImagePreview, {
          image: row.original.image,
          title: row.original.name
        }),
        h('div', {}, [
          h('div', { class: 'text-sm font-medium text-gray-900' }, row.original.name),
          h('div', { class: 'text-[#525866] text-sm' }, row.original.location)
        ])
      ])
    }
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return h('span', {}, `₦${price.toLocaleString()}`)
    }
  },
  {
    accessorKey: 'submittedBy',
    header: 'Submitted By'
  },
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h('div', [
        h(UDropdownMenu, {
          content: {
            align: 'end'
          },
          items: getPendingRowItems(row),
          ui: {
            group: 'p-1 ',
            label: 'font-medium text-sm leading-5 tracking-normal text-[#525866]',
            leadingIcon: 'size-2.5 p-1',
            item: 'p-2',
          }
        }, {
          default: () => h(UButton, {
            icon: 'i-hugeicons-more-vertical',
            color: 'neutral',
            variant: 'ghost',
            size: 'lg'
          })
        })
      ])
    }
  }
]

function getRowItems(row: Row<Property>) {
  return [
    {
      label: 'View Property',
      icon: 'i-hugeicons-eye',
      to: `/dashboard/listings/${row.original.id}`
    },
    {
      label: 'Edit Property',
      icon: 'i-hugeicons-pencil-edit-01'
    },
    {
      label: 'View Reviews',
      icon: 'i-hugeicons-message-preview-02'
    },
    {
      label: 'Disable',
      icon: 'i-hugeicons-cancel-circle-half-dot'
    },
    {
      label: 'Delete',
      icon: 'i-hugeicons-delete-04',
    }
  ]
}

function getPendingRowItems(_row: Row<PendingApproval>) {
  return [
    {
      label: 'View Property',
      icon: 'i-hugeicons-eye'
    },
    {
      label: 'Edit Property',
      icon: 'i-hugeicons-pencil-edit-01'
    },
    {
      label: 'Approve',
      icon: 'i-hugeicons-checkmark-circle-02'
    },
    {
      label: 'Decline',
      icon: 'i-hugeicons-delete-04'
    }
  ]
}
</script>
