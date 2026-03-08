<template>
  <div class="p-6">
    <!-- Back Button -->
    <NuxtLink to="/dashboard/listings"
      class="inline-flex items-center gap-1 mb-6 text-[#171717] text-sm decoration-1 decoration-transparent hover:decoration-[#171717] underline underline-offset-4 transition-colors duration-300 cursor-pointer">
      <UIcon name="i-hugeicons-arrow-left-01" class="bg-[#171717] w-4 h-4" />
      Back to Listings 
    </NuxtLink>

    <div class="flex justify-between items-start">
      <div class="flex gap-3">
        <PropertyImagePreview
          :image="property.image"
          :title="property.name"
        />
        <div class="space-y-0.5">
          <p class="font-medium text-gray-900 text-sm">
            {{ property.name }}
          </p>
          <p class="text-[#525866] text-sm">
            {{ property.location }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <p class="font-normal text-[#171717] text-sm">         
          ID: #ORD-98745
        </p>
        <UBadge 
          :color="property.status === 'Occupied' ? 'success' : 'warning'"
          variant="subtle"
          size="sm"
          class="inline-flex items-center gap-1.5"
        >
          <span 
            :class="`w-1.5 h-1.5 rounded-full ${property.status === 'Occupied' ? 'bg-green-500' : 'bg-orange-500'}`"
          />
          {{ property.status }}
        </UBadge>
      </div>
    </div>

    <!-- Tabs -->
    <UTabs 
      color="neutral" 
      size="md" 
      variant="link" 
      :items="tabs"
      :ui="{
        root: 'py-6',
        list: 'gap-6',
        label: 'font-medium text-sm leading-5 tracking-tight text-center data-[state=active]:text-[#007AFC]',
        trigger: 'justify-start px-0 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866] hover:data-[state=inactive]:not-disabled:text-[#525866]',
        indicator: 'absolute transition-[translate,40%] duration-200 bg-[#007AFC]',
        content: 'py-3.5'
      }"
    >
      <!-- Details & Photos Tab -->
      <template #details-photos>
        <div class="space-y-6">
          <!-- Photo Gallery -->
          <div class="gap-1 grid grid-cols-4 grid-rows-2">
            <!-- Large image - spans 2 rows and 2 columns -->
            <div class="col-span-2 row-span-2">
              <img 
                :src="photos[0]" 
                :alt="property.name"
                class="rounded-2xl w-full h-full object-cover"
              />
            </div>
            
            <!-- Top right image - spans 2 columns -->
            <div class="col-span-2">
              <img 
                :src="photos[1]"
                alt="Property view"
                class="rounded-2xl w-full h-full object-cover"
              />
            </div>
            
            <!-- Bottom left small image -->
            <div>
              <img 
                :src="photos[2]"
                alt="Property view"
                class="rounded-2xl w-full h-full object-cover"
              />
            </div>
            
            <!-- Bottom right small image with overlay -->
            <div class="relative">
              <img 
                :src="photos[3]"
                alt="Property view"
                class="rounded-2xl w-full h-full object-cover"
              />
              <button class="right-2.5 bottom-2.5 absolute flex justify-center items-center bg-[#F6F8FA]/90 hover:bg-[#F6F8FA] px-2 py-1.5 rounded-xl transition-colors">
                <div class="flex items-center gap-2 text-[#3A3A3C]">
                  <UIcon name="i-hugeicons-image-01" class="bg-[] w-5 h-5" />
                  <span class="font-medium text-xs">Show all photos</span>
                </div>
              </button>
            </div>
          </div>

          <!-- About this place -->
            <div class="space-y-4">
              <h2 class="font-semibold text-[#1C1C1E] text-xl">About this place</h2>
              <p class="text-[#1C1C1E] text-sm leading-6">
                {{ property.description }}
              </p>
              <p class="font-normal text-[#1C1C1E] text-sm leading-6">
                Lorem ipsum dolor sit amet consectetur. Fermentum faucibus enim cursus id maecenas pulvinar mi cras. Et enim felis in arcu aliquam. Est vitae massa eu malesuada. In at sed elit cursus vestibulum sed hendrerit ut augue. Nulla id justo netus leo. Dignissim mollis ultrices luctus facilisis nunc diam curabitur volutpat risus. Phasellus turpis nulla ullamcorper eget. Porta nunc.
              </p>
              <p class="text-[#1C1C1E] text-sm leading-6">
                Lorem ipsum dolor sit amet consectetur. Fermentum faucibus enim cursus id maecenas pulvinar mi cras. Et enim felis in arcu aliquam. Est vitae massa eu malesuada. In at sed elit cursus vestibulum sed hendrerit ut augue. Nulla id justo netus leo. Dignissim mollis ultrices luctus facilisis nunc diam curabitur volutpat risus. Phasellus turpis nulla ullamcorper eget. Porta nunc.
              </p>
            </div>

          <USeparator type="dotted" :ui="{ root: 'py-4' }" />

          <!-- What this place offers -->
            <div class="space-y-6">
              <h2 class="font-semibold text-[#1C1C1E] text-xl">What this place offers</h2>
              <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
                <div v-for="amenity in amenities" :key="amenity.name" class="flex items-center gap-3">
                  <UIcon :name="amenity.icon" class="w-5 h-5 text-[#1C1C1E]" />
                  <span class="text-[#1C1C1E] text-sm">{{ amenity.name }}</span>
                </div>
              </div>
            </div>
        </div>
      </template>

      <!-- Pricing & Availability Tab -->
      <template #pricing-availability>
        <div class="space-y-6">
          <!-- Stats Cards -->
          <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <div class="flex flex-col gap-2.5">
                  <p class="font-medium text-[#433740] text-sm/loose">Nightly Rate</p>
                  <p class="font-semibold text-[#1C1C1E] text-3xl">₦62,000</p>
                </div>
                <p class="font-medium text-[#8E8E93] text-xs">Average per night</p>
              </div>
            </UCard>
            
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <div class="flex flex-col gap-2.5">
                  <p class="font-medium text-[#433740] text-sm/loose">Monthly Rent</p>
                  <p class="font-semibold text-[#1C1C1E] text-3xl">₦480,000</p>
                </div>
                <p class="font-medium text-[#8E8E93] text-xs">Average per night</p>
              </div>
            </UCard>
            
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <div class="flex flex-col gap-2.5">
                  <p class="font-medium text-[#433740] text-sm/loose">Occupancy Rate</p>
                  <p class="font-semibold text-[#1C1C1E] text-3xl">85%</p>
                </div>
                <p class="font-medium text-[#8E8E93] text-xs">Last 30 days</p>
              </div>
            </UCard>
          </div>

          <!-- Pricing Details -->
          <UCard :ui="{
            header: 'sm:px-0 mx-4',
            body: 'px-4 sm:px-4 sm:py-0'
          }">
            <template #header>
              <h3 class="font-medium text-[#1C1C1E] text-base">Pricing Details</h3>
            </template>
            <div class="py-4">
            <div v-for="(item, index) in pricingDetails" :key="item.label">
              <div class="flex justify-between items-center">
                <div class="flex flex-col gap-1">
                  <p class="font-normal text-[#1C1C1E] text-sm">{{ item.label }}</p>
                  <p class="text-[#8E8E93] text-xs">{{ item.description }}</p>
                </div>
                <p class="font-semibold text-[#201A1E] text-xs">{{ item.amount }}</p>
              </div>
              <USeparator class="py-4 text-[#EBEBEB]" v-if="index < pricingDetails.length - 1" />
            </div>
            </div>
          </UCard>
          
          <!-- Schedule -->
          <div class="space-y-4">
            <h3 class="font-semibold text-[#1C1C1E] text-base">Schedule</h3>
            <UCard>
              <!-- Calendar Header -->
              <div class="flex justify-between items-center mb-6">
                <UButton
                  icon="i-hugeicons-arrow-left-01"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :ui="{ base: 'p-1' }"
                />
                <p class="font-medium text-[#1C1C1E] text-sm">January 2026</p>
                <UButton
                  icon="i-hugeicons-arrow-right-01"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :ui="{ base: 'p-1' }"
                />
              </div>

              <!-- Calendar Days -->
              <div class="flex justify-between items-center mb-6">
                <UButton
                  icon="i-hugeicons-arrow-left-01"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :ui="{ base: 'p-1' }"
                />
                <div class="flex gap-4">
                  <div v-for="day in calendarDays" :key="day.date" class="text-center">
                    <p class="mb-2 text-[#8E8E93] text-xs">{{ day.dayName }}</p>
                    <div 
                      :class="[
                        'px-6 py-2 rounded-lg text-sm font-medium',
                        day.isSelected ? 'bg-[#007AFC] text-white' : 'text-[#1C1C1E]'
                      ]"
                    >
                      {{ day.date }}
                    </div>
                  </div>
                </div>
                <UButton
                  icon="i-hugeicons-arrow-right-01"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :ui="{ base: 'p-1' }"
                />
              </div>

              <!-- Tabs for Current/Upcoming -->
              <UTabs :items="scheduleTabs" variant="link" class="gap-4 w-full"
              :ui="{
                  root: 'mb-4',
                  list: 'gap-3 border-b border-1 border-gray-200',
                  label: 'font-medium text-sm',
                  trigger: 'grow px-0 pb-3 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866]',
                  indicator: 'bg-[#007AFC]'
                }"
              >
                <template #current>
                  <div class="space-y-2 py-4">
                    <div v-for="booking in currentBookings" :key="booking.id" class="flex justify-between items-start bg-[#F7F7F7] p-4 rounded-lg">
                      <div class="">
                        <p class="font-medium text-[#1C1C1E] text-sm">{{ booking.guestName }}</p>
                        <div>
                          <p class="font-medium text-[#5C5C5C] text-xs/loose tracking-widest">{{ booking.dates }}</p>
                          <p class="font-medium text-[#5C5C5C] text-xs/loose tracking-widest">{{ booking.nights }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        <UIcon name="i-hugeicons-user" class="w-3 h-3 text-[#5C5C5C]" />
                        <p class="font-medium text-[#5C5C5C] text-sm">{{ booking.amount }}</p>
                      </div>
                    </div>
                  </div>
                </template>

                <template #upcoming>
                  <div class="space-y-2 py-4">
                    <div v-for="booking in upcomingBookings" :key="booking.id" class="flex justify-between items-start bg-[#F7F7F7] p-4 rounded-lg">
                      <div class="">
                        <p class="font-medium text-[#1C1C1E] text-sm">{{ booking.guestName }}</p>
                        <div>
                          <p class="font-medium text-[#5C5C5C] text-xs/loose tracking-widest">{{ booking.dates }}</p>
                          <p class="font-medium text-[#5C5C5C] text-xs/loose tracking-widest">{{ booking.nights }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1">
                        <UIcon name="i-hugeicons-user" class="w-3 h-3 text-[#5C5C5C]" />
                        <p class="font-medium text-[#5C5C5C] text-sm">{{ booking.amount }}</p>
                      </div>
                    </div>
                  </div>
                </template>
              </UTabs>
            </UCard>
          </div>
        </div>
      </template>

      <!-- Assets/Inventory Tab -->
      <template #assets-inventory>
        <div class="space-y-6">
          <!-- Stats Cards -->
          <div class="gap-4 grid grid-cols-1 md:grid-cols-4">
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <p class="font-medium text-[#525866] text-sm">Total Assets</p>
                <p class="font-semibold text-[#1C1C1E] text-3xl">6</p>
              </div>
            </UCard>
            
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <p class="font-medium text-[#525866] text-sm">Excellent Condition</p>
                <p class="font-semibold text-[#1C1C1E] text-3xl">2</p>
              </div>
            </UCard>
            
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <p class="font-medium text-[#525866] text-sm">Needs Attention</p>
                <p class="font-semibold text-[#1C1C1E] text-3xl">1</p>
              </div>
            </UCard>
            
            <UCard :ui="{ body: 'sm:px-6 sm:py-4' }">
              <div class="space-y-1">
                <p class="font-medium text-[#525866] text-sm">Open Incidents</p>
                <p class="font-semibold text-[#1C1C1E] text-3xl">1</p>
              </div>
            </UCard>
          </div>

          <!-- Tabs and Add Button -->
          <div class="relative p-4 border border-[#EBEBEB] rounded-2xl">
            <UTabs
              v-model="activeAssetTab"
              :items="assetTabs"
              variant="link"
              :ui="{
                list: 'gap-6 border-b border-gray-200',
                label: 'font-medium text-sm',
                trigger: 'px-0 pb-3 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866]',
                indicator: 'bg-[#007AFC]'
              }"
            >
              <template #asset-registry>
                <div class="space-y-4 pt-4">
                  <!-- Search and Filter -->
                  <div class="flex gap-3">
                    <div class="flex-1">
                      <UInput
                        icon="i-hugeicons-search-01"
                        class="w-full"
                        placeholder="Search assets..."
                        :ui="{
                          base: 'w-full placeholder:text-[#8E8E93]',
                          leading: 'pl-3'
                        }"
                      />
                    </div>
                    <UButton
                      icon="i-hugeicons-filter"
                      label="Filter"
                      color="neutral"
                      variant="outline"
                    />
                  </div>

                  <!-- Asset Cards Grid -->
                  <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
                    <UCard v-for="asset in assets" :key="asset.id" :ui="{ body: 'p-4 bg-[#F7F7F7]' }">
                      <div class="flex gap-4">
                        <img 
                          :src="asset.image" 
                          :alt="asset.name"
                          class="rounded-lg w-20 h-20 object-cover"
                        />
                        <div class="flex-1">
                          <div class="flex justify-between items-start mb-2">
                            <div>
                              <h4 class="font-semibold text-[#1C1C1E] text-sm">{{ asset.name }}</h4>
                              <p class="text-[#8E8E93] text-xs">{{ asset.category }}</p>
                            </div>
                            <UDropdownMenu>
                              <template #default="{ open }">
                                <UButton
                                  icon="i-hugeicons-more-vertical"
                                  color="neutral"
                                  variant="ghost"
                                  size="sm"
                                  :ui="{ base: 'p-1' }"
                                />
                              </template>
                              <template #content>
                                <UDropdownMenuItem label="Edit" />
                                <UDropdownMenuItem label="Delete" />
                              </template>
                            </UDropdownMenu>
                          </div>
                          <UBadge 
                            :color="asset.condition === 'Excellent' ? 'success' : 'warning'"
                            variant="subtle"
                            size="sm"
                            class="mb-2"
                          >
                            {{ asset.condition }}
                          </UBadge>
                          <div class="space-y-1">
                            <p class="text-[#525866] text-xs">
                              <span class="font-medium">Brand:</span> {{ asset.brand }}
                            </p>
                            <p class="text-[#525866] text-xs">
                              <span class="font-medium">Serial:</span> {{ asset.serial }}
                            </p>
                            <p class="text-[#8E8E93] text-xs">{{ asset.location }}</p>
                          </div>
                        </div>
                      </div>
                    </UCard>
                  </div>
                </div>
              </template>

              <template #condition-logs>
                <div class="space-y-4 pt-4">
                  <!-- Search and Filter -->
                  <div class="flex gap-3">
                    <div class="flex-1">
                      <UInput
                        icon="i-hugeicons-search-01"
                        class="w-full"
                        placeholder="Search assets..."
                        :ui="{
                          base: 'w-full placeholder:text-[#8E8E93]',
                          leading: 'pl-3'
                        }"
                      />
                    </div>
                    <UButton
                      icon="i-hugeicons-filter"
                      label="Filter"
                      color="neutral"
                      variant="outline"
                    />
                  </div>

                  <!-- Condition Logs List -->
                  <div class="space-y-3">
                    <UCard v-for="log in conditionLogs" :key="log.id" :ui="{ body: 'p-4 bg-[#F7F7F7]' }">
                      <div class="flex gap-4">
                        <img 
                          :src="log.image" 
                          :alt="log.assetName"
                          class="rounded-lg w-20 h-20 object-cover"
                        />
                        <div class="flex-1">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h4 class="mb-1 font-semibold text-[#1C1C1E] text-sm">{{ log.assetName }}</h4>
                              <div class="flex items-center gap-2 mb-2">
                                <p class="text-[#8E8E93] text-xs">{{ log.date }}</p>
                                <span class="text-[#8E8E93]">•</span>
                                <p class="text-[#8E8E93] text-xs">{{ log.reporter }}</p>
                              </div>
                              <p class="text-[#525866] text-sm">{{ log.description }}</p>
                            </div>
                            <UBadge 
                              :color="log.condition === 'Excellent' ? 'success' : 'warning'"
                              variant="subtle"
                              size="sm"
                            >
                              <span class="flex items-center gap-1.5">
                                <span 
                                  :class="`w-1.5 h-1.5 rounded-full ${log.condition === 'Excellent' ? 'bg-green-500' : 'bg-orange-500'}`"
                                />
                                {{ log.condition }}
                              </span>
                            </UBadge>
                          </div>
                        </div>
                      </div>
                    </UCard>
                  </div>
                </div>
              </template>

              <template #incident-reports>
                <div class="space-y-4 pt-4">
                  <!-- Search and Filter -->
                  <div class="flex gap-3">
                    <div class="flex-1">
                      <UInput
                        icon="i-hugeicons-search-01"
                        class="w-full"
                        placeholder="Search assets..."
                        :ui="{
                          base: 'w-full placeholder:text-[#8E8E93]',
                          leading: 'pl-3'
                        }"
                      />
                    </div>
                    <UButton
                      icon="i-hugeicons-filter"
                      label="Filter"
                      color="neutral"
                      variant="outline"
                    />
                  </div>

                  <!-- Incident Reports List -->
                  <div class="space-y-3">
                    <UCard v-for="incident in incidentReports" :key="incident.id" :ui="{ body: 'p-4 bg-[#F7F7F7]' }">
                      <div class="flex gap-4">
                        <img 
                          :src="incident.image" 
                          :alt="incident.assetName"
                          class="rounded-lg w-20 h-20 object-cover"
                        />
                        <div class="flex-1">
                          <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                              <h4 class="mb-1 font-semibold text-[#1C1C1E] text-sm">{{ incident.title }}</h4>
                              <div class="flex items-center gap-2 mb-1">
                                <p class="text-[#8E8E93] text-xs">Asset: {{ incident.assetName }}</p>
                                <span class="text-[#8E8E93]">•</span>
                                <p class="text-[#8E8E93] text-xs">{{ incident.category }}</p>
                              </div>
                              <div class="flex items-center gap-2 mb-2">
                                <p class="text-[#8E8E93] text-xs">{{ incident.date }}</p>
                                <span class="text-[#8E8E93]">•</span>
                                <p class="text-[#8E8E93] text-xs">Reported by {{ incident.reporter }}</p>
                              </div>
                              <p class="text-[#525866] text-sm">{{ incident.description }}</p>
                            </div>
                            <div class="flex gap-2">
                              <UBadge 
                                :color="incident.severity === 'Low' ? 'success' : incident.severity === 'Medium' ? 'warning' : 'error'"
                                variant="subtle"
                                size="sm"
                              >
                                {{ incident.severity }}
                              </UBadge>
                              <UBadge 
                                :color="incident.status === 'Resolved' ? 'success' : 'info'"
                                variant="subtle"
                                size="sm"
                              >
                                {{ incident.status }}
                              </UBadge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </UCard>
                  </div>
                </div>
              </template>
            </UTabs>

            <!-- Dynamic Action Button -->
            <UButton
              :icon="actionButtonConfig.icon"
              :label="actionButtonConfig.label"
              color="secondary"
              size="md"
              :ui="{
                leadingIcon: 'size-4'
              }"
              class="top-5 right-4 absolute rounded-lg"
              @click="handleActionButtonClick"
            />
          </div>
        </div>
      </template>
    </UTabs>

    <!-- Add Asset Modal -->
    <AddAssetModal v-model:open="isAddAssetModalOpen" />
    
    <!-- Log Asset Condition Modal -->
    <LogAssetConditionModal v-model:open="isLogConditionModalOpen" />
    
    <!-- Report Incident Modal -->
    <ReportIncidentModal v-model:open="isReportIncidentModalOpen" />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Property Details - Smart Stay Rentals',
  meta: [
    { name: 'description', content: 'View and manage property details, pricing, availability, and assets' }
  ]
})

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
  description?: string
}

