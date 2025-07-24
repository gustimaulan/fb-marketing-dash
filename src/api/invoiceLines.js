// API service for invoice lines data
const INVOICE_LINES_API = import.meta.env.VITE_INVOICE_LINES_API_URL || 'https://workflows.cekat.ai/webhook/invoice-lines'

// Caching configuration
const CACHE_DURATION = 4 * 60 * 60 * 1000 // 4 hours
const requestCache = new Map()

// Storage keys for invoice lines caching
const STORAGE_KEYS = {
  INVOICE_LINES_DATA: 'invoice_lines_data',
  INVOICE_LINES_CACHE_TIMESTAMP: 'invoice_lines_cache_timestamp'
}

// Cache utilities for invoice lines
const cacheUtils = {
  setCache: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache invoice lines data:', error)
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
      console.warn('Failed to read invoice lines cache:', error)
      return null
    }
  },

  clearCache: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to clear invoice lines cache:', error)
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

// Enhanced fetch with caching for invoice lines
const fetchInvoiceLinesWithCache = async (options = {}) => {
  const cacheKey = 'invoice_lines_all'
  const url = INVOICE_LINES_API
  
  // Check in-memory cache first (for request deduplication)
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 60000) { // 1 minute for request deduplication
      return cached.data
    }
    requestCache.delete(cacheKey)
  }

  // Check localStorage cache
  const cachedData = cacheUtils.getCache(cacheKey)
  if (cachedData && !options.forceFresh) {
    return cachedData
  }

  // Make fresh request
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Handle the API response format
    let data = []
    if (Array.isArray(result)) {
      data = result
    } else if (result.data) {
      data = result.data
    }
    
    // Cache the successful response
    requestCache.set(cacheKey, { data, timestamp: Date.now() })
    cacheUtils.setCache(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('Error fetching invoice lines:', error)
    throw error
  }
}

export const fetchInvoiceLines = fetchInvoiceLinesWithCache

// Process and enrich invoice line data
export const processInvoiceLineData = (invoiceLines) => {
  return invoiceLines.map(line => ({
    ...line,
    // Add computed fields
    creditAmount: parseFloat(line.credit || 0),
    debitAmount: parseFloat(line.debit || 0),
    // Credit represents the revenue from this line item
    revenue: parseFloat(line.credit || 0),
    // Net amount (credit - debit for discounts/adjustments)
    netAmount: parseFloat(line.credit || 0) - parseFloat(line.debit || 0),
    // Extract service/product category from line_name
    serviceCategory: extractServiceCategory(line.line_name),
    // Clean line name for display
    displayName: cleanLineName(line.line_name),
    // Determine if this is a revenue-generating line
    isRevenueLine: isRevenueGeneratingLine(line)
  }))
}

// Extract service category from line name
const extractServiceCategory = (lineName) => {
  if (!lineName) return 'Unknown'
  
  const name = lineName.toLowerCase()
  
  // Service categories
  if (name.includes('analisa') || name.includes('cek') || name.includes('check')) {
    return 'Diagnostic Services'
  }
  if (name.includes('rem') || name.includes('brake')) {
    return 'Brake System'
  }
  if (name.includes('oli') || name.includes('oil')) {
    return 'Oil & Lubricants'
  }
  if (name.includes('filter')) {
    return 'Filters'
  }
  if (name.includes('kampas') || name.includes('pad')) {
    return 'Brake Pads'
  }
  if (name.includes('discount')) {
    return 'Discounts'
  }
  if (name.includes('kaki') || name.includes('suspension')) {
    return 'Suspension'
  }
  if (name.includes('engine') || name.includes('mesin')) {
    return 'Engine Services'
  }
  if (name.includes('inv/') || name.includes('invoice')) {
    return 'Invoice Totals'
  }
  
  return 'Other Services'
}

