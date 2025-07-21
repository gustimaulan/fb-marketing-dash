// Environment configuration
export const config = {
  // API Configuration
  api: {
    odooBaseUrl: import.meta.env.VITE_ODOO_BASE_URL || 'https://sokasistem.pitcar.co.id',
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