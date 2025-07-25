<template>
  <div class="space-y-8">
    <!-- Campaign Header -->
    <DashboardHeader 
      title="Campaign Performance"
      description="Facebook advertising campaign metrics and analysis"
    />

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
      <PerformanceGrid>
        <!-- Top Performing Items -->
        <TopPerformersCard
          :title="`Top Performing ${getGroupByLabel()}`"
          :items="topItems"
          :formatCurrency="formatCurrency"
          :formatNumber="formatNumber"
        />

        <!-- Performance Trends -->
        <MetricDisplayCard title="Performance Trends">
          <div class="space-y-4">
            <InsightCard
              title="Average CPM"
              subtitle="Cost per 1000 impressions"
              :value="metrics?.cpm || 0"
              value-type="currency"
              color-scheme="blue"
              :format-currency="formatCurrency"
            />
            
            <InsightCard
              title="Click-through Rate"
              subtitle="Engagement rate"
              :value="(metrics?.ctr || 0) / 100"
              value-type="percentage"
              color-scheme="green"
              :format-percentage="formatPercentage"
            />
            
            <InsightCard
              title="Frequency"
              subtitle="Times shown per person"
              :value="metrics?.frequency || 0"
              value-type="number"
              color-scheme="purple"
              :format-number="(val) => formatNumber(val, 2)"
            />
          </div>
        </MetricDisplayCard>
      </PerformanceGrid>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onErrorCaptured } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import MetricCards from '../cards/MetricCards.vue'
import DashboardChart from '../charts/DashboardChart.vue'
import DashboardTable from '../tables/DashboardTable.vue'
import DashboardHeader from '../shared/DashboardHeader.vue'
import MetricDisplayCard from '../shared/MetricDisplayCard.vue'
import InsightCard from '../shared/InsightCard.vue'
import PerformanceGrid from '../shared/PerformanceGrid.vue'
import TopPerformersCard from '../shared/TopPerformersCard.vue'

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