// Clean line name for display
const cleanLineName = (lineName) => {
  if (!lineName) return 'Unknown'
  
  // Remove newlines and extra spaces
  return lineName.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

// Determine if a line is revenue-generating (not a balancing entry)
const isRevenueGeneratingLine = (line) => {
  const name = line.line_name?.toLowerCase() || ''
  const accountId = line.account_id
  
  // Exclude balancing entries
  if (name.includes('inv/') || name.includes('invoice')) return false
  if (name.includes('discount')) return false
  
  // Exclude tax offset entries (account_id 67)
  if (accountId === '67') return false
  
  // Include revenue-generating items
  if (parseFloat(line.credit || 0) > 0) return true
  
  return false
}

// Get product performance data by combining sales orders and invoice lines
export const getProductPerformanceData = (salesOrders, invoiceLines) => {
  // Create a map of invoice numbers to sales order data
  const salesOrderMap = new Map()
  salesOrders.forEach(order => {
    if (order.invoice_number) {
      salesOrderMap.set(order.invoice_number, order)
    }
  })

  // Calculate discounts per invoice
  const invoiceDiscounts = new Map()
  invoiceLines.forEach(line => {
    if (line.line_name?.toLowerCase().includes('discount')) {
      const discountAmount = parseFloat(line.debit || 0)
      if (discountAmount > 0) {
        invoiceDiscounts.set(line.invoice_number, (invoiceDiscounts.get(line.invoice_number) || 0) + discountAmount)
      }
    }
  })

  // Group invoice lines by service/product
  const productStats = new Map()
  
  invoiceLines.forEach(line => {
    const salesOrder = salesOrderMap.get(line.invoice_number)
    if (!salesOrder) return // Skip if no matching sales order
    
    // Only process revenue-generating lines
    if (!line.isRevenueLine) return
    
    const key = line.line_name || 'Unknown'
    
    if (!productStats.has(key)) {
      productStats.set(key, {
        lineName: line.line_name,
        displayName: line.displayName,
        serviceCategory: line.serviceCategory,
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        avgOrderValue: 0,
        fbAttributedOrders: 0,
        fbAttributedRevenue: 0,
        orders: [],
        invoiceNumbers: new Set(),
        invoiceGrossRevenue: new Map(), // Track gross revenue per invoice
        invoiceDiscounts: new Map() // Track discounts per invoice
      })
    }
    
    const stats = productStats.get(key)
    const revenue = line.revenue // Use credit amount as revenue
    
    // Count unique invoices
    if (!stats.invoiceNumbers.has(line.invoice_number)) {
      stats.totalOrders++
      stats.invoiceNumbers.add(line.invoice_number)
      
      // Check if this order is from Facebook ads
      if (salesOrder.customer_sumber_info === 'fb_ads' || salesOrder.customer_sumber_info === 'ig_ads') {
        stats.fbAttributedOrders++
      }
    }
    
    // Track gross revenue per invoice
    stats.invoiceGrossRevenue.set(line.invoice_number, 
      (stats.invoiceGrossRevenue.get(line.invoice_number) || 0) + revenue)
    
    // Track discounts per invoice
    const invoiceDiscount = invoiceDiscounts.get(line.invoice_number) || 0
    stats.invoiceDiscounts.set(line.invoice_number, invoiceDiscount)
    
    stats.totalRevenue += revenue
    stats.totalQuantity++
    
    // Add order details
    stats.orders.push({
      invoiceNumber: line.invoice_number,
      partnerName: line.partner_name,
      dateCompleted: line.date_completed,
      amount: revenue,
      isFromFbAds: salesOrder.customer_sumber_info === 'fb_ads' || salesOrder.customer_sumber_info === 'ig_ads',
      branchName: salesOrder.branch_name,
      customerSource: salesOrder.customer_sumber_info
    })
  })
  
  // Calculate net revenue (gross - discounts) and convert to array
  const result = Array.from(productStats.values()).map(stats => {
    // Calculate net revenue per invoice
    let totalNetRevenue = 0
    let fbNetRevenue = 0
    
    stats.invoiceNumbers.forEach(invoiceNumber => {
      const grossRevenue = stats.invoiceGrossRevenue.get(invoiceNumber) || 0
      const discount = stats.invoiceDiscounts.get(invoiceNumber) || 0
      const netRevenue = grossRevenue - discount
      
      totalNetRevenue += netRevenue
      
      // Check if this invoice is from FB ads
      const salesOrder = salesOrderMap.get(invoiceNumber)
      if (salesOrder && (salesOrder.customer_sumber_info === 'fb_ads' || salesOrder.customer_sumber_info === 'ig_ads')) {
        fbNetRevenue += netRevenue
      }
    })
    
    return {
      ...stats,
      totalRevenue: totalNetRevenue, // Use net revenue (after discounts)
      avgOrderValue: stats.totalOrders > 0 ? totalNetRevenue / stats.totalOrders : 0,
      fbAttributedRevenue: fbNetRevenue, // Use net revenue for FB attribution
      invoiceNumbers: Array.from(stats.invoiceNumbers)
    }
  })
  
  return result.sort((a, b) => b.totalRevenue - a.totalRevenue)
}

// Get performance by service category
export const getCategoryPerformance = (productPerformanceData) => {
  const categoryStats = new Map()
  
  productPerformanceData.forEach(product => {
    const category = product.serviceCategory
    
    if (!categoryStats.has(category)) {
      categoryStats.set(category, {
        category,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        fbAttributedOrders: 0,
        fbAttributedRevenue: 0,
        products: []
      })
    }
    
    const stats = categoryStats.get(category)
    stats.totalProducts++
    stats.totalOrders += product.totalOrders
    stats.totalRevenue += product.totalRevenue // Already net revenue from product calculation
    stats.fbAttributedOrders += product.fbAttributedOrders
    stats.fbAttributedRevenue += product.fbAttributedRevenue // Already net revenue from product calculation
    stats.products.push(product)
  })
  
  return Array.from(categoryStats.values())
    .map(stats => ({
      ...stats,
      avgOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
      fbAttributionRate: stats.totalOrders > 0 ? (stats.fbAttributedOrders / stats.totalOrders) * 100 : 0
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
}

// Cache management utilities
export const invoiceLinesCacheManager = {
  getCacheInfo: () => {
    const cacheInfo = {}
    
    // Get all localStorage keys that start with 'invoice_lines_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('invoice_lines_')) {
        const info = cacheUtils.getCacheInfo(key)
        if (info) {
          cacheInfo[key] = info
        }
      }
    }
    
    return cacheInfo
  },

  clearAll: () => {
    // Clear localStorage caches
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('invoice_lines_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear in-memory cache
    requestCache.clear()
  },

  refresh: async () => {
    // Clear specific cache
    const cacheKey = 'invoice_lines_all'
    cacheUtils.clearCache(cacheKey)
    if (requestCache.has(cacheKey)) {
      requestCache.delete(cacheKey)
    }
    
    // Fetch fresh data
    return await fetchInvoiceLinesWithCache({ forceFresh: true })
  }
} 