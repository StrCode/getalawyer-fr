<script setup lang="ts" generic="TData extends object">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import { FlexRender, useTable } from '@tanstack/vue-table'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { dataTableFeatures, type DataTableFeatures } from '@/lib/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Shared table shell: owns its loading skeleton (header stays visible) and
 * empty state, so callers never wrap it. Client sorting via TanStack v9 —
 * columns opt in with enableSorting. Server pagination can be layered on
 * later by registering the pagination feature in lib/data-table.ts.
 */
const props = withDefaults(defineProps<{
  columns: ColumnDef<DataTableFeatures, TData, unknown>[]
  data: TData[]
  loading?: boolean
  skeletonRows?: number
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  loading: false,
  skeletonRows: 5,
  emptyTitle: 'Nothing here yet',
})

const sorting = ref<SortingState>([])

// Per-column classes ride on columnDef.meta.class and apply to the header,
// body, and skeleton cells alike (so responsive hiding holds while loading).
function columnClass(def: { meta?: unknown }) {
  return (def.meta as { class?: string } | undefined)?.class
}

const table = useTable({
  features: dataTableFeatures,
  get data() { return props.data },
  get columns() { return props.columns },
  state: {
    get sorting() { return sorting.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
})
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow
        v-for="headerGroup in table.getHeaderGroups()"
        :key="headerGroup.id"
      >
        <TableHead
          v-for="header in headerGroup.headers"
          :key="header.id"
          :class="[columnClass(header.column.columnDef), header.column.getCanSort() ? 'cursor-pointer select-none' : '']"
          :aria-sort="header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined"
          @click="header.column.getToggleSortingHandler()?.($event)"
        >
          <span class="inline-flex items-center gap-1">
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
            <HugeiconsIcon
              v-if="header.column.getIsSorted() === 'asc'"
              :icon="ArrowUp01Icon"
              class="size-3.5"
              aria-hidden="true"
            />
            <HugeiconsIcon
              v-else-if="header.column.getIsSorted() === 'desc'"
              :icon="ArrowDown01Icon"
              class="size-3.5"
              aria-hidden="true"
            />
          </span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="loading">
        <TableRow
          v-for="i in skeletonRows"
          :key="`skeleton-${i}`"
          aria-hidden="true"
        >
          <TableCell
            v-for="(column, colIndex) in columns"
            :key="column.id ?? `col-${colIndex}`"
            :class="columnClass(column)"
          >
            <Skeleton class="h-4 w-full max-w-40" />
          </TableCell>
        </TableRow>
      </template>
      <template v-else-if="table.getRowModel().rows.length">
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
        >
          <!-- getAllCells: visibility feature isn't registered, so the
               tree-shaken getVisibleCells doesn't exist on rows. -->
          <TableCell
            v-for="cell in row.getAllCells()"
            :key="cell.id"
            :class="columnClass(cell.column.columnDef)"
          >
            <FlexRender :cell="cell" />
          </TableCell>
        </TableRow>
      </template>
      <!-- Empty state lives inside the body so the header stays visible. -->
      <TableRow v-else class="hover:bg-transparent">
        <TableCell :colspan="columns.length" class="py-12">
          <div class="flex flex-col items-center gap-1.5 text-center">
            <p class="text-sm font-medium text-foreground">{{ emptyTitle }}</p>
            <p v-if="emptyDescription" class="max-w-sm text-sm text-muted-foreground">
              {{ emptyDescription }}
            </p>
            <div v-if="$slots['empty-actions']" class="mt-3 flex flex-wrap justify-center gap-2">
              <slot name="empty-actions" />
            </div>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
