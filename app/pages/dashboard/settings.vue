<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="font-semibold text-[#1C1C1E] text-2xl">Account Settings</h1>
        <p class="text-[#525866] text-sm mt-1">Manage and collaborate on your account settings</p>
      </div>
      <div class="flex gap-3">
        <UButton
          label="Discard"
          color="neutral"
          variant="outline"
          size="md"
          @click="handleDiscard"
        />
        <UButton
          label="Save changes"
          color="primary"
          size="md"
          @click="handleSave"
        />
      </div>
    </div>

    <!-- Tabs -->
    <UTabs 
      v-model="activeTab"
      default-value="profile"
      :items="tabs"
      variant="link"
      :ui="{
        list: 'gap-6 border-b border-gray-200',
        label: 'font-medium text-sm',
        trigger: 'px-0 pb-3 data-[state=active]:text-[#007AFC] data-[state=inactive]:text-[#525866]',
        indicator: 'bg-[#007AFC]'
      }"
    >
      <!-- Profile Tab -->
      <template #profile>
        <div class="space-y-6 pt-6">
          <!-- Profile Photo -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Profile Photo</p>
              <p class="text-[#8E8E93] text-xs">Min 400x400px. PNG or JPEG formats.</p>
            </div>
            <div class="flex items-start gap-4">
              <div class="relative">
                <img 
                  :src="profileData.avatar" 
                  alt="Profile"
                  class="size-28 rounded-full object-cover"
                />
                <button 
                  class="absolute size-7.5 top-3 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors border-2 border-white flex items-center justify-center"
                  @click="removePhoto"
                >
                  <UIcon name="i-hugeicons-cancel-01" class="w-3 h-3 text-white" />
                </button>
              </div>
              <UButton
                label="Change"
                color="neutral"
                variant="outline"
                size="sm"
                @click="changePhoto"
              />
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Full Name -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Full Name</p>
              <p class="text-[#8E8E93] text-xs">Your name will be visible to your contacts.</p>
            </div>
            <div>
              <UInput
                v-model="profileData.fullName"
                size="lg"
                class="w-full"
                :disabled="!isEditingField.fullName"
              >
                <template #trailing>
                  <div v-if="!isEditingField.fullName">
                    <UButton
                      icon="i-hugeicons-pencil-edit-02"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="toggleEdit('fullName')"
                    />
                  </div>
                  <div v-else class="flex gap-1">
                    <UButton
                      icon="i-hugeicons-cancel-01"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="cancelEdit('fullName')"
                    />
                    <UButton
                      icon="i-hugeicons-tick-02"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      @click="saveEdit('fullName')"
                    />
                  </div>
                </template>
              </UInput>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Email Address -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Email Address</p>
              <p class="text-[#8E8E93] text-xs">Business email address recommended.</p>
            </div>
            <div>
              <UInput
                v-model="profileData.email"
                type="email"
                size="lg"
                class="w-full"
                :disabled="!isEditingField.email"
              >
                <template #trailing>
                  <div v-if="!isEditingField.email">
                    <UButton
                      icon="i-hugeicons-pencil-edit-02"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="toggleEdit('email')"
                    />
                  </div>
                  <div v-else class="flex gap-1">
                    <UButton
                      icon="i-hugeicons-cancel-01"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="cancelEdit('email')"
                    />
                    <UButton
                      icon="i-hugeicons-tick-02"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      @click="saveEdit('email')"
                    />
                  </div>
                </template>
              </UInput>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Phone Number -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Phone Number</p>
              <p class="text-[#8E8E93] text-xs">Business phone number recommended.</p>
            </div>
            <div>
              <UInput
                v-model="profileData.phone"
                type="tel"
                size="lg"
                class="w-full"
                :disabled="!isEditingField.phone"
              >
                <template #trailing>
                  <div v-if="!isEditingField.phone">
                    <UButton
                      icon="i-hugeicons-pencil-edit-02"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="toggleEdit('phone')"
                    />
                  </div>
                  <div v-else class="flex gap-1">
                    <UButton
                      icon="i-hugeicons-cancel-01"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="cancelEdit('phone')"
                    />
                    <UButton
                      icon="i-hugeicons-tick-02"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      @click="saveEdit('phone')"
                    />
                  </div>
                </template>
              </UInput>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Language -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Language</p>
              <p class="text-[#8E8E93] text-xs">Set language</p>
            </div>
            <div>
              <USelect
                v-model="profileData.language"
                :options="languageOptions"
                class="w-full"
              />
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Region -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Region</p>
              <p class="text-[#8E8E93] text-xs">Set region</p>
            </div>
            <div>
              <USelect
                v-model="profileData.region"
                :options="regionOptions"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Notifications Tab -->
      <template #notifications>
        <div class="pt-6 space-y-8">
          <!-- Notification Preferences Header -->
          <div>
            <h2 class="font-semibold text-[#1C1C1E] text-base">Notification Preferences</h2>
            <p class="text-[#525866] text-sm mt-1">Choose how and when you want to receive notifications</p>
          </div>

          <!-- Email Notifications Section -->
          <div class="space-y-4">
            <h3 class="font-medium text-[#1C1C1E] text-sm">Email Notifications</h3>
            
            <div class="grid grid-cols-2 gap-6">
              <!-- Payment Received -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.paymentReceived" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Payment Received</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Get notified when a payment is successfully processed</p>
                </div>
              </div>

              <!-- Refunds Issued -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.refundsIssued" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Refunds Issued</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Receive alerts when refunds are processed</p>
                </div>
              </div>

              <!-- New Bookings -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.newBookings" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">New Bookings</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Get notified when a new reservation is made</p>
                </div>
              </div>

              <!-- Cancellations -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.cancellations" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Cancellations</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Receive alerts when bookings are cancelled</p>
                </div>
              </div>

              <!-- Guest Reviews -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.guestReviews" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Guest Reviews</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Get notified when guests leave reviews</p>
                </div>
              </div>

              <!-- Weekly Summary -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="emailNotifications.weeklySummary" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Weekly Summary</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Receive a weekly digest of your activity</p>
                </div>
              </div>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Push Notifications Section -->
          <div class="space-y-4">
            <h3 class="font-medium text-[#1C1C1E] text-sm">Push Notifications</h3>
            
            <div class="grid grid-cols-2 gap-6">
              <!-- Payment Alerts -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="pushNotifications.paymentAlerts" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Payment Alerts</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Instant notifications for payment activities</p>
                </div>
              </div>

              <!-- Refund Alerts -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="pushNotifications.refundAlerts" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Refund Alerts</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Instant notifications for refund processing</p>
                </div>
              </div>

              <!-- New Bookings -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="pushNotifications.newBookings" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">New Bookings</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Real-time alerts for new reservations</p>
                </div>
              </div>

              <!-- Cancellations -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="pushNotifications.cancellations" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Cancellations</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Instant notifications for booking cancellations</p>
                </div>
              </div>

              <!-- Reviews -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="pushNotifications.reviews" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Reviews</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Get notified instantly about new reviews</p>
                </div>
              </div>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- SMS Notifications Section -->
          <div class="space-y-4">
            <h3 class="font-medium text-[#1C1C1E] text-sm">SMS Notifications</h3>
            
            <div class="grid grid-cols-2 gap-6">
              <!-- Urgent Alerts -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="smsNotifications.urgentAlerts" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Urgent Alerts</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Critical notifications via text message</p>
                </div>
              </div>

              <!-- Payment Issues -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="smsNotifications.paymentIssues" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Payment Issues</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Get SMS alerts for failed or declined payments</p>
                </div>
              </div>

              <!-- Security Alerts -->
              <div class="flex items-center gap-3 py-3">
                <USwitch v-model="smsNotifications.securityAlerts" size="sm" />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm">Security Alerts</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Receive text messages for security-related events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Privacy & Security Tab -->
      <template #privacy-security>
        <div class="pt-6 space-y-8">
          <!-- Password & Authentication Section -->
          <div class="space-y-6">
            <div>
              <h2 class="font-semibold text-[#1C1C1E] text-base">Password & Authentication</h2>
              <p class="text-[#525866] text-sm mt-1">Manage your password and authentication methods</p>
            </div>

            <!-- Change Password -->
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-[#1C1C1E] text-sm">Change Password</p>
                  <p class="text-[#8E8E93] text-xs mt-0.5">Last changed 45 days ago</p>
                </div>
                <UButton
                  label="Change Password"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="togglePasswordChange"
                />
              </div>

              <!-- Password Change Form -->
              <div v-if="showPasswordForm" class="space-y-3 pl-0">
                <UInput
                  v-model="passwordData.current"
                  type="password"
                  placeholder="Enter your current password"
                  size="lg"
                  class="w-full"
                />
                <UInput
                  v-model="passwordData.new"
                  type="password"
                  placeholder="Enter your new password"
                  size="lg"
                  class="w-full"
                />
                <UInput
                  v-model="passwordData.confirm"
                  type="password"
                  placeholder="Confirm your new password"
                  size="lg"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- 2FA Authentication Section -->
          <div class="space-y-6">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium text-[#1C1C1E] text-sm">2FA-Authentication</h3>
                <p class="text-[#8E8E93] text-xs mt-0.5">Add an extra layer of protection to your account.</p>
              </div>
              <UButton
                label="Manage Authentication"
                color="neutral"
                variant="outline"
                size="sm"
                @click="manage2FA"
              />
            </div>

            <!-- 2FA Enabled Status -->
            <div class="bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg p-4">
              <div class="flex items-start gap-3">
                <USwitch
                  v-model="twoFactorEnabled"
                  size="md"
                  @update:model-value="toggle2FA"
                />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm mb-1">2FA is enabled</p>
                  <p class="text-[#525866] text-sm">Your account is protected with authenticator app</p>
                  <UButton
                    label="Manage 2FA Settings"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    class="mt-3"
                    @click="manage2FASettings"
                  />
                </div>
              </div>
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Security Preferences Section -->
          <div class="space-y-6">
            <div>
              <h2 class="font-semibold text-[#1C1C1E] text-base">Security Preferences</h2>
              <p class="text-[#525866] text-sm mt-1">Control how we secure your account</p>
            </div>

            <!-- Login Alerts -->
            <div class="flex items-start justify-between py-3">
              <div class="flex-1">
                <p class="font-medium text-[#1C1C1E] text-sm">Login Alerts</p>
                <p class="text-[#8E8E93] text-xs mt-0.5">Get notified of new login attempts</p>
              </div>
              <USwitch v-model="securityPreferences.loginAlerts" size="md" />
            </div>
          </div>
        </div>
      </template>

      <!-- Payment Methods Tab -->
      <template #payment-methods>
        <div class="pt-6 space-y-6">
          <!-- Header Section -->
          <div>
            <h2 class="font-semibold text-[#1C1C1E] text-base">Payment Methods</h2>
            <p class="text-[#525866] text-sm mt-1">Manage how and when you receive payments from guests</p>
          </div>

          <!-- Search and Filter Bar -->
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <UInput
                v-model="paymentMethodSearch"
                placeholder="Search activities"
                size="lg"
                icon="i-heroicons-magnifying-glass"
              />
            </div>
            <UButton
              label="All Activities"
              color="neutral"
              variant="outline"
              size="lg"
              trailing-icon="i-heroicons-adjustments-horizontal"
            />
            <UButton
              label="Export"
              color="neutral"
              variant="outline"
              size="lg"
              trailing-icon="i-heroicons-arrow-up-tray"
            />
          </div>

          <!-- Default Payout Account -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Default Payout Account</p>
              <p class="text-[#8E8E93] text-xs">Where your earnings will be deposited</p>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#1C1C1E] text-sm">Chase Bank •••• 6789</span>
              <USwitch v-model="paymentSettings.defaultPayoutEnabled" size="md" />
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Payout Schedule -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Payout Schedule</p>
              <p class="text-[#8E8E93] text-xs">Choose how frequently you receive payouts</p>
            </div>
            <div>
              <USelect
                v-model="paymentSettings.payoutSchedule"
                :options="payoutScheduleOptions"
                class="w-full"
              />
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Minimum Payout Amount -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Minimum Payout Amount</p>
              <p class="text-[#8E8E93] text-xs">Only receive payouts above this threshold</p>
            </div>
            <div>
              <USelect
                v-model="paymentSettings.minimumPayout"
                :options="minimumPayoutOptions"
                class="w-full"
              />
            </div>
          </div>

          <USeparator type="dashed" />

          <!-- Currency -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="font-medium text-[#1C1C1E] text-sm mb-1">Currency</p>
              <p class="text-[#8E8E93] text-xs">Your preferred payout currency</p>
            </div>
            <div>
              <USelect
                v-model="paymentSettings.currency"
                :options="currencyOptions"
                class="w-full"
              />
            </div>
          </div>

          <!-- Tax and Admin Fee Information Section -->
          <div class="space-y-4 pt-6">
            <div>
              <h3 class="font-semibold text-[#1C1C1E] text-base">Tax and Admin Fee Information</h3>
              <p class="text-[#525866] text-sm mt-1">Manage your Admin fee and tax information</p>
            </div>

            <!-- VAT Payment -->
            <div class="flex items-center justify-between py-3">
              <div class="flex-1">
                <p class="font-medium text-[#1C1C1E] text-sm">VAT Payment</p>
                <p class="text-[#8E8E93] text-xs mt-0.5">Value Added Tax (if applicable)</p>
              </div>
              <span class="text-[#1C1C1E] text-sm font-medium">25%</span>
            </div>

            <USeparator type="dashed" />

            <!-- Admin Fee -->
            <div class="flex items-center justify-between py-3">
              <div class="flex-1">
                <p class="font-medium text-[#1C1C1E] text-sm">Admin Fee</p>
                <p class="text-[#8E8E93] text-xs mt-0.5">Add Smart Stay Fee (if applicable)</p>
              </div>
              <span class="text-[#1C1C1E] text-sm font-medium">15%</span>
            </div>

            <USeparator type="dashed" />

            <!-- Inspection Fee -->
            <div class="flex items-center justify-between py-3">
              <div class="flex-1">
                <p class="font-medium text-[#1C1C1E] text-sm">Inspection Fee</p>
                <p class="text-[#8E8E93] text-xs mt-0.5">Property inspection charges</p>
              </div>
              <span class="text-[#1C1C1E] text-sm font-medium">7.5%</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Audit Logs Tab -->
      <template #audit-logs>
        <div class="pt-6 space-y-6">
          <!-- Header Section -->
          <div>
            <h2 class="font-semibold text-[#1C1C1E] text-lg">Audit Log</h2>
            <p class="text-[#525866] text-sm mt-1">Track all activities and changes made to your account</p>
          </div>

          <!-- Search and Filter Bar -->
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <UInput
                v-model="auditLogSearch"
                placeholder="Search activities"
                size="lg"
                icon="i-heroicons-magnifying-glass"
              />
            </div>
            <UButton
              label="All Activities"
              color="neutral"
              variant="outline"
              size="lg"
              trailing-icon="i-heroicons-adjustments-horizontal"
              @click="openFilterMenu"
            />
            <UButton
              label="Export"
              color="neutral"
              variant="outline"
              size="lg"
              trailing-icon="i-heroicons-arrow-up-tray"
              @click="exportAuditLog"
            />
          </div>

          <!-- Audit Log Entries -->
          <div class="space-y-4">
            <div
              v-for="(log, index) in filteredAuditLogs"
              :key="index"
              class="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
            >
              <!-- Icon -->
              <div class="shrink-0 mt-1">
                <div class="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-information-circle" class="size-5 text-gray-600" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        :class="getActivityBadgeClass(log.type)"
                      >
                        {{ log.type }}
                      </span>
                      <span class="text-[#525866] text-sm">by {{ log.user }}</span>
                    </div>
                    <p class="font-medium text-[#1C1C1E] text-sm">{{ log.title }}</p>
                    <p class="text-[#8E8E93] text-xs mt-1">
                      {{ log.timestamp }} • IP: {{ log.ip }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredAuditLogs.length === 0" class="text-center py-12">
            <UIcon name="i-heroicons-document-text" class="size-12 text-gray-400 mx-auto mb-3" />
            <p class="text-[#525866] text-sm">No activities found</p>
          </div>

          <!-- Load More Button -->
          <div v-if="filteredAuditLogs.length > 0" class="flex justify-end">
            <UButton
              label="Load More Entries"
              color="neutral"
              variant="ghost"
              size="md"
              @click="loadMoreEntries"
            />
          </div>

          <!-- Log Retention Section -->
          <div class="space-y-4 pt-6">
            <div>
              <h3 class="font-semibold text-[#1C1C1E] text-base">Log Retention</h3>
              <p class="text-[#525866] text-sm mt-1">Configure how long audit logs are stored</p>
            </div>

            <div class="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <div class="flex items-start gap-3">
                <USwitch
                  v-model="logRetentionEnabled"
                  size="sm"
                />
                <div class="flex-1">
                  <p class="font-medium text-[#1C1C1E] text-sm mb-1">
                    Audit logs are retained for 90 days
                  </p>
                  <p class="text-[#007AFC] text-sm">
                    All activities are logged and stored for 90 days. You can export logs at any time for longer-term storage.
                  </p>
                  <UButton
                    label="Export Full History"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-arrow-up-tray"
                    class="mt-4"
                    @click="exportFullHistory"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Summary Section -->
          <div class="space-y-4 pt-6">
            <div>
              <h3 class="font-semibold text-[#1C1C1E] text-base">Activity Summary</h3>
              <p class="text-[#525866] text-sm mt-1">Overview of recent account activity</p>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-lg p-6">
                <p class="text-[#1C1C1E] text-3xl font-semibold mb-1">124</p>
                <p class="text-[#525866] text-sm">Total activities (30 days)</p>
              </div>
              <div class="bg-green-50 rounded-lg p-6">
                <p class="text-[#1C1C1E] text-3xl font-semibold mb-1">89</p>
                <p class="text-[#525866] text-sm">Payment activities</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-6">
                <p class="text-[#1C1C1E] text-3xl font-semibold mb-1">12</p>
                <p class="text-[#525866] text-sm">Team Changes</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-6">
                <p class="text-[#1C1C1E] text-3xl font-semibold mb-1">23</p>
                <p class="text-[#525866] text-sm">Security Events</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Data & Exports Tab -->
      <template #data-exports>
        <div class="pt-6">
          <p class="text-[#525866] text-sm">Data and exports coming soon...</p>
        </div>
      </template>

      <!-- Team Management Tab -->
      <template #team-management>
        <div class="pt-6">
          <p class="text-[#525866] text-sm">Team management coming soon...</p>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Settings - Smart Stay Rentals',
  meta: [
    { name: 'description', content: 'Configure your account settings and preferences' }
  ]
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const activeTab = ref('profile')

const tabs = [
  { label: 'Profile', slot: 'profile', value: 'profile' },
  { label: 'Notifications', slot: 'notifications', value: 'notifications' },
  { label: 'Privacy & Security', slot: 'privacy-security', value: 'privacy-security' },
  { label: 'Payment Methods', slot: 'payment-methods', value: 'payment-methods' },
  { label: 'Audit Logs', slot: 'audit-logs', value: 'audit-logs' },
  { label: 'Data & Exports', slot: 'data-exports', value: 'data-exports' },
  { label: 'Team Management', slot: 'team-management', value: 'team-management' }
]

const profileData = ref({
  avatar: 'https://i.pravatar.cc/150?img=33',
  fullName: 'James Brown',
  email: 'james@alignui.com',
  phone: '+1 (012) 345-6789',
  language: 'English',
  region: 'Nigeria'
})

const originalProfileData = ref({
  fullName: 'James Brown',
  email: 'james@alignui.com',
  phone: '+1 (012) 345-6789'
})

const isEditingField = ref({
  fullName: false,
  email: false,
  phone: false
})

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Portuguese']
const regionOptions = ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia']

const toggleEdit = (field: keyof typeof isEditingField.value) => {
  isEditingField.value[field] = !isEditingField.value[field]
}

const cancelEdit = (field: 'fullName' | 'email' | 'phone') => {
  profileData.value[field] = originalProfileData.value[field]
  isEditingField.value[field] = false
}

const saveEdit = (field: 'fullName' | 'email' | 'phone') => {
  originalProfileData.value[field] = profileData.value[field]
  isEditingField.value[field] = false
  console.log(`Save ${field}:`, profileData.value[field])
}

const removePhoto = () => {
  // Handle photo removal
  console.log('Remove photo')
}

const changePhoto = () => {
  // Handle photo change
  console.log('Change photo')
}

const handleDiscard = () => {
  // Reset all changes
  profileData.value.fullName = originalProfileData.value.fullName
  profileData.value.email = originalProfileData.value.email
  profileData.value.phone = originalProfileData.value.phone
  console.log('Discard changes')
}

const handleSave = () => {
  // Save all changes
  console.log('Save changes')
}

// Audit Log functionality
const auditLogSearch = ref('')

const auditLogs = ref([
  {
    type: 'Payment processed',
    user: 'Michael Chen',
    title: 'Payment #12345 processed - ₦1,250.00',
    timestamp: '2026-01-30 08:42:15',
    ip: '192.168.1.5'
  },
  {
    type: 'Log in',
    user: 'Sarah Willow',
    title: 'Successful login',
    timestamp: '2026-01-30 09:15:23',
    ip: '192.168.1.1'
  },
  {
    type: 'Settings Updated',
    user: 'Michael Femi',
    title: 'Updated notification preferences',
    timestamp: '2026-01-29 16:30:00',
    ip: '192.168.1.1'
  },
  {
    type: 'Refund Issues',
    user: 'Emma Davis',
    title: 'Refund #REF-789 issued - ₦450.00',
    timestamp: '2026-01-29 16:30:00',
    ip: '192.168.1.1'
  },
  {
    type: 'Team Member Added',
    user: 'Emma Davis',
    title: 'Added James Wilson as Manager',
    timestamp: '2026-01-29 16:15:30',
    ip: '192.168.1.1'
  },
  {
    type: 'API Key Generated',
    user: 'Emma Davis',
    title: 'New API key created: prod_key_***',
    timestamp: '2026-01-28 11:45:12',
    ip: '192.168.1.5'
  }
])

const filteredAuditLogs = computed(() => {
  if (!auditLogSearch.value) return auditLogs.value
  
  const search = auditLogSearch.value.toLowerCase()
  return auditLogs.value.filter(log => 
    log.type.toLowerCase().includes(search) ||
    log.user.toLowerCase().includes(search) ||
    log.title.toLowerCase().includes(search)
  )
})

const getActivityBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    'Payment processed': 'bg-green-100 text-green-700',
    'Log in': 'bg-blue-100 text-blue-700',
    'Settings Updated': 'bg-gray-100 text-gray-700',
    'Refund Issues': 'bg-red-100 text-red-700',
    'Team Member Added': 'bg-purple-100 text-purple-700',
    'API Key Generated': 'bg-purple-100 text-purple-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

const openFilterMenu = () => {
  console.log('Open filter menu')
}

const exportAuditLog = () => {
  console.log('Export audit log')
}

const loadMoreEntries = () => {
  console.log('Load more entries')
}

const logRetentionEnabled = ref(true)

const exportFullHistory = () => {
  console.log('Export full history')
}

// Notification preferences
const emailNotifications = ref({
  paymentReceived: true,
  refundsIssued: true,
  newBookings: true,
  cancellations: false,
  guestReviews: false,
  weeklySummary: false
})

const pushNotifications = ref({
  paymentAlerts: false,
  refundAlerts: false,
  newBookings: false,
  cancellations: false,
  reviews: false
})

const smsNotifications = ref({
  urgentAlerts: false,
  paymentIssues: false,
  securityAlerts: false
})

// Payment Methods functionality
const paymentMethodSearch = ref('')

const paymentSettings = ref({
  defaultPayoutEnabled: true,
  payoutSchedule: 'Weekly (Every Monday)',
  minimumPayout: '₦3.2M',
  currency: '₦ Naira'
})

const payoutScheduleOptions = [
  'Daily',
  'Weekly (Every Monday)',
  'Bi-weekly',
  'Monthly'
]

const minimumPayoutOptions = [
  '₦1M',
  '₦2M',
  '₦3.2M',
  '₦5M',
  '₦10M'
]

const currencyOptions = [
  '₦ Naira',
  '$ USD',
  '€ EUR',
  '£ GBP'
]

// Privacy & Security functionality
const showPasswordForm = ref(false)
const passwordData = ref({
  current: '',
  new: '',
  confirm: ''
})

const twoFactorEnabled = ref(true)

const securityPreferences = ref({
  loginAlerts: false
})

const togglePasswordChange = () => {
  showPasswordForm.value = !showPasswordForm.value
  if (!showPasswordForm.value) {
    // Reset form when closing
    passwordData.value = {
      current: '',
      new: '',
      confirm: ''
    }
  }
}

const toggle2FA = (enabled: boolean) => {
  console.log('2FA toggled:', enabled)
  // Handle 2FA toggle logic
}

const manage2FA = () => {
  console.log('Manage 2FA')
  // Open 2FA management modal/slideover
}

const manage2FASettings = () => {
  console.log('Manage 2FA Settings')
  // Open detailed 2FA settings
}
</script>
