# Social Media Sharing Guide - OCUS Job Hunter

## The Problem
Your website at https://jobhunter.one is being redirected through Replit's shield protection system, which causes social media platforms to see Replit's branding instead of your custom Open Graph meta tags.

## Permanent Solution: Custom Domain
1. Go to your Replit Deployment settings
2. Click "Custom Domain"
3. Add your domain (jobhunter.one)
4. Copy the A and TXT records provided by Replit
5. Add these records to your domain registrar's DNS settings
6. Wait for DNS propagation (up to 48 hours)

## Immediate Workaround for Social Media

Until the custom domain is properly configured, use these sharing strategies:

### Option 1: Manual Sharing Content
Use this pre-formatted content for social media posts:

**Title:** OCUS Job Hunter - Premium Chrome Extension

**Description:** Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.

**Image:** Use the attached OG image from your admin panel

**Link:** https://jobhunter.one/

### Option 2: Use Direct Image Links
For platforms that allow image uploads, use your custom Open Graph image:
- Download from Admin Panel → SEO Settings → Custom Images
- Upload directly to social media posts

### Option 3: LinkedIn Article/Post
Create a LinkedIn article or detailed post with:
- Custom image as header
- Detailed description of the extension features
- Link to https://jobhunter.one/

### Option 4: Video Content
Create a short demo video showing:
- Extension installation
- Mission detection in action
- Benefits for photographers
- Upload to YouTube/LinkedIn with custom thumbnail

## Testing Social Media Previews

After setting up the custom domain, test with:
1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

## Current Meta Tags Available
Your site has been configured with proper Open Graph meta tags:
- og:title: "OCUS Job Hunter - Premium Chrome Extension"
- og:description: "Boost your photography career with OCUS Job Hunter Chrome Extension..."
- og:image: Custom uploaded image
- og:url: https://jobhunter.one/
- Twitter Card: summary_large_image

These will work correctly once the custom domain DNS is properly configured.

## Next Steps
1. Set up custom domain in Replit Deployment settings
2. Configure DNS records with your domain registrar
3. Wait for propagation
4. Clear social media cache using the testing tools above
5. Your custom branding will then appear correctly on all social platforms