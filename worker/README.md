# Cloudflare Worker for CORS Proxy

This directory contains the Cloudflare Worker that acts as a proxy to resolve CORS issues between the frontend and the Odoo server.

## Files

- `wrangler.toml` - Worker configuration
- `worker.js` - Worker code that handles CORS and proxies requests

## Deployment

To deploy this worker:

```bash
# Navigate to the worker directory
cd worker

# Install Wrangler CLI if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy
```

## Configuration

The worker will be deployed as `fb-marketing-dash-api` and should be accessible at:
`https://fb-marketing-dash-api.your-subdomain.workers.dev`

## DNS Setup

After deployment, add a DNS record in your Cloudflare dashboard:
- **Type**: CNAME
- **Name**: `api.odoo`
- **Target**: `fb-marketing-dash-api.your-subdomain.workers.dev`
- **Proxy status**: Proxied (orange cloud)

This will make the worker accessible at `https://api.odoo.pitcar.co.id` 