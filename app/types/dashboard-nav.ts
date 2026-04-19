import type { Component } from 'vue'

export type DashboardNavItem = {
  label: string
  iconComponent: Component
  to: string
  exact?: boolean
  badge?: string
}
