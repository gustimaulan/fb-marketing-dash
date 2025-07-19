// API functions for meta-ads-data fetching with enhanced caching
const META_ADS_API = import.meta.env.VITE_DASHBOARD_API_URL || 'https://workflows.cekat.ai/webhook/meta-ads-data'

// Caching configuration
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours - same as other APIs
const requestCache = new Map()

// Storage keys for meta ads caching
const STORAGE_KEYS = {
  META_ADS_DATA: 'meta_ads_data',
  META_ADS_CACHE_TIMESTAMP: 'meta_ads_cache_timestamp',
  USER_PREFERENCES: 'user_preferences'
}

// Helper function to format date as YYYY-MM-DD
const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to extract product name from ad_name
const extractProductName = (adName) => {
  if (!adName) return 'Unknown'
  const parts = adName.split('_')
  if (parts.length >= 3) {
    return parts[1].trim() // Get text between first and second underscore
  }
  return adName // Fallback to full ad name if pattern doesn't match
}

// Transform API data to match expected field structure
const transformApiData = (data) => {
  if (!Array.isArray(data)) return data
  
  return data.map(row => {
    // Create transformed row with field mapping
    const transformed = { ...row }
    
    // Map new API field names to expected field names
    if (row.messaging_conversation_started_7d !== undefined) {
      transformed['onsite_conversion.messaging_conversation_started_7d'] = row.messaging_conversation_started_7d
    }
    
    // Ensure numeric fields are properly converted
    const numericFields = [
      'spend', 'reach', 'impressions', 'frequency', 'cpm',
      'messaging_conversation_started_7d', 'cost_per_messaging_conversation_started_7d',
      'purchase', 'add_to_cart', 'cost_per_purchase', 'cost_per_add_to_cart', 'purchase_value'
    ]
    
    numericFields.forEach(field => {
      if (transformed[field] !== undefined) {
        const value = parseFloat(transformed[field])
        transformed[field] = isNaN(value) ? 0 : value
      }
    })
    
    // Handle date fields - ensure consistent format
    if (transformed.date_start) {
      // Keep ISO format as-is for compatibility
      // transformed.date_start = transformed.date_start.split('T')[0]
    }
    
    if (transformed.date_stop) {
      // Keep ISO format as-is for compatibility  
      // transformed.date_stop = transformed.date_stop.split('T')[0]
    }
    
    return transformed
  })
}

// Cache manager for meta ads data (following salesOrders.js pattern)
export const metaAdsCacheManager = {
  // Get cache information for all meta ads caches
  getCacheInfo: () => {
    const cacheInfo = {}
    
    // Get all localStorage keys that start with 'meta_ads_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('meta_ads_')) {
        const info = cacheUtils.getCacheInfo(key)
        if (info) {
          cacheInfo[key] = info
        }
      }
    }
    return cacheInfo
  },

  // Clear all meta ads caches
  clearAll: () => {
    // Clear localStorage caches
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('meta_ads_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear in-memory cache
    requestCache.clear()
  },

  // Force refresh data for specific date range
  refresh: async (dateFrom, dateTo) => {
    // Clear specific cache
    const cacheKey = `meta_ads_${dateFrom}_${dateTo}`
    cacheUtils.clearCache(cacheKey)
    if (requestCache.has(cacheKey)) {
      requestCache.delete(cacheKey)
    }
    
    // Fetch fresh data
    return await fetchMetaAdsWithCache(dateFrom, dateTo, { forceFresh: true })
  },

  // Get info for a specific cache key (for debugging)
  getInfo: () => {
    return metaAdsCacheManager.getCacheInfo()
  }
}

// Cache utilities for meta ads data (following salesOrders.js pattern)
const cacheUtils = {
  setCache: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
      console.log(`Meta ads data cached with key: ${key}`)
    } catch (error) {
      console.warn('Failed to cache meta ads data:', error)
    }
  },

  getCache: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_DURATION) {
        console.log('Meta ads cache expired, removing:', key)
        localStorage.removeItem(key)
        return null
      }

      console.log('Using cached meta ads data:', key)
      return data
    } catch (error) {
      console.warn('Failed to read meta ads cache:', error)
      return null
    }
  },

  clearCache: (key) => {
    try {
      localStorage.removeItem(key)
      console.log('Meta ads cache cleared:', key)
    } catch (error) {
      console.warn('Failed to clear meta ads cache:', error)
    }
  },

  getCacheInfo: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      const remaining = CACHE_DURATION - age

      return {
        exists: true,
        size: cached.length,  // Add size field for cache debugger
        age,
        remaining: Math.max(0, remaining),
        expired: remaining <= 0,
        recordCount: Array.isArray(data) ? data.length : 0  // Add record count
      }
    } catch (error) {
      return null
    }
  }
}

