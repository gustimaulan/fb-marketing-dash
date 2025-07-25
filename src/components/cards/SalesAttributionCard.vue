<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Sales Attribution Analysis</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- FB Attributed Revenue -->
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-blue-700">Meta Attributed Revenue</h4>
        <p class="text-2xl font-bold text-blue-900 mt-1">{{ formatCurrency(attributionMetrics.fbAttributedRevenue) }}</p>
        <p class="text-xs text-blue-600 mt-1">{{ attributionMetrics.fbAttributedOrders }} orders</p>
      </div>
      
      <!-- True ROAS -->
      <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-green-700">True ROAS</h4>
        <p class="text-2xl font-bold text-green-900 mt-1">{{ formatNumber(attributionMetrics.trueROAS) }}x</p>
        <p class="text-xs text-green-600 mt-1">vs {{ formatNumber(fbMetrics.roas) }}x Meta ROAS</p>
      </div>
      
      <!-- Conversion Rate -->
      <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-purple-700">Meta → Order Rate</h4>
        <p class="text-2xl font-bold text-purple-900 mt-1">{{ formatPercentage(attributionMetrics.conversionRate) }}</p>
        <p class="text-xs text-purple-600 mt-1">{{ attributionMetrics.fbAttributedOrders }} / {{ fbMetrics.purchases }} purchases</p>
      </div>
      
      <!-- Average Order Value -->
      <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-orange-700">Avg Order Value</h4>
        <p class="text-2xl font-bold text-orange-900 mt-1">{{ formatCurrency(attributionMetrics.avgOrderValue) }}</p>
        <p class="text-xs text-orange-600 mt-1">FB-attributed orders</p>
      </div>
    </div>
    
    <!-- Attribution Insights -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Attribution Insights</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Revenue Gap:</span>
          <span class="ml-2" :class="revenueGap > 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(Math.abs(revenueGap)) }}
            {{ revenueGap > 0 ? 'higher' : 'lower' }} than FB reported
          </span>
        </div>
        <div>
          <span class="font-medium">Attribution Rate:</span>
          <span class="ml-2 text-blue-600">
            {{ formatPercentage(attributionRate) }} of orders from FB ads
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  attributionMetrics: {
    type: Object,
    required: true
  },
  fbMetrics: {
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
  },
  formatPercentage: {
    type: Function,
    required: true
  },
  totalSalesRevenue: {
    type: Number,
    default: 0
  }
})

const revenueGap = computed(() => {
  return props.attributionMetrics.fbAttributedRevenue - props.fbMetrics.purchase_value
})

const attributionRate = computed(() => {
  return props.totalSalesRevenue > 0 
    ? props.attributionMetrics.fbAttributedRevenue / props.totalSalesRevenue 
    : 0
})
</script> 