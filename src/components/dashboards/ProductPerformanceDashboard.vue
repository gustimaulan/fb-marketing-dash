<template>
  <div class="space-y-8">
    <!-- Product Performance Header -->
    <DashboardHeader 
      title="Meta Ads Product & Service Performance"
      description="Analyze your most popular services and products attributed to Facebook & Instagram advertising."
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading Meta ads product performance data...</span>
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
      <!-- Summary Cards - Meta Attribution Only -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Total Products with Meta Attribution -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h3 class="text-lg font-medium text-blue-800 mb-4">📦 Meta Attributed Products</h3>
          <div class="text-3xl font-bold text-blue-900">{{ formatNumber(metaAttributedProducts) }}</div>
          <p class="text-sm text-blue-600 mt-2">Products with Meta attribution</p>
        </div>

        <!-- Meta Attributed Revenue -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <h3 class="text-lg font-medium text-purple-800 mb-4">📱 Meta Revenue (Net After Discount)</h3>
          <div class="text-3xl font-bold text-purple-900">{{ formatCurrency(fbAttributedRevenue) }}</div>
          <p class="text-sm text-purple-600 mt-2">From Meta attribution</p>
        </div>

        <!-- Top Meta Category -->
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <h3 class="text-lg font-medium text-orange-800 mb-4">🏆 Top Meta Category</h3>
          <div class="text-lg font-bold text-orange-900">{{ topMetaCategory }}</div>
          <p class="text-sm text-orange-600 mt-2">{{ formatCurrency(topMetaCategoryRevenue) }}</p>
        </div>
      </div>

      <!-- Category Performance - Meta Attribution Only -->
      <DataTable
        title="📊 Meta Ads Performance by Category"
        :data="metaCategoryPerformance"
        :columns="categoryColumns"
        :loading="loading"
        empty-title="No category data available"
        empty-message="No Meta ads category performance found for the selected date range."
      />

      <!-- Top Products - Meta Attribution Only -->
      <DataTable
        title="🏆 Top Meta Ads Products"
        :data="topMetaProducts"
        :columns="productColumns"
        :loading="loading"
        empty-title="No product data available"
        empty-message="No Meta ads products found for the selected date range."
        @row-click="selectedProduct = $event"
      />

      <!-- Product Details Modal - Meta Attribution Focus -->
      <div v-if="selectedProduct" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ selectedProduct.displayName }} - Meta Ads Performance</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Category</label>
                  <p class="text-sm text-gray-900">{{ selectedProduct.serviceCategory }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Meta Orders</label>
                  <p class="text-sm text-gray-900">{{ formatNumber(selectedProduct.fbAttributedOrders) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Meta Revenue</label>
                  <p class="text-sm text-gray-900">{{ formatCurrency(selectedProduct.fbAttributedRevenue) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Avg Meta Order Value</label>
                  <p class="text-sm text-gray-900">{{ formatCurrency(selectedProduct.metaAvgOrderValue) }}</p>
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium text-gray-500">Recent Meta Ads Orders</label>
                <div class="mt-2 max-h-60 overflow-y-auto">
                  <div v-for="order in selectedProduct.metaOrders.slice(0, 10)" :key="order.invoiceNumber" 
                       class="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ order.partnerName }}</p>
                      <p class="text-xs text-gray-500">{{ order.invoiceNumber }} - {{ order.branchName }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ formatCurrency(order.amount) }}</p>
                      <span class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {{ order.customerSource === 'fb_ads' ? 'Facebook' : 'Instagram' }}
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No Meta ads product data available</h3>
      <p class="mt-1 text-sm text-gray-500">No Facebook or Instagram attributed sales found for the selected date range.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUtilsStore } from '../../stores/utils.js'
import { useDashboardStore } from '../../stores/dashboard.js'
import { fetchInvoiceLines, processInvoiceLineData, getProductPerformanceData } from '../../api/invoiceLines.js'

// Import components
import DashboardHeader from '../shared/DashboardHeader.vue'
import DataTable from '../shared/DataTable.vue'  // Fixed import

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
const fbSalesOrders = computed(() =>
  props.salesOrderData.filter(order =>
    order.customer_sumber_info === 'fb_ads' || order.customer_sumber_info === 'ig_ads')
)

const productPerformanceData = computed(() => {
  if (!fbSalesOrders.value.length || !invoiceLinesData.value.length) return []
  const processedInvoiceLines = processInvoiceLineData(invoiceLinesData.value)
  return getProductPerformanceData(fbSalesOrders.value, processedInvoiceLines)
})

// Meta-only computed properties
const metaProductPerformanceData = computed(() => {
  return productPerformanceData.value.filter(product => product.fbAttributedOrders > 0)
})

const metaCategoryPerformance = computed(() => {
  const categoryMap = new Map()
  
  metaProductPerformanceData.value.forEach(product => {
    const category = product.serviceCategory
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        metaProducts: 0,
        fbAttributedOrders: 0,
        fbAttributedRevenue: 0
      })
    }
    
    const categoryData = categoryMap.get(category)
    categoryData.metaProducts += 1
    categoryData.fbAttributedOrders += product.fbAttributedOrders
    categoryData.fbAttributedRevenue += product.fbAttributedRevenue
  })
  
  return Array.from(categoryMap.values())
    .map(category => ({
      ...category,
      avgMetaOrderValue: category.fbAttributedOrders > 0 ? category.fbAttributedRevenue / category.fbAttributedOrders : 0
    }))
    .sort((a, b) => b.fbAttributedRevenue - a.fbAttributedRevenue)
})

