# Deployment Guide

## CORS Issue Resolution

The application was experiencing CORS issues when deployed to Cloudflare Pages. This guide explains how to resolve it.

## Solution: Cloudflare Worker Proxy

### 1. Deploy the Cloudflare Worker

First, deploy the worker that acts as a proxy:

```bash
# Install Wrangler CLI if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy
```

### 2. Configure DNS

Add a DNS record in your Cloudflare dashboard:
- **Type**: CNAME
- **Name**: `api.odoo`
- **Target**: `fb-marketing-dash-api.your-subdomain.workers.dev`
- **Proxy status**: Proxied (orange cloud)

### 3. Update Environment Variables

In your Cloudflare Pages deployment settings, add:
```
VITE_ODOO_BASE_URL=https://api.odoo.pitcar.co.id
```

### 4. Alternative: Direct Odoo Server Configuration

If you have access to the Odoo server, you can configure CORS directly:

Add to your Odoo server's nginx configuration:
```nginx
location /web/ {
    add_header 'Access-Control-Allow-Origin' 'https://fb-marketing-dash.pages.dev';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fb-marketing-dash.pages.dev';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        return 204;
    }
    
    proxy_pass http://odoo_backend;
}
```

## Current Configuration

The application is configured to use:
- **Development**: Direct connection to Odoo server
- **Production**: Cloudflare Worker proxy at `https://api.odoo.pitcar.co.id`

## Testing

After deployment, test the authentication by:
1. Opening the application
2. Attempting to log in with valid credentials
3. Checking browser console for any remaining CORS errors

## Troubleshooting

If you still see CORS errors:
1. Verify the worker is deployed and accessible
2. Check DNS configuration
3. Ensure environment variables are set correctly
4. Clear browser cache and try again 