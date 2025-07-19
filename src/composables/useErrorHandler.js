import { ref } from 'vue'
import { config } from '@/config'

export function useErrorHandler() {
  const error = ref(null)
  const isError = ref(false)
  
  const handleError = (err, context = 'Unknown') => {
    console.error(`[${context}] Error:`, err)
    
    error.value = err
    isError.value = true
    
    // Log to external service in production
    if (config.isProd) {
      // Could integrate with Sentry, LogRocket, etc.
      // logErrorToService(err, context)
    }
    
    return err
  }
  
  const clearError = () => {
    error.value = null
    isError.value = false
  }
  
  const handleAsyncOperation = async (operation, context) => {
    try {
      clearError()
      const result = await operation()
      return result
    } catch (err) {
      return handleError(err, context)
    }
  }
  
  return {
    error,
    isError,
    handleError,
    clearError,
    handleAsyncOperation
  }
} 