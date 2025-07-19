<template>
  <div class="space-y-8">
    <!-- Campaign Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Campaign Performance</h2>
      <p class="mt-2 text-gray-600">Facebook advertising campaign metrics and analysis</p>
    </div>

    <!-- Campaign Content -->
    <div class="space-y-8">
      <!-- Campaign Metrics Cards -->
      <MetricCards
        :metrics="metrics"
        :formatCurrency="formatCurrency"
        :formatNumber="formatNumber"
      />

      <!-- Campaign Performance Chart -->
      <DashboardChart
        :chartData="chartData"
        :selectedProducts="selectedProducts"
        :productOptions="productOptions"
      />

    <!-- Campaign Data Table -->
    <DashboardTable
      :sortedData="sortedData"
      :columnConfig="columnConfig"
      :visibleColumns="visibleColumns"
      :currentSort="currentSort"
      :formatValue="formatValue"
      @handleSort="handleSort"
      @moveColumn="moveColumn"
      @toggleColumn="(key) => columnConfig[key].visible = !columnConfig[key].visible"
    />

    <!-- Campaign Insights -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <!-- Top Performing Items -->
      <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Top Performing {{ getGroupByLabel() }}</h3>
        <div class="space-y-4">
          <div v-if="topItems.length === 0" class="text-sm text-gray-500 text-center py-8">
            No performance data available
          </div>
          <div v-for="item in topItems" :key="item?.label || 'unknown'" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">{{ formatItemLabel(item?.label) || 'Unknown ' + getGroupByLabel() }}</div>
              <div class="text-sm text-gray-500 mt-1">ROAS: {{ formatNumber(item?.roas || 0, 2) }}x</div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-green-600">{{ formatCurrency(item?.spend || 0) }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ formatNumber(item?.purchases || 0) }} purchases</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaign Performance Trends -->
      <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <div class="font-medium text-blue-900">Average CPM</div>
              <div class="text-sm text-blue-700 mt-1">Cost per 1000 impressions</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-900">{{ formatCurrency(metrics?.cpm || 0) }}</div>
            </div>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div>
              <div class="font-medium text-green-900">Click-through Rate</div>
              <div class="text-sm text-green-700 mt-1">Engagement rate</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-900">{{ formatPercentage((metrics?.ctr || 0) / 100) }}</div>
            </div>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div>
              <div class="font-medium text-purple-900">Frequency</div>
              <div class="text-sm text-purple-700 mt-1">Times shown per person</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-purple-900">{{ formatNumber(metrics?.frequency || 0, 2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Optimization Suggestions -->
    <!-- <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Optimization Suggestions</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-if="optimizationSuggestions.length === 0" class="col-span-full text-sm text-gray-500 text-center py-8">
          No suggestions available
        </div>
        <div v-for="suggestion in optimizationSuggestions" :key="suggestion?.title || 'unknown'" 
             class="p-4 rounded-lg border-l-4 hover:shadow-sm transition-shadow"
             :class="suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 
                    suggestion.type === 'success' ? 'bg-green-50 border-green-400' : 
                    'bg-blue-50 border-blue-400'">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg v-if="suggestion.type === 'warning'" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="suggestion.type === 'success'" class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-medium" :class="suggestion.type === 'warning' ? 'text-yellow-800' : 
                                                   suggestion.type === 'success' ? 'text-green-800' : 
                                                   'text-blue-800'">
                {{ suggestion?.title || 'Unknown Suggestion' }}
              </h4>
              <p class="text-sm mt-1" :class="suggestion.type === 'warning' ? 'text-yellow-700' : 
                                        suggestion.type === 'success' ? 'text-green-700' : 
                                        'text-blue-700'">
                {{ suggestion?.description || 'No description available' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onErrorCaptured } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import MetricCards from '../cards/MetricCards.vue'
import DashboardChart from '../charts/DashboardChart.vue'
import DashboardTable from '../tables/DashboardTable.vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
    default: () => ({})
  },
  chartData: {
    type: Object,
    required: true,
    default: () => ({})
  },
  sortedData: {
    type: Array,
    required: true,
    default: () => []
  },
  columnConfig: {
    type: Object,
    required: true,
    default: () => ({})
  },
  visibleColumns: {
    type: Array,
    required: true,
    default: () => []
  },
  currentSort: {
    type: Object,
    required: true,
    default: () => ({ column: null, direction: 'asc' })
  },
  selectedProducts: {
    type: Array,
    required: true,
    default: () => []
  },
  productOptions: {
    type: Array,
    required: true,
    default: () => []
  },
  groupByMode: {
    type: String,
    required: true,
    default: 'product'
  },
  handleSort: {
    type: Function,
    required: true
  },
  moveColumn: {
    type: Function,
    required: true
  },
  formatValue: {
    type: Function,
    required: true
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore

// Debug logging
onMounted(() => {
  console.log('CampaignDashboard mounted with props:', {
    metricsKeys: Object.keys(props.metrics || {}),
    chartDataKeys: Object.keys(props.chartData || {}),
    sortedDataLength: props.sortedData?.length || 0,
    columnConfigKeys: Object.keys(props.columnConfig || {}),
    visibleColumnsLength: props.visibleColumns?.length || 0,
    selectedProductsLength: props.selectedProducts?.length || 0,
    productOptionsLength: props.productOptions?.length || 0
  })
})

// Error boundary
onErrorCaptured((err, instance, info) => {
  console.error('CampaignDashboard error:', err, info)
  return false // Let error propagate
})

// Top performing items based on ROAS
const topItems = computed(() => {
  if (!props.sortedData || !Array.isArray(props.sortedData)) {
    console.warn('sortedData is not available or not an array:', props.sortedData)
    return []
  }
  
  return props.sortedData
    .filter(item => item && typeof item.roas === 'number' && item.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5)
})

// Helper function to get the label for the current group by mode
const getGroupByLabel = () => {
  switch (props.groupByMode) {
    case 'product':
      return 'Products'
    case 'ad_name':
      return 'Ad Names'
    case 'campaign':
      return 'Campaigns'
    case 'adset':
      return 'Adsets'
    case 'date':
      return 'Dates'
    default:
      return 'Products'
  }
}

// Helper function to format item labels (especially dates)
const formatItemLabel = (label) => {
  if (!label) return null
  
  // Handle ISO date format (2025-07-19T00:00:00.000Z)
  if (typeof label === 'string' && label.includes('T') && label.includes('Z')) {
    const date = new Date(label)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0] // Return yyyy-mm-dd
    }
  }
  
  return label
}

