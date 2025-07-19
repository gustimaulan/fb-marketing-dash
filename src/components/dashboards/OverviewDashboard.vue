<template>
  <div class="space-y-8">
    <!-- Overview Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      <p class="mt-2 text-gray-600">
        Key performance indicators with real sales data. 
        <span class="text-purple-600 font-medium">📱 WhatsApp Leads</span> vs <span class="text-orange-600 font-medium">💰 Sales Orders (Real)</span>
      </p>
    </div>

    <!-- Data Content -->
    <div class="space-y-8">
      <!-- High-Level KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <!-- Total Ad Spend -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center">
                <h3 class="text-sm font-medium text-blue-700 truncate">Total Ad Spend</h3>
                <Tooltip 
                  title="Total Ad Spend"
                  content="Total amount spent on Facebook and Instagram advertising campaigns during the selected period"
                  example="Rp 10,000,000 spent on FB/IG ads in last 7 days"
                  position="top"
                />
              </div>
              <p class="text-xl md:text-2xl font-bold text-blue-900 mt-1">{{ formatCurrency(metrics.spend) }}</p>
            </div>
            <div class="flex-shrink-0 ml-3">
              <div class="p-2 md:p-3 bg-blue-200 rounded-full">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 md:p-6 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center">
                <h3 class="text-sm font-medium text-green-700 truncate">Sales Order Revenue</h3>
                <Tooltip 
                  title="Sales Order Revenue"
                  content="Actual revenue from sales orders attributed to Facebook/Instagram advertising based on customer source tracking"
                  example="Revenue from customers who came through fb_ads or ig_ads"
                  position="top"
                />
              </div>
              <p class="text-xl md:text-2xl font-bold text-green-900 mt-1">{{ formatCurrency(totalSalesRevenue) }}</p>
            </div>
            <div class="flex-shrink-0 ml-3">
              <div class="p-2 md:p-3 bg-green-200 rounded-full">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Leads (from WhatsApp Labels) - REAL API DATA ONLY -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 md:p-6 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center">
                <h3 class="text-sm font-medium text-purple-700 truncate">WhatsApp Leads</h3>
                <Tooltip 
                  title="WhatsApp Leads from Cekat"
                  content="ONLY real leads data from Cekat."
                  example="Real data: Pitcar + Otokits leads from Cekat"
                  position="top"
                />
              </div>
              
              <!-- Loading State -->
              <div v-if="leadsRatioLoading" class="text-xl md:text-2xl font-bold text-purple-600 mt-1 flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
              
              <!-- Error State -->
              <div v-else-if="leadsRatioError" class="text-xl md:text-2xl font-bold text-red-600 mt-1">
                API Error
                <div class="text-xs text-red-500 mt-1 font-normal">{{ leadsRatioError }}</div>
              </div>
              
              <!-- Data State -->
              <div v-else-if="leadsRatioData" class="text-xl md:text-2xl font-bold text-purple-900 mt-1">
                {{ formatNumber(leadsRatioData.totalLeads) }}
                <div class="text-xs text-green-600 mt-1 font-normal">✓ From Cekat</div>
              </div>
              
              <!-- No Data State -->
              <div v-else class="text-xl md:text-2xl font-bold text-gray-400 mt-1">
                No Data
                <div class="text-xs text-gray-500 mt-1 font-normal">No leads data available</div>
              </div>
            </div>
            <div class="flex-shrink-0 ml-3">
              <div class="p-2 md:p-3 bg-green-100 rounded-full">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Purchases (from Sales Orders) -->
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 md:p-6 rounded-lg shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center">
                <h3 class="text-sm font-medium text-orange-700 truncate">Sales Order Purchases</h3>
                <Tooltip 
                  title="Sales Order Purchases"
                  content="Actual purchases from sales order system attributed to Facebook/Instagram ads. More reliable than label-based tracking."
                  example="Real orders with source = fb_ads or ig_ads"
                  position="top"
                />
              </div>
              <p class="text-xl md:text-2xl font-bold text-orange-900 mt-1">{{ formatNumber(attributionMetrics.fbAttributedOrders || 0) }}</p>
            </div>
            <div class="flex-shrink-0 ml-3">
              <div class="p-2 md:p-3 bg-orange-200 rounded-full">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Quality Insight -->
      <!-- <div class="bg-gradient-to-r from-amber-50 to-amber-100 p-4 md:p-6 rounded-lg shadow-sm border border-amber-200 mb-6">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-amber-800 mb-1">Data Source Reliability</h3>
            <p class="text-sm text-amber-700">
              <strong>Purchases now use Sales Order data</strong> instead of WhatsApp labels for higher accuracy. 
              WhatsApp labels may miss purchases when admins forget to assign them.
            </p>
                         <div class="mt-2 text-xs">
               <span v-if="leadsRatioLoading" class="text-purple-600">📱 WhatsApp Leads: Loading...</span>
               <span v-else-if="leadsRatioError" class="text-red-600">📱 WhatsApp Leads: API Error</span>
               <span v-else-if="leadsRatioData" class="text-amber-600">📱 WhatsApp Leads: {{ formatNumber(leadsRatioData.totalLeads) }} (Real API)</span>
               <span v-else class="text-gray-400">📱 WhatsApp Leads: No data</span>
               • 
               <span class="text-orange-600">💰 Real Purchases: {{ formatNumber(attributionMetrics.fbAttributedOrders || 0) }}</span> • 
               <span v-if="leadsRatioLoading" class="text-purple-600">Conversion: Loading...</span>
               <span v-else-if="leadsRatioError" class="text-red-600">Conversion: Error</span>
               <span v-else-if="leadsRatioData && leadsRatioData.totalLeads > 0" class="text-green-600">Conversion: {{ formatPercentage((attributionMetrics.fbAttributedOrders / leadsRatioData.totalLeads) * 100) }}</span>
               <span v-else class="text-gray-400">Conversion: No data</span>
             </div>
          </div>
        </div>
      </div> -->

      <!-- Key Performance Indicators -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Overall ROAS -->
        <div class="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Overall ROAS</h3>
            <Tooltip 
              title="Return on Ad Spend Comparison"
              content="Compare Facebook's reported ROAS with actual ROAS based on your real sales data. True ROAS is more accurate for business decisions."
              example="FB reports 3x ROAS vs True ROAS 4x from actual sales"
              position="top"
            />
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="text-sm text-gray-600">Facebook Reported:</span>
                <Tooltip 
                  title="FB Reported ROAS"
                  content="ROAS calculated by Facebook platform using their conversion tracking"
                  position="right"
                />
              </div>
              <span class="font-semibold text-blue-600">{{ formatNumber(metrics.roas, 2) }}x</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="text-sm text-gray-600">True ROAS:</span>
                <Tooltip 
                  title="True ROAS"
                  content="Actual ROAS based on real sales orders from your system. More accurate than FB reported."
                  example="True ROAS 4.2x = Rp 4,200 actual revenue per Rp 1,000 spent"
                  position="right"
                />
              </div>
              <span class="font-semibold text-green-600">{{ formatNumber(attributionMetrics.trueROAS, 2) }}x</span>
            </div>
            <div class="pt-3 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Performance:</span>
                <span :class="attributionMetrics.trueROAS > metrics.roas ? 'text-green-600' : 'text-red-600'" class="font-medium">
                  {{ attributionMetrics.trueROAS > metrics.roas ? 'Better' : 'Lower' }} than reported
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Funnel -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Impressions:</span>
              <span class="font-semibold">{{ formatNumber(metrics.impressions) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="text-sm text-gray-600">Leads (Real API):</span>
                <Tooltip 
                  title="Real API Leads"
                  content="Real leads from WhatsApp API - no fallback data"
                  position="right"
                />
              </div>
              <span v-if="leadsRatioLoading" class="font-semibold text-purple-600">Loading...</span>
              <span v-else-if="leadsRatioError" class="font-semibold text-red-600">Error</span>
              <span v-else-if="leadsRatioData" class="font-semibold">{{ formatNumber(leadsRatioData.totalLeads) }}</span>
              <span v-else class="font-semibold text-gray-400">No data</span>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="text-sm text-gray-600">Purchases (Real):</span>
                <Tooltip 
                  title="Real Sales Orders"
                  content="Actual purchases from sales order system (fb_ads + ig_ads source)"
                  position="right"
                />
              </div>
              <span class="font-semibold text-orange-600">{{ formatNumber(attributionMetrics.fbAttributedOrders || 0) }}</span>
            </div>
            <div class="pt-2 border-t">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Lead → Purchase (Real):</span>
                <span v-if="leadsRatioLoading" class="font-semibold text-purple-600">Loading...</span>
                <span v-else-if="leadsRatioError" class="font-semibold text-red-600">Error</span>
                <span v-else-if="leadsRatioData && leadsRatioData.totalLeads > 0" class="font-semibold text-green-600">
                  {{ formatPercentage((attributionMetrics.fbAttributedOrders / leadsRatioData.totalLeads) * 100) }}
                </span>
                <span v-else class="font-semibold text-gray-400">No data</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Branch Performance Summary -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Branch Performance</h3>
            <Tooltip 
              title="Branch Purchase Comparison"
              content="Real purchases per branch from sales order system vs WhatsApp lead distribution"
              position="top"
            />
          </div>
          <div class="space-y-3">
            <!-- Loading State -->
            <div v-if="leadsRatioLoading" class="text-center text-purple-600 py-4">
              <svg class="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading branch data...
            </div>
            
            <!-- Error State -->
            <div v-else-if="leadsRatioError" class="text-center text-red-600 py-4">
              <div class="text-sm">Failed to load branch data</div>
              <div class="text-xs text-gray-500 mt-1">{{ leadsRatioError }}</div>
            </div>
            
            <!-- Data State -->
            <div v-else-if="leadsRatioData?.branches" v-for="branch in leadsRatioData.branches" :key="branch.name" class="space-y-1">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full" :class="branch.name.includes('Pitcar') ? 'bg-blue-500' : 'bg-purple-500'"></div>
                  <span class="text-sm text-gray-600">{{ branch.name.split(' ')[0] }}:</span>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-orange-600">{{ getRealBranchPurchases(branch.name) }}</div>
                  <div class="text-xs text-gray-400">(API: {{ formatNumber(branch.total || 0) }} leads)</div>
                </div>
              </div>
            </div>
            
            <!-- No Data State -->
            <div v-else class="text-center text-gray-400 py-4">
              <div class="text-sm">No branch data available</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <!-- <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            @click="$emit('switchTab', 'campaigns')"
            class="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="text-sm font-medium text-blue-700">View Campaigns</span>
          </button>
          
          <button 
            @click="$emit('switchTab', 'attribution')"
            class="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="text-sm font-medium text-green-700">View Attribution</span>
          </button>
          
          <button 
            @click="$emit('switchTab', 'branches')"
            class="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-sm font-medium text-purple-700">View Branches</span>
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { useUtilsStore } from '../../stores/utils.js'
import Tooltip from '../shared/Tooltip.vue'

const props = defineProps({
  metrics: {
    type: Object,
    required: true
  },
  attributionMetrics: {
    type: Object,
    required: true
  },
  totalSalesRevenue: {
    type: Number,
    required: true
  },
  leadsRatioData: {
    type: Object,
    default: null
  },
  leadsRatioLoading: {
    type: Boolean,
    default: false
  },
  leadsRatioError: {
    type: String,
    default: null
  },
  sortedData: {
    type: Array,
    default: () => []
  },
  branchPerformanceData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['switchTab'])

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore

// Get real purchases per branch from sales order data
const getRealBranchPurchases = (branchName) => {
  if (!props.branchPerformanceData) return '0'
  
  const branchData = props.branchPerformanceData.find(branch => 
    branch.branchName === branchName || branch.branchName.includes(branchName.split(' ')[0])
  )
  
  return formatNumber(branchData?.metrics?.sales_order?.orders || 0)
}

// Debug logging for props - with leads data source tracking
console.log('OverviewDashboard props:', {
  metrics: props.metrics,
  attributionMetrics: props.attributionMetrics,
  totalSalesRevenue: props.totalSalesRevenue,
  leadsRatioData: props.leadsRatioData,
  leadsRatioLoading: props.leadsRatioLoading,
  leadsRatioError: props.leadsRatioError,
  branchPerformanceData: props.branchPerformanceData
})

// Log leads data source
if (props.leadsRatioLoading) {
  console.log('🔄 Leads Status: LOADING from real API')
} else if (props.leadsRatioError) {
  console.error('❌ Leads Status: API ERROR -', props.leadsRatioError)
} else if (props.leadsRatioData) {
  console.log('✅ Leads Status: REAL API DATA -', props.leadsRatioData.totalLeads, 'leads')
  console.log('📊 Branch breakdown:', props.leadsRatioData.branches?.map(b => `${b.name}: ${b.total}`).join(', '))
} else {
  console.log('⚪ Leads Status: NO DATA AVAILABLE')
}
</script>

<style scoped>
/* Add any specific styles here */
</style> 