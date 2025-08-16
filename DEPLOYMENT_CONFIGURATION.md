# OCUS Job Hunter - Complete Configuration Guide

## 📋 Project Overview
- **Project Name**: OCUS Job Hunter
- **Type**: Full-stack React + Node.js application with TypeScript
- **Architecture**: React SPA frontend + Cloudflare Functions backend
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Cloudflare Pages

## 🌐 Live Deployment URLs

### Production Deployment
- **Main URL**: https://915ba357.ocus-jub-hunter2.pages.dev/
- **Health Check**: https://915ba357.ocus-jub-hunter2.pages.dev/health
- **Debug Page**: https://915ba357.ocus-jub-hunter2.pages.dev/debug

### API Endpoints
- **Customer Login**: `/api/customer/login`
- **Admin Login**: `/api/admin/login`
- **Dashboard Features**: `/api/admin/dashboard-features`
- **Tickets**: `/api/tickets`
- **Health**: `/health`

## 📁 Local Development Setup

### Repository Location
```bash
/Users/houmanghavamzadeh/Documents/GitHub/OCUS-jub-hunter/
```

### Key Directories
- **Client Source**: `/client/src/` (React TypeScript)
- **Server Source**: `/server/` (Node.js TypeScript)
- **Functions**: `/functions/` (Cloudflare Functions)
- **Shared**: `/shared/` (Database schema & types)
- **Build Output**: `/dist/` (Built assets)

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# TypeScript compilation
npx tsc --noEmit
```

## 🔧 GitHub Configuration

### Repository Details
- **Owner**: Houman6460
- **Repository**: OCUS-jub-hunter
- **Main Branch**: `main`
- **Deployment Branch**: `pages`
- **Repository URL**: https://github.com/Houman6460/OCUS-jub-hunter.git

### Latest Commits (pages branch)
- `d977276e` - Add comprehensive API endpoints for dashboard functionality
- `59ca7fb1` - Add ticket system API endpoints
- `3d6d221c` - Add dashboard features control API
- `6bcfec38` - Add essential API endpoints for login
- `edce54fe` - Add simple _redirects file for SPA routing

### Git Commands
```bash
# Clone repository
git clone https://github.com/Houman6460/OCUS-jub-hunter.git

# Switch to deployment branch
git checkout pages

# Push changes
git add .
git commit -m "Your commit message"
git push origin pages
```

## ☁️ Cloudflare Pages Configuration

### Project Settings
- **Project Name**: ocus-jub-hunter2
- **Deployment ID**: 915ba357
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Build Output**: `dist/public`
- **Root Directory**: `/`

### Environment Variables Needed
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Email Service
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@example.com

# Payment Providers
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Security
JWT_SECRET=your-jwt-secret
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret

# API Configuration
API_BASE=https://your-api-domain.com
```

### Cloudflare Functions Structure
```
functions/
├── api/
│   ├── customer/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── profile.ts
│   │   └── stats.ts
│   ├── admin/
│   │   ├── login.ts
│   │   ├── stats.ts
│   │   ├── tickets.ts
│   │   ├── dashboard-features.ts
│   │   ├── auth-settings.ts
│   │   └── payment-settings.ts
│   ├── tickets.ts
│   ├── tickets/[id].ts
│   ├── tickets/[id]/messages.ts
│   ├── invoices.ts
│   ├── invoices/[id]/pdf.ts
│   └── auth-settings.ts
└── health.ts
```

## 🔑 Authentication Credentials

### Demo Login Credentials
- **Customer**: `demo@example.com` / `demo123`
- **Admin**: `admin` / `admin123`

### Feature Access
- **Dashboard Features Control**: Available in admin panel
- **Ticket System**: Functional for both users and admins
- **Invoice System**: Demo invoices available
- **Statistics**: Demo data for both dashboards

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (client-side routing)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite
- **Forms**: React Hook Form

### Backend
- **Runtime**: Cloudflare Functions (Edge Runtime)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT implementation
- **File Uploads**: FormData handling
- **Email**: Nodemailer integration

### Development Tools
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Tailwind**: Utility-first CSS

## 🚀 Deployment Process

### Automatic Deployment
1. Push changes to `pages` branch
2. Cloudflare Pages automatically builds and deploys
3. Functions are deployed alongside static assets
4. Environment variables are injected at runtime

### Manual Deployment Steps
```bash
# 1. Build locally
npm run build

# 2. Commit and push
git add .
git commit -m "Deploy updates"
git push origin pages

# 3. Monitor deployment at Cloudflare Pages dashboard
```

## 🔍 Troubleshooting

### Common Issues
1. **Redirect Loop**: Cloudflare caching issue - wait 24-48 hours or create new deployment
2. **API 405 Errors**: Missing function endpoints - check functions/ directory
3. **Build Failures**: TypeScript errors - run `npx tsc --noEmit` to check
4. **CORS Issues**: Add proper headers to function responses

### Debug Tools
- **Health Endpoint**: `/health` - Check API status
- **Debug Page**: `/debug` - System diagnostics
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor API requests

## 📝 File Structure
```
OCUS-jub-hunter/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── public/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── emailService.ts
│   └── ...
├── functions/
│   └── api/
├── shared/
│   └── schema.ts
├── public/
│   ├── index.html
│   ├── _redirects
│   └── assets/
├── dist/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Next Steps for New Chat Session

1. **Clone Repository**: `git clone https://github.com/Houman6460/OCUS-jub-hunter.git`
2. **Switch Branch**: `git checkout pages`
3. **Install Dependencies**: `npm install`
4. **Check Status**: Verify all files are present and TypeScript compiles
5. **Test Locally**: `npm run dev` (if needed)
6. **Deploy**: Push changes to `pages` branch for automatic deployment

## 📊 Current Status
- ✅ All TypeScript errors resolved
- ✅ Build process working
- ✅ API endpoints functional
- ✅ Authentication system working
- ✅ Dashboard features complete
- ✅ Ticket system operational
- 🔄 Cloudflare deployment active (redirect loop issue may persist)

---
**Last Updated**: 2025-08-16
**Commit**: d977276e
**Status**: Production Ready
