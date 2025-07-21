// API service for leads ratio data to split campaign performance by branch
const LEADS_RATIO_API = import.meta.env.VITE_LEADS_RATIO_API_URL || 'https://workflows.cekat.ai/webhook/leads-ratio'

// Caching configuration
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours - same as other APIs
const requestCache = new Map()

// Storage keys for leads ratio caching
const STORAGE_KEYS = {
  LEADS_RATIO_DATA: 'leads_ratio_data',
  LEADS_RATIO_CACHE_TIMESTAMP: 'leads_ratio_cache_timestamp'
}

// Cache utilities for leads ratio
const cacheUtils = {
  setCache: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache leads ratio data:', error)
    }
  },

  getCache: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key)
        return null
      }
      return data
    } catch (error) {
      console.warn('Failed to read leads ratio cache:', error)
      return null
    }
  },

  clearCache: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to clear leads ratio cache:', error)
    }
  }
}

// Cache manager for leads ratio
export const leadsRatioCacheManager = {
  getCacheInfo: () => {
    const cacheInfo = {}
    
    // Check all localStorage keys that match our pattern
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.LEADS_RATIO_DATA)) {
        const cached = localStorage.getItem(key)
        if (cached) {
          try {
            const { timestamp } = JSON.parse(cached)
            const age = Date.now() - timestamp
            const isExpired = age > CACHE_DURATION
            
            // Extract date range from key (e.g., "leads_ratio_data_2025-07-01_2025-07-19")
            const dateRange = key.replace(STORAGE_KEYS.LEADS_RATIO_DATA + '_', '')
            
            cacheInfo[dateRange] = {
              age,
              isExpired,
              timestamp,
              size: cached.length,
              recordCount: 1 // Leads ratio has one record per date range
            }
          } catch (error) {
            cacheInfo[key] = { error: 'Invalid cache data' }
          }
        }
      }
    })
    
    return cacheInfo
  },

  clearAll: () => {
    // Clear all date-specific cache keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.LEADS_RATIO_DATA)) {
        cacheUtils.clearCache(key)
      }
    })
    requestCache.clear()
  },

  // Force refresh data for specific date range
  refresh: async (dateFrom, dateTo) => {
    // Clear specific cache
    const cacheKey = `${STORAGE_KEYS.LEADS_RATIO_DATA}_${dateFrom}_${dateTo}`
    cacheUtils.clearCache(cacheKey)
    const requestKey = `${dateFrom}_${dateTo}`
    if (requestCache.has(requestKey)) {
      requestCache.delete(requestKey)
    }
    
    // Fetch fresh data
    return await fetchLeadsRatio(dateFrom, dateTo)
  },

  // Add debug helper function
  debugLeadsData: () => {
    const info = leadsRatioCacheManager.getCacheInfo()
    return info
  }
}

