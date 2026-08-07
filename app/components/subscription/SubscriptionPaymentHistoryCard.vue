<script setup lang="ts">
import {
  formatNairaAmount,
  formatSubscriptionHistoryAction,
  getSubscriptionHistoryStatus,
  useSubscriptionPaymentHistory,
} from '~/composables/useSubscription'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const page = ref(1)

const { data, isPending, isFetching } = useSubscriptionPaymentHistory(page)

const payments = computed(() => data.value?.payments ?? [])
const pagination = computed(() => data.value?.pagination)

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
  } catch {
    return iso
  }
}

function formatAmount(action: string, amountNaira: number | null): string {
  if (amountNaira == null) return '—'
  const formatted = formatNairaAmount(amountNaira)
  if (action === 'refunded' || action === 'refund_initiated') {
    return `−${formatted}`
  }
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

function goToPage(next: number) {
  const totalPages = pagination.value?.totalPages ?? 1
  page.value = Math.min(Math.max(next, 1), totalPages)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        Payment history
      </CardTitle>
      <CardDescription>
        Invoices and charges for your GetALawyer membership.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div
        v-if="isPending"
        class="space-y-2"
      >
        <Skeleton class="h-10 w-full rounded-lg" />
        <Skeleton class="h-10 w-full rounded-lg" />
        <Skeleton class="h-10 w-full rounded-lg" />
      </div>

      <p
        v-else-if="payments.length === 0"
        class="text-sm text-muted-foreground"
      >
        No payments yet. Your first charge will appear here after checkout.
      </p>

      <template v-else>
        <div class="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead class="text-right">
                  Amount
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="hidden sm:table-cell">
                  Reference
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="payment in payments"
                :key="payment.id"
              >
                <TableCell class="whitespace-nowrap text-muted-foreground">
                  {{ formatDate(payment.createdAt) }}
                </TableCell>
                <TableCell class="font-medium">
                  {{ formatSubscriptionHistoryAction(payment.action) }}
                </TableCell>
                <TableCell class="text-right tabular-nums">
                  {{ formatAmount(payment.action, payment.amountNaira) }}
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="statusBadgeVariant[getSubscriptionHistoryStatus(payment.action)]"
                  >
                    {{ formatStatusLabel(getSubscriptionHistoryStatus(payment.action)) }}
                  </Badge>
                </TableCell>
                <TableCell class="hidden max-w-32 truncate font-mono text-xs text-muted-foreground sm:table-cell">
                  {{ payment.paymentReference ?? '—' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div
          v-if="pagination && pagination.totalPages > 1"
          class="mt-4 flex items-center justify-between gap-3 text-sm"
        >
          <p class="text-muted-foreground">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </p>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page <= 1 || isFetching"
              @click="goToPage(pagination.page - 1)"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page >= pagination.totalPages || isFetching"
              @click="goToPage(pagination.page + 1)"
            >
              Next
            </Button>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
