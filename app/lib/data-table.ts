import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  tableFeatures,
} from '@tanstack/vue-table'

/**
 * TanStack Table v9 is feature-based: anything not registered here is
 * tree-shaken out. Register features once so every DataTable call site
 * agrees on capabilities; add pagination/filtering features here when a
 * table actually needs them.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
  },
})

export type DataTableFeatures = typeof dataTableFeatures

export function dataTableColumnHelper<TData extends object>() {
  return createColumnHelper<DataTableFeatures, TData>()
}
