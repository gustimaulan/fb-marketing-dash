import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { 
  fetchDashboardData, 
  generateSampleData, 
  filterDataByDateRange, 
  getProductOptions,
  userPreferences,
  cacheManager
} from '../api/dashboard.js'
import { 
  fetchSalesOrders, 
  processSalesOrderData, 
  calculateAttributionMetrics,
  getTrafficSourceSummary,
  salesOrderCacheManager,
  calculateBranchMetrics
} from '../api/salesOrders.js'
import { 
  fetchLeadsRatio, 
  applySplitByBranch,
  leadsRatioCacheManager
  } from '../api/leadsRatio.js'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const groupByMode = ref('product')
  const selectedProducts = ref([]) // For multi-select product filter
  const currentSort = ref({ column: null, direction: 'asc' })
  const searchQuery = ref('')
  
  // Date range state - initialize with last7days for better demo data
  const dateRange = ref('last7days')
  const startDate = ref('')
  const endDate = ref('')
  
  // UI state
  const showColumnMenu = ref(false)
  const showProductMenu = ref(false)
  
  // Fallback data for when API fails
  const useSampleDataFallback = ref(false)
  
  // Column configuration with user preferences support
  const defaultColumnConfig = {
    label: { name: 'Group Name', visible: true, fixed: true, order: 0 },
    spend: { name: 'Spend', visible: true, fixed: false, order: 1 },
    reach: { name: 'Reach', visible: true, fixed: false, order: 2 },
    impressions: { name: 'Impressions', visible: true, fixed: false, order: 3 },
    frequency: { name: 'Frequency', visible: true, fixed: false, order: 4 },
    cpm: { name: 'CPM', visible: true, fixed: false, order: 5 },
    ctr: { name: 'CTR', visible: false, fixed: false, order: 6 },
    conversations: { name: 'Conversations', visible: true, fixed: false, order: 7 },
    cost_per_conversation: { name: 'Cost / Conversation', visible: true, fixed: false, order: 8 },
    add_to_cart: { name: 'Add to Cart', visible: true, fixed: false, order: 9 },
    cost_per_add_to_cart: { name: 'Cost / Add to Cart', visible: true, fixed: false, order: 10 },
    purchases: { name: 'Purchases', visible: true, fixed: false, order: 11 },
    cost_per_purchase: { name: 'Cost / Purchase', visible: true, fixed: false, order: 12 },
    purchase_value: { name: 'Purchase Value', visible: true, fixed: false, order: 13 },
    roas: { name: 'ROAS', visible: true, fixed: false, order: 14 },
  }
  
  const columnConfig = ref({ ...defaultColumnConfig })

  // Enhanced TanStack Query with daily data update schedule
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data', startDate, endDate],
    queryFn: async () => {
      console.log('Dashboard query function called with dates:', { 
        startDate: startDate.value, 
        endDate: endDate.value 
      })
      try {
        const data = await fetchDashboardData({
          startDate: startDate.value,
          endDate: endDate.value
        })
        console.log('Dashboard data fetched successfully:', data.length, 'records')
        return data
      } catch (error) {
        console.log('Dashboard query error:', error)
        if (error.useSampleData) {
          console.log('Using sample data as fallback')
          useSampleDataFallback.value = true
          const sampleData = generateSampleData()
          console.log('Generated sample data:', sampleData.length, 'records')
          return sampleData
        }
        throw error
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - data updates daily at 4 AM
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours - keep cache for full day
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: computed(() => !!startDate.value && !!endDate.value)
  })

  // Sales Order Query
  const salesOrderQuery = useQuery({
    queryKey: ['sales-orders', startDate, endDate],
    queryFn: async () => {
      try {
        const rawData = await fetchSalesOrders(startDate.value, endDate.value)
        return processSalesOrderData(rawData)
      } catch (error) {
        console.error('Error fetching sales orders:', error)
        return [] // Return empty array on error
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: computed(() => !!startDate.value && !!endDate.value)
  })

  // Leads Ratio Query - ONLY use real API data, no fallbacks
  const leadsRatioQuery = useQuery({
    queryKey: ['leads-ratio', startDate, endDate],
    queryFn: async () => {
      console.log(`📅 LEADS DEBUG: Fetching REAL leads data for ${startDate.value} to ${endDate.value}`)
      console.log(`📅 LEADS DEBUG: Date range details:`, {
        startDate: startDate.value,
        endDate: endDate.value,
        dateRange: dateRange.value,
        expectedDate: '2025-07-18',
        isExpectedDate: startDate.value === '2025-07-18' && endDate.value === '2025-07-18'
      })
      const data = await fetchLeadsRatio(startDate.value, endDate.value)
      console.log('✅ LEADS DEBUG: Real leads data received:', data)
      return data
    },
    retry: 3, // Increased retries for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: computed(() => !!startDate.value && !!endDate.value)
  })

  // Computed properties with optimized memoization
  // Helper function to extract product name from ad_name
  const extractProductName = (adName) => {
    if (!adName) return 'Unknown'
    const parts = adName.split('_')
    if (parts.length >= 3) {
      return parts[1].trim() // Get text between first and second underscore
    }
    return adName // Fallback to full ad name if pattern doesn't match
  }

  // Raw data from query
  const allData = computed(() => {
    const data = dashboardQuery.data.value || []
    console.log('allData computed:', { 
      length: data.length, 
      loading: dashboardQuery.isLoading.value,
      error: dashboardQuery.error.value,
      usingSampleData: useSampleDataFallback.value,
      firstRecord: data[0] ? {
        campaign: data[0].campaign_name,
        ad: data[0].ad_name,
        spend: data[0].spend,
        date: data[0].date_start
      } : 'no records'
    })
    return data
  })
  
  // Sales order data
  const salesOrderData = computed(() => salesOrderQuery.data.value || [])
  
  // Leads ratio data - ONLY real API data
  const leadsRatioData = computed(() => {
    const data = leadsRatioQuery.data.value
    if (data && !data.error && data.totalLeads !== undefined) {
      console.log('Using REAL leads ratio data:', data.totalLeads, 'leads')
      return data
    }
    return null // Return null if no valid data
  })

  // Leads ratio loading and error states
  const leadsRatioLoading = computed(() => leadsRatioQuery.isLoading.value)
  const leadsRatioError = computed(() => {
    if (leadsRatioQuery.error.value) {
      return `Failed to load leads data: ${leadsRatioQuery.error.value.message}`
    }
    return null
  })
  
  // Branch performance metrics computed from real sales order data
  const branchPerformanceData = computed(() => {
    if (!salesOrderData.value.length || !metrics.value) return null
    
    return calculateBranchMetrics(salesOrderData.value, metrics.value, leadsRatioData.value)
  })
  
  // Date filtered data with memoization
  const data = computed(() => {
    const filtered = filterDataByDateRange(allData.value, startDate.value, endDate.value)
    console.log('data computed (after date filtering):', { 
      originalLength: allData.value.length, 
      filteredLength: filtered.length,
      startDate: startDate.value,
      endDate: endDate.value,
      firstRecordDate: allData.value[0]?.date_start || 'no records',
      dateFilterWorking: allData.value.length > 0 && filtered.length > 0
    })
    return filtered
  })

  // Loading and error states from query
  const loading = computed(() => dashboardQuery.isLoading.value)
  const error = computed(() => {
    if (dashboardQuery.error.value) {
      return useSampleDataFallback.value 
        ? 'Using sample data for demonstration purposes.'
        : dashboardQuery.error.value.message
    }
    
    // Check if we have data for the current date range
    if (!dashboardQuery.isLoading.value && allData.value.length === 0 && startDate.value && endDate.value) {
      return `No data available for the selected date range (${startDate.value} to ${endDate.value}). Try selecting a different date range or use custom dates.`
    }
    
    return useSampleDataFallback.value ? 'Using sample data for demonstration purposes.' : ''
  })

  // Cached product options
  const productOptions = computed(() => {
    return getProductOptions(data.value)
  })

  const filteredData = computed(() => {
    console.log('filteredData computed - data length:', data.value.length)
    console.log('filteredData computed - selectedProducts:', selectedProducts.value)
    
    if (!data.value.length) {
      console.log('No data available')
      return []
    }
    
    // Extract all available products for debugging
    const availableProducts = data.value.map(row => extractProductName(row.ad_name))
    const uniqueProducts = [...new Set(availableProducts)]
    console.log('Available products:', uniqueProducts)
    
    // If no products are selected, show all data instead of empty array
    if (selectedProducts.value.length === 0) {
      console.log('No products selected, showing all data')
      return data.value
    }
    
    // Filter data based on selected products
    console.log('Filtering data by selected products')
    let filtered = data.value.filter(row => {
      const productName = extractProductName(row.ad_name)
      const isIncluded = selectedProducts.value.includes(productName)
      return isIncluded
    })
    
    console.log('Product filtering result:', { 
      originalCount: data.value.length,
      filteredCount: filtered.length,
      selectedProducts: selectedProducts.value,
      availableProducts: uniqueProducts.slice(0, 5) // Show first 5
    })
    
    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(row => {
        return (
          (row.campaign_name && row.campaign_name.toLowerCase().includes(query)) ||
          (row.adset_name && row.adset_name.toLowerCase().includes(query)) ||
          (row.ad_name && row.ad_name.toLowerCase().includes(query))
        )
      })
    }
    
    return filtered
  })

  // Optimized grouping with better performance
  const groupedData = computed(() => {
    console.log('groupedData computed - filteredData length:', filteredData.value.length)
    console.log('groupedData computed - groupByMode:', groupByMode.value)
    
    if (!filteredData.value.length) {
      console.log('No filtered data, returning empty array')
      return []
    }
    
    const grouped = new Map() // Use Map for better performance
    
    filteredData.value.forEach(row => {
      let key
      switch (groupByMode.value) {
        case 'product':
          key = extractProductName(row.ad_name)
          break
        case 'ad_name':
          key = row.ad_name || 'Unknown'
          break
        case 'campaign':
          key = row.campaign_name || 'Unknown'
          break
        case 'adset':
          key = row.adset_name || 'Unknown'
          break
        case 'date':
          key = row.date_start || 'Unknown'
          break
        default:
          key = extractProductName(row.ad_name)
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          label: key,
          spend: 0,
          reach: 0,
          impressions: 0,
          frequency: 0,
          cpm: 0,
          ctr: 0,
          conversations: 0,
          cost_per_conversation: 0,
          purchases: 0,
          cost_per_purchase: 0,
          purchase_value: 0,
          roas: 0,
          add_to_cart: 0,
          cost_per_add_to_cart: 0,
          count: 0
        })
      }
      
      const group = grouped.get(key)
      group.spend += parseFloat(row.spend) || 0
      group.reach += parseFloat(row.reach) || 0
      group.impressions += parseFloat(row.impressions) || 0
      group.conversations += parseFloat(row['onsite_conversion.messaging_conversation_started_7d']) || 0
      group.purchases += parseFloat(row.purchase) || 0
      group.purchase_value += parseFloat(row.purchase_value) || 0
      group.add_to_cart += parseFloat(row.add_to_cart) || 0
      group.count++
    })
    
    // Calculate derived metrics efficiently
    const result = Array.from(grouped.values())
    result.forEach(group => {
      group.frequency = group.reach > 0 ? group.impressions / group.reach : 0
      group.cpm = group.impressions > 0 ? (group.spend / group.impressions) * 1000 : 0
      group.ctr = group.impressions > 0 ? (group.conversations / group.impressions) * 100 : 0
      group.cost_per_conversation = group.conversations > 0 ? group.spend / group.conversations : 0
      group.cost_per_purchase = group.purchases > 0 ? group.spend / group.purchases : 0
      group.roas = group.spend > 0 ? group.purchase_value / group.spend : 0
      group.cost_per_add_to_cart = group.add_to_cart > 0 ? group.spend / group.add_to_cart : 0
    })
    
    console.log('groupedData result:', { 
      groups: result.length,
      firstGroup: result[0]?.label,
      totalSpend: result.reduce((sum, g) => sum + g.spend, 0)
    })
    
    return result
  })

  const sortedData = computed(() => {
    if (!currentSort.value.column) return groupedData.value
    
    return [...groupedData.value].sort((a, b) => {
      let aVal = a[currentSort.value.column]
      let bVal = b[currentSort.value.column]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (currentSort.value.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
  })

  const visibleColumns = computed(() => {
    return Object.entries(columnConfig.value)
      .filter(([, config]) => config.visible)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, config]) => ({ key, name: config.name }))
  })

  // Optimized metrics calculation
  const metrics = computed(() => {
    console.log('metrics computed - groupedData length:', groupedData.value.length)
    console.log('metrics computed - filteredData length:', filteredData.value.length)
    
    if (!groupedData.value.length) {
      console.log('No grouped data, returning zero metrics')
      return {
        spend: 0,
        reach: 0,
        impressions: 0,
        frequency: 0,
        cpm: 0,
        ctr: 0,
        conversations: 0,
        add_to_cart: 0,
        purchases: 0,
        cost_per_conversation: 0,
        cost_per_add_to_cart: 0,
        cost_per_purchase: 0,
        purchase_value: 0,
        roas: 0
      }
    }

    const totals = groupedData.value.reduce((acc, item) => ({
      spend: acc.spend + item.spend,
      reach: acc.reach + item.reach,
      impressions: acc.impressions + item.impressions,
      conversations: acc.conversations + item.conversations,
      add_to_cart: acc.add_to_cart + item.add_to_cart,
      purchases: acc.purchases + item.purchases,
      purchase_value: acc.purchase_value + item.purchase_value
    }), {
      spend: 0,
      reach: 0,
      impressions: 0,
      conversations: 0,
      add_to_cart: 0,
      purchases: 0,
      purchase_value: 0
    })

    const calculatedMetrics = {
      spend: totals.spend,
      reach: totals.reach,
      impressions: totals.impressions,
      frequency: totals.reach > 0 ? totals.impressions / totals.reach : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      ctr: totals.impressions > 0 ? (totals.conversations / totals.impressions) * 100 : 0,
      conversations: totals.conversations,
      add_to_cart: totals.add_to_cart,
      purchases: totals.purchases,
      cost_per_conversation: totals.conversations > 0 ? totals.spend / totals.conversations : 0,
      cost_per_add_to_cart: totals.add_to_cart > 0 ? totals.spend / totals.add_to_cart : 0,
      cost_per_purchase: totals.purchases > 0 ? totals.spend / totals.purchases : 0,
      purchase_value: totals.purchase_value,
      roas: totals.spend > 0 ? totals.purchase_value / totals.spend : 0
    }
    
    console.log('metrics computed result:', calculatedMetrics)
    return calculatedMetrics
  })

  // Enhanced chart data with better performance
  const chartData = computed(() => {
    if (!filteredData.value.length) return {}

    // Group by date for chart (aggregate all products per date)
    const grouped = new Map()
    
    filteredData.value.forEach(row => {
      const date = row.date_start || 'Unknown'
      
      if (!grouped.has(date)) {
        grouped.set(date, {
          spend: 0,
          conversations: 0,
          purchases: 0,
          purchase_value: 0
        })
      }
      
      const item = grouped.get(date)
      item.spend += parseFloat(row.spend) || 0
      item.conversations += parseFloat(row['onsite_conversion.messaging_conversation_started_7d']) || 0
      item.purchases += parseFloat(row.purchase) || 0
      item.purchase_value += parseFloat(row.purchase_value) || 0
    })

    // Convert Map to object with date keys
    return Object.fromEntries(grouped)
  })

  // Attribution metrics combining FB ads and sales order data
  const attributionMetrics = computed(() => {
    console.log('attributionMetrics computed:', { 
      salesOrdersLength: salesOrderData.value.length,
      hasMetrics: !!metrics.value,
      metricsSpend: metrics.value?.spend 
    })
    
    if (!salesOrderData.value.length || !metrics.value) {
      console.log('No sales data or metrics, returning zero attribution metrics')
      return {
        fbAttributedRevenue: 0,
        fbAttributedOrders: 0,
        avgOrderValue: 0,
        trueROAS: 0,
        conversionRate: 0
      }
    }

    const result = calculateAttributionMetrics(salesOrderData.value, metrics.value)
    console.log('attributionMetrics result:', result)
    return result
  })

  // Total sales revenue from Facebook/Instagram ads only
  const totalSalesRevenue = computed(() => {
    const fbOrders = salesOrderData.value.filter(order => 
      order.customer_sumber_info === 'fb_ads' || order.customer_sumber_info === 'ig_ads'
    )
    const revenue = fbOrders.reduce((sum, order) => sum + order.orderValue, 0)
    console.log('totalSalesRevenue computed:', { 
      totalOrders: salesOrderData.value.length,
      fbOrders: fbOrders.length,
      fbRevenue: revenue
    })
    return revenue
  })

  // Traffic source breakdown
  const trafficSourceSummary = computed(() => {
    if (!salesOrderData.value.length) return []
    return getTrafficSourceSummary(salesOrderData.value)
  })

  // User preferences management
  const savePreferences = () => {
    const preferences = {
      groupByMode: groupByMode.value,
      selectedProducts: selectedProducts.value,
      dateRange: dateRange.value,
      columnConfig: columnConfig.value,
      currentSort: currentSort.value
    }
    userPreferences.save(preferences)
  }

  const loadPreferences = () => {
    const preferences = userPreferences.load()
    if (preferences) {
      groupByMode.value = preferences.groupByMode || 'product'
      selectedProducts.value = preferences.selectedProducts || []
      dateRange.value = preferences.dateRange || 'yesterday'
      columnConfig.value = { ...defaultColumnConfig, ...preferences.columnConfig }
      currentSort.value = preferences.currentSort || { column: null, direction: 'asc' }
    }
  }

  // Watch for changes to auto-save preferences
  watch([groupByMode, selectedProducts, dateRange, columnConfig, currentSort], 
    () => savePreferences(), 
    { deep: true, debounce: 1000 }
  )

  // Actions - Enhanced with caching optimizations
  const generateSampleDataAction = () => {
    // Sample data generation is now memoized in the API layer
    return generateSampleData()
  }

  const refetchData = async () => {
    // Force fresh data and clear caches
    cacheManager.clearAll()
    useSampleDataFallback.value = false
    await dashboardQuery.refetch()
  }

  const getJakartaTimeString = (date = new Date()) => {
    return date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  }

  const formatDateString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const setDateRange = (range) => {
    dateRange.value = range
    const today = new Date()
    const jakartaToday = new Date(getJakartaTimeString(today))
    
    console.log('setDateRange called with:', range)
    console.log('Today:', today)
    console.log('Jakarta today:', jakartaToday)
    
    switch (range) {
      case 'today':
        startDate.value = formatDateString(jakartaToday)
        endDate.value = formatDateString(jakartaToday)
        console.log('Today range set:', startDate.value, 'to', endDate.value)
        break
      case 'yesterday':
        const yesterday = new Date(jakartaToday)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate.value = formatDateString(yesterday)
        endDate.value = formatDateString(yesterday)
        console.log('Yesterday range set:', startDate.value, 'to', endDate.value)
        break
      case 'last7days':
        const sevenDaysAgo = new Date(jakartaToday)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const last7EndDate = new Date(jakartaToday)
        last7EndDate.setDate(last7EndDate.getDate() - 1)
        startDate.value = formatDateString(sevenDaysAgo)
        endDate.value = formatDateString(last7EndDate)
        console.log('Last 7 days range set:', startDate.value, 'to', endDate.value)
        break
      case 'last30days':
        const thirtyDaysAgo = new Date(jakartaToday)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
        startDate.value = formatDateString(thirtyDaysAgo)
        endDate.value = formatDateString(jakartaToday)
        console.log('Last 30 days range set:', startDate.value, 'to', endDate.value)
        break
      case 'thisMonth':
      case 'thismonth':
        const firstDayOfMonth = new Date(jakartaToday.getFullYear(), jakartaToday.getMonth(), 1)
        startDate.value = formatDateString(firstDayOfMonth)
        endDate.value = formatDateString(jakartaToday)
        console.log('This month range set:', startDate.value, 'to', endDate.value)
        break
      case 'lastMonth':
      case 'lastmonth':
        const firstDayOfLastMonth = new Date(jakartaToday.getFullYear(), jakartaToday.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(jakartaToday.getFullYear(), jakartaToday.getMonth(), 0)
        startDate.value = formatDateString(firstDayOfLastMonth)
        endDate.value = formatDateString(lastDayOfLastMonth)
        console.log('Last month range set:', startDate.value, 'to', endDate.value)
        break
      case 'thisweek':
        const startOfWeek = new Date(jakartaToday)
        startOfWeek.setDate(jakartaToday.getDate() - jakartaToday.getDay())
        startDate.value = formatDateString(startOfWeek)
        endDate.value = formatDateString(jakartaToday)
        console.log('This week range set:', startDate.value, 'to', endDate.value)
        break
      case 'lastweek':
        const startOfLastWeek = new Date(jakartaToday)
        startOfLastWeek.setDate(jakartaToday.getDate() - jakartaToday.getDay() - 7)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
        startDate.value = formatDateString(startOfLastWeek)
        endDate.value = formatDateString(endOfLastWeek)
        console.log('Last week range set:', startDate.value, 'to', endDate.value)
        break
    }
  }

  const handleSort = (column) => {
    if (currentSort.value.column === column) {
      currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value = { column, direction: 'asc' }
    }
  }

  const moveColumn = (columnKey, direction) => {
    console.log('moveColumn called:', { columnKey, direction })
    
    // Get all non-fixed columns sorted by order
    const moveableColumns = Object.entries(columnConfig.value)
      .filter(([, config]) => !config.fixed)
      .sort(([, a], [, b]) => a.order - b.order)
    
    console.log('Moveable columns:', moveableColumns.map(([key, config]) => ({ key, order: config.order })))
    
    const currentIndex = moveableColumns.findIndex(([key]) => key === columnKey)
    console.log('Current index in moveable columns:', currentIndex)
    
    if (currentIndex === -1) {
      console.log('Column not found or is fixed')
      return
    }
    
    // Determine target index based on direction
    let targetIndex
    if (direction === 'up') {
      targetIndex = currentIndex - 1
    } else if (direction === 'down') {
      targetIndex = currentIndex + 1
    } else {
      console.log('Invalid direction:', direction)
      return
    }
    
    console.log('Target index:', targetIndex)
    
    // Check bounds
    if (targetIndex < 0 || targetIndex >= moveableColumns.length) {
      console.log('Cannot move column - target index out of bounds')
      return
    }
    
    // Get the columns to swap
    const [currentKey, currentConfig] = moveableColumns[currentIndex]
    const [targetKey, targetConfig] = moveableColumns[targetIndex]
    
    console.log('Swapping orders:', { 
      [currentKey]: `${currentConfig.order} -> ${targetConfig.order}`,
      [targetKey]: `${targetConfig.order} -> ${currentConfig.order}`
    })
    
    // Swap the orders
    const tempOrder = currentConfig.order
    columnConfig.value[currentKey].order = targetConfig.order
    columnConfig.value[targetKey].order = tempOrder
    
    // Save preferences after column reordering
    savePreferences()
    
    console.log('Column move completed successfully')
  }

  const toggleColumnMenu = () => {
    showColumnMenu.value = !showColumnMenu.value
  }

  const toggleProductMenu = () => {
    showProductMenu.value = !showProductMenu.value
  }

  const applyProductFilter = (products) => {
    console.log('Applying product filter:', products)
    selectedProducts.value = [...products]
    // Save preferences after applying filter
    savePreferences()
  }

  const initializeDashboard = () => {
    // Load user preferences first
    loadPreferences()
    
    // Always sync dates with the current dateRange (whether from preferences or default)
    const currentRange = dateRange.value || 'last7days'
    setDateRange(currentRange)
    
    // Update selected products when data changes
    updateSelectedProducts()
    
    // Preload data in background
    cacheManager.preload()
    salesOrderCacheManager.preload()
  }

  const updateSelectedProducts = () => {
    console.log('updateSelectedProducts called:', {
      productOptionsLength: productOptions.value.length,
      selectedProductsLength: selectedProducts.value.length,
      productOptions: productOptions.value,
      selectedProducts: selectedProducts.value
    })
    
    // Initialize selected products to all products when data is available and none are selected
    if (productOptions.value.length > 0 && selectedProducts.value.length === 0) {
      selectedProducts.value = [...productOptions.value]
      console.log('Auto-selected all products on initialization:', selectedProducts.value)
    }
  }

  const handleCustomDateChange = () => {
    dateRange.value = 'custom'
  }

  const setCustomDateRange = (start, end) => {
    startDate.value = start
    endDate.value = end
    dateRange.value = 'custom'
    console.log('Custom date range set:', { startDate: start, endDate: end })
  }

  const useSampleData = () => {
    useSampleDataFallback.value = true
    dashboardQuery.refetch()
  }

  // Cache management utilities
  const getCacheInfo = () => {
    return {
      fbAds: cacheManager.getInfo(),
      salesOrders: salesOrderCacheManager.getCacheInfo()
    }
  }
  
  const clearAllCaches = () => {
    console.log('Clearing all caches (FB ads + sales orders)...')
    cacheManager.clearAll()
    salesOrderCacheManager.clearAll()
  }
  
  const refreshData = () => {
    console.log('Refreshing all data...')
    cacheManager.refresh()
    
    // Refresh sales orders if date range is available
    if (startDate.value && endDate.value) {
      salesOrderCacheManager.refresh(startDate.value, endDate.value)
    }
  }
  
  const refreshSalesOrders = () => {
    if (startDate.value && endDate.value) {
      console.log('Refreshing sales orders only...')
      return salesOrderCacheManager.refresh(startDate.value, endDate.value)
    }
  }

  // Watch for data changes to update products
  watch([allData, productOptions], updateSelectedProducts, { immediate: true })
  
  // Also watch for data loading completion
  watch(() => dashboardQuery.isLoading.value, (isLoading) => {
    if (!isLoading && allData.value.length > 0) {
      console.log('Data loading completed, updating selected products')
      updateSelectedProducts()
    }
  })

  return {
    // State
    groupByMode,
    selectedProducts,
    currentSort,
    dateRange,
    startDate,
    endDate,
    searchQuery,
    showColumnMenu,
    showProductMenu,
    useSampleDataFallback,
    columnConfig,
    
    // Computed
    allData,
    data,
    loading,
    error,
    filteredData,
    groupedData,
    sortedData,
    visibleColumns,
    productOptions,
    metrics,
    chartData,
    salesOrderData,
    attributionMetrics,
    totalSalesRevenue,
    trafficSourceSummary,
    leadsRatioData,
    leadsRatioLoading,
    leadsRatioError,
    branchPerformanceData,
    
    // Actions
    generateSampleData: generateSampleDataAction,
    refetchData,
    setDateRange,
    setCustomDateRange,
    handleSort,
    moveColumn,
    toggleColumnMenu,
    toggleProductMenu,
    applyProductFilter,
    initializeDashboard,
    updateSelectedProducts,
    handleCustomDateChange,
    useSampleData,
    
    // Preferences
    savePreferences,
    loadPreferences,
    
    // Cache management
    getCacheInfo,
    clearAllCaches,
    refreshData,
    refreshSalesOrders
  }
}) 