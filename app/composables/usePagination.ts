import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface UsePaginationOptions {
  itemsPerPage?: number
  totalItems: Ref<number>
}

export interface UsePaginationReturn {
  currentPage: Ref<number>
  itemsPerPage: Ref<number>
  totalPages: ComputedRef<number>
  hasNextPage: ComputedRef<boolean>
  hasPreviousPage: ComputedRef<boolean>
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  paginatedItems: <T>(items: T[]) => ComputedRef<T[]>
}

export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const router = useRouter()
  const route = useRoute()
  
  const itemsPerPage = ref(options.itemsPerPage || 12)
  const currentPage = ref(
    route.query.page ? Number(route.query.page) : 1
  )
  
  const totalPages = computed(() => {
    return Math.ceil(options.totalItems.value / itemsPerPage.value)
  })
  
  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })
  
  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })
  
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) {
      return
    }
    
    currentPage.value = page
    
    const query = { ...route.query, page: page.toString() }
    router.push({ query })
  }
  
  const nextPage = () => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1)
    }
  }
  
  const previousPage = () => {
    if (hasPreviousPage.value) {
      goToPage(currentPage.value - 1)
    }
  }
  
  const paginatedItems = <T>(items: T[]) => {
    return computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return items.slice(start, end)
    })
  }
  
  watch(() => route.query.page, (newPage) => {
    if (newPage) {
      const pageNum = Number(newPage)
      if (pageNum >= 1 && pageNum <= totalPages.value) {
        currentPage.value = pageNum
      }
    } else {
      currentPage.value = 1
    }
  })
  
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    paginatedItems
  }
}
