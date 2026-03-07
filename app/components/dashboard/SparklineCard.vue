<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold uppercase tracking-wider text-gray-500">{{ title }}</span>
        <UBadge variant="subtle" size="xs" :style="{ color: accent }">Last 7 days</UBadge>
      </div>
    </template>
    
    <svg class="w-full h-20 mb-2" viewBox="0 0 280 80" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="accent" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="accent" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <polyline
        :points="linePoints"
        fill="none"
        :stroke="accent"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-for="(pt, i) in points"
        :key="i"
        :cx="pt.x"
        :cy="pt.y"
        r="3.5"
        :fill="accent"
      />
    </svg>
    
    <div class="flex justify-between text-xs text-gray-400">
      <span v-for="d in days" :key="d">{{ d }}</span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  data: number[]
  accent: string
}>()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const gradientId = computed(() => `grad-${props.title.replace(/ /g, '')}`)

const points = computed(() => {
  const w = 280
  const h = 80
  const pad = 10
  const max = Math.max(...props.data)
  const min = Math.min(...props.data)
  
  return props.data.map((v, i) => ({
    x: pad + (i / (props.data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / (max - min)) * (h - pad * 2)
  }))
})

const linePoints = computed(() => {
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  const first = pts[0]
  const last = pts[pts.length - 1]
  
  return `M${first.x},80 ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${last.x},80 Z`
})
</script>
