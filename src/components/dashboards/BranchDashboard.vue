<template>
  <div class="space-y-8">
    <!-- Branch Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Branch Performance Analysis</h2>
      <p class="mt-2 text-gray-600">
        Compare FB Reported data vs Sales Order data (actual) for accurate budget allocation decisions.
        <span class="text-orange-600 font-medium">📊 FB Reported</span> vs <span class="text-green-600 font-medium">✅ Sales Order (Actual)</span>
      </p>
    </div>

    <!-- Branch Content -->
    <div class="space-y-8">
      <!-- Budget Allocation Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Total Budget Summary -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h3 class="text-lg font-medium text-blue-800 mb-4">💰 Cost Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-600">Total Ad Spend:</span>
              <span class="font-bold text-blue-900">{{ formatCurrency(totalBudget) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-600">Avg Cost/Order:</span>
              <span class="font-bold text-blue-900">{{ formatCurrency(averageCostPerOrder) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-600">Overall ROAS (Actual):</span>
              <span class="font-bold text-blue-900">{{ formatNumber(overallROAS, 2) }}x</span>
            </div>
          </div>
        </div>

        <!-- FB Reported Summary -->
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <h3 class="text-lg font-medium text-orange-800 mb-4">📊 FB Reported Totals</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-orange-600">FB Revenue:</span>
              <span class="font-bold text-orange-900">{{ formatCurrency(totalFBRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-orange-600">FB Orders:</span>
              <span class="font-bold text-orange-900">{{ formatNumber(totalFBOrders) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-orange-600">FB ROAS:</span>
              <span class="font-bold text-orange-900">{{ formatNumber(totalFBROAS, 2) }}x</span>
            </div>
          </div>
        </div>

        <!-- Sales Order Summary -->
        <div class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 class="text-lg font-medium text-green-800 mb-4">✅ Sales Order Totals (Actual)</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-600">Actual Revenue:</span>
              <span class="font-bold text-green-900">{{ formatCurrency(totalRevenue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-600">Actual Orders:</span>
              <span class="font-bold text-green-900">{{ formatNumber(leadsRatioData?.totalPurchases || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-600">Actual ROAS:</span>
              <span class="font-bold text-green-900">{{ formatNumber(overallROAS, 2) }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Branch Performance Comparison -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div v-for="branchData in branchPerformanceData" :key="branchData.branchName" 
             class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <!-- Branch Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h4 class="text-xl font-bold text-gray-900">{{ branchData.branchName }}</h4>
              <p class="text-sm text-gray-600">{{ formatPercentage(branchData.percentage) }} of total ad spend allocation</p>
            </div>
            <div class="text-right">
              <div class="px-3 py-1 rounded-full text-sm font-medium"
                   :class="branchData.metrics.roas > overallROAS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ branchData.metrics.roas > overallROAS ? 'Outperforming' : 'Underperforming' }}
              </div>
            </div>
          </div>

          <!-- Key Financial Metrics -->
          <div class="mb-6">
            <!-- Ad Spend (Single Source) -->
            <div class="text-center p-4 bg-blue-50 rounded-lg border mb-4">
              <div class="text-2xl font-bold text-blue-900">{{ formatCurrency(branchData.metrics.spend) }}</div>
              <div class="text-sm text-blue-600">Total Ad Spend</div>
            </div>

            <!-- FB Reported vs Sales Order Comparison -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- FB Reported Data -->
              <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 class="font-semibold text-orange-800 mb-3 text-center">📊 FB Reported Data</h5>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-orange-600">Revenue:</span>
                    <span class="font-bold text-orange-900">{{ formatCurrency(branchData.metrics.fb_reported.revenue) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-orange-600">Orders:</span>
                    <span class="font-bold text-orange-900">{{ formatNumber(branchData.metrics.fb_reported.orders) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-orange-600">ROAS:</span>
                    <span class="font-bold text-orange-900">{{ formatNumber(branchData.metrics.fb_reported.roas, 2) }}x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-orange-600">Avg Order Value:</span>
                    <span class="font-bold text-orange-900">{{ formatCurrency(branchData.metrics.fb_reported.avgOrderValue) }}</span>
                  </div>
                </div>
              </div>

              <!-- Sales Order Data (Actual) -->
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 class="font-semibold text-green-800 mb-3 text-center">✅ Sales Order Data (Actual)</h5>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">Revenue:</span>
                    <span class="font-bold text-green-900">{{ formatCurrency(branchData.metrics.sales_order.revenue) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">Orders:</span>
                    <span class="font-bold text-green-900">{{ formatNumber(branchData.metrics.sales_order.orders) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">ROAS:</span>
                    <span class="font-bold text-green-900">{{ formatNumber(branchData.metrics.sales_order.roas, 2) }}x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-green-600">Avg Order Value:</span>
                    <span class="font-bold text-green-900">{{ formatCurrency(branchData.metrics.sales_order.avgOrderValue) }}</span>
                  </div>
            </div>
            </div>
            </div>
          </div>

          <!-- Data Accuracy & Performance -->
          <div class="mb-6">
            <!-- Tracking Accuracy -->
            <div class="bg-gray-50 p-4 rounded-lg border mb-4">
              <h5 class="font-semibold text-gray-800 mb-3">📊 Tracking Accuracy</h5>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-lg font-bold" :class="getAccuracyColor(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)">
                    {{ formatPercentage(getAccuracyPercentage(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)) }}
                  </div>
                  <div class="text-xs text-gray-600">Revenue Accuracy</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold" :class="getAccuracyColor(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders)">
                    {{ formatPercentage(getAccuracyPercentage(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders)) }}
                  </div>
                  <div class="text-xs text-gray-600">Order Accuracy</div>
            </div>
            </div>
            </div>

            <!-- Primary Performance (Based on Sales Order) -->
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 class="font-semibold text-green-800 mb-3">✅ Primary Performance (Sales Order Based)</h5>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-green-700">ROAS:</span>
                  <span class="font-bold text-lg" :class="branchData.metrics.sales_order.roas > 2 ? 'text-green-600' : 'text-red-600'">
                    {{ formatNumber(branchData.metrics.sales_order.roas, 2) }}x
              </span>
            </div>
                <div class="flex justify-between items-center">
                  <span class="font-medium text-green-700">Cost per Order:</span>
                  <span class="font-bold text-green-900">{{ formatCurrency(branchData.metrics.sales_order.cost_per_order) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-medium text-green-700">Revenue Gap vs FB:</span>
                  <span class="font-bold" :class="getRevenueGap(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue) > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(getRevenueGap(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)) }}
              </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget Recommendations -->
          <div class="p-4 rounded-lg" :class="getBudgetRecommendationClass(branchData)">
            <h5 class="font-medium mb-2" :class="getBudgetRecommendationTextClass(branchData)">
              Budget Recommendation:
            </h5>
            <p class="text-sm" :class="getBudgetRecommendationTextClass(branchData)">
              {{ getBudgetRecommendation(branchData) }}
            </p>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'

const props = defineProps({
  branchPerformanceData: {
    type: Array,
    default: null
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore

// Business metrics calculations
const totalBudget = computed(() => {
  if (!props.branchPerformanceData) return 0
  return props.branchPerformanceData.reduce((sum, branch) => sum + branch.metrics.spend, 0)
})

const totalRevenue = computed(() => {
  if (!props.branchPerformanceData) return 0
  return props.branchPerformanceData.reduce((sum, branch) => sum + branch.metrics.revenue, 0)
})

const overallROAS = computed(() => {
  return totalBudget.value > 0 ? totalRevenue.value / totalBudget.value : 0
})

const averageOrderValue = computed(() => {
  if (!props.branchPerformanceData) return 0
  const totalOrders = props.branchPerformanceData.reduce((sum, branch) => sum + branch.metrics.orders, 0)
  return totalOrders > 0 ? totalRevenue.value / totalOrders : 0
})

// Calculate leads and purchases data from branch metrics  
const leadsRatioData = computed(() => {
  if (!props.branchPerformanceData) return { totalLeads: 0, totalPurchases: 0 }
  
  // For now, we don't have leads data in branch metrics
  // We only have orders (purchases) from sales order data
  const totalPurchases = props.branchPerformanceData.reduce((sum, branch) => {
    return sum + (branch.metrics.orders || 0)
  }, 0)
  
  // Set leads as 0 for now since we don't have conversation data per branch
  const totalLeads = 0
  
  return { totalLeads, totalPurchases }
})



const bestBranchROAS = computed(() => {
  if (!props.branchPerformanceData || props.branchPerformanceData.length === 0) return 0
  return Math.max(...props.branchPerformanceData.map(branch => branch.metrics.roas || 0))
})

const averageCostPerOrder = computed(() => {
  const totalOrders = leadsRatioData.value.totalPurchases
  return totalOrders > 0 ? totalBudget.value / totalOrders : 0
})

// Tracking accuracy and gap analysis functions
const getAccuracyPercentage = (fbValue, salesOrderValue) => {
  if (!fbValue || !salesOrderValue) return 0
  const accuracy = Math.min(fbValue, salesOrderValue) / Math.max(fbValue, salesOrderValue)
  return accuracy * 100
}

const getAccuracyColor = (fbValue, salesOrderValue) => {
  const accuracy = getAccuracyPercentage(fbValue, salesOrderValue)
  if (accuracy >= 80) return 'text-green-600'
  if (accuracy >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getRevenueGap = (fbRevenue, salesOrderRevenue) => {
  return salesOrderRevenue - fbRevenue
}

// FB Reported totals
const totalFBRevenue = computed(() => {
  if (!props.branchPerformanceData) return 0
  return props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.fb_reported.revenue || 0), 0)
})

const totalFBOrders = computed(() => {
  if (!props.branchPerformanceData) return 0
  return props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.fb_reported.orders || 0), 0)
})

const totalFBROAS = computed(() => {
  return totalBudget.value > 0 ? totalFBRevenue.value / totalBudget.value : 0
})

// Budget recommendation logic based on Sales Order ROAS and cost efficiency
const getBudgetRecommendationClass = (branchData) => {
  const salesOrderROAS = branchData.metrics.sales_order.roas
  const salesOrderCostPerOrder = branchData.metrics.sales_order.cost_per_order
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  const trackingAccuracy = getAccuracyPercentage(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder && trackingAccuracy >= 70) {
    return 'bg-green-50 border border-green-200'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5 || trackingAccuracy < 50) {
    return 'bg-red-50 border border-red-200'
  } else {
    return 'bg-yellow-50 border border-yellow-200'
  }
}

const getBudgetRecommendationTextClass = (branchData) => {
  const salesOrderROAS = branchData.metrics.sales_order.roas
  const salesOrderCostPerOrder = branchData.metrics.sales_order.cost_per_order
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  const trackingAccuracy = getAccuracyPercentage(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder && trackingAccuracy >= 70) {
    return 'text-green-800'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5 || trackingAccuracy < 50) {
    return 'text-red-800'
  } else {
    return 'text-yellow-800'
  }
}

const getBudgetRecommendation = (branchData) => {
  // Use Sales Order data as primary source for decisions
  const salesOrderROAS = branchData.metrics.sales_order.roas
  const salesOrderCostPerOrder = branchData.metrics.sales_order.cost_per_order
  const salesOrderOrders = branchData.metrics.sales_order.orders
  const fbROAS = branchData.metrics.fb_reported.roas
  
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  const trackingAccuracy = getAccuracyPercentage(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder) {
    const increasePercentage = Math.min(40, Math.round((salesOrderROAS / overallROAS.value - 1) * 30))
    return `INCREASE budget by ${increasePercentage}%. Excellent ${formatNumber(salesOrderROAS, 2)}x actual ROAS with efficient cost. Tracking accuracy: ${formatPercentage(trackingAccuracy)}`
  } else if (salesOrderROAS < overallROAS.value * 0.8) {
    return `REDUCE or OPTIMIZE budget. Low actual ROAS (${formatNumber(salesOrderROAS, 2)}x vs FB ${formatNumber(fbROAS, 2)}x). Focus on actual conversions.`
  } else if (salesOrderCostPerOrder > avgCostPerOrder * 1.5) {
    return `OPTIMIZE cost efficiency. High actual cost per order (${formatCurrency(salesOrderCostPerOrder)} vs avg ${formatCurrency(avgCostPerOrder)}).`
  } else if (salesOrderOrders < 5) {
    return `MONITOR closely. Limited actual order volume (${salesOrderOrders}). Review tracking and conversion funnel.`
  } else if (trackingAccuracy < 70) {
    return `IMPROVE TRACKING. Low accuracy (${formatPercentage(trackingAccuracy)}). FB data unreliable for this branch.`
  } else {
    return `MAINTAIN current allocation. Acceptable performance with ${formatNumber(salesOrderROAS, 2)}x actual ROAS.`
  }
}


</script> 