// Optimization suggestions based on current metrics
const optimizationSuggestions = computed(() => {
  if (!props.metrics || typeof props.metrics !== 'object') {
    console.warn('metrics is not available:', props.metrics)
    return []
  }
  
  const suggestions = []
  
  try {
    // High frequency warning
    if (typeof props.metrics.frequency === 'number' && props.metrics.frequency > 3) {
      suggestions.push({
        title: 'High Frequency Alert',
        description: `Average frequency is ${formatNumber(props.metrics.frequency, 2)}. Consider expanding audience or refreshing creative.`,
        type: 'warning'
      })
    }
    
    // Low CTR warning
    if (typeof props.metrics.ctr === 'number' && props.metrics.ctr < 0.01) {
      suggestions.push({
        title: 'Low Click-Through Rate',
        description: `CTR is ${formatPercentage(props.metrics.ctr / 100)}. Consider testing new ad creative or targeting.`,
        type: 'warning'
      })
    }
    
    // High CPM warning
    if (typeof props.metrics.cpm === 'number' && props.metrics.cpm > 50000) {
      suggestions.push({
        title: 'High CPM Detected',
        description: `CPM is ${formatCurrency(props.metrics.cpm)}. Review audience targeting and competition.`,
        type: 'warning'
      })
    }
    
    // Good performance
    if (typeof props.metrics.roas === 'number' && props.metrics.roas > 3) {
      suggestions.push({
        title: 'Strong ROAS Performance',
        description: `ROAS is ${formatNumber(props.metrics.roas, 2)}x. Consider scaling successful campaigns.`,
        type: 'success'
      })
    }
    
    // General optimization
    suggestions.push({
      title: 'Regular Optimization',
      description: 'Review and optimize underperforming ads and audiences weekly.',
      type: 'info'
    })
    
  } catch (error) {
    console.error('Error generating optimization suggestions:', error)
  }
  
  return suggestions
})
</script>

<style scoped>
/* Add any specific styles here */
</style> 