<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-background text-foreground">
    <div
      class="flex flex-col w-full overflow-y-auto border-border lg:w-[52%] lg:max-w-2xl lg:border-r"
    >
      <div class="flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 min-h-dvh sm:min-h-0 sm:py-12">
        <div class="mx-auto w-full max-w-lg">
          <slot />
        </div>
      </div>
    </div>

    <aside
      class="hidden lg:flex flex-col flex-1 min-w-0 justify-between bg-muted/40 px-10 py-10"
    >
      <div class="flex flex-1 justify-center items-center w-full min-h-48">
        <slot name="illustration">
          <AuthLegalIllustration />
        </slot>
      </div>
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-border w-full"
      >
        <div class="min-w-0">
          <p class="mb-1 font-semibold text-foreground text-sm">
            Take GetaLawyer with you
          </p>
          <p class="text-muted-foreground text-sm leading-relaxed">
            Find verified lawyers on our mobile app for iOS and Android.
          </p>
        </div>
        <AuthQRCode class="shrink-0" />
      </div>
    </aside>
  </div>
</template>