// Mock property data - in a real app, this would come from an API
const property = ref<Property>({
  id: 1,
  name: 'Luxury Beachfront Villa',
  location: 'Miami, Florida, USA',
  image: 'https://picsum.photos/seed/prop1/800/600',
  type: 'Villa',
  status: 'Occupied',
  views: 1250,
  reviews: 48,
  description: 'Beautiful beachfront villa with stunning ocean views, modern amenities, and direct beach access. Perfect for vacation rentals or long-term stays. Features 4 bedrooms, 3 bathrooms, infinity pool, and fully equipped kitchen.'
})

const tabs = [
  {
    label: 'Details & Photos',
    slot: 'details-photos'
  },
  {
    label: 'Pricing & Availability',
    slot: 'pricing-availability'
  },
  {
    label: 'Assets/Inventory',
    slot: 'assets-inventory'
  }
]

const amenities = [
  { name: 'Garden view', icon: 'i-hugeicons-home-01' },
  { name: 'Kitchen', icon: 'i-hugeicons-home-01' },
  { name: 'Kitchen', icon: 'i-hugeicons-home-01' },
  { name: 'Wifi', icon: 'i-hugeicons-wifi-01' },
  { name: 'Pets allowed', icon: 'i-hugeicons-favourite' },
  { name: 'Pets allowed', icon: 'i-hugeicons-favourite' },
  { name: 'Washing machine', icon: 'i-hugeicons-settings-02' },
  { name: 'Solar Inverter', icon: 'i-hugeicons-flash' },
  { name: 'Solar Inverter', icon: 'i-hugeicons-flash' },
  { name: 'Air conditioning', icon: 'i-hugeicons-sun-01' },
  { name: 'Security cameras on property', icon: 'i-hugeicons-video-camera' },
  { name: 'Security cameras on property', icon: 'i-hugeicons-video-camera' },
  { name: 'Swimming pool', icon: 'i-hugeicons-home-03' },
  { name: 'Gym / Fitness center', icon: 'i-hugeicons-favourite' },
  { name: 'Gym / Fitness center', icon: 'i-hugeicons-favourite' }
]

