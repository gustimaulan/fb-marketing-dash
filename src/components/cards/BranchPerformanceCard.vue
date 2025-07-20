<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Branch Performance Breakdown</h3>
    
    <!-- Branch Ratio Overview -->
    <div v-if="leadsRatioData" class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Leads Distribution</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="branch in leadsRatioData.branches" :key="branch.name" class="bg-gray-50 p-3 rounded-lg">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">{{ branch.name }}</span>
            <span class="text-sm text-gray-600">{{ branch.percentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: branch.percentage + '%' }"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formatNumber(branch.total) }} leads → {{ formatNumber(branch.purchases || 0) }} purchases
          </div>
        </div>
      </div>
    </div>
    
    <!-- Branch Performance Metrics -->
    <div v-if="branchPerformanceData" class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Campaign Performance by Branch</h4>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="branchData in branchPerformanceData" :key="branchData.branchName" class="space-y-3">
          <!-- Branch Header -->
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <h5 class="text-sm font-medium text-blue-800 mb-2">{{ branchData.branchName }}</h5>
            <div class="text-xs text-blue-600">{{ branchData.percentage }}% of total performance</div>
          </div>
          
          <!-- Key Metrics -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white border border-gray-200 p-3 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Spend</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(branchData.metrics.spend) }}
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 p-3 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">ROAS</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatNumber(branchData.metrics.roas) }}x
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 p-3 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Reach</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatNumber(branchData.metrics.reach) }}
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 p-3 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Purchases</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatNumber(branchData.metrics.purchases) }}
              </div>
              <div class="text-xs text-green-600 mt-1">Real data</div>
            </div>
          </div>
          
          <!-- Real Performance Insights -->
          <div class="bg-green-50 p-3 rounded-lg">
            <div class="text-xs text-green-700 mb-2">Real Performance Insights</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between">
                <span>Lead to Purchase:</span>
                <span class="font-medium">{{ formatPercentage(branchData.actualLeads > 0 ? (branchData.actualPurchases / branchData.actualLeads) : 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span>True CPA:</span>
                <span class="font-medium">{{ formatCurrency(branchData.metrics.cost_per_purchase) }}</span>
              </div>
              <div class="flex justify-between">
                <span>True ROAS:</span>
                <span class="font-medium">{{ formatNumber(branchData.metrics.roas) }}x</span>
              </div>
              <div class="flex justify-between">
                <span>Avg Order Value:</span>
                <span class="font-medium">{{ branchData.actualPurchases > 0 ? formatCurrency(branchData.metrics.purchase_value / branchData.actualPurchases) : '-' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Additional Metrics -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-xs text-gray-600 mb-2">Campaign Metrics</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between">
                <span>Impressions:</span>
                <span class="font-medium">{{ formatNumber(branchData.metrics.impressions) }}</span>
              </div>
              <div class="flex justify-between">
                <span>CPM:</span>
                <span class="font-medium">{{ formatCurrency(branchData.metrics.cpm) }}</span>
              </div>
              <div class="flex justify-between">
                <span>CTR:</span>
                <span class="font-medium">{{ formatPercentage(branchData.metrics.ctr / 100) }}</span>
              </div>
              <div class="flex justify-between">
                <span>CPP:</span>
                <span class="font-medium">{{ formatCurrency(branchData.metrics.cost_per_purchase) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Conversations:</span>
                <span class="font-medium">{{ formatNumber(branchData.metrics.conversations) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Purchase Value:</span>
                <span class="font-medium">{{ formatCurrency(branchData.metrics.purchase_value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- No Data State -->
    <div v-else class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p>Branch performance data not available</p>
      <p class="text-xs mt-1">Data may be loading or unavailable for the selected date range</p>
    </div>
    
    <!-- Data Status -->
    <div v-if="leadsRatioData" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>Total Leads: {{ formatNumber(leadsRatioData.totalLeads) }}</span>
        <span v-if="leadsRatioData.totalPurchases">
          Total Purchases: {{ formatNumber(leadsRatioData.totalPurchases) }}
        </span>
        <span v-if="leadsRatioData.lastUpdated">
          Updated: {{ formatDate(leadsRatioData.lastUpdated) }}
        </span>
        <span v-if="leadsRatioData.error" class="text-red-600">
          Using fallback data
        </span>
      </div>
      <div v-if="leadsRatioData.totalPurchases && leadsRatioData.totalLeads" class="text-center mt-2 text-xs text-gray-600">
                        Overall Lead to Purchase Rate: {{ formatPercentage((leadsRatioData.totalPurchases / leadsRatioData.totalLeads)) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'

const props = defineProps({
  leadsRatioData: {
    type: Object,
    default: null
  },
  branchPerformanceData: {
    type: Array,
    default: null
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage, formatDate } = utilsStore
</script>

<style scoped>
/* Add any custom styles here */
</style> 