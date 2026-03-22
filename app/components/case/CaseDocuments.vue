<template>
  <!-- Use the new DocumentManager component -->
  <DocumentManager :case-id="caseId" />
</template>

<script setup lang="ts">
interface Props {
  caseId: string
}

defineProps<Props>()
</script>