// Date Range Constants
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_WEEK: 'thisweek',
  LAST_WEEK: 'lastweek',
  THIS_MONTH: 'thismonth',
  LAST_MONTH: 'lastmonth',
  CUSTOM: 'custom'
}

// Dashboard Tab Constants
export const DASHBOARD_TABS = {
  OVERVIEW: 'overview',
  CAMPAIGN: 'campaign',
  ATTRIBUTION: 'attribution',
  BRANCH: 'branch'
}

// Sort Directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
}

// Cache Keys Pattern
export const CACHE_KEYS = {
  FB_ADS: 'fb_ads_data',
  SALES_ORDERS: 'sales_orders',
  LEADS_RATIO: 'leads_ratio'
}

// Component Status
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#10B981',
  SECONDARY: '#3B82F6',  
  ACCENT: '#8B5CF6',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4'
}

// Metric Card Icons
export const METRIC_ICONS = {
  SPEND: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  REACH: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  IMPRESSIONS: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  CLICKS: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
  PURCHASES: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01'
}

// Business Constants
export const BUSINESS_THRESHOLDS = {
  GOOD_ROAS: 3.0,
  ACCEPTABLE_ROAS: 2.0,
  GOOD_CTR: 0.02, // 2%
  HIGH_CPC: 5000, // IDR
  MAX_FREQUENCY: 3.0
}

// Local Storage Keys
export const STORAGE_KEYS = {
  CACHE_DEBUGGER_VISIBLE: 'cache-debugger-visible',
  USER_PREFERENCES: 'user-preferences',
  COLUMN_CONFIG: 'column-config'
} 