# 🚀 AdSense Production Deployment Checklist

## 🎯 BEFORE YOU START

### Prerequisites
- [ ] Google AdSense account approved and active
- [ ] Domain ownership verified in AdSense dashboard
- [ ] Website complies with AdSense content policies
- [ ] Privacy policy page accessible at `/privacy`

## 📋 STEP-BY-STEP DEPLOYMENT GUIDE

### Step 1: AdSense Account Setup
- [ ] **Get Publisher ID**: AdSense Dashboard → Account → Account Information
- [ ] **Add Your Domain**: AdSense Dashboard → Sites → Add site
- [ ] **Wait for Approval**: Allow 24-48 hours for domain approval
- [ ] **Create Ad Units** (Optional): AdSense Dashboard → Ads → By ad unit

### Step 2: Environment Configuration
- [ ] **Copy Template**: `cp .env.local.production-ready .env.local`
- [ ] **Set Publisher ID**: Replace `YOUR_PUBLISHER_ID_HERE` with your actual ID
  ```bash
  # Format: pub-1234567890123456 (WITHOUT "ca-" prefix)
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-YOUR_ACTUAL_ID
  ```
- [ ] **Enable Ads**: Set `NEXT_PUBLIC_SHOW_ADS=true`
- [ ] **Set Site URL**: Update `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

### Step 3: Code Configuration (Choose One)

#### Option A: Auto Ads (Recommended - Easier Setup)
- [ ] **Keep Default Settings**: Auto ads will be enabled automatically
- [ ] **No Additional Configuration**: Skip ad unit ID setup
- [ ] **Google Optimizes Placement**: AdSense will automatically place ads

#### Option B: Manual Ad Units (Advanced - More Control)
- [ ] **Create Ad Units** in AdSense Dashboard:
  - [ ] Header Banner (728x90 leaderboard)
  - [ ] Homepage Hero (responsive display)
  - [ ] Tool Sidebar (300x250 rectangle)
  - [ ] Mobile Banner (320x50)
- [ ] **Update Environment Variables** with real ad unit IDs
- [ ] **Verify Ad Unit IDs** in `lib/adsense-config.ts`

### Step 4: Build and Test
- [ ] **Install Dependencies**: `npm install`
- [ ] **Build Production**: `npm run build`
- [ ] **Test Locally**: `npm run start` (check for errors)
- [ ] **Verify Ad Script Loading**: Open DevTools → Network tab → Look for `googlesyndication.com`

### Step 5: Deploy to Production
- [ ] **Upload Files**: Deploy `out/` folder to your hosting provider
- [ ] **Verify HTTPS**: Ensure site loads over HTTPS
- [ ] **Test Live Site**: Visit your domain and verify ads appear
- [ ] **Check Mobile**: Test responsive ads on mobile devices

## 🔍 VERIFICATION CHECKLIST

### Technical Verification
- [ ] **AdSense Script Loads**: Check Network tab for `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`
- [ ] **No Console Errors**: Check browser console for AdSense-related errors
- [ ] **Publisher ID Correct**: Verify in page source: `ca-pub-YOUR_ID`
- [ ] **Auto Ads Active**: Look for `enable_page_level_ads: true` in network requests

### AdSense Dashboard Verification
- [ ] **Site Status**: Green checkmark in AdSense → Sites
- [ ] **Ads.txt File**: If required, add ads.txt to your domain root
- [ ] **Policy Compliance**: No policy violations in AdSense dashboard
- [ ] **Earnings Tracking**: Revenue should appear within 24-48 hours

### Performance Verification
- [ ] **Page Load Speed**: Test with Google PageSpeed Insights
- [ ] **Mobile Friendly**: Test with Google Mobile-Friendly Test
- [ ] **Core Web Vitals**: Ensure ads don't hurt performance scores

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue: Ads Not Showing
**Solutions:**
- [ ] Wait 24-48 hours after domain approval
- [ ] Check if domain is approved in AdSense → Sites
- [ ] Verify publisher ID format (pub-1234567890123456)
- [ ] Ensure `NEXT_PUBLIC_SHOW_ADS=true` in production
- [ ] Check for ad blockers during testing

### Issue: AdSense Policy Violations
**Solutions:**
- [ ] Review AdSense Policy Center for violations
- [ ] Ensure privacy policy is accessible
- [ ] Check content quality and originality
- [ ] Verify ad placement doesn't interfere with navigation

### Issue: Low Ad Revenue
**Solutions:**
- [ ] Enable Auto Ads for better optimization
- [ ] Test different ad placements
- [ ] Improve page load speed
- [ ] Increase organic traffic

## 📊 MONITORING & OPTIMIZATION

### Daily Tasks
- [ ] **Check AdSense Dashboard**: Monitor earnings and performance
- [ ] **Review Policy Center**: Ensure no new violations
- [ ] **Monitor Page Speed**: Keep Core Web Vitals optimized

### Weekly Tasks
- [ ] **Analyze Ad Performance**: Review top-performing pages
- [ ] **Test Mobile Experience**: Ensure responsive ads work properly
- [ ] **Review Traffic Sources**: Optimize for high-value traffic

### Monthly Tasks
- [ ] **Optimize Ad Placements**: Test new positions for better revenue
- [ ] **Review Content Strategy**: Create high-value content for users
- [ ] **Update SEO**: Improve organic traffic growth

## 🆘 SUPPORT RESOURCES

### Official Support
- **AdSense Help**: https://support.google.com/adsense
- **Policy Center**: https://www.google.com/adsense/app/#policycenter
- **Community Forum**: https://support.google.com/adsense/community

### Troubleshooting Tools
- **AdSense Auto Ads Checker**: AdSense Dashboard → Ads → Auto ads
- **Page Speed Insights**: https://pagespeed.web.dev/
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

## ✅ PRODUCTION DEPLOYMENT SIGN-OFF

### Before Going Live
- [ ] All checklist items above are completed
- [ ] Site tested thoroughly on staging environment
- [ ] AdSense account is approved and active
- [ ] All placeholder values replaced with real data
- [ ] Privacy policy and terms of service are published
- [ ] Site complies with all AdSense policies

### After Going Live
- [ ] Ads are displaying correctly on live site
- [ ] No console errors related to AdSense
- [ ] Mobile ads are working properly
- [ ] AdSense dashboard shows site activity
- [ ] Revenue tracking is functional

---

## 🎉 CONGRATULATIONS!

Your AdSense integration is now live and ready to generate revenue. Remember to:
- Monitor performance regularly
- Stay compliant with AdSense policies  
- Optimize based on data and user feedback
- Keep improving your content and user experience

**Estimated Setup Time**: 2-4 hours (excluding AdSense approval wait time)
**First Revenue**: Typically visible within 24-48 hours after ads go live