// API service for Odoo sales order data
const SALES_ORDER_API = import.meta.env.VITE_SALES_ORDER_API_URL || 'https://workflows.cekat.ai/webhook/sales-order'

// Caching configuration
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours - same as FB ads cache
const requestCache = new Map()

// Storage keys for sales order caching
const STORAGE_KEYS = {
  SALES_ORDER_DATA: 'sales_order_data',
  SALES_ORDER_CACHE_TIMESTAMP: 'sales_order_cache_timestamp'
}

// Cache utilities for sales orders
const cacheUtils = {
  setCache: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
      console.log(`Sales order data cached with key: ${key}`)
    } catch (error) {
      console.warn('Failed to cache sales order data:', error)
    }
  },

  getCache: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_DURATION) {
        console.log('Sales order cache expired, removing:', key)
        localStorage.removeItem(key)
        return null
      }

      console.log('Using cached sales order data:', key)
      return data
    } catch (error) {
      console.warn('Failed to read sales order cache:', error)
      return null
    }
  },

  clearCache: (key) => {
    try {
      localStorage.removeItem(key)
      console.log('Sales order cache cleared:', key)
    } catch (error) {
      console.warn('Failed to clear sales order cache:', error)
    }
  },

  getCacheInfo: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      const remaining = CACHE_DURATION - age

      return {
        exists: true,
        age,
        remaining: Math.max(0, remaining),
        expired: remaining <= 0
      }
    } catch (error) {
      return null
    }
  }
}

// Enhanced fetch with caching for sales orders
const fetchSalesOrdersWithCache = async (dateFrom, dateTo, options = {}) => {
  const cacheKey = `sales_orders_${dateFrom}_${dateTo}`
  const url = `${SALES_ORDER_API}?date-from=${dateFrom}&date-to=${dateTo}`
  
  // Check in-memory cache first (for request deduplication)
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 60000) { // 1 minute for request deduplication
      console.log('Using in-memory cache for sales orders:', cacheKey)
      return cached.data
    }
    requestCache.delete(cacheKey)
  }

  // Check localStorage cache
  const cachedData = cacheUtils.getCache(cacheKey)
  if (cachedData && !options.forceFresh) {
    console.log('Using localStorage cache for sales orders:', cacheKey)
    return cachedData
  }

  // Make fresh request
  console.log('Making fresh sales order API request:', url)
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Handle the API response format which returns an array with a data property
    let data = []
    if (Array.isArray(result) && result.length > 0 && result[0].data) {
      data = result[0].data
    } else if (Array.isArray(result)) {
      data = result
    } else if (result.data) {
      data = result.data
    }
    
    // Cache the successful response
    requestCache.set(cacheKey, { data, timestamp: Date.now() })
    cacheUtils.setCache(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    throw error
  }
}

export const fetchSalesOrders = fetchSalesOrdersWithCache

// Helper function to check if an order is from Facebook advertising (includes both fb_ads and ig_ads)
const isFromFacebookAds = (customerSource) => {
  return customerSource === 'fb_ads' || customerSource === 'ig_ads'
}

// Process and enrich sales order data
export const processSalesOrderData = (salesOrders) => {
  return salesOrders.map(order => ({
    ...order,
    // Add computed fields
    isFromFbAds: isFromFacebookAds(order.customer_sumber_info),
    orderValue: parseFloat(order.amount_total || 0),
    orderDate: new Date(order.date_completed).toISOString().split('T')[0],
    // Additional field for detailed source tracking
    normalizedSource: order.customer_sumber_info === 'ig_ads' ? 'Facebook (Instagram)' : 
                     order.customer_sumber_info === 'fb_ads' ? 'Facebook (Facebook)' : 
                     order.customer_sumber_info || 'unknown'
  }))
}

// Get FB-attributed orders only (includes both fb_ads and ig_ads)
export const getFbAttributedOrders = (salesOrders) => {
  return salesOrders.filter(order => isFromFacebookAds(order.customer_sumber_info))
}

