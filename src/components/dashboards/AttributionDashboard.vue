<template>
  <div class="space-y-6">
    <!-- Attribution Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Sales Attribution Analysis</h2>
      <p class="mt-1 text-gray-600">Track how advertising drives real sales and revenue</p>
    </div>

    <!-- Attribution Content -->
    <div>
      <!-- Sales Attribution Cards -->
      <SalesAttributionCard
        :attributionMetrics="attributionMetrics"
        :fbMetrics="fbMetrics"
        :formatCurrency="formatCurrency"
        :formatNumber="formatNumber"
        :formatPercentage="formatPercentage"
        :totalSalesRevenue="totalSalesRevenue"
      />

      <!-- Traffic Source Analysis -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Traffic Source Breakdown -->
        <div class="xl:col-span-2">
          <TrafficSourceBreakdown
            :trafficSources="trafficSources"
            :formatCurrency="formatCurrency"
            :formatNumber="formatNumber"
          />
        </div>
      </div>

      <!-- Attribution Deep Dive -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Attribution Funnel -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Attribution Funnel</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div class="font-medium text-blue-900">FB Ad Impressions</div>
                <div class="text-sm text-blue-700">Campaign reach</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-900">{{ formatNumber(fbMetrics.impressions) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div class="font-medium text-green-900">FB Purchases</div>
                <div class="text-sm text-green-700">Platform reported</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-900">{{ formatNumber(fbMetrics.purchases) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div class="font-medium text-purple-900">Actual Sales</div>
                <div class="text-sm text-purple-700">From FB advertising</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-purple-900">{{ formatNumber(attributionMetrics.fbAttributedOrders) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div>
                <div class="font-medium text-orange-900">Attribution Rate</div>
                <div class="text-sm text-orange-700">FB purchases → Sales</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-orange-900">{{ formatPercentage(attributionMetrics.conversionRate) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Comparison -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Comparison</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div class="font-medium text-blue-900">FB Reported Revenue</div>
                <div class="text-sm text-blue-700">Platform tracking</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-blue-900">{{ formatCurrency(fbMetrics.purchase_value) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div class="font-medium text-green-900">Actual FB Revenue</div>
                <div class="text-sm text-green-700">From sales orders</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-green-900">{{ formatCurrency(attributionMetrics.fbAttributedRevenue) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div class="font-medium text-purple-900">Total Sales Revenue</div>
                <div class="text-sm text-purple-700">All sources</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-purple-900">{{ formatCurrency(totalSalesRevenue) }}</div>
              </div>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div>
                <div class="font-medium text-orange-900">FB Attribution %</div>
                <div class="text-sm text-orange-700">Share of total revenue</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-orange-900">
                  {{ formatPercentage(totalSalesRevenue > 0 ? (attributionMetrics.fbAttributedRevenue / totalSalesRevenue) : 0) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attribution Insights -->
      <div class="bg-white mt-6 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Attribution Insights</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="ml-4">
                <h4 class="text-sm font-medium text-blue-900">Attribution Accuracy</h4>
                <p class="text-2xl font-bold text-blue-900">
                  {{ formatPercentage(attributionMetrics.conversionRate) }}
                </p>
                <p class="text-xs text-blue-700">of FB purchases tracked</p>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="ml-4">
                <h4 class="text-sm font-medium text-green-900">True ROAS</h4>
                <p class="text-2xl font-bold text-green-900">
                  {{ formatNumber(attributionMetrics.trueROAS) }}x
                </p>
                <p class="text-xs text-green-700">vs {{ formatNumber(fbMetrics.roas) }}x FB reported</p>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div class="ml-4">
                <h4 class="text-sm font-medium text-purple-900">Avg Order Value</h4>
                <p class="text-2xl font-bold text-purple-900">
                  {{ formatCurrency(attributionMetrics.avgOrderValue) }}
                </p>
                <p class="text-xs text-purple-700">from FB attributed orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Quality & Recommendations -->
      <div class="bg-white mt-6 p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Data Quality & Recommendations</h3>
        <div class="space-y-4">
          <div class="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-blue-900">Attribution Setup</h4>
              <p class="text-sm text-blue-700">
                {{ attributionMetrics.fbAttributedOrders }} of {{ formatNumber(fbMetrics.purchases) }} FB purchases 
                have been successfully attributed to sales orders.
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-green-900">Revenue Tracking</h4>
              <p class="text-sm text-green-700">
                Revenue attribution is working well. True ROAS provides more accurate business insights.
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-yellow-900">Improvement Opportunity</h4>
              <p class="text-sm text-yellow-700">
                Consider implementing UTM parameters or enhanced conversion tracking to improve attribution accuracy.
              </p>
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
import SalesAttributionCard from '../cards/SalesAttributionCard.vue'
import TrafficSourceBreakdown from '../cards/TrafficSourceBreakdown.vue'

const props = defineProps({
  attributionMetrics: {
    type: Object,
    required: true
  },
  fbMetrics: {
    type: Object,
    required: true
  },
  totalSalesRevenue: {
    type: Number,
    required: true
  },
  trafficSources: {
    type: Array,
    required: true
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore
</script>

<style scoped>
/* Add any specific styles here */
</style> 