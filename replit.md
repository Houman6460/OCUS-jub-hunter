# OCUS Job Hunter - E-commerce Platform

## Overview
OCUS Job Hunter is an e-commerce platform selling a premium Chrome extension that automates job hunting for photographers on OCUS. The platform features a React/TypeScript frontend and an Express/Node.js backend, supporting dual payment processing (Stripe, PayPal), automated email delivery, and AI-powered live chat. The Chrome extension provides intelligent mission detection, a 3-mission trial system, floating panel counters, and unlimited usage after activation. The project aims to provide a robust, user-friendly, and scalable solution for digital product sales, streamlining job hunting for OCUS photographers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite.
- **UI/UX**: Radix UI primitives with shadcn/ui components, styled with Tailwind CSS. Includes interactive tutorial onboarding and comprehensive mobile responsiveness.
- **State Management**: TanStack Query for server state; local React state.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.

### Backend Architecture
- **Runtime**: Node.js with Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: OAuth integration (Google OAuth), dynamic password management.
- **File Storage**: Local filesystem with Multer for uploads.
- **Email Service**: Nodemailer for automated email delivery.
- **AI Integration**: OpenAI-powered live chat bot.

### Payment Processing
- **Dual Gateway**: Integrated Stripe and PayPal for order creation, payment processing, confirmation emails, and secure download token generation.
- **Pricing**: Dynamic pricing synchronization from admin dashboard.

### Key Features
- **Database Schema**: Manages Users (admin, Stripe customer integration), Orders, Products, Downloads, Trial Usage, and SEO Settings.
- **Services**: EmailService for confirmations, FileService for secure digital product management.
- **Pages**: Product showcase (Home), Dual payment checkout, Comprehensive admin dashboard (Analytics, Customers, Payments, Chat, Files, Users, SEO), User dashboard (Profile, Orders, Downloads, Support, Billing, Reviews, Preferences), 404 handler.
- **Data Flow**: Streamlined purchase to secure download; Admin for monitoring; Secure token-based download system; Secure user authentication and authorization.
- **Security Enhancements**: Environment variable management, secure download token generation, file access validation, admin access controls, OAuth credential handling.
- **Additional Features**: Affiliate program, enhanced ticket system, privacy policy system, invoice/receipt system, and dynamic social media sharing system.
- **Social Media Integration**: Dynamic meta tag generation for proper Facebook/Twitter sharing with custom cover images, comprehensive SEO management through admin panel.

### Chrome Extension Features (Two-Version System)
- **Core Functionality**: Mission detection, acceptance, floating panel counters (ACCEPTED, OPENED, LOGINS, REFRESHING), refresh timer, sound alerts, and home navigation after mission acceptance.
- **Trial Version**: 3-mission limit enforced server-side with device fingerprinting and complete disablement after limit. UI text: "Tests Available".
- **Premium Version**: Unlimited mission acceptance, no restrictions, premium branding.
- **Server-Side Security**: Trial tracking with unique extensionId-userFingerprint combination prevents cross-browser abuse.
- **Real-time Trial Tracking**: Live API validation for trial usage.
- **User Interface**: Always-visible floating panel with quick refresh interval buttons; version-specific branding and messaging.

## External Dependencies

### Payment Providers
- **Stripe**: Credit card processing.
- **PayPal**: Alternative payment method.

### Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting.
- **Email SMTP**: Configurable email service.

### AI Services
- **OpenAI**: AI services for live chat bot.

## Recent Changes (August 13, 2025)

### CRITICAL SECURITY FIXES - User Data Isolation Complete ✅
Successfully fixed all cross-user data leakage vulnerabilities in the dashboard system:

#### Security Vulnerabilities Eliminated
- **Cross-User Orders Access**: Removed `/api/user/:userId/orders` endpoint that allowed any user to view any other user's orders by URL manipulation
- **Cross-User Purchase Status**: Fixed `/api/user/:userId/purchase-status` to prevent access to other users' purchase information
- **Tickets System Breach**: Replaced client-side authorization with server-side session validation for all ticket operations
- **Missing Ownership Verification**: Added proper ownership checks for all user-specific operations

#### New Secure Endpoints Implemented
- **`/api/me/orders`** - Server-side authenticated user orders only
- **`/api/me/purchase-status`** - Session-validated purchase status
- **`/api/me/tickets`** - User's own tickets via server-side email validation
- **`/api/me`** - Secure user profile (password excluded)
- **`/api/me/downloads`** - User downloads with proper database joins

#### Security Architecture Enhancements
- **Authentication Middleware**: All user endpoints now require `requireAuth` middleware
- **Server-Side Session Validation**: No client-provided user IDs accepted for authorization
- **Ownership Verification**: Every ticket/order operation validates ownership before access
- **Database Query Scoping**: All queries properly filtered by authenticated user ID
- **Rate Limiting Security**: Fixed trust proxy configuration to prevent IP-based bypasses

