<template>
  <div class="relative flex items-center gap-4">
    <div class="flex-1 bg-border h-px" />
    <span class="flex-shrink-0 text-muted-foreground/60 text-xs font-medium tracking-widest uppercase">
      <slot>or</slot>
    </span>
    <div class="flex-1 bg-border h-px" />
  </div>
</template>
