<template>
  <div class="space-y-8">
    <!-- Branch Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Branch Performance Analysis</h2>
      <p class="mt-2 text-gray-600">
        Accurate performance data based on actual sales orders. Ad spend allocation uses leads ratio for fair distribution.
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
              <span class="text-sm text-blue-600">Overall ROAS:</span>
              <span class="font-bold text-blue-900">{{ formatNumber(overallROAS, 2) }}x</span>
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
              <span class="text-sm text-green-600">Total Leads:</span>
              <span class="font-bold text-green-900">{{ formatNumber(props.leadsRatioData?.totalLeads || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-600">Actual Orders:</span>
              <span class="font-bold text-green-900">{{ formatNumber(totalSalesOrders || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-green-600">Actual ROAS:</span>
              <span class="font-bold text-green-900">{{ formatNumber(overallROAS, 2) }}x</span>
            </div>
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
          <h3 class="text-lg font-medium text-gray-800 mb-4">📊 Performance Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-purple-600">Best Branch ROAS:</span>
              <span class="font-bold text-purple-900">{{ formatNumber(bestBranchROAS, 2) }}x</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-purple-600">Avg Order Value:</span>
              <span class="font-bold text-purple-900">{{ formatCurrency(averageOrderValue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-purple-600">Total Branches:</span>
              <span class="font-bold text-purple-900">{{ branchPerformanceData?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Branch Performance Comparison -->
      <div class="grid grid-cols-2 xl:grid-cols-2 gap-8">
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
            <div class="text-right">
              <div class="px-3 py-1 rounded-full text-sm font-medium"
                   :class="branchData.metrics.sales_order.roas > overallROAS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ branchData.metrics.sales_order.roas > overallROAS ? 'Outperforming' : 'Underperforming' }}
              </div>
            </div>
          </div>

          <!-- Key Financial Metrics -->
          <div class="mb-6">
            <!-- Ad Spend (Allocated via Leads Ratio) -->
            <div class="text-center p-4 bg-blue-50 rounded-lg border mb-4">
              <div class="text-2xl font-bold text-blue-900">{{ formatCurrency(branchData.metrics.spend) }}</div>
              <div class="text-sm text-blue-600">Allocated Ad Spend (via Leads Ratio)</div>
            </div>



            <!-- Sales Order Data (Actual) -->
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 class="font-semibold text-green-800 mb-3 text-center">✅ Sales Order Data (Actual)</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-green-600">Revenue:</span>
                  <span class="font-bold text-green-900">{{ formatCurrency(branchData.metrics.sales_order.revenue) }}</span>
                </div>
                <!-- Removed Total Leads line since it's not branch-specific -->
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

          <!-- Performance Analysis -->
          <div class="mb-6">
            <!-- Performance Metrics -->
            <div class="bg-gray-50 p-4 rounded-lg border mb-4">
              <h5 class="font-semibold text-gray-800 mb-3">📊 Performance Analysis</h5>
              
              <!-- ROAS Performance -->
              <div class="mb-3 p-3 bg-white rounded border">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">ROAS Performance</span>
                  <span class="text-lg font-bold" :class="branchData.metrics.sales_order.roas > 2 ? 'text-green-600' : 'text-red-600'">
                    {{ formatNumber(branchData.metrics.sales_order.roas, 2) }}x
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  <span v-if="branchData.metrics.sales_order.roas > overallROAS" class="text-green-600 font-medium">
                    ✅ {{ formatNumber(((branchData.metrics.sales_order.roas / overallROAS) - 1) * 100, 1) }}% above average
                  </span>
                  <span v-else class="text-red-600 font-medium">
                    📉 {{ formatNumber(((overallROAS / branchData.metrics.sales_order.roas) - 1) * 100, 1) }}% below average
                  </span>
                </div>
              </div>

              <!-- Cost Efficiency -->
              <div class="p-3 bg-white rounded border">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">Cost per Order</span>
                  <span class="text-lg font-bold" :class="branchData.metrics.sales_order.cost_per_order <= averageCostPerOrder ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(branchData.metrics.sales_order.cost_per_order) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  <span v-if="branchData.metrics.sales_order.cost_per_order <= averageCostPerOrder" class="text-green-600 font-medium">
                    ✅ {{ formatNumber(((averageCostPerOrder / branchData.metrics.sales_order.cost_per_order) - 1) * 100, 1) }}% more efficient
                  </span>
                  <span v-else class="text-red-600 font-medium">
                    📉 {{ formatNumber(((branchData.metrics.sales_order.cost_per_order / averageCostPerOrder) - 1) * 100, 1) }}% less efficient
                  </span>
                </div>
              </div>
            </div>
          </div>
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
  },
  leadsRatioData: {
    type: Object,
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
  return props.branchPerformanceData.reduce((sum, branch) => sum + branch.metrics.sales_order.revenue, 0)
})

const overallROAS = computed(() => {
  return totalBudget.value > 0 ? totalRevenue.value / totalBudget.value : 0
})

const averageOrderValue = computed(() => {
  if (!props.branchPerformanceData) return 0
  const totalOrders = props.branchPerformanceData.reduce((sum, branch) => sum + branch.metrics.sales_order.orders, 0)
  return totalOrders > 0 ? totalRevenue.value / totalOrders : 0
})

// Calculate total sales orders from branch metrics  
const totalSalesOrders = computed(() => {
  if (!props.branchPerformanceData) return 0
  return props.branchPerformanceData.reduce((sum, branch) => {
    return sum + (branch.metrics.sales_order.orders || 0)
  }, 0)
})

// Calculate leads and purchases summary
const leadsSummary = computed(() => {
  if (!props.leadsRatioData) return { totalLeads: 0, totalPurchases: 0 }
  
  const totalPurchases = totalSalesOrders.value
  const totalLeads = props.leadsRatioData.totalLeads || 0
  
  return { totalLeads, totalPurchases }
})

const bestBranchROAS = computed(() => {
  if (!props.branchPerformanceData || props.branchPerformanceData.length === 0) return 0
  return Math.max(...props.branchPerformanceData.map(branch => branch.metrics.sales_order.roas || 0))
})

const averageCostPerOrder = computed(() => {
  const totalOrders = totalSalesOrders.value
  return totalOrders > 0 ? totalBudget.value / totalOrders : 0
})

// Budget recommendation logic based on Sales Order ROAS and cost efficiency
const getBudgetRecommendationClass = (branchData) => {
  const salesOrderROAS = branchData.metrics.sales_order.roas
  const salesOrderCostPerOrder = branchData.metrics.sales_order.cost_per_order
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder) {
    return 'bg-green-50 border border-green-200'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5) {
    return 'bg-red-50 border border-red-200'
  } else {
    return 'bg-yellow-50 border border-yellow-200'
  }
}

const getBudgetRecommendationTextClass = (branchData) => {
  const salesOrderROAS = branchData.metrics.sales_order.roas
  const salesOrderCostPerOrder = branchData.metrics.sales_order.cost_per_order
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder) {
    return 'text-green-800'
  } else if (salesOrderROAS < overallROAS.value * 0.8 || salesOrderCostPerOrder > avgCostPerOrder * 1.5) {
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
  
  const avgCostPerOrder = totalBudget.value / props.branchPerformanceData.reduce((sum, branch) => sum + (branch.metrics.sales_order.orders || 0), 0)
  
  if (salesOrderROAS > overallROAS.value * 1.2 && salesOrderCostPerOrder <= avgCostPerOrder) {
    const increasePercentage = Math.min(40, Math.round((salesOrderROAS / overallROAS.value - 1) * 30))
    return `INCREASE budget by ${increasePercentage}%. Excellent ${formatNumber(salesOrderROAS, 2)}x ROAS with efficient cost.`
  } else if (salesOrderROAS < overallROAS.value * 0.8) {
    return `REDUCE or OPTIMIZE budget. Low ROAS (${formatNumber(salesOrderROAS, 2)}x). Focus on conversion optimization.`
  } else if (salesOrderCostPerOrder > avgCostPerOrder * 1.5) {
    return `OPTIMIZE cost efficiency. High cost per order (${formatCurrency(salesOrderCostPerOrder)} vs avg ${formatCurrency(avgCostPerOrder)}).`
  } else if (salesOrderOrders < 5) {
    return `MONITOR closely. Limited order volume (${salesOrderOrders}). Review conversion funnel.`
  } else {
    return `MAINTAIN current allocation. Acceptable performance with ${formatNumber(salesOrderROAS, 2)}x ROAS.`
  }
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

// Helper functions for leads data
const getBranchLeads = (branchName) => {
  if (!props.leadsRatioData?.branches) return 0
  const branch = props.leadsRatioData.branches.find(b => b.name === branchName)
  return branch?.total || 0
}

const getBranchCostPerLead = (branchData) => {
  const leads = getBranchLeads(branchData.branchName)
  return leads > 0 ? branchData.metrics.spend / leads : 0
}

const getBranchConversionRate = (branchData) => {
  const leads = getBranchLeads(branchData.branchName)
  const orders = branchData.metrics.sales_order.orders
  return leads > 0 ? (orders / leads) * 100 : 0
}

</script>