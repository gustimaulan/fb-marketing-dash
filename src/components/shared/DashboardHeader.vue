<template>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    <p v-if="description" class="mt-2 text-gray-600">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  }
})
</script>