// Enhanced fetch with caching for meta ads data (following salesOrders.js pattern)
const fetchMetaAdsWithCache = async (dateFrom, dateTo, options = {}) => {
  const cacheKey = `meta_ads_${dateFrom}_${dateTo}`
  const url = `${META_ADS_API}?date-from=${dateFrom}&date-to=${dateTo}`
  
  // Check in-memory cache first (for request deduplication)
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 60000) { // 1 minute for request deduplication
      console.log('Using in-memory cache for meta ads:', cacheKey)
      return cached.data
    }
    requestCache.delete(cacheKey)
  }

  // Check localStorage cache
  const cachedData = cacheUtils.getCache(cacheKey)
  if (cachedData && !options.forceFresh) {
    console.log('Using localStorage cache for meta ads:', cacheKey)
    return cachedData
  }

  // Make fresh request
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Handle the API response format which returns an array with a data property (same as salesOrders.js)
    let data = []
    if (Array.isArray(result) && result.length > 0 && result[0].data) {
      const responseObj = result[0]
      
      if (responseObj.status === 200 && responseObj.data) {
        data = responseObj.data
      } else {
        throw new Error(`API returned error: ${responseObj.message}`)
      }
    } else if (Array.isArray(result)) {
      data = result
    } else if (result.data) {
      data = result.data
    } else {
      console.warn('Unexpected API response structure:', result)
      data = []
    }
    
    // Transform data to match expected field structure
    data = transformApiData(data)
    
    // Cache the successful response
    requestCache.set(cacheKey, { data, timestamp: Date.now() })
    cacheUtils.setCache(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('Error fetching meta ads data:', error)
    throw error
  }
}

// Generate sample data function (optimized with memoization)
let memoizedSampleData = null // Clear cache for updated sample data
export const generateSampleData = () => {
  // Temporarily disable memoization during development
  // if (memoizedSampleData) {
  //   console.log('Using memoized sample data')
  //   return memoizedSampleData
  // }

  console.log('Generating new sample data')
  const products = ['Tune Up', 'Oil Change', 'AC Service', 'Brake Service', 'Car Wash']
  const prefixes = ['Poster', 'Banner', 'Video', 'Story', 'Carousel']
  const prices = ['99 Ribu', '199 Ribu', '299 Ribu', '399 Ribu', '499 Ribu']
  const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3']
  const sampleData = []
  
  // Generate sample data for a wide date range
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30) // 30 days in future
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90) // 90 days in past
  
  const dateRange = []
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dateRange.push(formatDateString(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Ensure we have data for today and yesterday for reliable demo
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const todayStr = formatDateString(today)
  const yesterdayStr = formatDateString(yesterday)
  
  for (let i = 0; i < 200; i++) {
    let randomDate;
    
    // Force 30% of records to be from today/yesterday for demo reliability
    if (i < 60) {
      randomDate = i % 2 === 0 ? todayStr : yesterdayStr
    } else {
      randomDate = dateRange[Math.floor(Math.random() * dateRange.length)]
    }
    const product = products[Math.floor(Math.random() * products.length)]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const price = prices[Math.floor(Math.random() * prices.length)]
    
    // Convert date to ISO format like real API data
    const isoDate = `${randomDate}T17:00:00.000Z`
    
    sampleData.push({
      campaign_name: campaigns[Math.floor(Math.random() * campaigns.length)],
      adset_name: `Adset ${product} ${i + 1}`,
      ad_name: `${prefix}_${product}_${price}`,
      spend: Math.random() * 1000000,
      reach: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 50000),
      frequency: Math.random() * 3,
      cpm: Math.random() * 50000,
      'onsite_conversion.messaging_conversation_started_7d': Math.floor(Math.random() * 100),
      purchase: Math.floor(Math.random() * 50),
      purchase_value: Math.random() * 5000000,
      add_to_cart: Math.floor(Math.random() * 200),
      date_start: isoDate,
      date_stop: isoDate
    })
  }
  
  memoizedSampleData = sampleData
  console.log('Generated sample data:', { 
    totalRecords: sampleData.length,
    todayRecords: sampleData.filter(d => d.date_start.startsWith(todayStr)).length,
    yesterdayRecords: sampleData.filter(d => d.date_start.startsWith(yesterdayStr)).length,
    dateRange: { todayStr, yesterdayStr }
  })
  return sampleData
}

