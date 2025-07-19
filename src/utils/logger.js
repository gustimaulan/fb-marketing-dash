import { config } from '@/config'

class Logger {
  constructor() {
    this.performanceMarks = new Map()
  }
  
  // Standard logging methods
  info(message, ...args) {
    if (config.features.enablePerformanceLogging) {
      console.log(`[INFO] ${message}`, ...args)
    }
  }
  
  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args)
  }
  
  error(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args)
  }
  
  debug(message, ...args) {
    if (config.isDev) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
  
  // Performance tracking
  startTimer(label) {
    if (config.features.enablePerformanceLogging) {
      this.performanceMarks.set(label, performance.now())
    }
  }
  
  endTimer(label) {
    if (config.features.enablePerformanceLogging && this.performanceMarks.has(label)) {
      const startTime = this.performanceMarks.get(label)
      const duration = performance.now() - startTime
      this.info(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
      this.performanceMarks.delete(label)
      return duration
    }
    return 0
  }
  
  // Component lifecycle logging
  componentMounted(componentName, props = {}) {
    this.debug(`🔧 ${componentName} mounted`, {
      propsKeys: Object.keys(props),
      timestamp: new Date().toISOString()
    })
  }
  
  componentError(componentName, error, info) {
    this.error(`💥 ${componentName} error:`, error, info)
  }
  
  // API call logging
  apiCall(method, url, data = {}) {
    this.debug(`🌐 API ${method.toUpperCase()} ${url}`, data)
  }
  
  // Cache operation logging
  cacheOperation(operation, key, data = {}) {
    this.debug(`💾 Cache ${operation}: ${key}`, data)
  }
}

export const logger = new Logger() 