<template>
  <div class="space-y-8">
    <!-- Branch Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Branch Performance Analysis</h2>
      <p class="mt-2 text-gray-600">
        Compare FB Reported data vs Sales Order data (actual) for accurate budget allocation decisions.
        <span class="text-orange-600 font-medium">📊 FB Reported</span> vs <span class="text-green-600 font-medium">✅ Sales Order (Actual)</span>
        <span v-if="dateRangeText" class="text-xs text-gray-500 ml-2">({{ dateRangeText }})</span>
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

      <!-- Data Quality Warning (if extreme values detected) -->
      <div v-if="hasDataQualityIssues" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">⚠️ Data Quality Alert</h3>
            <p class="mt-1 text-sm text-yellow-700">
              Extreme accuracy values detected. This may indicate data processing issues or significant tracking discrepancies. 
              Check browser console for detailed analysis (type <code class="bg-yellow-100 px-1 rounded">debugBranchAccuracy()</code>).
            </p>
          </div>
        </div>
      </div>

      <!-- Branch Performance Comparison -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div v-for="branchData in branchPerformanceData" :key="branchData.branchName" 
             class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <!-- Branch Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div v-if="getBranchLogo(branchData.branchName)" class="flex-shrink-0">
                <img :src="getBranchLogo(branchData.branchName)" 
                     :alt="branchData.branchName + ' logo'"
                     class="h-6 w-auto object-contain">
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">{{ branchData.branchName }}</h4>
                <p class="text-sm text-gray-600">{{ branchData.percentage }}% of total ad spend allocation</p>
              </div>
            </div>
            <!-- <div class="text-right">
              <div class="px-3 py-1 rounded-full text-sm font-medium"
                   :class="branchData.metrics.roas > overallROAS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ branchData.metrics.roas > overallROAS ? 'Outperforming' : 'Underperforming' }}
              </div>
            </div> -->
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
              <h5 class="font-semibold text-gray-800 mb-3">📊 Tracking Accuracy Analysis</h5>
              
              <!-- Revenue Accuracy -->
              <div class="mb-3 p-3 bg-white rounded border">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">Revenue Accuracy</span>
                  <span class="text-lg font-bold" :class="getAccuracyColor(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)">
                    {{ formatPercentage(getAccuracyPercentage(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue)) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  FB: {{ formatCurrency(branchData.metrics.fb_reported.revenue) }} vs 
                  Actual: {{ formatCurrency(branchData.metrics.sales_order.revenue) }}
                  <br>
                  <span class="mt-1 inline-block">
                    Ratio: {{ formatNumber(getAccuracyAnalysis(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue).ratio, 2) }}x
                    <span v-if="getAccuracyAnalysis(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue).direction === 'fb-under-reporting'" 
                          class="text-orange-600 font-medium ml-2">📉 FB Under-reporting</span>
                    <span v-else-if="getAccuracyAnalysis(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue).direction === 'fb-over-reporting'" 
                          class="text-red-600 font-medium ml-2">📈 FB Over-reporting</span>
                    <span v-else-if="getAccuracyAnalysis(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue).direction === 'accurate'" 
                          class="text-green-600 font-medium ml-2">✅ Accurate</span>
                    <span v-else class="text-gray-500 font-medium ml-2">❓ {{ getAccuracyAnalysis(branchData.metrics.fb_reported.revenue, branchData.metrics.sales_order.revenue).direction }}</span>
                  </span>
                </div>
              </div>

              <!-- Order Accuracy -->
              <div class="p-3 bg-white rounded border">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">Order Count Accuracy</span>
                  <span class="text-lg font-bold" :class="getAccuracyColor(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders)">
                    {{ formatPercentage(getAccuracyPercentage(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders)) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  FB: {{ formatNumber(branchData.metrics.fb_reported.orders) }} vs 
                  Actual: {{ formatNumber(branchData.metrics.sales_order.orders) }}
                  <br>
                  <span class="mt-1 inline-block">
                    Ratio: {{ formatNumber(getAccuracyAnalysis(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders).ratio, 2) }}x
                    <span v-if="getAccuracyAnalysis(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders).direction === 'fb-under-reporting'" 
                          class="text-orange-600 font-medium ml-2">📉 FB Under-reporting</span>
                    <span v-else-if="getAccuracyAnalysis(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders).direction === 'fb-over-reporting'" 
                          class="text-red-600 font-medium ml-2">📈 FB Over-reporting</span>
                    <span v-else-if="getAccuracyAnalysis(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders).direction === 'accurate'" 
                          class="text-green-600 font-medium ml-2">✅ Accurate</span>
                    <span v-else class="text-gray-500 font-medium ml-2">❓ {{ getAccuracyAnalysis(branchData.metrics.fb_reported.orders, branchData.metrics.sales_order.orders).direction }}</span>
                  </span>
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
          <!-- <div class="p-4 rounded-lg" :class="getBudgetRecommendationClass(branchData)">
            <h5 class="font-medium mb-2" :class="getBudgetRecommendationTextClass(branchData)">
              Budget Recommendation:
            </h5>
            <p class="text-sm" :class="getBudgetRecommendationTextClass(branchData)">
              {{ getBudgetRecommendation(branchData) }}
            </p>
          </div> -->
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import { useDashboardStore } from '../../stores/dashboard.js'
import pitcarLogo from '../../assets/logos/pitcar-logo.png'
import otokitsLogo from '../../assets/logos/otokits-logo.png'

const props = defineProps({
  branchPerformanceData: {
    type: Array,
    default: null
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore

const dashboardStore = useDashboardStore()

// Get actual date range from dashboard store
const dateRangeText = computed(() => {
  if (dashboardStore.startDate && dashboardStore.endDate) {
    return `${dashboardStore.startDate} to ${dashboardStore.endDate}`
  }
  return null
})

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

// Detect data quality issues
const hasDataQualityIssues = computed(() => {
  if (!props.branchPerformanceData) return false
  
  return props.branchPerformanceData.some(branch => {
    const revenueAnalysis = getAccuracyAnalysis(
      branch.metrics.fb_reported.revenue,
      branch.metrics.sales_order.revenue
    )
    const orderAnalysis = getAccuracyAnalysis(
      branch.metrics.fb_reported.orders,
      branch.metrics.sales_order.orders
    )
    
    // Flag extreme ratios or invalid data (using more reasonable thresholds)
    return revenueAnalysis.ratio > 10 || revenueAnalysis.ratio < 0.1 ||
           orderAnalysis.ratio > 10 || orderAnalysis.ratio < 0.1 ||
           revenueAnalysis.direction === 'invalid-data' ||
           orderAnalysis.direction === 'invalid-data'
  })
})

// Tracking accuracy and gap analysis functions - FIXED DOUBLE PERCENTAGE ISSUE
const getAccuracyPercentage = (fbValue, salesOrderValue) => {
  // Convert to numbers and handle all edge cases
  const fbVal = parseFloat(fbValue) || 0
  const salesVal = parseFloat(salesOrderValue) || 0
  
  console.log('🔍 Raw Input Values:', { fbValue, salesOrderValue, fbVal, salesVal })
  
  // Handle zero cases
  if (fbVal <= 0 && salesVal <= 0) return 0
  if (fbVal <= 0 && salesVal > 0) return 0  // FB missing data
  if (salesVal <= 0 && fbVal > 0) return 0  // Sales missing data
  
  // Ensure positive values
  const fbAbs = Math.abs(fbVal)
  const salesAbs = Math.abs(salesVal)
  
  // Calculate similarity as decimal (0-1) - NOT percentage!
  const smaller = Math.min(fbAbs, salesAbs)
  const larger = Math.max(fbAbs, salesAbs)
  
  // Prevent division by zero
  if (larger === 0) return 0
  
  // Return decimal value (0-1) because formatPercentage will multiply by 100
  const similarity = smaller / larger
  
  console.log('📊 Accuracy Calculation:', {
    fbAbs, salesAbs, smaller, larger, 
    similarityDecimal: similarity,
    similarityPercent: similarity * 100,
    ratio: salesAbs / fbAbs
  })
  
  // Return decimal value between 0 and 1 (formatPercentage will handle the *100)
  const result = Math.max(0, Math.min(1, similarity))
  console.log('✅ Final Accuracy (decimal):', result, 'Will display as:', (result * 100).toFixed(1) + '%')
  
  return result
}

const getAccuracyColor = (fbValue, salesOrderValue) => {
  const accuracy = getAccuracyPercentage(fbValue, salesOrderValue)
  if (accuracy >= 80) return 'text-green-600'
  if (accuracy >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

// Enhanced accuracy analysis with direction indicator - COMPLETELY REWRITTEN
const getAccuracyAnalysis = (fbValue, salesOrderValue) => {
  // Convert to numbers safely
  const fbVal = parseFloat(fbValue) || 0
  const salesVal = parseFloat(salesOrderValue) || 0
  
  console.log('🔍 Enhanced Analysis Input:', {
    fbValue: { raw: fbValue, parsed: fbVal, type: typeof fbValue },
    salesOrderValue: { raw: salesOrderValue, parsed: salesVal, type: typeof salesOrderValue }
  })
  
  // Handle all zero/invalid cases
  if (isNaN(fbVal) || isNaN(salesVal)) {
    return { accuracy: 0, direction: 'invalid-data', ratio: 0, fbValue: 0, salesValue: 0 }
  }
  
  if (fbVal <= 0 && salesVal <= 0) {
    return { accuracy: 0, direction: 'no-data', ratio: 0, fbValue: 0, salesValue: 0 }
  }
  
  if (fbVal <= 0) {
    return { accuracy: 0, direction: 'fb-missing', ratio: 0, fbValue: 0, salesValue: salesVal }
  }
  
  if (salesVal <= 0) {
    return { accuracy: 0, direction: 'sales-missing', ratio: 0, fbValue: fbVal, salesValue: 0 }
  }
  
  // Use absolute values for calculation
  const fbAbs = Math.abs(fbVal)
  const salesAbs = Math.abs(salesVal)
  
  // Calculate accuracy using the same method as getAccuracyPercentage
  const accuracy = getAccuracyPercentage(fbValue, salesOrderValue)
  
  // Calculate ratio safely
  const ratio = fbAbs > 0 ? salesAbs / fbAbs : 0
  
  // Determine direction with more conservative thresholds
  let direction
  if (ratio === 1.0) {
    direction = 'accurate'                // Exactly equal
  } else if (ratio > 1.0) {
    direction = 'fb-under-reporting'      // Actual is higher than FB
  } else {
    direction = 'fb-over-reporting'       // FB is higher than actual
  }
  
  // Cap extreme ratios for display purposes
  const displayRatio = Math.min(Math.max(ratio, 0.01), 100)
  
  const result = { 
    accuracy, 
    direction, 
    ratio: displayRatio,
    fbValue: fbAbs,
    salesValue: salesAbs
  }
  
  console.log('📊 Enhanced Analysis Result:', result)
  return result
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
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder && trackingAccuracy >= 0.7) {
    return 'bg-green-50 border border-green-200'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5 || trackingAccuracy < 0.5) {
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
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder && trackingAccuracy >= 0.7) {
    return 'text-green-800'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5 || trackingAccuracy < 0.5) {
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
  } else if (trackingAccuracy < 0.7) {
    return `IMPROVE TRACKING. Low accuracy (${formatPercentage(trackingAccuracy)}). FB data unreliable for this branch.`
  } else {
    return `MAINTAIN current allocation. Acceptable performance with ${formatNumber(salesOrderROAS, 2)}x actual ROAS.`
  }
}

// Debug function to analyze branch data quality
const debugBranchData = () => {
  if (!props.branchPerformanceData) {
    console.log('❌ No branch performance data available')
    return
  }
  
  console.log('🏢 Branch Data Debug Analysis:')
  console.log('Raw branch data:', props.branchPerformanceData)
  
  props.branchPerformanceData.forEach((branch, index) => {
    console.log(`\n📍 Branch ${index + 1}: ${branch.branchName}`)
    console.log('Metrics structure:', branch.metrics)
    console.log('FB Reported:', branch.metrics.fb_reported)
    console.log('Sales Order:', branch.metrics.sales_order)
    
    // Calculate accuracy for debugging
    const revenueAccuracy = getAccuracyAnalysis(
      branch.metrics.fb_reported.revenue,
      branch.metrics.sales_order.revenue
    )
    console.log('Revenue accuracy analysis:', revenueAccuracy)
    
    const orderAccuracy = getAccuracyAnalysis(
      branch.metrics.fb_reported.orders,
      branch.metrics.sales_order.orders
    )
    console.log('Order accuracy analysis:', orderAccuracy)
  })
}

// Get branch logo based on branch name
const getBranchLogo = (branchName) => {
  const name = branchName.toLowerCase()
  if (name.includes('pitcar')) {
    return pitcarLogo
  } else if (name.includes('otokits')) {
    return otokitsLogo
  }
  return null
}

// Expose debug function globally for browser console access
if (typeof window !== 'undefined') {
  window.debugBranchAccuracy = debugBranchData
  
  // Quick test function to verify percentage fix
  window.testAccuracyFix = () => {
    console.log('🧪 Testing Accuracy Fix:')
    
    // Test cases
    const testCases = [
      { fb: 100, sales: 6000, expected: '1.7%' },
      { fb: 1000, sales: 3000, expected: '33.3%' },
      { fb: 2000, sales: 2000, expected: '100.0%' },
      { fb: 5000, sales: 1000, expected: '20.0%' }
    ]
    
    testCases.forEach(test => {
      const accuracy = getAccuracyPercentage(test.fb, test.sales)
      const formatted = formatPercentage(accuracy)
      console.log(`FB: ${test.fb}, Sales: ${test.sales} → Accuracy: ${accuracy} → Formatted: ${formatted} (Expected: ${test.expected})`)
    })
  }
}

</script> 