const photos = [
  property.value.image,
  'https://picsum.photos/seed/photo2/400/200',
  'https://picsum.photos/seed/photo3/400/200',
  'https://picsum.photos/seed/photo4/400/200'
]

const pricingDetails = [
  { label: 'Base Nightly Rate', description: 'Standard pricing', amount: '₦62,000' },
  { label: 'Base Nightly Rate', description: 'Standard pricing', amount: '₦62,000' },
  { label: 'Base Nightly Rate', description: 'Standard pricing', amount: '₦62,000' },
  { label: 'Cleaning Fee', description: 'One-time fee', amount: '₦62,000' },
  { label: 'Security Deposit', description: 'Refundable', amount: '₦62,000' }
]

const calendarDays = [
  { dayName: 'Fri', date: '31', isSelected: false },
  { dayName: 'Sat', date: '01', isSelected: false },
  { dayName: 'Sun', date: '02', isSelected: true },
  { dayName: 'Mon', date: '03', isSelected: false },
  { dayName: 'Tue', date: '04', isSelected: false }
]

const scheduleTabs = [
  { label: 'Current', slot: 'current', icon: 'i-hugeicons-calendar-03' },
  { label: 'Upcoming', slot: 'upcoming', icon: 'i-hugeicons-calendar-03' }
]

