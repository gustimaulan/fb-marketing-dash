<template>
  <div class="space-y-8">
    <!-- Product Performance Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Product & Service Performance</h2>
      <p class="mt-2 text-gray-600">
        Analyze your most popular services and products with Facebook attribution tracking.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading product performance data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading data</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="productPerformanceData.length > 0" class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Total Products -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h3 class="text-lg font-medium text-blue-800 mb-4">📦 Total Products</h3>
          <div class="text-3xl font-bold text-blue-900">{{ formatNumber(totalProducts) }}</div>
          <p class="text-sm text-blue-600 mt-2">Unique services/products</p>
        </div>

        <!-- Total Revenue -->
        <div class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 class="text-lg font-medium text-green-800 mb-4">💰 Total Revenue</h3>
          <div class="text-3xl font-bold text-green-900">{{ formatCurrency(totalRevenue) }}</div>
          <p class="text-sm text-green-600 mt-2">From all products</p>
        </div>

        <!-- FB Attributed Revenue -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <h3 class="text-lg font-medium text-purple-800 mb-4">📱 FB Revenue</h3>
          <div class="text-3xl font-bold text-purple-900">{{ formatCurrency(fbAttributedRevenue) }}</div>
          <p class="text-sm text-purple-600 mt-2">{{ formatPercentage(fbAttributionRate) }} of total</p>
        </div>

        <!-- Top Category -->
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <h3 class="text-lg font-medium text-orange-800 mb-4">🏆 Top Category</h3>
          <div class="text-lg font-bold text-orange-900">{{ topCategory }}</div>
          <p class="text-sm text-orange-600 mt-2">{{ formatCurrency(topCategoryRevenue) }}</p>
        </div>
      </div>

      <!-- Category Performance -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold text-gray-900 mb-6">📊 Performance by Category</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FB Orders</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FB Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribution Rate</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="category in categoryPerformance" :key="category.category" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ category.category }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(category.totalProducts) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(category.totalOrders) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatCurrency(category.totalRevenue) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(category.fbAttributedOrders) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{{ formatCurrency(category.fbAttributedRevenue) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                        :class="category.fbAttributionRate > 50 ? 'bg-green-100 text-green-800' : 
                               category.fbAttributionRate > 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'">
                    {{ formatPercentage(category.fbAttributionRate) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold text-gray-900 mb-6">🏆 Top Performing Products</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Service</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FB Orders</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FB Revenue</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in topProducts" :key="product.lineName" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ product.displayName }}</div>
                  <div class="text-xs text-gray-500">{{ product.lineName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ product.serviceCategory }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(product.totalOrders) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatCurrency(product.totalRevenue) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(product.avgOrderValue) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(product.fbAttributedOrders) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{{ formatCurrency(product.fbAttributedRevenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Details Modal -->
      <div v-if="selectedProduct" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ selectedProduct.displayName }}</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Category</label>
                  <p class="text-sm text-gray-900">{{ selectedProduct.serviceCategory }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Total Orders</label>
                  <p class="text-sm text-gray-900">{{ formatNumber(selectedProduct.totalOrders) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Total Revenue</label>
                  <p class="text-sm text-gray-900">{{ formatCurrency(selectedProduct.totalRevenue) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">FB Attributed Orders</label>
                  <p class="text-sm text-gray-900">{{ formatNumber(selectedProduct.fbAttributedOrders) }}</p>
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium text-gray-500">Recent Orders</label>
                <div class="mt-2 max-h-60 overflow-y-auto">
                  <div v-for="order in selectedProduct.orders.slice(0, 10)" :key="order.invoiceNumber" 
                       class="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ order.partnerName }}</p>
                      <p class="text-xs text-gray-500">{{ order.invoiceNumber }} - {{ order.branchName }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ formatCurrency(order.amount) }}</p>
                      <span class="text-xs px-2 py-1 rounded-full"
                            :class="order.isFromFbAds ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'">
                        {{ order.isFromFbAds ? 'FB Ads' : order.customerSource }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button @click="selectedProduct = null" 
                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No product data available</h3>
      <p class="mt-1 text-sm text-gray-500">No invoice lines data found for the selected date range.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import { useDashboardStore } from '../../stores/dashboard.js'
import { fetchInvoiceLines, processInvoiceLineData, getProductPerformanceData, getCategoryPerformance } from '../../api/invoiceLines.js'

const props = defineProps({
  salesOrderData: {
    type: Array,
    default: () => []
  }
})

const utilsStore = useUtilsStore()
const { formatCurrency, formatNumber, formatPercentage } = utilsStore

const dashboardStore = useDashboardStore()

// Reactive data
const loading = ref(false)
const error = ref(null)
const invoiceLinesData = ref([])
const selectedProduct = ref(null)

// Computed properties
const productPerformanceData = computed(() => {
  if (!props.salesOrderData.length || !invoiceLinesData.value.length) return []
  
  const processedInvoiceLines = processInvoiceLineData(invoiceLinesData.value)
  return getProductPerformanceData(props.salesOrderData, processedInvoiceLines)
})

const categoryPerformance = computed(() => {
  return getCategoryPerformance(productPerformanceData.value)
})

const topProducts = computed(() => {
  return productPerformanceData.value.slice(0, 10)
})

const totalProducts = computed(() => {
  return productPerformanceData.value.length
})

const totalRevenue = computed(() => {
  return productPerformanceData.value.reduce((sum, product) => sum + product.totalRevenue, 0)
})

const fbAttributedRevenue = computed(() => {
  return productPerformanceData.value.reduce((sum, product) => sum + product.fbAttributedRevenue, 0)
})

const fbAttributionRate = computed(() => {
  return totalRevenue.value > 0 ? (fbAttributedRevenue.value / totalRevenue.value) * 100 : 0
})

const topCategory = computed(() => {
  return categoryPerformance.value.length > 0 ? categoryPerformance.value[0].category : 'N/A'
})

const topCategoryRevenue = computed(() => {
  return categoryPerformance.value.length > 0 ? categoryPerformance.value[0].totalRevenue : 0
})

// Methods
const loadInvoiceLinesData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await fetchInvoiceLines()
    invoiceLinesData.value = data
  } catch (err) {
    console.error('Error loading invoice lines data:', err)
    error.value = err.message || 'Failed to load invoice lines data'
  } finally {
    loading.value = false
  }
}

// Watch for sales order data changes
watch(() => props.salesOrderData, (newData) => {
  if (newData.length > 0 && invoiceLinesData.value.length === 0) {
    loadInvoiceLinesData()
  }
}, { immediate: true })

// Load data on mount
onMounted(() => {
  if (props.salesOrderData.length > 0) {
    loadInvoiceLinesData()
  }
})
</script> 