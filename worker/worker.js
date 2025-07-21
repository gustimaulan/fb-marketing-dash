// Cloudflare Worker to proxy requests to Odoo server
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    try {
      // Get the path from the request URL
      const url = new URL(request.url)
      const path = url.pathname
      
      // Forward the request to the Odoo server
      const odooUrl = `https://sokasistem.pitcar.co.id${path}`
      
      // Clone the request headers and modify them
      const headers = new Headers(request.headers)
      headers.set('Origin', 'https://sokasistem.pitcar.co.id')
      headers.set('Referer', 'https://sokasistem.pitcar.co.id/')
      
      // Create the new request
      const newRequest = new Request(odooUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' ? request.body : undefined,
      })

      // Fetch from Odoo server
      const response = await fetch(newRequest)
      
      // Clone the response and add CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      })

      return newResponse
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      })
    }
  },
} 