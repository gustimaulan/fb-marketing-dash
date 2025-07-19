<template>
  <div v-if="showDebugger" class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-lg z-50">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-sm font-medium text-gray-900">Cache Status</h3>
      <button @click="toggleDebugger" class="text-gray-400 hover:text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="space-y-2 text-xs">
      <!-- FB Ads Cache -->
      <div class="bg-blue-50 p-2 rounded">
        <div class="font-medium text-blue-700 mb-1">FB Ads Cache</div>
        <div v-if="cacheInfo.fbAds && Object.keys(cacheInfo.fbAds).length > 0">
          <div v-for="(info, key) in cacheInfo.fbAds" :key="key" class="flex justify-between">
            <span class="font-medium">{{ formatCacheName(key) }}:</span>
            <span :class="getCacheStatusClass(info)">
              {{ formatCacheStatus(info) }}
            </span>
          </div>
        </div>
        <div v-else class="text-gray-500">No cache data</div>
      </div>

      <!-- Sales Order Cache -->
      <div class="bg-green-50 p-2 rounded">
        <div class="font-medium text-green-700 mb-1">Sales Order Cache</div>
        <div v-if="cacheInfo.salesOrders && Object.keys(cacheInfo.salesOrders).length > 0">
          <div v-for="(info, key) in cacheInfo.salesOrders" :key="key" class="flex justify-between">
            <span class="font-medium">{{ formatSalesOrderCacheName(key) }}:</span>
            <span :class="getSalesOrderCacheStatusClass(info)">
              {{ formatSalesOrderCacheStatus(info) }}
            </span>
          </div>
        </div>
        <div v-else class="text-gray-500">No cache data</div>
      </div>

      <!-- Leads Ratio Cache -->
      <div class="bg-purple-50 p-2 rounded">
        <div class="font-medium text-purple-700 mb-1">Leads Ratio Cache</div>
        <div v-if="cacheInfo.leadsRatio && Object.keys(cacheInfo.leadsRatio).length > 0">
          <div v-for="(info, key) in cacheInfo.leadsRatio" :key="key" class="flex justify-between">
            <span class="font-medium">{{ formatLeadsRatioCacheName(key) }}:</span>
            <span :class="getLeadsRatioCacheStatusClass(info)">
              {{ formatLeadsRatioCacheStatus(info) }}
            </span>
          </div>
        </div>
        <div v-else class="text-gray-500">No cache data</div>
      </div>
      
      <div class="pt-2 border-t border-gray-200">
        <div class="flex justify-between mb-2">
          <span class="font-medium">API Status:</span>
          <span :class="loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'">
            {{ loading ? 'Loading...' : error ? 'Error' : 'Ready' }}
          </span>
        </div>
        
        <div class="flex justify-between mb-2">
          <span class="font-medium">FB Ads Records:</span>
          <span class="text-gray-600">{{ dataCount }}</span>
        </div>
        
        <div class="flex justify-between mb-2">
          <span class="font-medium">Sales Orders:</span>
          <span class="text-gray-600">{{ salesOrderCount }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="font-medium">Using Sample:</span>
          <span :class="usingSampleData ? 'text-orange-600' : 'text-green-600'">
            {{ usingSampleData ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <div class="pt-2 border-t border-gray-200 flex flex-wrap gap-2">
        <button 
          @click="refreshCache" 
          class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh All
        </button>
        <button 
          @click="refreshSalesOrdersOnly" 
          class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh Sales
        </button>
        <button 
          @click="clearCache" 
          class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
  
  <!-- Toggle Button -->
  <button 
    v-else
    @click="toggleDebugger"
    class="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
    title="Show Cache Debugger"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../stores/dashboard.js'
import { metaAdsCacheManager } from '../../api/dashboard.js'
import { salesOrderCacheManager } from '../../api/salesOrders.js'
import { leadsRatioCacheManager } from '../../api/leadsRatio.js'

const dashboardStore = useDashboardStore()
const { loading, error, allData, useSampleDataFallback, salesOrderData, leadsRatioData } = storeToRefs(dashboardStore)
const { getCacheInfo, clearAllCaches, refreshData, refreshSalesOrders } = dashboardStore

const showDebugger = ref(false)
const cacheInfo = ref({})

const toggleDebugger = () => {
  showDebugger.value = !showDebugger.value
  if (showDebugger.value) {
    updateCacheInfo()
  }
}

const updateCacheInfo = () => {
  cacheInfo.value = {
    ...getCacheInfo(),
    leadsRatio: leadsRatioCacheManager.getCacheInfo()
  }
}

const formatCacheName = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatCacheStatus = (info) => {
  if (info.error) return 'Error'
  if (!info.size) return 'Empty'
  
  const ageMinutes = Math.floor(info.age / (1000 * 60))
  const sizeKB = Math.round(info.size / 1024)
  
  return `${sizeKB}KB (${ageMinutes}m ago)`
}

const getCacheStatusClass = (info) => {
  if (info.error) return 'text-red-600'
  if (!info.size) return 'text-gray-400'
  
  const ageMinutes = info.age / (1000 * 60)
  if (ageMinutes < 5) return 'text-green-600'
  if (ageMinutes < 15) return 'text-yellow-600'
  return 'text-orange-600'
}

// Sales Order Cache Functions
const formatSalesOrderCacheName = (key) => {
  // Convert "sales_orders_2025-01-01_2025-01-31" to "Jan 1 - Jan 31"
  const parts = key.replace('sales_orders_', '').split('_')
  if (parts.length === 2) {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return `${formatDate(parts[0])} - ${formatDate(parts[1])}`
  }
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatSalesOrderCacheStatus = (info) => {
  if (info.expired) return 'Expired'
  if (!info.exists) return 'Missing'
  
  const ageMinutes = Math.floor(info.age / (1000 * 60))
  const remainingMinutes = Math.floor(info.remaining / (1000 * 60))
  
  return `${remainingMinutes}m left (${ageMinutes}m old)`
}

const getSalesOrderCacheStatusClass = (info) => {
  if (info.expired) return 'text-red-600'
  if (!info.exists) return 'text-gray-400'
  
  const remainingMinutes = info.remaining / (1000 * 60)
  if (remainingMinutes > 120) return 'text-green-600' // > 2 hours
  if (remainingMinutes > 60) return 'text-yellow-600' // > 1 hour
  return 'text-orange-600'
}

// Leads Ratio Cache Functions
const formatLeadsRatioCacheName = (key) => {
  // Convert "leads_ratio_2025-01-01_2025-01-31" to "Jan 1 - Jan 31"
  const parts = key.replace('leads_ratio_', '').split('_')
  if (parts.length === 2) {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return `${formatDate(parts[0])} - ${formatDate(parts[1])}`
  }
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatLeadsRatioCacheStatus = (info) => {
  if (info.isExpired) return 'Expired'
  if (!info.size) return 'Missing'
  
  const ageMinutes = Math.floor(info.age / (1000 * 60))
  const sizeKB = Math.round(info.size / 1024)
  
  return `${sizeKB}KB (${ageMinutes}m ago)`
}

const getLeadsRatioCacheStatusClass = (info) => {
  if (info.isExpired) return 'text-red-600'
  if (!info.size) return 'text-gray-400'
  
  const ageMinutes = info.age / (1000 * 60)
  if (ageMinutes < 5) return 'text-green-600'
  if (ageMinutes < 15) return 'text-yellow-600'
  return 'text-orange-600'
}

const dataCount = computed(() => allData.value?.length || 0)
const salesOrderCount = computed(() => salesOrderData.value?.length || 0)
const usingSampleData = computed(() => useSampleDataFallback.value)

const refreshCache = async () => {
  await refreshData()
  updateCacheInfo()
}

const refreshSalesOrdersOnly = async () => {
  await refreshSalesOrders()
  updateCacheInfo()
}

const clearCache = () => {
  clearAllCaches()
  updateCacheInfo()
}

// Auto-update cache info every 30 seconds when debugger is visible
let intervalId = null

onMounted(() => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    showDebugger.value = localStorage.getItem('cache-debugger-visible') === 'true'
  }
  
  intervalId = setInterval(() => {
    if (showDebugger.value) {
      updateCacheInfo()
    }
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Save debugger state
const saveDebuggerState = () => {
  if (import.meta.env.DEV) {
    localStorage.setItem('cache-debugger-visible', showDebugger.value.toString())
  }
}

// Watch for debugger visibility changes
import { watch } from 'vue'
watch(showDebugger, saveDebuggerState)
</script> 