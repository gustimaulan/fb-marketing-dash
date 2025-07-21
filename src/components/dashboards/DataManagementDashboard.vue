<template>
  <div class="space-y-8">
    <!-- Data Management Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Data Management</h2>
          <p class="mt-2 text-gray-600">
            Upload and manage your Cekat Contacts data to update leads ratio information.
          </p>
        </div>
        
        <!-- Status Badge -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div class="w-2 h-2 rounded-full" :class="leadsRatioLoading ? 'bg-yellow-400' : leadsRatioError ? 'bg-red-400' : 'bg-green-400'"></div>
            <span class="text-sm font-medium text-gray-700">
              <span v-if="leadsRatioLoading">Loading...</span>
              <span v-else-if="leadsRatioError">Error</span>
              <span v-else-if="leadsRatioData">{{ formatNumber(leadsRatioData.totalLeads) }} data</span>
              <span v-else>No data</span>
            </span>
          </div>
          
          <div v-if="leadsRatioData && !leadsRatioLoading && !leadsRatioError" class="flex flex-col items-end space-x-2 text-xs text-gray-500">
            <span class="text-sm text-green-600 bg-green-50 rounded-lg p-1">Most recent data: {{ formatDate(leadsRatioData.lastCreatedAt || leadsRatioData.lastUpdated) }}</span>
            <span v-if="dateRangeText">Filtered data: {{ dateRangeText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- File Upload Section -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Upload Cekat Contacts File</h3>
        <div class="relative group ml-3">
          <button 
            type="button"
            class="flex items-center space-x-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-700 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-sm hover:shadow-md"
            title="Export instructions"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-medium">See Export Instructions</span>
          </button>
          <!-- Tooltip -->
          <div class="absolute left-0 top-full mt-2 w-80 bg-orange-50 border border-orange-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div class="p-4">
              <h4 class="font-medium text-orange-800 mb-2">📋 How to Export from Cekat:</h4>
              <ol class="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                <li>Go to Cekat Contacts section</li>
                <li>Set filter to <strong>"This Month"</strong></li>
                <li>Click Export/Download button</li>
                <li>Save the file and drop it here</li>
              </ol>
              <p class="text-xs text-orange-600 mt-2">
                💡 Tip: Using "This Month" filter ensures you get the most recent contact data for accurate leads ratio calculation.
              </p>
            </div>
            <!-- Tooltip arrow -->
            <div class="absolute -top-2 left-4 w-4 h-4 bg-orange-50 border-l border-t border-orange-200 transform rotate-45"></div>
          </div>
        </div>
      </div>
      
      <FileUpload 
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
    </div>



    
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import FileUpload from '../shared/FileUpload.vue'
import { useDashboardStore } from '../../stores/dashboard.js'

const props = defineProps({
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
  }
})

const emit = defineEmits(['refresh-leads-data'])

const utilsStore = useUtilsStore()
const { formatNumber, formatPercentage } = utilsStore

const dashboardStore = useDashboardStore()

const dateRangeText = computed(() => {
  if (dashboardStore.startDate && dashboardStore.endDate) {
    return `${dashboardStore.startDate} to ${dashboardStore.endDate}`
  }
  return null
})

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleUploadSuccess = (data) => {
  console.log('✅ File upload successful:', data)
  // Show success message and refresh data after a short delay
  setTimeout(() => {
    emit('refresh-leads-data')
  }, 1000)
}

const handleUploadError = (data) => {
  console.error('❌ File upload failed:', data)
}
</script> 