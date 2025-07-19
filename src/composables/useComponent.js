import { onMounted, onErrorCaptured } from 'vue'
import { logger } from '@/utils/logger'
import { useErrorHandler } from './useErrorHandler'

export function useComponent(componentName, props = {}) {
  const { handleError } = useErrorHandler()
  
  // Component lifecycle logging
  onMounted(() => {
    logger.componentMounted(componentName, props)
  })
  
  // Global error boundary for components
  onErrorCaptured((err, instance, info) => {
    const errorContext = `${componentName} - ${info}`
    logger.componentError(componentName, err, info)
    handleError(err, errorContext)
    
    // Return false to let error propagate up
    // Return true to prevent error from propagating
    return false
  })
  
  return {
    // Helper to wrap async operations with error handling
    withErrorHandling: async (operation, context = componentName) => {
      try {
        return await operation()
      } catch (err) {
        handleError(err, context)
        throw err // Re-throw to maintain original error flow
      }
    },
    
    // Performance measurement helpers
    startPerformanceTimer: (label) => {
      logger.startTimer(`${componentName}.${label}`)
    },
    
    endPerformanceTimer: (label) => {
      return logger.endTimer(`${componentName}.${label}`)
    }
  }
} 