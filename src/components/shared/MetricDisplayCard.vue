<template>
  <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
      <div v-if="badge" :class="badgeClasses">
        {{ badge }}
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: null
  },
  badgeType: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  }
})

const badgeClasses = computed(() => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }
  return `${baseClasses} ${typeClasses[props.badgeType]}`
})
</script>