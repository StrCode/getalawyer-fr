<template>
  <Card class="py-0 shadow-xs">
    <CardHeader class="border-b border-border/60 px-5 py-4">
      <CardTitle class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              v-for="column in columns"
              :key="column.id"
            >
              {{ column.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(row, index) in rows"
            :key="index"
          >
            <TableCell>
              <div class="flex items-center gap-2">
                <span
                  class="size-2 shrink-0 rounded-full"
                  :style="{ background: row.color }"
                />
                <span class="font-medium text-foreground text-sm">{{ row.channel }}</span>
              </div>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">
              {{ row.sessions }}
            </TableCell>
            <TableCell>
              <Badge
                :variant="row.convClass === 'high' ? 'secondary' : row.convClass === 'mid' ? 'outline' : 'destructive'"
                class="text-xs"
                :class="row.convClass === 'high' ? 'bg-primary/10 text-primary' : ''"
              >
                {{ row.conv }}
              </Badge>
            </TableCell>
            <TableCell class="font-semibold text-foreground text-sm">
              {{ row.rev }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableRowData {
  channel: string
  sessions: string
  conv: string
  rev: string
  color: string
  convClass: 'high' | 'mid' | 'low'
}

defineProps<{
  title: string
  rows: TableRowData[]
}>()

const columns = [
  { key: 'channel', label: 'Channel', id: 'channel' },
  { key: 'sessions', label: 'Sessions', id: 'sessions' },
  { key: 'conv', label: 'Conv.', id: 'conv' },
  { key: 'rev', label: 'Rev.', id: 'rev' },
]
</script>