const currentBookings = [
  { id: 1, guestName: 'John Smith', dates: 'JAN 15 - JAN 20, 2025', nights: '5 nights', amount: '₦62,000' },
  { id: 2, guestName: 'John Smith', dates: 'JAN 15 - JAN 20, 2025', nights: '5 nights', amount: '₦62,000' },
  { id: 3, guestName: 'John Smith', dates: 'JAN 15 - JAN 20, 2025', nights: '5 nights', amount: '₦62,000' },
  { id: 4, guestName: 'John Smith', dates: 'JAN 15 - JAN 20, 2025', nights: '5 nights', amount: '₦62,000' },
  { id: 5, guestName: 'John Smith', dates: 'JAN 15 - JAN 20, 2025', nights: '5 nights', amount: '₦62,000' }
]

const upcomingBookings = [
  { id: 6, guestName: 'Jane Doe', dates: 'FEB 01 - FEB 05, 2025', nights: '4 nights', amount: '₦52,000' },
  { id: 7, guestName: 'Mike Johnson', dates: 'FEB 10 - FEB 15, 2025', nights: '5 nights', amount: '₦62,000' }
]

const isAddAssetModalOpen = ref(false)
const isLogConditionModalOpen = ref(false)
const isReportIncidentModalOpen = ref(false)