// Get orders by traffic source
export const getOrdersBySource = (salesOrders) => {
  const sources = {}
  salesOrders.forEach(order => {
    const source = order.customer_sumber_info || 'unknown'
    if (!sources[source]) {
      sources[source] = {
        orders: [],
        totalRevenue: 0,
        count: 0
      }
    }
    sources[source].orders.push(order)
    sources[source].totalRevenue += order.orderValue
    sources[source].count++
  })
  return sources
}

// Get traffic source summary (combines fb_ads and ig_ads as Facebook Advertising)
export const getTrafficSourceSummary = (salesOrders) => {
  const sources = getOrdersBySource(salesOrders)
  const summary = []
  
  // Combine Facebook sources
  const fbAdsData = sources['fb_ads'] || { count: 0, totalRevenue: 0 }
  const igAdsData = sources['ig_ads'] || { count: 0, totalRevenue: 0 }
  
  if (fbAdsData.count > 0 || igAdsData.count > 0) {
    const totalFbOrders = fbAdsData.count + igAdsData.count
    const totalFbRevenue = fbAdsData.totalRevenue + igAdsData.totalRevenue
    
    summary.push({
      source: 'Facebook Advertising',
      orders: totalFbOrders,
      revenue: totalFbRevenue,
      avgOrderValue: totalFbRevenue / totalFbOrders,
      breakdown: {
        facebook: { orders: fbAdsData.count, revenue: fbAdsData.totalRevenue },
        instagram: { orders: igAdsData.count, revenue: igAdsData.totalRevenue }
      }
    })
  }
  
  // Add other sources (excluding fb_ads and ig_ads since they're combined)
  Object.entries(sources).forEach(([source, data]) => {
    if (source !== 'fb_ads' && source !== 'ig_ads') {
      summary.push({
        source: source === 'false' ? 'Unknown/Direct' : source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        orders: data.count,
        revenue: data.totalRevenue,
        avgOrderValue: data.totalRevenue / data.count
      })
    }
  })
  
  return summary.sort((a, b) => b.revenue - a.revenue)
}

// Cache management utilities
export const salesOrderCacheManager = {
  // Get cache information for all sales order caches
  getCacheInfo: () => {
    const cacheInfo = {}
    
    // Get all localStorage keys that start with 'sales_orders_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sales_orders_')) {
        const info = cacheUtils.getCacheInfo(key)
        if (info) {
          cacheInfo[key] = info
        }
      }
    }
    
    return cacheInfo
  },

  // Clear all sales order caches
  clearAll: () => {
    console.log('Clearing all sales order caches...')
    
    // Clear localStorage caches
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sales_orders_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear in-memory cache
    requestCache.clear()
    
    console.log(`Cleared ${keysToRemove.length} sales order caches`)
  },

  // Force refresh data for specific date range
  refresh: async (dateFrom, dateTo) => {
    console.log(`Refreshing sales order data for ${dateFrom} to ${dateTo}...`)
    
    // Clear specific cache
    const cacheKey = `sales_orders_${dateFrom}_${dateTo}`
    cacheUtils.clearCache(cacheKey)
    if (requestCache.has(cacheKey)) {
      requestCache.delete(cacheKey)
    }
    
    // Fetch fresh data
    return await fetchSalesOrdersWithCache(dateFrom, dateTo, { forceFresh: true })
  },

  // Preload data for common date ranges
  preload: async () => {
    console.log('Preloading sales order data for common date ranges...')
    
    const today = new Date()
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const dateRanges = [
      // Yesterday
      {
        from: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
        to: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000))
      },
      // Last 7 days
      {
        from: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
        to: formatDate(today)
      },
      // This month
      {
        from: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: formatDate(today)
      }
    ]
    
    // Preload in background without blocking
    dateRanges.forEach(async (range) => {
      try {
        await fetchSalesOrdersWithCache(range.from, range.to)
      } catch (error) {
        console.log(`Failed to preload sales orders for ${range.from} to ${range.to}:`, error)
      }
    })
  }
}

