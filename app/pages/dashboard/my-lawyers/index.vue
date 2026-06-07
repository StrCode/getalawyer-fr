<template>
  <div class="space-y-6">
    <AppPageHeader
      title="My lawyers"
      description="Lawyers you've worked with or bookmarked."
    />

    <Card class="rounded-xl border-dashed">
      <CardContent class="py-14 text-center">
        <p class="text-muted-foreground">
          You haven't connected with any lawyers yet.
        </p>
        <Button
          as-child
          class="mt-4"
        >
          <NuxtLink to="/find-lawyers">
            Browse lawyers
          </NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

definePageMeta({ layout: 'dashboard' })
</script>
