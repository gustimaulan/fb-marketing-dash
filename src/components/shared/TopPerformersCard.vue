<template>
  <MetricDisplayCard :title="title">
    <div class="space-y-4">
      <div v-if="items.length === 0" class="text-sm text-gray-500 text-center py-8">
        {{ emptyMessage }}
      </div>
      <div v-for="item in items" :key="item.label || 'unknown'" 
           class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div>
          <div class="font-medium text-gray-900">{{ formatLabel(item.label) }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ metricLabel }}: {{ formatMetric(item[metricKey]) }}</div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-green-600">{{ formatCurrency(item.spend || 0) }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ formatNumber(item.purchases || 0) }} purchases</div>
        </div>
      </div>
    </div>
  </MetricDisplayCard>
</template>

<script setup>
import { computed } from 'vue'
import MetricDisplayCard from './MetricDisplayCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  metricKey: {
    type: String,
    default: 'roas'
  },
  metricLabel: {
    type: String,
    default: 'ROAS'
  },
  emptyMessage: {
    type: String,
    default: 'No performance data available'
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  formatNumber: {
    type: Function,
    required: true
  }
})

const formatLabel = (label) => {
  if (!label) return 'Unknown'
  
  // Handle ISO date format
  if (typeof label === 'string' && label.includes('T') && label.includes('Z')) {
    const date = new Date(label)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  }
  
  return label
}

const formatMetric = (value) => {
  if (props.metricKey === 'roas') {
    return `${props.formatNumber(value || 0, 2)}x`
  }
  return props.formatNumber(value || 0, 2)
}
</script>