// Calculate attribution metrics
export const calculateAttributionMetrics = (salesOrders, fbMetrics) => {
  const fbOrders = getFbAttributedOrders(salesOrders)
  const totalRevenue = fbOrders.reduce((sum, order) => sum + order.orderValue, 0)
  const totalOrders = fbOrders.length
  
  return {
    fbAttributedRevenue: totalRevenue,
    fbAttributedOrders: totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    trueROAS: fbMetrics.spend > 0 ? totalRevenue / fbMetrics.spend : 0,
    conversionRate: fbMetrics.purchases > 0 ? totalOrders / fbMetrics.purchases : 0
  }
}

// Calculate real branch performance using actual sales order data
export const calculateBranchMetrics = (salesOrders, fbMetrics, branchRatios) => {
  // Group sales orders by branch
  const branchSalesData = {}
  const fbOrders = getFbAttributedOrders(salesOrders)
  
  fbOrders.forEach(order => {
    const branchName = order.branch_name
    if (!branchSalesData[branchName]) {
      branchSalesData[branchName] = {
        orders: [],
        totalRevenue: 0,
        totalOrders: 0
      }
    }
    branchSalesData[branchName].orders.push(order)
    branchSalesData[branchName].totalRevenue += order.orderValue
    branchSalesData[branchName].totalOrders++
  })

  // Calculate metrics for each branch
  const branchMetrics = []
  
  Object.entries(branchSalesData).forEach(([branchName, salesData]) => {
    // Get branch ratio for cost allocation (fallback to equal split if not found)
    const branchRatio = branchRatios?.branches?.find(b => b.name === branchName)?.ratio || 
                       (1 / Object.keys(branchSalesData).length)
    
    const spendForBranch = fbMetrics.spend * branchRatio
    
    // FB REPORTED DATA (allocated by ratio)
    const fbReportedRevenue = (fbMetrics.purchase_value || 0) * branchRatio
    const fbReportedOrders = Math.round((fbMetrics.purchases || 0) * branchRatio)
    const fbReportedConversations = Math.round((fbMetrics.conversations || 0) * branchRatio)
    
    // SALES ORDER DATA (actual)
    const salesOrderRevenue = salesData.totalRevenue
    const salesOrderOrders = salesData.totalOrders

    branchMetrics.push({
      branchName: branchName,
      ratio: branchRatio,
      percentage: (branchRatio * 100).toFixed(1),
      
      // COMBINED METRICS
      metrics: {
        // Cost data
        spend: spendForBranch,
        cost_per_order: salesOrderOrders > 0 ? spendForBranch / salesOrderOrders : 0,
        
        // FB REPORTED METRICS
        fb_reported: {
          revenue: fbReportedRevenue,
          orders: fbReportedOrders,
          conversations: fbReportedConversations,
          roas: spendForBranch > 0 ? fbReportedRevenue / spendForBranch : 0,
          avgOrderValue: fbReportedOrders > 0 ? fbReportedRevenue / fbReportedOrders : 0,
          cost_per_order: fbReportedOrders > 0 ? spendForBranch / fbReportedOrders : 0
        },
        
        // SALES ORDER METRICS (ACTUAL)
        sales_order: {
          revenue: salesOrderRevenue,
          orders: salesOrderOrders,
          roas: spendForBranch > 0 ? salesOrderRevenue / spendForBranch : 0,
          avgOrderValue: salesOrderOrders > 0 ? salesOrderRevenue / salesOrderOrders : 0,
          cost_per_order: salesOrderOrders > 0 ? spendForBranch / salesOrderOrders : 0
        },
        
        // LEGACY FIELDS (for backward compatibility) - use Sales Order as primary
        revenue: salesOrderRevenue,
        orders: salesOrderOrders,
        roas: spendForBranch > 0 ? salesOrderRevenue / spendForBranch : 0,
        avgOrderValue: salesOrderOrders > 0 ? salesOrderRevenue / salesOrderOrders : 0
      },
      
      // Raw data for reference
      salesData: salesData
    })
  })

  return branchMetrics.sort((a, b) => b.metrics.revenue - a.metrics.revenue)
} 