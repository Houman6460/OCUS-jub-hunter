# Social Media Cache Clearing Guide

## The Issue
Social media platforms (LinkedIn, Telegram, Facebook, Twitter) cache link previews. Even though we fixed the technical issue, they're still showing old cached Replit branding.

## Solution: Clear Social Media Caches

### 1. LinkedIn Cache Clearing
**URL**: https://www.linkedin.com/post-inspector/
1. Enter your URL: `https://jobhunter.one/share`
2. Click "Inspect"
3. This forces LinkedIn to re-fetch and cache the new preview
4. Test with your main domain: `https://jobhunter.one/`

### 2. Facebook Cache Clearing
**URL**: https://developers.facebook.com/tools/debug/
1. Enter your URL: `https://jobhunter.one/share`
2. Click "Debug"
3. Click "Scrape Again" to refresh cache
4. Test both URLs:
   - `https://jobhunter.one/share`
   - `https://jobhunter.one/`

### 3. Twitter Cache Clearing
**URL**: https://cards-dev.twitter.com/validator
1. Enter your URL: `https://jobhunter.one/share`
2. Click "Preview card"
3. This updates Twitter's cache

### 4. Telegram Cache Clearing
Telegram doesn't have a public tool, but you can:
1. Share the link in a test chat
2. Wait 24 hours for automatic cache refresh
3. Or contact @BotFather for manual cache clearing

## Technical Fix Applied
✅ Social media crawlers now get redirected to `/share` endpoint
✅ All meta tags are properly configured
✅ Images are served correctly
✅ No more Replit branding in the response

## What URLs to Test
- **Primary**: `https://jobhunter.one/share`
- **Secondary**: `https://jobhunter.one/`
- Both should now work without Replit branding

## Timeline
- **Immediate**: Facebook, LinkedIn, Twitter (after cache clearing)
- **24 hours**: Telegram (automatic refresh)
- **48 hours**: All platforms (complete cache expiration)

## Verification
After clearing caches, you should see:
- ✅ Your custom title: "OCUS Job Hunter - Premium Chrome Extension"
- ✅ Your description: "Boost your photography career..."
- ✅ Your custom image (once uploaded in admin panel)
- ❌ No more Replit branding or "Sign Up" messages