// Fetch meta ads data (following salesOrders.js pattern)
export const fetchDashboardData = async (options = {}) => {
  const { startDate, endDate } = options
  
  // Use provided dates or fallback to current date  
  const defaultStartDate = startDate || new Date().toISOString().split('T')[0]
  const defaultEndDate = endDate || new Date().toISOString().split('T')[0]
  
  try {
    const data = await fetchMetaAdsWithCache(defaultStartDate, defaultEndDate, options)
    
    return data
    
  } catch (err) {
    console.error('❌ META ADS DEBUG: fetchDashboardData error:', err)
    
    // Enhanced error messages
    let errorMessage = `Failed to load meta ads data: ${err.message}`
    
    if (err.message.includes('CORS')) {
      errorMessage += ' (CORS policy error - check if the API allows cross-origin requests)'
    } else if (err.message.includes('Failed to fetch')) {
      errorMessage += ' (Network error - check your internet connection)'
    } else if (err.message.includes('timeout')) {
      errorMessage += ' (Request timeout - server may be slow)'
    }
    
    // Throw error with sample data as fallback info
    const error = new Error(errorMessage)
    error.useSampleData = true
    throw error
  }
}

// Optimized date filtering with memoization
const dateFilterCache = new Map()
export const filterDataByDateRange = (data, startDate, endDate) => {
  if (!data?.length || !startDate || !endDate) return data || []
  
  const cacheKey = `${data.length}_${startDate}_${endDate}`
  if (dateFilterCache.has(cacheKey)) {
    return dateFilterCache.get(cacheKey)
  }
  
  console.log('Filtering data by date range:', { startDate, endDate, dataLength: data.length })
  
  const filtered = data.filter(row => {
    const rowDate = row.date_start
    if (!rowDate) return false
    
    // Handle both ISO format (2025-06-20T17:00:00.000Z) and YYYY-MM-DD format
    let dateStr
    if (rowDate.includes('T')) {
      // ISO format - extract just the date part
      dateStr = rowDate.split('T')[0]
    } else {
      // Already in YYYY-MM-DD format
      dateStr = rowDate
    }
    
    const isInRange = dateStr >= startDate && dateStr <= endDate
    if (isInRange) {
      console.log('Date matched:', { rowDate, dateStr, startDate, endDate })
    }
    
    return isInRange
  })
  
  console.log('Filtered results:', { originalCount: data.length, filteredCount: filtered.length })
  
  // Cache the result (limit cache size)
  if (dateFilterCache.size > 10) {
    const firstKey = dateFilterCache.keys().next().value
    dateFilterCache.delete(firstKey)
  }
  dateFilterCache.set(cacheKey, filtered)
  
  return filtered
}

// Optimized product options with memoization
let cachedProductOptions = null
let cachedDataLength = 0
export const getProductOptions = (data) => {
  if (!data?.length) return []
  
  // Return cached result if data hasn't changed
  if (cachedProductOptions && cachedDataLength === data.length) {
    return cachedProductOptions
  }
  
  const products = [...new Set(data.map(row => extractProductName(row.ad_name)).filter(name => name !== 'Unknown'))]
  cachedProductOptions = products.sort()
  cachedDataLength = data.length
  
  return cachedProductOptions
}

// User preferences caching
export const userPreferences = {
  save: (preferences) => {
    cacheUtils.setCache(STORAGE_KEYS.USER_PREFERENCES, preferences)
  },
  
  load: () => {
    return cacheUtils.getCache(STORAGE_KEYS.USER_PREFERENCES, Infinity) // Never expire user preferences
  },
  
  clear: () => {
    cacheUtils.clearCache(STORAGE_KEYS.USER_PREFERENCES)
  }
}

// Cache management utilities for debugging and maintenance
export const cacheManager = {
  getInfo: cacheUtils.getCacheInfo,
  clearAll: cacheUtils.clearAllCaches,
  refresh: () => fetchDashboardData({ forceFresh: true }),
  
  // Preload data in background
  preload: async () => {
    try {
      await fetchDashboardData()
      console.log('Data preloaded successfully')
    } catch (error) {
      console.warn('Preload failed:', error.message)
    }
  }
} 