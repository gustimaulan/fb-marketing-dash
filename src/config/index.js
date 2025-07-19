// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
  },
  
  // Cache Configuration
  cache: {
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    salesOrderTTL: 30 * 60 * 1000, // 30 minutes  
    leadsRatioTTL: 10 * 60 * 1000, // 10 minutes
  },
  
  // UI Configuration
  ui: {
    pageSize: 50,
    chartHeight: 400,
    dateFormat: 'id-ID',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
  },
  
  // Feature Flags
  features: {
    enableCacheDebugger: import.meta.env.DEV,
    enablePerformanceLogging: import.meta.env.DEV,
    enableRealTimeUpdates: false,
  },
  
  // Development flags
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} 