const activeAssetTab = ref('asset-registry')

const assetTabs = [
  { label: 'Asset Registry (6)', slot: 'asset-registry', value: 'asset-registry' },
  { label: 'Condition Logs (3)', slot: 'condition-logs', value: 'condition-logs' },
  { label: 'Incident Reports (2)', slot: 'incident-reports', value: 'incident-reports' }
]

const assets = [
  {
    id: 1,
    name: 'LG 55" Smart TV',
    category: 'Electronics',
    condition: 'Excellent',
    brand: 'LG',
    serial: '0LED55C1PUB',
    location: 'Mounted on living room wall',
    image: 'https://picsum.photos/seed/asset1/200/200'
  },
  {
    id: 2,
    name: 'LG 55" Smart TV',
    category: 'Electronics',
    condition: 'Excellent',
    brand: 'LG',
    serial: '0LED55C1PUB',
    location: 'Mounted on living room wall',
    image: 'https://picsum.photos/seed/asset2/200/200'
  },
  {
    id: 3,
    name: 'LG 55" Smart TV',
    category: 'Electronics',
    condition: 'Excellent',
    brand: 'LG',
    serial: '0LED55C1PUB',
    location: 'Mounted on living room wall',
    image: 'https://picsum.photos/seed/asset3/200/200'
  },
  {
    id: 4,
    name: 'LG 55" Smart TV',
    category: 'Electronics',
    condition: 'Excellent',
    brand: 'LG',
    serial: '0LED55C1PUB',
    location: 'Mounted on living room wall',
    image: 'https://picsum.photos/seed/asset4/200/200'
  }
]

