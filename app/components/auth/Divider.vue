<template>
  <div class="relative flex items-center gap-3">
    <div class="flex-1 bg-border h-px" />
    <span class="flex-shrink-0 text-muted-foreground text-xs uppercase tracking-wide">
      <slot>or</slot>
    </span>
    <div class="flex-1 bg-border h-px" />
  </div>
</template>
