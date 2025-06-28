<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div 
      v-for="metric in metricCards"
      :key="metric.key"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="['w-8 h-8 rounded-md flex items-center justify-center', metric.bgColor]">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metric.iconPath" />
            </svg>
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ metric.label }}</dt>
            <dd class="text-lg font-medium text-gray-900">{{ formatMetricValue(metric.key, metrics[metric.key]) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

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
  {
    key: 'spend',
    label: 'Total Spend',
    bgColor: 'bg-blue-500',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
  },
    {
        key: 'avgCpm',
        label: 'Avg. CPM',
        bgColor: 'bg-yellow-500',
        iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    },
    {
      key: 'roas',
      label: 'ROAS',
      bgColor: 'bg-indigo-500',
      iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    },
  {
    key: 'conversations',
    label: 'Conversations',
    bgColor: 'bg-green-500',
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
      key: 'add_to_cart',
      label: 'Add to Cart',
      bgColor: 'bg-orange-500',
      iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01'
    },
    {
      key: 'purchases',
      label: 'Purchases',
      bgColor: 'bg-purple-500',
      iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
    },
    {
        key: 'cost_per_conversation',
        label: 'Cost per Conversation',
        bgColor: 'bg-rose-500',
        iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      key: 'cost_per_purchase',
      label: 'Cost per Purchase',
      bgColor: 'bg-pink-500',
      iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
    },
    {
        key: 'purchase_value',
        label: 'Purchase Value',
        bgColor: 'bg-emerald-500',
        iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
    }
]

const formatMetricValue = (key, value) => {
  if (key === 'spend' || key === 'purchase_value' || key === 'cost_per_conversation' || key === 'cost_per_purchase' || key === 'avgCpm') {
    return props.formatCurrency(value)
  } else if (key === 'roas') {
    return props.formatNumber(value, 2)
  } else {
    return props.formatNumber(value)
  }
}
</script> 