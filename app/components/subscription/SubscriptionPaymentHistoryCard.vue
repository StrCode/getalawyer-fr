<script setup lang="ts">
import { h } from 'vue'
import {
  formatNairaAmount,
  formatSubscriptionHistoryAction,
  getSubscriptionHistoryStatus,
  useSubscriptionPaymentHistory,
} from '~/composables/useSubscription'
import { dataTableColumnHelper } from '@/lib/data-table'
import DataTable from '@/components/DataTable.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MICRO, PANEL, PANEL_FOOTER, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

const page = ref(1)

const { data, isPending, isFetching } = useSubscriptionPaymentHistory(page)

const payments = computed(() => data.value?.payments ?? [])
const pagination = computed(() => data.value?.pagination)

type PaymentRow = (typeof payments.value)[number]

const statusBadgeVariant = {
  paid: 'verified',
  failed: 'destructive',
  refund: 'secondary',
  pending: 'soft',
} as const

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  catch {
    return iso
  }
}

function formatAmount(action: string, amountNaira: number | null): string {
  if (amountNaira == null) return '—'
  const formatted = formatNairaAmount(amountNaira)
  if (action === 'refunded' || action === 'refund_initiated')
    return `−${formatted}`
  return formatted
}

function formatStatusLabel(status: ReturnType<typeof getSubscriptionHistoryStatus>): string {
  const labels = {
    paid: 'Paid',
    failed: 'Failed',
    refund: 'Refunded',
    pending: 'Processing',
  }
  return labels[status]
}

const columnHelper = dataTableColumnHelper<PaymentRow>()

const columns = columnHelper.columns([
  columnHelper.accessor('createdAt', {
    header: 'Date',
    sortFn: 'datetime',
    cell: ({ row }) => formatDate(row.original.createdAt),
    meta: { class: 'whitespace-nowrap text-muted-foreground' },
  }),
  columnHelper.accessor('action', {
    header: 'Description',
    enableSorting: false,
    cell: ({ row }) => formatSubscriptionHistoryAction(row.original.action),
    meta: { class: 'font-medium' },
  }),
  columnHelper.accessor('amountNaira', {
    header: 'Amount',
    enableSorting: false,
    cell: ({ row }) => formatAmount(row.original.action, row.original.amountNaira),
    meta: { class: 'text-right tabular-nums' },
  }),
  columnHelper.display({
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getSubscriptionHistoryStatus(row.original.action)
      return h(Badge, { variant: statusBadgeVariant[status] }, () => formatStatusLabel(status))
    },
  }),
  columnHelper.accessor('paymentReference', {
    header: 'Reference',
    enableSorting: false,
    cell: ({ row }) => row.original.paymentReference ?? '—',
    meta: { class: 'hidden max-w-32 truncate font-mono text-xs text-muted-foreground sm:table-cell' },
  }),
])

function goToPage(next: number) {
  const totalPages = pagination.value?.totalPages ?? 1
  page.value = Math.min(Math.max(next, 1), totalPages)
}
</script>

<template>
  <section :class="cn(PANEL)">
    <div :class="PANEL_HEADER">
      <div>
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Invoices
        </span>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Charges and refunds for your membership.
        </p>
      </div>
    </div>

    <div class="px-2 py-2 sm:px-4 sm:py-3">
      <DataTable
        :columns="columns"
        :data="payments"
        :loading="isPending"
        :skeleton-rows="3"
        empty-title="No payments yet"
        empty-description="Your first charge will appear here after checkout."
      />
    </div>

    <div
      v-if="pagination && pagination.totalPages > 1"
      :class="PANEL_FOOTER"
    >
      <div class="flex items-center justify-between gap-3 text-sm">
        <p class="text-muted-foreground tabular-nums">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer"
            :disabled="pagination.page <= 1 || isFetching"
            @click="goToPage(pagination.page - 1)"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="cursor-pointer"
            :disabled="pagination.page >= pagination.totalPages || isFetching"
            @click="goToPage(pagination.page + 1)"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
