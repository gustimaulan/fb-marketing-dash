<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from './stores/dashboard.js'
import { useUtilsStore } from './stores/utils.js'
import { leadsRatioCacheManager } from './api/leadsRatio.js'

// Import dashboard components
import OverviewDashboard from './components/dashboards/OverviewDashboard.vue'
import CampaignDashboard from './components/dashboards/CampaignDashboard.vue'
import AttributionDashboard from './components/dashboards/AttributionDashboard.vue'
import BranchDashboard from './components/dashboards/BranchDashboard.vue'
import DataManagementDashboard from './components/dashboards/DataManagementDashboard.vue'

// Import shared components
import DateRangePicker from './components/shared/DateRangePicker.vue'
import ProductFilter from './components/shared/ProductFilter.vue'
import CacheDebugger from './components/shared/CacheDebugger.vue'

// Tab management
const activeTab = ref('overview') // Changed default to overview to show the line chart

// Use Pinia stores
const dashboardStore = useDashboardStore()
const utilsStore = useUtilsStore()

// Destructure store properties and methods for easier access
const {
  loading,
  error,
  groupByMode,
  selectedProducts,
  currentSort,
  dateRange,
  startDate,
  endDate,
  searchQuery,
  columnConfig,
  sortedData,
  visibleColumns,
  productOptions,
  metrics,
  chartData,
  attributionMetrics,
  totalSalesRevenue,
  trafficSourceSummary,
  leadsRatioData,
  leadsRatioLoading,
  leadsRatioError,
  branchPerformanceData
} = storeToRefs(dashboardStore)

const {
  handleSort,
  moveColumn,
  applyProductFilter,
  refetchData,
  setDateRange,
  setCustomDateRange,
  initializeDashboard,
  handleCustomDateChange,
  refreshData
} = dashboardStore

const { formatValue, formatCurrency, formatNumber, formatPercentage } = utilsStore

// Tab configuration
const tabs = [
  { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
  { id: 'campaigns', name: 'Campaigns', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'attribution', name: 'Attribution', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'branches', name: 'Branches', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'data-management', name: 'Data Management', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' }
]

// Tab switching function
const switchTab = (tabId) => {
  console.log('Switching tab from', activeTab.value, 'to', tabId)
  activeTab.value = tabId
  console.log('Active tab changed to:', activeTab.value)
}

// Refresh leads data function
const refreshLeadsData = async () => {
  console.log('Refreshing leads data...')
  console.log('Current dates:', { startDate: startDate.value, endDate: endDate.value })
  
  // If dates are not set, use current date range
  if (!startDate.value || !endDate.value) {
    console.log('No dates set, using current date range')
    setDateRange('last7days')
  }
  
  try {
    // Clear leads ratio cache first
    leadsRatioCacheManager.clearAll()
    console.log('Leads ratio cache cleared')
    
    // Refresh all data including leads ratio
    refreshData()
    
    console.log('Refresh completed')
  } catch (error) {
    console.error('Error refreshing leads data:', error)
  }
}

// Lifecycle
onMounted(() => {
  initializeDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Campaign Performance Dashboard</h1>
        <p class="mt-2 text-gray-600">Monitor and analyze your Facebook advertising campaigns</p>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-6 md:mb-8">
        <nav class="flex flex-wrap gap-2 sm:space-x-8 sm:gap-0" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            :class="[
              'flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            ]"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Shared Filters (shown on all tabs) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
          <!-- Date Range Picker -->
          <div class="flex-1 max-w-sm">
            <DateRangePicker
              :dateRange="dateRange"
              :startDate="startDate"
              :endDate="endDate"
              @customDateChange="handleCustomDateChange"
              @selectDateRange="setDateRange"
              @setCustomDateRange="setCustomDateRange"
              @update:startDate="(value) => startDate = value"
              @update:endDate="(value) => endDate = value"
            />
          </div>

          <!-- Campaign-specific filters (only show on campaigns tab) -->
          <div v-if="activeTab === 'campaigns'" class="flex flex-col gap-3 sm:flex-row sm:gap-2 sm:items-end">
            <!-- Search Bar -->
            <div class="flex-1 max-w-sm">
              <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search campaigns, adsets, or ads..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Group By -->
            <div class="min-w-0 max-w-xs">
              <label for="groupBy" class="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                id="groupBy"
                v-model="groupByMode"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="product">Group by Product</option>
                <option value="ad_name">Group by Ad Name</option>
                <option value="campaign">Group by Campaign</option>
                <option value="adset">Group by Adset</option>
                <option value="date">Group by Date</option>
              </select>
            </div>
            
            <!-- Product Filter -->
            <div class="min-w-0">
              <ProductFilter
                :selectedProducts="selectedProducts"
                :productOptions="productOptions"
                @applyFilter="applyProductFilter"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading-spinner"></div>
        <span class="ml-3 text-gray-600">Loading data...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-yellow-800">Using Sample Data</h3>
            <p class="mt-1 text-sm text-yellow-700">{{ error }}</p>
            <p class="mt-2 text-sm text-yellow-600">Showing sample data for demonstration purposes.</p>
            <div class="mt-3 flex space-x-2">
              <button
                @click="refetchData()"
                class="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading Data
              </button>
              <button
                @click="dashboardStore.useSampleData()"
                class="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Force Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab-based Dashboard Content -->
      <div v-else-if="!loading && !error">
        <!-- Overview Dashboard -->
        <OverviewDashboard 
          v-if="activeTab === 'overview'"
          :metrics="metrics"
          :attributionMetrics="attributionMetrics"
          :totalSalesRevenue="totalSalesRevenue"
          :leadsRatioData="leadsRatioData"
          :leadsRatioLoading="leadsRatioLoading"
          :leadsRatioError="leadsRatioError"
          :sortedData="sortedData"
          :branchPerformanceData="branchPerformanceData"
          @switchTab="switchTab"
        />

        <!-- Campaign Dashboard -->
        <CampaignDashboard 
          v-else-if="activeTab === 'campaigns'"
          :metrics="metrics"
          :chartData="chartData"
          :sortedData="sortedData"
          :columnConfig="columnConfig"
          :visibleColumns="visibleColumns"
          :currentSort="currentSort"
          :selectedProducts="selectedProducts"
          :productOptions="productOptions"
          :groupByMode="groupByMode"
          :handleSort="handleSort"
          :moveColumn="moveColumn"
          :formatValue="formatValue"
        />

        <!-- Attribution Dashboard -->
        <AttributionDashboard 
          v-else-if="activeTab === 'attribution'"
          :attributionMetrics="attributionMetrics"
          :fbMetrics="metrics"
          :totalSalesRevenue="totalSalesRevenue"
          :trafficSources="trafficSourceSummary"
        />

        <!-- Branch Dashboard -->
        <BranchDashboard 
          v-else-if="activeTab === 'branches'"
          :branchPerformanceData="branchPerformanceData"
        />

        <!-- Data Management Dashboard -->
        <DataManagementDashboard 
          v-else-if="activeTab === 'data-management'"
          :leadsRatioData="leadsRatioData"
          :leadsRatioLoading="leadsRatioLoading"
          :leadsRatioError="leadsRatioError"
          @refresh-leads-data="refreshLeadsData"
        />

        <!-- Invalid Tab State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-600">Invalid dashboard tab selected.</p>
        </div>
      </div>
    </div>
    
    <!-- Cache Debugger (development only) -->
    <CacheDebugger />
  </div>
</template>