const conditionLogs = [
  {
    id: 1,
    assetName: 'Washing Machine',
    date: '20/01/2026',
    reporter: 'Property Manager',
    description: 'Noticed water pooling under the machine after wash cycle',
    condition: 'Excellent',
    image: 'https://picsum.photos/seed/log1/200/200'
  },
  {
    id: 2,
    assetName: 'Washing Machine',
    date: '20/01/2026',
    reporter: 'Property Manager',
    description: 'Noticed water pooling under the machine after wash cycle',
    condition: 'Excellent',
    image: 'https://picsum.photos/seed/log2/200/200'
  },
  {
    id: 3,
    assetName: 'Washing Machine',
    date: '20/01/2026',
    reporter: 'Property Manager',
    description: 'Noticed water pooling under the machine after wash cycle',
    condition: 'Excellent',
    image: 'https://picsum.photos/seed/log3/200/200'
  }
]

const incidentReports = [
  {
    id: 1,
    title: 'Washing Machine',
    assetName: 'Washing Machine',
    category: 'Appliance',
    date: '20/01/2026',
    reporter: 'Tenant',
    description: 'Water leaking from the bottom of the washing machine. Appears to be from the drain hose connection.',
    severity: 'Medium',
    status: 'In Progress',
    image: 'https://picsum.photos/seed/incident1/200/200'
  },
  {
    id: 2,
    title: 'Washing Machine',
    assetName: 'Washing Machine',
    category: 'Appliance',
    date: '15/01/2026',
    reporter: 'Tenant',
    description: 'Water leaking from the bottom of the washing machine. Appears to be from the drain hose connection.',
    severity: 'Low',
    status: 'Resolved',
    image: 'https://picsum.photos/seed/incident2/200/200'
  }
]

// Computed property for dynamic button configuration
const actionButtonConfig = computed(() => {
  switch (activeAssetTab.value) {
    case 'condition-logs':
      return {
        icon: 'i-hugeicons-add-01',
        label: 'Log Condition'
      }
    case 'incident-reports':
      return {
        icon: 'i-hugeicons-add-01',
        label: 'Report Incident'
      }
    default:
      return {
        icon: 'i-hugeicons-add-01',
        label: 'Add Assets'
      }
  }
})

function handleActionButtonClick() {
  switch (activeAssetTab.value) {
    case 'condition-logs':
      isLogConditionModalOpen.value = true
      break
    case 'incident-reports':
      isReportIncidentModalOpen.value = true
      break
    default:
      isAddAssetModalOpen.value = true
      break
  }
}
</script>