const topMetaProducts = computed(() => {
  return metaProductPerformanceData.value
    .map(product => ({
      ...product,
      metaAvgOrderValue: product.fbAttributedOrders > 0 ? product.fbAttributedRevenue / product.fbAttributedOrders : 0,
      metaOrders: product.orders.filter(order => order.isFromFbAds)
    }))
    .sort((a, b) => b.fbAttributedRevenue - a.fbAttributedRevenue)
    .slice(0, 10)
})

const metaAttributedProducts = computed(() => {
  return metaProductPerformanceData.value.length
})

const fbAttributedRevenue = computed(() => {
  return metaProductPerformanceData.value.reduce((sum, product) => sum + product.fbAttributedRevenue, 0)
})

const topMetaCategory = computed(() => {
  return metaCategoryPerformance.value.length > 0 ? metaCategoryPerformance.value[0].category : 'N/A'
})

const topMetaCategoryRevenue = computed(() => {
  return metaCategoryPerformance.value.length > 0 ? metaCategoryPerformance.value[0].fbAttributedRevenue : 0
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


// Column definitions with proper formatting
const categoryColumns = [
  { key: 'category', label: 'Category', sortable: true },
  { 
    key: 'metaProducts', 
    label: 'Products', 
    align: 'right',
    formatter: (value) => formatNumber(value)
  },
  { 
    key: 'fbAttributedOrders', 
    label: 'Meta Orders', 
    align: 'right',
    formatter: (value) => formatNumber(value)
  },
  { 
    key: 'fbAttributedRevenue', 
    label: 'Meta Revenue', 
    align: 'right', 
    cellClass: 'font-medium text-purple-600',
    formatter: (value) => formatCurrency(value)
  },
  { 
    key: 'avgMetaOrderValue', 
    label: 'Avg Order Value', 
    align: 'right',
    formatter: (value) => formatCurrency(value)
  }
]

const productColumns = [
  { key: 'displayName', label: 'Product/Service', sortable: true },
  { key: 'serviceCategory', label: 'Category' },
  { 
    key: 'fbAttributedOrders', 
    label: 'Meta Orders', 
    align: 'right',
    formatter: (value) => formatNumber(value)
  },
  { 
    key: 'fbAttributedRevenue', 
    label: 'Meta Revenue', 
    align: 'right', 
    cellClass: 'font-medium text-purple-600',
    formatter: (value) => formatCurrency(value)
  },
  { 
    key: 'metaAvgOrderValue', 
    label: 'Avg Order Value', 
    align: 'right',
    formatter: (value) => formatCurrency(value)
  }
]
</script>