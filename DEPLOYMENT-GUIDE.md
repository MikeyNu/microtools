# ToolHub Deployment Guide for GoDaddy Hosting

This guide will help you deploy your ToolHub website to GoDaddy hosting with AdSense integration.

## Prerequisites

- GoDaddy hosting account (cPanel or similar)
- Google AdSense account (approved)
- Node.js installed locally
- Git repository access

## Step 1: AdSense Setup

### 1.1 Get Your AdSense Publisher ID
1. Log into your Google AdSense account
2. Go to **Account** → **Account Information**
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXX`)

### 1.2 Create Ad Units
1. In AdSense, go to **Ads** → **By ad unit**
2. Create the following ad units:
   - **Header Banner** (728x90 Leaderboard)
   - **Sidebar Rectangle** (300x250 Medium Rectangle)
   - **Content Banner** (728x90 Leaderboard)
   - **Footer Rectangle** (300x250 Medium Rectangle)
   - **Mobile Banner** (320x50 Mobile Banner)

3. Copy each Ad Unit ID for later use

## Step 2: Configure Environment Variables

### 2.1 Create Production Environment File
Create `.env.production` in your project root:

```env
# AdSense Configuration
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_ACTUAL_ID
NEXT_PUBLIC_SHOW_ADS=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=ToolHub

# Production Environment
NODE_ENV=production
```

### 2.2 Update AdSense Configuration
Edit `lib/adsense-config.ts` and replace the placeholder ad unit IDs:

```typescript
adUnits: {
  headerBanner: "YOUR_HEADER_AD_UNIT_ID",
  toolSidebar: "YOUR_SIDEBAR_AD_UNIT_ID",
  toolContent: "YOUR_CONTENT_AD_UNIT_ID",
  toolFooter: "YOUR_FOOTER_AD_UNIT_ID",
  mobileSticky: "YOUR_MOBILE_AD_UNIT_ID",
  // ... other ad units
},
```

## Step 3: Build for Production

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Build Static Site
```bash
npm run build
```

This creates an `out` folder with your static website.

## Step 4: Deploy to GoDaddy

### 4.1 Access Your GoDaddy Hosting
1. Log into your GoDaddy account
2. Go to **My Products** → **Web Hosting**
3. Click **Manage** next to your hosting plan
4. Open **File Manager** or use FTP

### 4.2 Upload Files
1. Navigate to your domain's `public_html` folder
2. Delete any existing files (backup first if needed)
3. Upload all contents from the `out` folder to `public_html`
4. Ensure the file structure looks like:
   ```
   public_html/
   ├── _next/
   ├── calculators/
   ├── converters/
   ├── index.html
   ├── favicon.ico
   └── ... other files
   ```

### 4.3 Configure Domain Settings
1. In GoDaddy, go to **DNS Management**
2. Ensure your domain points to your hosting
3. Wait for DNS propagation (up to 24 hours)

## Step 5: Verify AdSense Integration

### 5.1 Test Your Website
1. Visit your live website
2. Open browser developer tools
3. Check for AdSense script loading:
   ```javascript
   // Should see in Network tab:
   // pagead2.googlesyndication.com/pagead/js/adsbygoogle.js
   ```

### 5.2 AdSense Verification
1. In Google AdSense, go to **Sites**
2. Add your domain if not already added
3. Verify site ownership
4. Wait for ad review (can take 24-48 hours)

## Step 6: Optimize for Performance

### 6.1 Enable Compression (if available)
In GoDaddy cPanel:
1. Look for **Optimize Website** or **Compression**
2. Enable Gzip compression

### 6.2 Set Up Caching
1. Check if your GoDaddy plan includes caching
2. Enable browser caching in cPanel if available

## Step 7: Monitor and Maintain

### 7.1 AdSense Performance
- Monitor earnings in AdSense dashboard
- Adjust ad placements based on performance
- Ensure compliance with AdSense policies

### 7.2 Website Updates
To update your website:
1. Make changes locally
2. Run `npm run build`
3. Upload new `out` folder contents to GoDaddy

## Troubleshooting

### Ads Not Showing
1. **Check Publisher ID**: Ensure it's correct in environment variables
2. **Ad Unit IDs**: Verify all ad unit IDs are correct
3. **AdSense Status**: Check if your AdSense account is approved
4. **Browser**: Test in incognito mode (ad blockers can hide ads)
5. **Time**: New sites may take 24-48 hours for ads to appear

### Website Not Loading
1. **File Permissions**: Ensure files have correct permissions (644 for files, 755 for folders)
2. **Index File**: Verify `index.html` exists in `public_html`
3. **DNS**: Check domain DNS settings

### Performance Issues
1. **Image Optimization**: Ensure images are optimized
2. **Caching**: Enable all available caching options
3. **CDN**: Consider using a CDN for better performance

## Security Considerations

1. **HTTPS**: Ensure your GoDaddy hosting has SSL enabled
2. **Environment Variables**: Never commit `.env.production` to version control
3. **Regular Updates**: Keep dependencies updated

## Support

For additional help:
- **GoDaddy Support**: Contact for hosting-related issues
- **Google AdSense Help**: For ad-related problems
- **Next.js Documentation**: For technical questions

---

**Note**: This deployment creates a static website that works perfectly with GoDaddy's shared hosting. All interactive features (calculators, converters) work client-side without requiring server-side functionality.