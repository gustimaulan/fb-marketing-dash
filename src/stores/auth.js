import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authenticateWithOdoo, logoutFromOdoo } from '../api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const sessionId = ref(null)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || '')

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authenticateWithOdoo(email, password)
      
      if (response.success) {
        user.value = response.user
        isAuthenticated.value = true
        sessionId.value = response.sessionId
        
        // Store session in localStorage for persistence
        localStorage.setItem('odoo_session', JSON.stringify({
          user: response.user,
          sessionId: response.sessionId,
          timestamp: Date.now()
        }))
        
        // Emit a custom event to notify that login was successful
        window.dispatchEvent(new CustomEvent('userLoggedIn'))
        
        return { success: true }
      } else {
        error.value = response.error || 'Authentication failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (sessionId.value) {
        await logoutFromOdoo(sessionId.value)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear local state regardless of server response
      user.value = null
      isAuthenticated.value = false
      sessionId.value = null
      error.value = null
      
      // Clear localStorage
      localStorage.removeItem('odoo_session')
    }
  }

  const checkAuth = async () => {
    const storedSession = localStorage.getItem('odoo_session')
    
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        const sessionAge = Date.now() - session.timestamp
        
        // Check if session is less than 24 hours old
        if (sessionAge < 24 * 60 * 60 * 1000) {
          user.value = session.user
          isAuthenticated.value = true
          sessionId.value = session.sessionId
          return true
        } else {
          // Session expired, clear it
          localStorage.removeItem('odoo_session')
        }
      } catch (err) {
        console.error('Error parsing stored session:', err)
        localStorage.removeItem('odoo_session')
      }
    }
    
    return false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    sessionId,
    
    // Getters
    isLoggedIn,
    userEmail,
    userName,
    userRole,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError
  }
}) 