// Test script for authentication and session ID extraction
// Run this in your browser console on your deployed app

async function testAuth() {
  console.log('🧪 Testing authentication...')
  
  const credentials = {
    email: 'gmaulan47@gmail.com',
    password: 'just4fun'
  }
  
  try {
    const response = await fetch('https://fb-marketing-dash-api.gmaulan47.workers.dev/web/session/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          db: 'Pitcar1',
          login: credentials.email,
          password: credentials.password
        }
      })
    })

    console.log('📡 Response status:', response.status)
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Check for Set-Cookie header specifically
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('🍪 Set-Cookie header:', setCookieHeader)
    
    // Extract session ID from cookie if present
    let sessionId = null
    if (setCookieHeader) {
      const sessionMatch = setCookieHeader.match(/session_id=([^;]+)/)
      if (sessionMatch) {
        sessionId = sessionMatch[1]
        console.log('🔑 Session ID extracted from cookie:', sessionId)
      }
    }
    
    // Check for other session-related headers
    const sessionHeaders = {
      'Set-Cookie': setCookieHeader,
      'session_id': response.headers.get('session_id'),
      'X-Session-ID': response.headers.get('X-Session-ID'),
      'X-Odoo-Session': response.headers.get('X-Odoo-Session'),
      'Authorization': response.headers.get('Authorization')
    }
    
    console.log('🔑 All session headers found:', sessionHeaders)
    
    const data = await response.json()
    console.log('📦 Response body:', data)
    
    if (data.result && data.result.uid) {
      console.log('✅ Authentication successful!')
      console.log('👤 User ID:', data.result.uid)
      console.log('👤 User name:', data.result.name)
      
      // Session ID is already extracted from cookie above
      console.log('🔐 Final session ID:', sessionId)
      
      return {
        success: true,
        user: data.result,
        sessionId: sessionId
      }
    } else {
      console.log('❌ Authentication failed:', data.error)
      return {
        success: false,
        error: data.error
      }
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the test
testAuth().then(result => {
  console.log('🎯 Final result:', result)
}) 