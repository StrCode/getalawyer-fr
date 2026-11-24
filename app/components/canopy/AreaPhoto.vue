<script setup lang="ts">
import { areaPhotoSrcset, areaPhotoUrl } from '~/lib/area-photos'

/**
 * The picture for a practice area: a wide one on top of a card, or a small
 * square beside the name (`thumb`). Areas without a photo get a quiet mint
 * panel with the scales mark, the same size, so the grid stays even.
 * Decorative: the link around it already carries the area's name. The caller
 * sets the shape (aspect or size) with a class.
 */
const props = defineProps<{ src?: string | null, thumb?: boolean }>()

// The card photo is at most about 420px wide; the thumbnail is 72px square.
const size = computed(() => (props.thumb ? { width: 72, height: 72 } : { width: 420, height: 263 }))
const url = computed(() => areaPhotoUrl(props.src, size.value.width, size.value.height))
const srcset = computed(() => areaPhotoSrcset(props.src, size.value.width, size.value.height))
</script>

<template>
  <span class="relative block overflow-hidden rounded-[calc(var(--radius-card)-0.375rem)] bg-mint">
    <img
      v-if="url"
      :src="url"
      :srcset="srcset"
      :width="size.width"
      :height="size.height"
      alt=""
      loading="lazy"
      decoding="async"
      class="size-full object-cover transition-transform duration-500 ease-canopy group-hover/tile:scale-103 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
    >
    <span v-else class="grid size-full place-items-center text-brand/70">
      <CanopyGlyph name="scales" :size="thumb ? 24 : 40" :stroke="1.6" />
    </span>
  </span>
</template>
