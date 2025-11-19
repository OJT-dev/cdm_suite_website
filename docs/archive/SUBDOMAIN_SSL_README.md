
# Subdomain SSL Configuration - Important Information

## The Issue

When users build sites using the AI Website Builder, each site gets a unique subdomain like:
- `yourcompany-abc1.cdmsuite.com`
- `mybusiness-xyz2.cdmsuite.com`

These subdomains are dynamically generated and stored in the database. However, **these subdomains do not have SSL certificates configured**, which causes the HSTS (HTTP Strict Transport Security) error you encountered:

```
elevate-digital-systems-d4p8.cdmsuite.com uses encryption to protect your information.
When Microsoft Edge tried to connect to elevate-digital-systems-d4p8.cdmsuite.com this time,
the website sent back unusual and incorrect credentials.
```

## Why This Happens

1. **Dynamic Subdomain Generation**: Each user's site gets a unique subdomain
2. **No Wildcard SSL**: The main `cdmsuite.com` domain doesn't have a wildcard SSL certificate (`*.cdmsuite.com`)
3. **HSTS Policy**: Modern browsers enforce HTTPS and reject connections without valid SSL certificates

## Solutions

### Option 1: Wildcard SSL Certificate (Recommended for Production)

To support unlimited dynamic subdomains, you need:

1. **Purchase/Configure Wildcard SSL** for `*.cdmsuite.com`
   - This allows all subdomains (`anything.cdmsuite.com`) to use HTTPS
   - Available from Let's Encrypt (free), Cloudflare, or commercial providers

2. **DNS Configuration**:
   ```
   *.cdmsuite.com → A record pointing to your server IP
   ```

3. **Server Configuration**: Update your web server (Nginx/Apache) to handle wildcard subdomains

### Option 2: Preview via iframe (Current Workaround)

Instead of redirecting to the subdomain, display the site in an iframe within the dashboard:

```tsx
<iframe 
  src={`https://cdmsuite.com/preview/${projectId}`}
  className="w-full h-screen"
/>
```

This keeps users on the main domain (which has SSL) while showing their site content.

### Option 3: Custom Domain Support Only

Remove subdomain functionality and require users to:
1. Build their site in the platform
2. Connect their own custom domain (which they configure DNS/SSL for)
3. Preview sites only within the dashboard

### Option 4: Use GitHub Pages / Netlify / Vercel

Deploy each user's site to a platform that provides automatic SSL:

1. When a site is published, export it as static HTML/CSS/JS
2. Deploy to Vercel/Netlify with auto-SSL
3. Give users a URL like `yoursite.vercel.app` or `yoursite.netlify.app`

## Current Implementation Status

### What Works:
✅ Site generation with AI
✅ Visual editor for customization
✅ Database storage of site content
✅ Preview within the dashboard

### What Needs SSL Configuration:
❌ Direct subdomain access (e.g., `yoursite.cdmsuite.com`)
❌ Live site hosting on subdomains
❌ Public sharing of subdomain URLs

## Temporary Solution for Testing

For development/testing purposes:

1. **Preview Mode**: Use the preview page within the dashboard
   - Route: `/builder/preview/[id]`
   - This stays on the main domain with SSL

2. **Local Development**: Test subdomain functionality locally without HTTPS

3. **Browser Override**: In development, you can bypass SSL errors:
   - Chrome: Type `thisisunsafe` when you see the error
   - Accept the security warning (only for testing!)

## Next Steps for Production

To enable full subdomain functionality with SSL:

1. **Get Wildcard SSL Certificate**:
   ```bash
   # Using Let's Encrypt (free)
   certbot certonly --dns-cloudflare -d '*.cdmsuite.com'
   ```

2. **Configure DNS** for wildcard subdomains

3. **Update Nginx/Server Config**:
   ```nginx
   server {
       listen 443 ssl;
       server_name *.cdmsuite.com;
       
       ssl_certificate /path/to/wildcard.crt;
       ssl_certificate_key /path/to/wildcard.key;
       
       # Route to appropriate project based on subdomain
       # ...
   }
   ```

4. **Deploy Subdomain Router**: Create a service that:
   - Reads the subdomain from the request
   - Looks up the project in the database
   - Renders the appropriate site content

## User Communication

Until SSL is configured, inform users:

> "Your site is being built! While we're setting up hosting, you can preview your site within the dashboard. We'll notify you when your site is live at yourname.cdmsuite.com"

This manages expectations while you implement the proper SSL infrastructure.

## Questions?

If you need help implementing any of these solutions, please let me know which approach you'd like to take!