// Fetch leads ratio data from API
export const fetchLeadsRatio = async (startDate, endDate) => {
  const cacheKey = `${STORAGE_KEYS.LEADS_RATIO_DATA}_${startDate}_${endDate}`
  
  // Check cache first
  const cachedData = cacheUtils.getCache(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Check in-memory cache for ongoing requests
  const requestKey = `${startDate}_${endDate}`
  if (requestCache.has(requestKey)) {
    return requestCache.get(requestKey)
  }

  try {
    const url = `${LEADS_RATIO_API}?date-from=${startDate}&date-to=${endDate}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const rawData = await response.json()
    
    // Extract data from the response array
    const responseData = rawData[0] // API returns array with single object
    
    if (responseData.status !== 200) {
      throw new Error(`API returned error: ${responseData.message}`)
    }
    
    const processedData = processLeadsRatioData(responseData.data)
    
    // Cache the processed data
    cacheUtils.setCache(cacheKey, processedData)
    requestCache.set(requestKey, processedData)
    
    // Clean up request cache after 30 seconds
    setTimeout(() => {
      requestCache.delete(requestKey)
    }, 30000)
    
    return processedData
    
  } catch (error) {
    console.error('Error fetching leads ratio data:', error)
    requestCache.delete(requestKey)
    
    // Don't use fallback data - return null to indicate API failure
    throw new Error(`Failed to fetch leads data: ${error.message}`)
  }
}

// Process raw leads ratio data into structured format
const processLeadsRatioData = (rawData) => {
  const branches = rawData.map(branch => {
    const processed = {
      name: branch.label_group,
      total: parseInt(branch.total),
      percentage: parseFloat(branch.percentage),
      ratio: parseFloat(branch.percentage) / 100,
      purchases: parseInt(branch.purchase) || 0,
      lastCreatedAt: branch.last_created_at || null
    }
    return processed
  })
  
  const totalLeads = branches.reduce((sum, branch) => sum + branch.total, 0)
  const totalPurchases = branches.reduce((sum, branch) => sum + branch.purchases, 0)
  
  // Find the most recent last_created_at from all branches
  const lastCreatedDates = branches
    .map(branch => branch.lastCreatedAt)
    .filter(date => date !== null)
    .map(date => new Date(date))
  
  const mostRecentDate = lastCreatedDates.length > 0 
    ? new Date(Math.max(...lastCreatedDates))
    : new Date()
  
  const result = {
    branches,
    totalLeads,
    totalPurchases,
    lastUpdated: mostRecentDate.toISOString(),
    lastCreatedAt: mostRecentDate.toISOString()
  }
  
  return result
}

// Apply branch ratios to split campaign metrics (REAL DATA ONLY)
export const applySplitByBranch = (metrics, branchRatios) => {
  if (!branchRatios || !branchRatios.branches) {
    return null
  }
  
  return branchRatios.branches.map(branch => {
    // Real data points
    const actualPurchases = branch.purchases || 0
    const actualLeads = branch.total || 0
    const spendForBranch = metrics.spend * branch.ratio
    const revenueForBranch = metrics.purchase_value * branch.ratio
    
    return {
      branchName: branch.name,
      ratio: branch.ratio,
      percentage: branch.percentage,
      actualPurchases: actualPurchases,
      actualLeads: actualLeads,
      
      // BUSINESS METRICS for budget allocation decisions
      metrics: {
        // === FINANCIAL ALLOCATION ===
        spend: spendForBranch,
        revenue: revenueForBranch,
        profit: revenueForBranch - spendForBranch,
        roas: spendForBranch > 0 ? revenueForBranch / spendForBranch : 0,
        
        // === LEAD ECONOMICS ===
        leads: actualLeads,
        purchases: actualPurchases,
        cost_per_lead: actualLeads > 0 ? spendForBranch / actualLeads : 0,
        cost_per_purchase: actualPurchases > 0 ? spendForBranch / actualPurchases : 0,
        
        // === EFFICIENCY METRICS ===
        conversion_rate: actualLeads > 0 ? (actualPurchases / actualLeads) * 100 : 0,
        revenue_per_lead: actualLeads > 0 ? revenueForBranch / actualLeads : 0,
        revenue_per_purchase: actualPurchases > 0 ? revenueForBranch / actualPurchases : 0,
        
        // === BUDGET RECOMMENDATIONS ===
        // Suggested budget allocation based on performance
        efficiency_score: actualLeads > 0 && spendForBranch > 0 ? 
          (revenueForBranch / spendForBranch) * (actualPurchases / actualLeads) * 100 : 0,
        recommended_budget_share: 0 // Will be calculated in component
      }
    }
  })
}

// Generate sample leads ratio data for testing - DISABLED
export const generateSampleLeadsRatio = () => {
  console.warn('Sample leads data generation is DISABLED - use real API only')
  throw new Error('Sample data disabled - use real leads-ratio API only')
}

// Global debug function - call from browser console
window.debugLeads = async (startDate = '2025-07-18', endDate = '2025-07-18') => {
  // Clear cache first
  leadsRatioCacheManager.clearAll()
  
  try {
    // Make fresh API call
    const data = await fetchLeadsRatio(startDate, endDate)
    console.log('Leads ratio data:', data)
    console.log('Cache info:', leadsRatioCacheManager.getCacheInfo())
    return data
  } catch (error) {
    console.error('Leads ratio error:', error)
    return { error: error.message }
  }
}

// Test cache info
window.testLeadsCache = () => {
  console.log('Current cache info:', leadsRatioCacheManager.getCacheInfo())
  console.log('All localStorage keys:', Object.keys(localStorage).filter(k => k.includes('leads')))
} 