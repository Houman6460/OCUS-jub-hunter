# Social Media Image Setup Guide

## Current Status
✅ **Deployment is working** - Social media sharing is now functional!
❌ **No custom image uploaded** - Currently using default SVG

## How to Upload Your Custom Social Media Image

### Step 1: Upload Custom Image in Admin Panel
1. Go to **Admin Dashboard** → **SEO Settings**
2. In the **"Social Media Preview"** section, click **"Choose Cover Image"**
3. Upload an image with these specifications:
   - **Size**: 1200x630 pixels (recommended)
   - **Format**: PNG, JPG, or JPEG
   - **Content**: Professional design with your branding
   - **Text**: Readable on all devices

### Step 2: Test Your Upload
1. After uploading, save the SEO settings
2. Check the preview in the admin panel
3. The preview should show your uploaded image

### Step 3: Test Social Media Sharing
Use these URLs for testing:
- **Primary sharing URL**: `https://jobhunter.one/share`
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Validator**: https://cards-dev.twitter.com/validator

## Why No Image Is Showing Currently
Your SEO settings show:
```json
"customOgImage": null
"ogImage": "/og-image.svg"
```

This means:
- No custom image has been uploaded yet
- System is using the default SVG file
- Social media platforms may not display SVG images properly

## Quick Fix Options

### Option 1: Upload Custom Image (Recommended)
Upload a proper 1200x630 PNG image through the admin panel.

### Option 2: Use Default for Now
The current SVG image will work for sharing, but may not display optimally on all platforms.

### Option 3: Test Current Setup
Your `/share` endpoint is working. Test it at:
https://jobhunter.one/share

## Image Requirements for Best Results
- **Dimensions**: 1200x630 pixels
- **File size**: Under 1MB
- **Format**: PNG or JPG (not SVG)
- **Content**: Clear, readable text and branding
- **Safe area**: Keep important content in center 1200x500 area

Once you upload a custom image through the admin panel, it will automatically appear in all social media shares!