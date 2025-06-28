<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from './stores/dashboard.js'
import { useUtilsStore } from './stores/utils.js'

// Import components
import DateRangePicker from './components/DateRangePicker.vue'
import ProductFilter from './components/ProductFilter.vue'
import MetricCards from './components/MetricCards.vue'
import DashboardChart from './components/DashboardChart.vue'
import DashboardTable from './components/DashboardTable.vue'
import CacheDebugger from './components/CacheDebugger.vue'

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
  chartData
} = storeToRefs(dashboardStore)

const {
  handleSort,
  moveColumn,
  applyProductFilter,
  refetchData,
  setDateRange,
  initializeDashboard,
  handleCustomDateChange
} = dashboardStore

const { formatValue, formatCurrency, formatNumber } = utilsStore

// Lifecycle
onMounted(() => {
  initializeDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Campaign Performance Dashboard</h1>
        <p class="mt-2 text-gray-600">Monitor and analyze your Facebook advertising campaigns</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-wrap gap-2 justify-between items-center">
          <!-- Date Range Picker -->
          <DateRangePicker
            :dateRange="dateRange"
            :startDate="startDate"
            :endDate="endDate"
            @customDateChange="handleCustomDateChange"
            @selectDateRange="setDateRange"
            @update:startDate="(value) => startDate = value"
            @update:endDate="(value) => endDate = value"
          />

          <!-- Search Bar -->
          <div class="flex-1 max-w-sm">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search campaigns, adsets, or ads..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Group By -->
           <div class="flex flex-row justify-end gap-2">
             <div>
               <select
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
             <ProductFilter
               :selectedProducts="selectedProducts"
               :productOptions="productOptions"
               @applyFilter="applyProductFilter"
             />
           </div>
           </div>
      </div>

      <!-- Debug Info -->
      <!-- <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 class="text-sm font-medium text-blue-800">Debug Info</h3>
        <p class="text-xs text-blue-700 mt-1">
          Loading: {{ loading }} | Error: {{ error || 'none' }} | Data length: {{ data?.length || 0 }}
        </p>
      </div> -->

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
            <div class="mt-3">
              <button
                @click="refetchData()"
                class="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="!loading">
        <!-- Metric Cards -->
        <MetricCards
          :metrics="metrics"
          :formatCurrency="formatCurrency"
          :formatNumber="formatNumber"
        />

        <!-- Charts Section -->
        <DashboardChart
          :chartData="chartData"
          :selectedProducts="selectedProducts"
          :productOptions="productOptions"
        />

        <!-- Data Table -->
        <DashboardTable
          :sortedData="sortedData"
          :columnConfig="columnConfig"
          :visibleColumns="visibleColumns"
          :currentSort="currentSort"
          :formatValue="formatValue"
          @handleSort="handleSort"
          @moveColumn="moveColumn"
        />
      </div>

      <!-- Fallback State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">Something went wrong. Check debug info above.</p>
      </div>
    </div>
    
    <!-- Cache Debugger (development only) -->
    <CacheDebugger />
  </div>
</template>



