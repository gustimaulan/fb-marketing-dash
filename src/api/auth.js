import { config } from '../config/index.js'

// Odoo authentication API service
export const authenticateWithOdoo = async (email, password) => {
  try {
    // Debug logging
    console.log('Auth config:', {
      isDev: config.isDev,
      odooBaseUrl: config.api.odooBaseUrl,
      envUrl: config.debug.envUrl,
      finalUrl: config.debug.finalUrl
    })
    
    // Use proxy in development, direct URL in production
    const baseUrl = config.isDev ? '/odoo' : config.api.odooBaseUrl
    const response = await fetch(`${baseUrl}/web/session/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          db: 'Pitcar1',
          login: email,
          password: password
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Extract session ID from response headers
    const sessionId = response.headers.get('Set-Cookie') || 
                     response.headers.get('session_id') || 
                     response.headers.get('X-Session-ID')
    
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    console.log('Extracted session ID:', sessionId)

    const data = await response.json()
    
    // Check for Odoo-specific errors
    if (data.error) {
      return {
        success: false,
        error: data.error.data?.message || data.error.message || 'Authentication failed'
      }
    }

    // Check if authentication was successful
    if (data.result && data.result.uid) {
      // Extract user information from the response
      const userInfo = {
        id: data.result.uid,
        email: email,
        name: data.result.name || email,
        role: data.result.user_companies?.current_company?.[1] || 'User',
        // Don't store sessionId in user object
      }

      return {
        success: true,
        user: userInfo,
        sessionId: sessionId // Use the session ID from headers
      }
    } else {
      return {
        success: false,
        error: 'Invalid credentials'
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: error.message || 'Network error occurred'
    }
  }
}

export const logoutFromOdoo = async (sessionId) => {
  try {
    // Use proxy in development, direct URL in production
    const baseUrl = config.isDev ? '/odoo' : config.api.odooBaseUrl
    const response = await fetch(`${baseUrl}/web/session/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': sessionId, // Include session cookie in logout request
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          session_id: sessionId
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails on server, we consider it successful locally
    return {
      success: true,
      message: 'Logged out locally'
    }
  }
}

export const validateSession = async (sessionId) => {
  try {
    // Use proxy in development, direct URL in production
    const baseUrl = config.isDev ? '/odoo' : config.api.odooBaseUrl
    const response = await fetch(`${baseUrl}/web/session/get_session_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': sessionId, // Include session cookie in validation request
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          session_id: sessionId
        }
      })
    })

    if (!response.ok) {
      return { valid: false }
    }

    const data = await response.json()
    
    if (data.error) {
      return { valid: false }
    }

    return {
      valid: true,
      user: data.result
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { valid: false }
  }
} 