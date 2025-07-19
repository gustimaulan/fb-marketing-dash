<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
    <div 
      v-for="metric in metricCards"
      :key="metric.key"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex items-center space-x-3 md:space-x-4">
        <div class="flex-shrink-0">
          <div :class="['w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center', metric.bgColor]">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metric.iconPath" />
            </svg>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <dl class="space-y-1">
            <dt class="text-xs md:text-sm font-medium text-gray-500 truncate">
              {{ metric.label }}
            </dt>
            <dd class="text-lg md:text-xl font-semibold text-gray-900">{{ formatMetricValue(metric.key, metrics[metric.key]) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true
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

const metricCards = [
  // FINANCIAL METRICS (Real data for budget allocation)
  {
    key: 'spend',
    label: 'Total Spend',
    bgColor: 'bg-blue-500',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
  },
  {
    key: 'purchase_value',
    label: 'Revenue Generated',
    bgColor: 'bg-emerald-500',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
  },
  {
    key: 'roas',
    label: 'ROAS',
    bgColor: 'bg-indigo-500',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  
  // LEAD METRICS (Real conversion data)
  {
    key: 'conversations',
    label: 'Leads Generated',
    bgColor: 'bg-green-500',
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    key: 'purchases',
    label: 'Purchases',
    bgColor: 'bg-purple-500',
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  },
  
  // COST EFFICIENCY (Real actionable metrics)
  {
    key: 'cost_per_conversation',
    label: 'Cost per Lead',
    bgColor: 'bg-rose-500',
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    key: 'cost_per_purchase',
    label: 'Cost per Purchase',
    bgColor: 'bg-pink-500',
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  }
]

const formatMetricValue = (key, value) => {
  // Handle null/undefined values
  if (value === null || value === undefined || isNaN(value)) return '-'
  
  // Format based on metric type
  switch (key) {
    // Financial metrics
    case 'spend':
    case 'purchase_value':
    case 'cost_per_conversation':
    case 'cost_per_purchase':
      return props.formatCurrency(value)
    
    // ROAS (ratio with 2 decimals)
    case 'roas':
      return `${props.formatNumber(value, 2)}x`
    
    // Count metrics (no decimals)
    case 'conversations':
    case 'purchases':
      return props.formatNumber(value, 0)
    
    // Default formatting
    default:
      return props.formatNumber(value, 0)
  }
}
</script> 