#### Benefits Achieved
- **Complete Data Isolation**: Users can only access their own data across all systems
- **GDPR Compliance**: Proper data access controls implemented
- **Audit Trail**: All access attempts logged and verified
- **Session Security**: Server-side validation prevents tampering attacks
- **Zero Cross-User Leakage**: Comprehensive testing confirms no data bleeding between accounts

**Impact**: 🔒 All critical user data isolation vulnerabilities have been completely eliminated with comprehensive server-side security controls.

### Installation Steps Multi-Language Fix Completed
Successfully fixed missing installation steps across all languages:

#### Installation Guide Language Support
- **Complete Step Coverage**: Added all 6 installation steps for Spanish, Danish, Norwegian, German, Finnish, and Turkish languages
- **Consistent Experience**: All 9 languages (English, Français, Português, Español, Dansk, Norsk, Deutsch, Suomi, Türkçe) now display complete installation guides
- **Bug Resolution**: Fixed issue where steps 4 and 6 were missing from home page display in multiple languages
- **Fallback Array Update**: Updated home.tsx fallback array from 5 to 6 steps to match translation files

#### Installation Steps Include
1. Download extension file
2. Open browser extension settings  
3. Enable Developer Mode
4. Load unpacked extension and select folder
5. Pin extension to toolbar
6. Start finding photography jobs

#### Benefits
- **Unified User Experience**: Consistent installation guidance across all supported languages
- **Reduced Support Burden**: Users can follow complete instructions in their preferred language
- **Professional Quality**: No missing steps or incomplete translations affecting user onboarding

### Multi-Language Privacy Policy Implementation
Successfully implemented comprehensive multi-language support for the privacy policy page:

#### Privacy Policy Language Support
- **Language Selector Integration**: Added LanguageSelector component with dropdown menu supporting all 9 languages (English, Français, Português, Español, Dansk, Norsk, Deutsch, Suomi, Türkçe)
- **Professional Navigation**: Implemented sticky navigation header with Shield icon, privacy branding, and consistent styling matching the manual page
- **Hero Section**: Created attractive hero section with privacy focus and last updated timestamp
- **Translation Ready**: Complete translation structure already in place through existing translations.ts system
- **Responsive Design**: Fully responsive design with mobile-optimized language selector
- **Consistent UX**: Maintains same interaction patterns and visual design as manual page for consistent user experience

#### Benefits
- **Unified Experience**: Privacy policy now matches manual page functionality and design
- **Global Accessibility**: Users can read privacy policy in their preferred language
- **Professional Appearance**: Enhanced branding with Shield icon and privacy-focused messaging
- **Easy Navigation**: Sticky header with language selector for seamless language switching

## Previous Changes (August 11, 2025)

### Development Resilience Improvements
Applied critical fixes to improve development experience and server stability:

#### Database Initialization (server/db.ts)
- **Dev-Safe Database Setup**: Modified database initialization to use proxy pattern that only throws errors when database operations are actually accessed, not during server startup
- **Impact**: Server can now start in development without DATABASE_URL configured, enabling testing of non-database endpoints

#### Translation Service (server/translationService.ts) 
- **Lazy OpenAI Initialization**: Replaced top-level OpenAI client creation with lazy initialization pattern
- **Graceful Degradation**: Returns empty translation maps instead of crashing when OPENAI_API_KEY is missing
- **Impact**: OpenAI-dependent features are disabled gracefully without preventing server startup

#### API Route Improvements (server/routes.ts)
- **Activation System Deprecation**: Converted legacy activation endpoints to return HTTP 410 Gone:
  - `POST /api/validate-activation-key` → 410 Gone
  - `GET /api/recent-activation-keys` → 410 Gone  
  - `GET /api/download-activation/:token` → 410 Gone
  - `POST /api/admin/users/:userId/regenerate-code` → 410 Gone
- **Dashboard Features Fallback**: Added safe default responses for dashboard feature endpoints when database is unavailable
- **Impact**: Legacy functionality properly deprecated while maintaining backwards compatibility

#### Frontend UI Cleanup (client/src/pages/admin.tsx)
- **Activation UI Removal**: Removed regenerate-code button and mutation from UserManagementTab
- **Clean Deprecation**: Added comments explaining activation system deprecation
- **Impact**: Admin interface no longer exposes deprecated activation functionality

#### Benefits
- **Development Mode**: Server runs reliably without external dependencies (DATABASE_URL, OPENAI_API_KEY)
- **Production Safety**: Database and API operations still throw clear errors when actually accessed
- **Graceful Degradation**: Missing API keys disable features rather than crash the server
- **Endpoint Verification**: All health checks and feature toggles work correctly in both development and production modes

### Testing Results
- Health endpoint: ✅ `GET /api/health` returns 200
- Feature toggles: ✅ `GET /api/dashboard-features` returns safe defaults
- Deprecated endpoints: ✅ All activation endpoints return 410 Gone as expected
- Server startup: ✅ No crashes, clean initialization with helpful logging