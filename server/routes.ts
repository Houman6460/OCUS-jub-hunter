import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import Stripe from "stripe";
import multer from "multer";
import { DatabaseStorage } from "./storage";
import OpenAI from "openai";
import { emailService } from "./emailService";
import { fileService } from "./fileService";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import validator from "validator";
import { orders, customers, extensionUsageStats, users, tickets, ticketMessages, missions, userTrials } from "@shared/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import archiver from "archiver";
import path from "path";
import { configurePassport, reinitializeStrategies } from './socialAuth';
import session from "express-session";
import { captchaService } from "./captcha";
import { TranslationService } from "./translationService";
import { AffiliateService } from "./affiliateService";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import cors from 'cors';
import { generateInvoicePDF } from './invoicePdfService';
import { existsSync, createReadStream } from 'fs';
import { promises as fsp } from 'fs';
import * as fsSync from 'fs';
import { z } from "zod";
import type { DbInstance } from './db';

declare global {
  namespace Express {
    interface User {
      id: number;
      isAdmin?: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}

// Dynamic Stripe setup - use database keys if available, fallback to env
let stripe: Stripe | null = null;
let currentStripeKey: string | null = null;

async function initializeStripe(storage: DatabaseStorage) {
  try {
    // Try to get Stripe keys from database (admin settings - stored in authSettings)
    const authSettings = await storage.getAuthSettings?.();
    let stripeSecretKey: string | null = null;
    
    if (authSettings?.stripeSecretKey) {
      // Use database key (from admin dashboard)
      stripeSecretKey = authSettings.stripeSecretKey;
      console.log('Using Stripe keys from database (admin settings)');
      console.log('Database secret key starts with:', stripeSecretKey.substring(0, 8) + '...');
    } else {
      console.log('No payment settings found in database, checking environment');
      // Fallback to environment variables
      stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || null;
      if (stripeSecretKey) {
        console.log('Using Stripe keys from environment variables');
        console.log('Environment secret key starts with:', stripeSecretKey.substring(0, 8) + '...');
      }
    }
    
    if (stripeSecretKey && stripeSecretKey !== currentStripeKey) {
      stripe = new Stripe(stripeSecretKey);
      currentStripeKey = stripeSecretKey;
      
      // Log Stripe mode for debugging
      const isLive = stripeSecretKey.startsWith('sk_live_');
      console.log(`Stripe initialized in ${isLive ? 'LIVE' : 'TEST'} mode`);
    }
    
    if (!stripeSecretKey) {
      console.warn('No Stripe secret key found in database or environment - Stripe integration disabled');
    }
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    // Fallback to environment variables
    const envKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (envKey) {
      stripe = new Stripe(envKey);
      currentStripeKey = envKey;
      const isLive = envKey.startsWith('sk_live_');
      console.log(`Stripe initialized from ENV in ${isLive ? 'LIVE' : 'TEST'} mode`);
    }
  }
}


// OpenAI setup
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('Missing OPENAI_API_KEY - Chat functionality disabled');
}

// Secure multer setup for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit (reduced for security)
    files: 3 // Maximum 3 files
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow safe image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

async function createStripeCheckoutSession(stripe: Stripe, plan: string, customerId: string, successUrl: string, cancelUrl: string) {
  const isSubscription = plan === 'premium'; // Assuming premium is a subscription
  const priceId = isSubscription ? process.env.STRIPE_PREMIUM_PRICE_ID : process.env.STRIPE_BASIC_PRICE_ID;

  if (!priceId) {
    throw new Error('Price ID not configured for plan: ' + plan);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: isSubscription ? 'subscription' : 'payment',
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Ensure the checkout session completion event is sent to the webhook
    payment_intent_data: isSubscription ? undefined : {
      setup_future_usage: 'on_session',
    },
    subscription_data: isSubscription ? {
      trial_period_days: 7,
    } : undefined,
  });

  return session;
}

export default async function defineRoutes(app: Express, db: DbInstance): Promise<Server> {
  const storage = new DatabaseStorage(db);
  const affiliateService = new AffiliateService(db);
  // Passport is configured in server/index.ts

  const server = createServer(app);

  // Initialize Stripe now that we have a database connection
  await initializeStripe(storage);

  // In development, add an endpoint to reset the database for easier testing.
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/admin/reset-db', async (req: Request, res: Response) => {
      // Basic security check for development environment
      const secret = req.headers['x-admin-secret'];
      if (secret !== 'ocus-power-secret') {
        return res.status(403).send('Forbidden: Invalid admin secret.');
      }

      try {
        console.log('Attempting to reset database...');
        const schemaPath = './functions/schema.sql'; // Path is relative to project root
                const script = await fsp.readFile(schemaPath, 'utf8');
        
        // Execute the SQL script using raw queries
        await db.run(script);
        
        console.log('Database has been successfully reset and initialized.');
        res.status(200).send('Database reset successfully.');
      } catch (error) {
        console.error('Failed to reset database:', error);
        res.status(500).send('Error resetting database.');
      }
    });
  }

  // Rate limiting with different limits for different endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: "Too many authentication attempts, try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: { error: "Upload limit exceeded, try again later." },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Authentication middleware for admin routes
  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // If session-based admin is present, allow
    if (req.isAuthenticated?.() && req.user?.isAdmin) {
      return next();
    }

    // Otherwise, attempt to decode Bearer token similar to /api/auth/user
    const authHeader = req.headers?.authorization as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [type] = decoded.split(':');
        if (type === 'admin') {
          // Treat as admin for route access
          return next();
        }
      } catch (e) {
        // fall through to 401
      }
    }

    return res.status(401).json({ error: 'Admin access required' });
  };

  // Authentication middleware for user routes  
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Health check endpoints for deployment and monitoring
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'healthy',
      service: 'OCUS Job Hunter',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok',
      service: 'OCUS Job Hunter API',
      timestamp: new Date().toISOString(),
      version: '2.3.4'
    });
  });

  // Lightweight system health stub (no DB dependencies)
  // This endpoint is used by the automation UI to avoid 404s during development
  app.get('/api/system-health', (req: Request, res: Response) => {
    try {
      res.status(200).json({
        ok: true,
        status: 'ok',
        services: {
          server: 'ok',
          chromeRunner: 'unknown',
          puppeteer: 'unknown'
        },
        timestamp: new Date().toISOString()
      });
    } catch (_err) {
      res.status(200).json({ ok: false, status: 'degraded' });
    }
  });

  // Recovery stub endpoint to simulate recovery flows in development
  // Accepts optional query parameter: action=localhost|chrome|server
  app.get('/api/recovery', (req: Request, res: Response) => {
    const action = (req.query.action as string) || 'unknown';
    const id = uuidv4();
    res.status(200).json({
      ok: true,
      id,
      action,
      message: `Simulated recovery for action: ${action}`,
      timestamp: new Date().toISOString()
    });
  });

  // SEO Settings Management API with comprehensive image upload support
  app.get('/api/admin/seo-settings', requireAdmin, async (req: Request, res: Response) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      res.json(seoSettings || {});
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      res.status(500).json({ error: 'Failed to fetch SEO settings' });
    }
  });

  // SEO Settings with file upload support (FormData)
  app.put('/api/admin/seo-settings', requireAdmin, uploadLimiter, upload.fields([
    { name: 'customOgImage', maxCount: 1 },
    { name: 'customLogo', maxCount: 1 },
    { name: 'customFavicon', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    try {
      console.log('=== SEO SETTINGS UPLOAD DEBUG (FormData) ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Files received:', req.files ? Object.keys(req.files as any) : 'No files');
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const updateData = { ...req.body };

      // Debug file processing
      if (files?.customOgImage?.[0]) {
        const file = files.customOgImage[0];
        console.log('Processing customOgImage:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer.length
        });
        const base64Data = file.buffer.toString('base64');
        updateData.customOgImage = `data:${file.mimetype};base64,${base64Data}`;
        console.log('Base64 data length:', base64Data.length);
      }

      if (files?.customLogo?.[0]) {
        const file = files.customLogo[0];
        console.log('Processing customLogo:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        const base64Data = file.buffer.toString('base64');
        updateData.customLogo = `data:${file.mimetype};base64,${base64Data}`;
      }

      if (files?.customFavicon?.[0]) {
        const file = files.customFavicon[0];
        console.log('Processing customFavicon:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        const base64Data = file.buffer.toString('base64');
        updateData.customFavicon = `data:${file.mimetype};base64,${base64Data}`;
      }

      // Remove undefined and empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('Update data keys:', Object.keys(updateData));
      console.log('Has customOgImage:', !!updateData.customOgImage);
      
      const updatedSettings = await storage.updateSeoSettings(updateData);
      console.log('Database update result:', {
        id: updatedSettings.id,
        hasCustomOgImage: !!updatedSettings.customOgImage,
        customOgImageLength: updatedSettings.customOgImage ? updatedSettings.customOgImage.length : 0
      });
      console.log('=== END SEO SETTINGS DEBUG (FormData) ===');
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating SEO settings (FormData):', error);
      res.status(500).json({ 
        error: 'Failed to update SEO settings', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // SEO Settings JSON-only updates (for text changes without file uploads)
  app.patch('/api/admin/seo-settings', requireAdmin, async (req: Request, res: Response) => {
    try {
      console.log('=== SEO SETTINGS JSON UPDATE DEBUG ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Request body:', req.body);
      
      const updateData = { ...req.body };
      
      // Remove undefined and empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('Clean update data:', updateData);
      
      const updatedSettings = await storage.updateSeoSettings(updateData);
      console.log('Database update result:', updatedSettings);
      console.log('=== END SEO SETTINGS JSON UPDATE DEBUG ===');
      
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating SEO settings (JSON):', error);
      res.status(500).json({ 
        error: 'Failed to update SEO settings', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Deployment health check endpoints commonly used by platforms
  app.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('pong');
  });

  // Root route is handled by Vite middleware to serve the React frontend

  // CORS configuration for extension communication
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://app.ocus.com',
      /https:\/\/.*\.replit\.app$/,
      /https:\/\/.*\.replit\.dev$/,
      'chrome-extension://*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
  }));

  // Security middleware with enhanced protection
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.paypal.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
      },
      useDefaults: false
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }))

  // Input sanitization middleware
  const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize string inputs to prevent XSS
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return validator.escape(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    next();
  };

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // Session middleware for passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize OAuth strategies after database connection is ready
  await reinitializeStrategies(storage);

  // Add routes for checking strategy status
  app.get("/api/auth-strategies/status", async (req: Request, res: Response) => {
    try {
      const authSettings = await storage.getAuthSettings();
      const strategies = {
        google: !!(authSettings?.googleEnabled && authSettings.googleClientId && authSettings.googleClientSecret),
        facebook: !!(authSettings?.facebookEnabled && authSettings.facebookAppId && authSettings.facebookAppSecret),
        github: !!(authSettings?.githubEnabled && authSettings.githubClientId && authSettings.githubClientSecret)
      };

      res.json({
        strategies,
        authSettings: authSettings ? {
          googleEnabled: authSettings.googleEnabled || false,
          facebookEnabled: authSettings.facebookEnabled || false,
          githubEnabled: authSettings.githubEnabled || false
        } : {
          googleEnabled: false,
          facebookEnabled: false,
          githubEnabled: false
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking strategy status: " + error.message });
    }
  });

  // Google credentials JSON upload
  app.post("/api/admin/upload-google-credentials", upload.single('credentials'), async (req: Request, res: Response) => {
    try {
      console.log('Upload request received:', {
        hasFile: !!req.file,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        mimetype: req.file?.mimetype
      });

      if (!req.file) {
        return res.status(400).json({ message: "No credentials file uploaded" });
      }

      const credentialsData = JSON.parse(req.file.buffer.toString());
      console.log('Parsed credentials structure:', {
        hasWeb: !!credentialsData.web,
        hasInstalled: !!credentialsData.installed,
        webClientId: credentialsData.web?.client_id ? 'present' : 'missing',
        installedClientId: credentialsData.installed?.client_id ? 'present' : 'missing'
      });

      // Extract client ID and secret from Google credentials JSON
      const googleClientId = credentialsData.web?.client_id || credentialsData.installed?.client_id;
      const googleClientSecret = credentialsData.web?.client_secret || credentialsData.installed?.client_secret;

      if (!googleClientId || !googleClientSecret) {
        return res.status(400).json({ 
          message: "Invalid Google credentials file. Missing client_id or client_secret." 
        });
      }

      console.log('Extracted credentials:', {
        clientId: googleClientId.substring(0, 20) + '...',
        clientSecret: 'extracted successfully'
      });

      // Update auth settings with extracted credentials
      const updates = {
        googleEnabled: true,
        googleClientId,
        googleClientSecret
      };

      const authSettings = await storage.updateAuthSettings(updates);
      console.log('Auth settings updated, reinitializing strategies...');

      // Reinitialize OAuth strategies
      await reinitializeStrategies(storage);
      console.log('OAuth strategies reinitialized successfully');

      res.json({ 
        message: "Google credentials uploaded successfully",
        googleEnabled: true,
        googleClientId: googleClientId.substring(0, 20) + "..." // Show partial ID for confirmation
      });
    } catch (error: any) {
      console.error('Google credentials upload error:', error);
      res.status(500).json({ message: "Failed to process credentials: " + error.message });
    }
  });

  // Auth Settings routes
  app.get("/api/auth-settings", async (req: Request, res: Response) => {
    try {
      const authSettings = await storage.getAuthSettings();

      if (!authSettings) {
        // Return default settings
        res.json({
          googleEnabled: false,
          facebookEnabled: false,
          githubEnabled: false,
          recaptchaEnabled: false,
          recaptchaMode: 'v2',
          recaptchaCustomerEnabled: false,
          recaptchaAdminEnabled: true
        });
      } else {
        // Return only public settings (no secret keys)
        res.json({
          googleEnabled: authSettings.googleEnabled,
          facebookEnabled: authSettings.facebookEnabled,
          githubEnabled: authSettings.githubEnabled,
          recaptchaEnabled: authSettings.recaptchaEnabled,
          recaptchaMode: authSettings.recaptchaMode,
          recaptchaSiteKey: authSettings.recaptchaSiteKey,
          recaptchaCustomerEnabled: authSettings.recaptchaCustomerEnabled,
          recaptchaAdminEnabled: authSettings.recaptchaAdminEnabled
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching auth settings: " + error.message });
    }
  });

  // Admin-specific auth settings endpoint (includes non-sensitive data)
  app.get("/api/admin/auth-settings", async (req: Request, res: Response) => {
    try {
      const authSettings = await storage.getAuthSettings();

      if (!authSettings) {
        // Return default settings
        res.json({
          googleEnabled: false,
          googleClientId: '',
          googleClientSecret: '',
          googleRedirectUri: '',
          facebookEnabled: false,
          facebookAppId: '',
          facebookAppSecret: '',
          githubEnabled: false,
          githubClientId: '',
          githubClientSecret: '',
          recaptchaEnabled: false,
          recaptchaSiteKey: '',
          recaptchaSecretKey: '',
          recaptchaMode: 'v2',
          recaptchaCustomerEnabled: false,
          recaptchaAdminEnabled: true
        });
      } else {
        // Return all settings for admin (including client IDs but mask secrets partially)
        res.json({
          googleEnabled: authSettings.googleEnabled || false,
          googleClientId: authSettings.googleClientId || '',
          googleClientSecret: authSettings.googleClientSecret ? '***' + authSettings.googleClientSecret.slice(-4) : '',
          googleRedirectUri: authSettings.googleRedirectUri || '',
          facebookEnabled: authSettings.facebookEnabled || false,
          facebookAppId: authSettings.facebookAppId || '',
          facebookAppSecret: authSettings.facebookAppSecret ? '***' + authSettings.facebookAppSecret.slice(-4) : '',
          githubEnabled: authSettings.githubEnabled || false,
          githubClientId: authSettings.githubClientId || '',
          githubClientSecret: authSettings.githubClientSecret ? '***' + authSettings.githubClientSecret.slice(-4) : '',
          recaptchaEnabled: authSettings.recaptchaEnabled || false,
          recaptchaSiteKey: authSettings.recaptchaSiteKey || '',
          recaptchaSecretKey: authSettings.recaptchaSecretKey ? '***' + authSettings.recaptchaSecretKey.slice(-4) : '',
          recaptchaMode: authSettings.recaptchaMode || 'v2',
          recaptchaCustomerEnabled: authSettings.recaptchaCustomerEnabled || false,
          recaptchaAdminEnabled: authSettings.recaptchaAdminEnabled || true
        });
      }
    } catch (error: any) {
      console.error('Get admin auth settings error:', error);
      res.status(500).json({ message: "Error fetching auth settings: " + error.message });
    }
  });

  app.put("/api/admin/auth-settings", async (req: Request, res: Response) => {
    try {
      const updates = req.body;

      const schema = z.object({
        googleClientId: z.string().optional(),
        googleClientSecret: z.string().optional(),
        googleEnabled: z.boolean().optional(),
        facebookAppId: z.string().optional(),
        facebookAppSecret: z.string().optional(),
        facebookEnabled: z.boolean().optional(),
        githubClientId: z.string().optional(),
        githubClientSecret: z.string().optional(),
        githubEnabled: z.boolean().optional(),
        recaptchaSiteKey: z.string().optional(),
        recaptchaSecretKey: z.string().optional(),
        recaptchaEnabled: z.boolean().optional(),
        recaptchaMode: z.enum(['v2', 'v3']).optional(),
        recaptchaCustomerEnabled: z.boolean().optional(),
        recaptchaAdminEnabled: z.boolean().optional()
      });

      const validatedData = schema.parse(updates);
      const authSettings = await storage.updateAuthSettings(validatedData);

      // Reinitialize OAuth strategies with new settings
      try {
        await reinitializeStrategies(storage);
        console.log('OAuth strategies reinitialized after settings update');
      } catch (error) {
        console.error('Failed to reinitialize OAuth strategies:', error);
      }

      // Return only public settings (no secret keys)
      res.json({
        googleEnabled: authSettings.googleEnabled,
        facebookEnabled: authSettings.facebookEnabled,
        githubEnabled: authSettings.githubEnabled,
        recaptchaEnabled: authSettings.recaptchaEnabled,
        recaptchaMode: authSettings.recaptchaMode,
        recaptchaSiteKey: authSettings.recaptchaSiteKey,
        recaptchaCustomerEnabled: authSettings.recaptchaCustomerEnabled,
        recaptchaAdminEnabled: authSettings.recaptchaAdminEnabled
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating auth settings: " + error.message });
    }
  });

  // Admin and Customer Login Routes
  app.post("/api/admin/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const { username, email, password, recaptchaToken } = req.body;

      // Accept both email and username for backwards compatibility
      const loginField = email || username;

      if (!loginField || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Enhanced password strength validation for new passwords
      if (password.length < 8) {
        console.warn(`Weak password attempt for: ${loginField} from IP: ${req.ip}`);
      }

      // Verify reCAPTCHA if enabled for admin
      const authSettings = await storage.getAuthSettings();
      if (authSettings?.recaptchaEnabled && authSettings?.recaptchaAdminEnabled && authSettings?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }

        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }

      // Check for dynamic demo admin credentials first (stored in database)
      const demoAdminPassword = await storage.getSetting('demo_admin_password');

      // New admin email credentials - check database password first, then fallback
      if (loginField === 'info@logoland.se') {
        const correctPassword = demoAdminPassword?.value || 'demo123';
        if (password === correctPassword) {
          // Log successful admin login with audit trail
          console.info(`Admin login successful for: ${loginField} from IP: ${req.ip} at ${new Date().toISOString()}`);

          // Store session with timeout tracking
          req.session.adminUser = {
            email: loginField,
            isAdmin: true,
            loginTime: Date.now(),
            lastActivity: Date.now()
          };

          return res.json({ success: true, role: 'admin' });
        } else {
          console.warn(`Failed admin login attempt for: ${loginField} from IP: ${req.ip} at ${new Date().toISOString()}`);
        }
      }

      // Legacy support for old demo admin credentials with dynamic password
      if (loginField === 'demo_admin') {
        const correctPassword = demoAdminPassword?.value || 'demo123';
        if (password === correctPassword) {
          console.info(`Admin login successful for: ${loginField} from IP: ${req.ip} at ${new Date().toISOString()}`);

          req.session.adminUser = {
            email: loginField,
            isAdmin: true,
            loginTime: Date.now(),
            lastActivity: Date.now()
          };

          return res.json({ success: true, role: 'admin' });
        } else {
          console.warn(`Failed legacy admin login attempt for: ${loginField} from IP: ${req.ip}`);
        }
      }

      // Check database for admin user - try both email and username
      let user = null;
      if (loginField.includes('@')) {
        user = await storage.getUserByEmail(loginField);
      } else {
        user = await storage.getUserByUsername(loginField);
      }

      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.warn(`Invalid password for database admin user: ${loginField} from IP: ${req.ip}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.info(`Database admin login successful for: ${loginField} from IP: ${req.ip} at ${new Date().toISOString()}`);

      req.session.adminUser = {
        id: user.id.toString(),
        email: user.email,
        isAdmin: true,
        loginTime: Date.now(),
        lastActivity: Date.now()
      };

      res.json({ success: true, role: 'admin' });
    } catch (error: any) {
      res.status(500).json({ message: "Login failed: " + error.message });
    }
  });

  // Admin credentials update endpoint
  app.post("/api/admin/update-credentials", authLimiter, async (req: Request, res: Response) => {
    try {
      const { currentUsername, currentEmail, currentPassword, newUsername, newEmail, newPassword } = req.body;

      if ((!currentUsername && !currentEmail) || !currentPassword) {
        return res.status(400).json({ message: "Current email and password are required" });
      }

      // Get current stored password for demo admin
      const storedPassword = await storage.getSetting('demo_admin_password');
      const currentStoredPassword = storedPassword?.value || 'demo123';

      // For demo admin, check current credentials
      if ((currentUsername === 'demo_admin' || currentEmail === 'info@logoland.se') && currentPassword === currentStoredPassword) {
        const responseMessage = [];

        // If new password is provided, hash and store it
        if (newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // Update in settings table for demo admin
          await storage.updateSetting('demo_admin_password', newPassword);

          // Also update the database user if exists
          const existingUser = await storage.getUserByUsername('demo_admin');
          if (existingUser) {
            await db.update(users)
              .set({ password: hashedPassword, email: newEmail || existingUser.email })
              .where(eq(users.id, existingUser.id));
          }

          responseMessage.push("Password updated successfully");
        }
        // TODO: Add logic to update email for demo admin if newEmail is provided

        return res.json({ success: true, message: responseMessage.join(', ') });
      } else {
        // Check if it's a database admin user
        const user = await storage.getUserByUsername(currentUsername);
        if (user && user.isAdmin && await bcrypt.compare(currentPassword, user.password)) {
          const updates: any = {};

          if (newUsername && newUsername !== currentUsername) {
            updates.username = newUsername;
          }

          if (newPassword) {
            updates.password = await bcrypt.hash(newPassword, 10);
          }

          if (Object.keys(updates).length > 0) {
            // Update user in database
            await db.update(users)
              .set(updates)
              .where(eq(users.id, user.id));
          }

          return res.json({ success: true, message: "Admin credentials updated successfully" });
        }
      }

      return res.status(401).json({ message: "Invalid current credentials" });
    } catch (error: any) {
      console.error('Admin credentials update error:', error);
      res.status(500).json({ message: "Failed to update credentials: " + error.message });
    }
  });


  app.post("/api/customer/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password, recaptchaToken } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Verify reCAPTCHA if enabled for customers
      const authSettings = await storage.getAuthSettings();
      if (authSettings?.recaptchaEnabled && authSettings?.recaptchaCustomerEnabled && authSettings?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }

        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }

      // Demo customer credentials - works in all environments
      if (email === 'customer@demo.com' && password === 'customer123') {
        const token = uuidv4();
        return res.json({ 
          success: true, 
          role: 'customer', 
          token,
          user: {
            id: "demo-customer-123",
            email: "customer@demo.com",
            name: "Demo Customer"
          }
        });
      }

      // Check database for customer
      const customer = await storage.getCustomerByEmail(email);
      if (!customer || !customer.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, customer.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = uuidv4();
      res.json({ 
        success: true, 
        role: 'customer', 
        token, 
        user: { 
          id: customer.id.toString(), 
          email: customer.email, 
          name: customer.name 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Login failed: " + error.message });
    }
  });

  // User-authenticated payment intent creation (for dashboard purchases)
  app.post("/api/create-user-payment-intent", async (req: Request, res: Response) => {
    console.log('[/api/create-user-payment-intent] Received request');
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      // This would normally check authentication, but for now we'll use basic validation
      const userId = req.headers['user-id'] || req.body.userId;
      
      // Get product pricing from database
      const product = await storage.getActiveProduct();
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Generate activation code for this purchase
      const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      // Create order for authenticated user
      const order = await storage.createOrder({
        userId: userId ? parseInt(userId.toString()) : null,
        customerEmail: req.body.customerEmail || 'user@example.com',
        customerName: req.body.customerName || 'User',
        originalAmount: product.price,
        finalAmount: product.price,
        discountAmount: "0",
        currency: product.currency || "eur",
        status: "pending",
        paymentMethod: "stripe",
        maxDownloads: 3,
        activationCode: activationCode
      });

      // Create Stripe checkout session
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const successUrl = new URL('/purchase-success', process.env.APP_URL || 'http://localhost:3000');
      successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
      successUrl.searchParams.append('order_id', order.id.toString());

      const cancelUrl = new URL('/purchase-canceled', process.env.APP_URL || 'http://localhost:3000');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: product.currency || 'eur',
              product_data: {
                name: product.name || 'OCUS Job Hunter - Premium',
              },
              unit_amount: Math.round(parseFloat(product.price) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        metadata: {
          orderId: order.id.toString(),
          userId: userId?.toString() || '',
          activationCode: activationCode
        },
      });

      // Update order with session ID
      await db.update(orders).set({ paymentIntentId: session.id }).where(eq(orders.id, order.id));

      res.json({ 
        sessionId: session.id,
        checkoutUrl: session.url,
        orderId: order.id,
        activationCode: activationCode
      });
    } catch (error: any) {
      console.error('User payment intent creation failed:', error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });



  // Check current authenticated user's premium purchase status
  app.get("/api/me/purchase-status", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!(req.user as any)?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userOrders = await storage.getUserOrders((req.user as any).id);
      
      // Check if user has any completed orders
      const completedOrders = userOrders.filter((order: { status: string }) => order.status === 'completed');
      const hasPurchased = completedOrders.length > 0;
      
      // Calculate total spent from completed orders
      const totalSpent = completedOrders.reduce((sum: number, order: { finalAmount: string }) => sum + parseFloat(order.finalAmount), 0);

      res.json({
        hasPurchased,
        totalSpent: totalSpent.toFixed(2),
        completedOrders: completedOrders.length,
        lastPurchaseDate: completedOrders.length > 0 ? 
          Math.max(...completedOrders.map((o: any) => {
            const timestamp = o.completedAt || o.createdAt || Date.now();
            return typeof timestamp === 'number' ? timestamp * 1000 : new Date(timestamp).getTime();
          })) : null
      });
    } catch (error: any) {
      console.error('Failed to get user purchase status:', error);
      res.status(500).json({ message: "Failed to get purchase status: " + error.message });
    }
  });

  // Add secure user profile endpoints
  // Get current user profile
  app.get("/api/me", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = req.user as any;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userProfile } = user;

      const isPremium = user.accountType === 'Premium';

      res.json({
        ...userProfile,
        isPremium,
        extensionActivated: isPremium,
      });
    } catch (error: any) {
      console.error('Failed to get user profile:', error);
      res.status(500).json({ message: "Failed to get profile: " + error.message });
    }
  });

  // Get current user orders
  app.get("/api/me/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!(req.user as any)?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userOrders = await storage.getUserOrders((req.user as any).id);
      res.json(userOrders);
    } catch (error: any) {
      console.error('Failed to get user orders:', error);
      res.status(500).json({ message: "Failed to get orders: " + error.message });
    }
  });


  // User-specific payment intent creation for dashboard purchases
  app.post("/api/user/create-payment-intent", async (req: Request, res: Response) => {
    console.log('[/api/user/create-payment-intent] Received request');
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const { amount } = req.body;

      // Validate input
      const schema = z.object({
        amount: z.number().min(1),
      });

      const validatedData = schema.parse({ amount });

      // Reinitialize Stripe to get latest settings
      await initializeStripe(storage);
      
      // Check if Stripe is configured and account is ready for live payments
      if (!stripe) {
        console.error('Stripe not configured - missing secret key');
        return res.status(500).json({ 
          message: "Payment system not configured. Please set your Stripe keys in Admin → Payment Settings.",
          error: "stripe_not_configured"
        });
      }

      try {
        // Create an order before creating the checkout session
        const order = await storage.createOrder({
          customerEmail: (req.user as any)?.email || 'user@example.com',
          customerName: (req.user as any)?.name || 'User',
          originalAmount: validatedData.amount.toString(),
          finalAmount: validatedData.amount.toString(),
          currency: "usd",
          status: "pending",
          paymentMethod: "stripe",
          userId: (req.user as any)?.id || null,
        });

        const successUrl = new URL('/purchase-success', process.env.APP_URL || 'http://localhost:3000');
        successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
        successUrl.searchParams.append('order_id', order.id.toString());

        const cancelUrl = new URL('/purchase-canceled', process.env.APP_URL || 'http://localhost:3000');

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'OCUS Job Hunter - Premium',
                },
                unit_amount: Math.round(validatedData.amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: successUrl.toString(),
          cancel_url: cancelUrl.toString(),
          customer_email: (req.user as any)?.email,
          metadata: {
            orderId: order.id.toString(),
            userId: (req.user as any)?.id?.toString() || '',
          },
        });

        // Update order with session ID
        await db.update(orders).set({ paymentIntentId: session.id }).where(eq(orders.id, order.id));

        res.json({ 
          sessionId: session.id,
          checkoutUrl: session.url
        });
      } catch (stripeError: any) {
        console.error('Stripe payment intent creation failed:', stripeError);
        
        // Handle specific Stripe errors for live mode issues
        if (stripeError.code === 'account_not_activated') {
          return res.status(400).json({ 
            message: "Your Stripe account setup is incomplete. Please complete your business verification, bank account setup, and identity verification in your Stripe dashboard before accepting live payments.",
            error: "account_not_activated"
          });
        }
        
        if (stripeError.code === 'card_declined') {
          return res.status(400).json({ 
            message: "Your card was declined. Please try a different payment method.",
            error: "card_declined"
          });
        }

        return res.status(500).json({ 
          message: "Failed to initialize payment. Please try again or contact support.",
          error: stripeError.code || "payment_initialization_failed"
        });
      }
    } catch (error: any) {
      console.error('User payment intent creation failed:', error);
      res.status(500).json({ 
        message: "Failed to initialize payment. Please try again.",
        error: "server_error"
      });
    }
  });

  // Customer registration route
  app.post("/api/customer/register", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password, name, recaptchaToken } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password and name are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Verify reCAPTCHA if enabled for customers
      const authSettings = await storage.getAuthSettings();
      if (authSettings?.recaptchaEnabled && authSettings?.recaptchaCustomerEnabled && authSettings?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }

        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }

      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create customer
      const customer = await storage.createCustomer({
        email,
        password: hashedPassword,
        name,
        isAdmin: false,
        referralCode: generateReferralCode()
      });

      res.json({ 
        success: true, 
        message: "Registration successful",
        user: {
          id: customer.id.toString(),
          email: customer.email,
          name: customer.name
        }
      });
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique violation
        res.status(400).json({ message: "Email already registered" });
      } else {
        res.status(500).json({ message: "Registration failed: " + error.message });
      }
    }
  });

  // Helper function to generate referral code
  function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Social authentication routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

  // Social auth callbacks
  app.get('/api/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
    console.log('Google OAuth callback received:', {
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error,
      error: req.query.error
    });

    passport.authenticate('google', (err: any, user: any, info: any) => {
      console.log('Google OAuth authentication result:', {
        hasError: !!err,
        hasUser: !!user,
        info: info,
        errorMessage: err?.message || err
      });

      if (err) {
        console.error('OAuth authentication error:', err);
        return res.status(500).json({ message: err.message || 'Authentication failed' });
      }

      if (!user) {
        console.log('No user returned from OAuth, likely access denied or authentication failed');
        if (req.query.error === 'access_denied') {
          return res.redirect('/login?error=access_denied');
        }
        return res.status(401).json({ message: 'Authentication failed - please try again' });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).json({ message: 'Login failed' });
        }

        console.log('OAuth login successful for user:', user.email);
        return res.redirect('/dashboard?auth=success');
      });
    })(req, res, next);
  });

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
      res.redirect('/dashboard');
    }
  );

  // Authentication check endpoint
  app.get("/api/auth/check", (req: Request, res: Response) => {
    res.json({ authenticated: !!req.user, user: req.user });
  });
  // PayPal routes
  app.get("/api/paypal/setup", async (req: Request, res: Response) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req: Request, res: Response) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", capturePaypalOrder(db));

  // Settings routes
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap = (settings || []).reduce((acc: { [key: string]: string }, setting: { key: string, value: string }) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsMap);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching settings: " + error.message });
    }
  });

  app.put("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const schema = z.object({
        value: z.string().min(1)
      });

      const validatedData = schema.parse({ value });
      const setting = await storage.updateSetting(key, validatedData.value);
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating setting: " + error.message });
    }
  });

  // Coupon routes
  app.post("/api/coupons", async (req: Request, res: Response) => {
    try {
      const { code, discountType, discountValue, usageLimit, expiresAt } = req.body;

      const schema = z.object({
        code: z.string().min(1),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(0),
        usageLimit: z.number().optional(),
        expiresAt: z.string().datetime().optional(),
      });

      const validatedData = schema.parse({ code, discountType, discountValue, usageLimit, expiresAt });

      const coupon = await storage.createCoupon({
        code: validatedData.code,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue.toString(),
        usageLimit: validatedData.usageLimit || null,
        expiresAt: validatedData.expiresAt ? Math.floor(new Date(validatedData.expiresAt).getTime() / 1000) : null,
        isActive: true,


      });

      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating coupon: " + error.message });
    }
  });

  app.get("/api/coupons", async (req: Request, res: Response) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching coupons: " + error.message });
    }
  });

  // Delete coupon
  app.delete("/api/coupons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting coupon: " + error.message });
    }
  });

  // Update product price (admin only)
  app.put("/api/settings/product_price", async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      const schema = z.object({
        value: z.string().min(1)
      });

      const validatedData = schema.parse({ value });
      const price = parseFloat(validatedData.value);

      if (price <= 0) {
        return res.status(400).json({ message: "Price must be greater than 0" });
      }

      // For simplicity, we'll store this in environment or a settings table
      // For now, just return success - in production you'd store this in database
      res.json({ success: true, price: validatedData.value });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating price: " + error.message });
    }
  });

  // Update dual pricing for products
  app.put("/api/admin/pricing", async (req: Request, res: Response) => {
    try {
      const { price, beforePrice } = req.body;

      if (!price || price <= 0) {
        return res.status(400).json({ message: "Valid price is required" });
      }

      if (beforePrice && beforePrice <= price) {
        return res.status(400).json({ message: "Before price must be higher than current price" });
      }

      // Update or create product pricing
      const updatedProduct = await storage.updateProductPricing({
        price: price,
        beforePrice: beforePrice
      });

      res.json({ 
        success: true, 
        product: updatedProduct,
        message: "Pricing updated successfully" 
      });
    } catch (error: any) {
      console.error("Error updating pricing:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get current product pricing
  app.get("/api/products/pricing", async (req: Request, res: Response) => {
    try {
      const product = await storage.getCurrentProduct();
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product pricing:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/validate-coupon", async (req: Request, res: Response) => {
    try {
      const { code, orderAmount } = req.body;

      const schema = z.object({
        code: z.string().min(1),
        orderAmount: z.number().min(0)
      });

      const validatedData = schema.parse({ code, orderAmount });

      const coupon = await storage.getCouponByCode(validatedData.code);

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ message: "Coupon is not active" });
      }

      if (coupon.expiresAt && Date.now() / 1000 > coupon.expiresAt) {
        return res.status(400).json({ message: "Coupon has expired" });
      }

      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (validatedData.orderAmount * parseFloat(coupon.discountValue)) / 100;
      } else {
        discountAmount = parseFloat(coupon.discountValue);
      }

      const finalAmount = Math.max(0, validatedData.orderAmount - discountAmount);

      res.json({
        valid: true,
        discountAmount,
        finalAmount,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: "Error validating coupon: " + error.message });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    console.log('[/api/create-payment-intent] Received request');
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const { amount, customerEmail, customerName, couponCode, originalAmount, discountAmount, referralCode } = req.body;

      // Validate input
      const schema = z.object({
        amount: z.number().min(1),
        customerEmail: z.string().min(1).email(),
        customerName: z.string().min(1),
        couponCode: z.string().optional(),
        originalAmount: z.number().optional(),
        discountAmount: z.number().optional(),
        referralCode: z.string().optional()
      });

      console.log('Payment intent request data:', { amount, customerEmail, customerName, couponCode, originalAmount, discountAmount, referralCode });
      
      // Handle null values before validation
      const processedData = {
        amount,
        customerEmail,
        customerName,
        couponCode: couponCode || undefined,
        originalAmount,
        discountAmount,
        referralCode: referralCode || undefined
      };
      
      const validatedData = schema.parse(processedData);

      // Generate activation code
      const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      // Create order first
      const order = await storage.createOrder({
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
        originalAmount: (validatedData.originalAmount || validatedData.amount).toString(),
        finalAmount: validatedData.amount.toString(),
        discountAmount: (validatedData.discountAmount || 0).toString(),
        couponCode: validatedData.couponCode || null,
        currency: "usd",
        status: "pending",
        paymentMethod: "stripe",
        maxDownloads: 3,
        referralCode: validatedData.referralCode || null
      });

      // Create Stripe checkout session
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const successUrl = new URL('/purchase-success', process.env.APP_URL || 'http://localhost:3000');
      successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
      successUrl.searchParams.append('order_id', order.id.toString());

      const cancelUrl = new URL('/purchase-canceled', process.env.APP_URL || 'http://localhost:3000');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'OCUS Job Hunter - Premium',
              },
              unit_amount: Math.round(validatedData.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        customer_email: validatedData.customerEmail,
        metadata: {
          orderId: order.id.toString(),
        },
      });

      // Update order with session ID
      await storage.updateOrderStatus(order.id, "pending");
      await db.update(orders).set({ paymentIntentId: session.id }).where(eq(orders.id, order.id));

      res.json({ 
        sessionId: session.id,
        checkoutUrl: session.url 
      });
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });


  // Stripe payment completion (manual trigger)
  app.post("/api/complete-stripe-payment", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, customerEmail, customerName } = req.body;
      
      console.log('Completing Stripe payment:', { paymentIntentId, customerEmail });
      
      // Find the order by payment intent ID
      const order = await storage.getOrderByPaymentIntentId(paymentIntentId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.status === "completed") {
        return res.json({ success: true, message: "Order already completed", orderId: order.id });
      }
      
      // Update order to completed
      await storage.updateOrderStatus(order.id, "completed", new Date());
      
      // Track referral if present
      if (order.referralCode) {
        try {
          await affiliateService.trackReferral(order.referralCode, order.id);
        } catch (error) {
          console.error('Failed to track referral:', error);
        }
      }
      
      // Generate activation key for the order
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await storage.createActivationKey({
        activationKey: activationKey,
        orderId: order.id,
        userId: order.userId,
        isActive: true
      });
      
      console.log('Generated activation key:', activationKey);

      // Create invoice for the completed order
      try {
        const invoiceNumber = await storage.generateInvoiceNumber();
        const invoice = await storage.createInvoice({
          invoiceNumber,
          customerId: order.userId || null,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          invoiceDate: Math.floor(Date.now() / 1000),
          dueDate: Math.floor(Date.now() / 1000),
          subtotal: order.finalAmount,
          totalAmount: order.finalAmount,
          currency: (order.currency || 'USD').toUpperCase(),
          status: 'paid',
          paidAt: Math.floor(Date.now() / 1000),
          notes: `Invoice for order #${order.id}`
        });

        // Create invoice item for the product
        const product = await storage.getActiveProduct();
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          productName: product?.name || 'OCUS Job Hunter Extension',
          description: product?.description || 'Chrome extension for job hunting automation',
          quantity: 1,
          unitPrice: order.finalAmount,
          totalPrice: order.finalAmount
        });

        console.log(`Invoice #${invoiceNumber} created for order #${order.id}`);
      } catch (error) {
        console.error('Failed to create invoice:', error);
      }
      
      // Send confirmation email (if email service is configured)
      try {
        await emailService.sendPurchaseConfirmation(order, activationKey);
      } catch (emailError) {
        console.log('Email service not configured, skipping email send');
      }
      
      res.json({ 
        success: true, 
        orderId: order.id,
        activationKey: activationKey
      });
    } catch (error: any) {
      console.error('Stripe payment completion failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // PayPal payment completion
  app.post("/api/complete-paypal-payment", async (req: Request, res: Response) => {
    try {
      const { orderID, customerEmail, customerName, amount, referralCode } = req.body;

      const order = await storage.createOrder({
        customerEmail,
        customerName,
        originalAmount: amount.toString(),
        finalAmount: amount.toString(),
        currency: "usd",
        status: "completed",
        paymentMethod: "paypal",
        paypalOrderId: orderID,
        maxDownloads: 3,
        referralCode: referralCode || null
      });

      // Track referral if present
      if (referralCode) {
        try {
          await affiliateService.trackReferral(referralCode, order.id);
        } catch (error) {
          console.error('Failed to track referral:', error);
        }
      }

      // Generate activation key for the order
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await storage.createActivationKey({
        activationKey: activationKey,
        orderId: order.id,
        userId: order.userId,
        isActive: true
      });

      // Send confirmation email
      await emailService.sendPurchaseConfirmation(order, activationKey);

      res.json({ 
        success: true, 
        orderId: order.id,
        activationKey: activationKey
      });
    } catch (error: any) {
      console.error('PayPal payment completion failed:', error);
      res.status(500).json({ message: error.message });
    }
  });


  // Deprecated: Validate activation key for Chrome extension (HTTP 410 Gone)
    app.post("/api/validate-activation-key", async (req: Request, res: Response) => {
    res.status(410).json({ 
      valid: false, 
      message: "Activation system has been deprecated. Please contact support for assistance." 
    });
  });

  // Premium device validation for single-device restriction
    app.post("/api/premium/validate-device", async (req: Request, res: Response) => {
    try {
      const { userId, deviceFingerprint, extensionId } = req.body;
      
      if (!userId || !deviceFingerprint || !extensionId) {
        return res.status(400).json({ 
          authorized: false, 
          message: 'Missing required parameters' 
        });
      }

      // Check if this device is already registered for premium access
      const existingDevice = await storage.getPremiumDevice(userId, deviceFingerprint);
      
      if (existingDevice) {
        // Device already authorized
        return res.json({ 
          authorized: true, 
          message: 'Device authorized',
          registeredAt: existingDevice.registeredAt
        });
      }

      // Check if user has any registered devices
      const userDevices = await storage.getUserPremiumDevices(userId);
      
      if (userDevices.length >= 1) {
        // User already has a device registered - deny access
        return res.json({ 
          authorized: false, 
          message: 'Premium access limited to one device. Please deactivate existing device.',
          maxDevices: 1,
          currentDevices: userDevices.length
        });
      }

      // Register this as the first device for the user
      await storage.registerPremiumDevice(userId, deviceFingerprint, extensionId);
      
      res.json({ 
        authorized: true, 
        message: 'Device registered and authorized',
        isNewRegistration: true
      });

    } catch (error: any) {
      console.error('Premium device validation error:', error);
      res.status(500).json({ 
        authorized: false, 
        message: 'Server error during device validation' 
      });
    }
  });

  // Update premium device heartbeat (last seen timestamp)
  app.post("/api/premium/device-heartbeat", async (req: Request, res: Response) => {
    try {
      const { deviceFingerprint } = req.body;
      
      if (!deviceFingerprint) {
        return res.status(400).json({ 
          success: false, 
          message: 'Device fingerprint required' 
        });
      }

      // Update the last seen timestamp for this device
      await storage.updatePremiumDeviceLastSeen(deviceFingerprint);
      
      res.json({ 
        success: true, 
        message: 'Device heartbeat updated',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Device heartbeat update error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update device heartbeat' 
      });
    }
  });

app.get("/api/invoices", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const invoices = await storage.getAllInvoices();
    res.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/me/invoices", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const invoices = await storage.getCustomerInvoices((req.user as any).id);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

app.get("/api/invoices/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await storage.getInvoice(parseInt(id));
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Get invoice items
    const items = await storage.getInvoiceItems(invoice.id);
    res.json({ ...invoice, items });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/invoices", requireAuth, async (req: Request, res: Response) => {
  try {
    const { customerId, customerName, customerEmail, items, notes } = req.body;
    
    // Generate invoice number
    const invoiceNumber = await storage.generateInvoiceNumber();
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
    const totalAmount = subtotal; // Add tax calculation if needed
    
    // Create invoice
    const invoice = await storage.createInvoice({
      invoiceNumber,
      customerId,
      customerName,
      customerEmail,
      invoiceDate: Math.floor(Date.now() / 1000),
      dueDate: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days from now
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      currency: 'USD',
      status: 'issued',
      notes
    });

    // Create invoice items
    for (const item of items) {
      await storage.createInvoiceItem({
        invoiceId: invoice.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: (item.unitPrice * item.quantity).toFixed(2)
      });
    }

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
  });

  app.get("/api/invoices/:id/pdf", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      const items = await storage.getInvoiceItems(invoice.id);
      const settings = await storage.getInvoiceSettings();
      
      const pdfBuffer = await generateInvoicePDF({ ...invoice, items }, settings);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoice-settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getInvoiceSettings();
      res.json(settings || {});
    } catch (error: any) {
      console.error('Error fetching invoice settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/invoice-settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.updateInvoiceSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      console.error('Error updating invoice settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe) {
      console.error('Stripe is not initialized, cannot process webhook.');
      return res.status(503).send('Stripe is not initialized');
    }

    if (!webhookSecret) {
      console.error('Stripe webhook secret is not set.');
      return res.status(500).send('Webhook secret not configured.');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Error verifying Stripe webhook signature: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log the received event for debugging
    console.log('Stripe webhook event received and verified:', {
      id: event.id,
      type: event.type,
      api_version: event.api_version,
      created: new Date(event.created * 1000).toISOString()
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent was successful!', paymentIntentSucceeded);
        
        // Find order by payment intent ID and update user to premium
        const order = await storage.getOrderByPaymentIntentId(paymentIntentSucceeded.id);
        if (order && order.userId) {
          try {
            console.log(`Upgrading user ${order.userId} to Premium after payment_intent.succeeded`);
            // Update user premium status using direct database query since storage doesn't have this method
            await db.update(users).set({ 
              isPremium: true, 
              extensionActivated: true,
              premiumActivatedAt: new Date().toISOString()
            }).where(eq(users.id, order.userId));
            await storage.updateOrderStatus(order.id, 'completed', new Date());
            console.log(`User ${order.userId} successfully upgraded to Premium`);
          } catch (error) {
            console.error(`Failed to upgrade user ${order.userId} to Premium:`, error);
          }
        }
        break;
      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent was created!', paymentIntentCreated);
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed.', paymentIntentFailed);
        // TODO: Notify the user about the payment failure.
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('--- Checkout Session Completed ---');
        console.log('Received session ID:', session.id);
        console.log('Metadata:', session.metadata);

        if (session.metadata?.userId && session.metadata?.orderId) {
          const userId = parseInt(session.metadata.userId, 10);
          const orderId = parseInt(session.metadata.orderId, 10);
          console.log(`Processing purchase for userId: ${userId}, orderId: ${orderId}`);

          try {
            // 1. Update user to Premium
            console.log(`Attempting to upgrade user ${userId} to Premium...`);
            await db.update(users).set({ 
              isPremium: true, 
              extensionActivated: true,
              premiumActivatedAt: new Date().toISOString()
            }).where(eq(users.id, userId));
            console.log(`User ${userId} upgrade successful.`);

            // 2. Update order status to 'completed'
            console.log(`Attempting to mark order ${orderId} as completed...`);
            await storage.updateOrderStatus(orderId, 'completed', new Date());
            console.log(`Order ${orderId} status update successful.`);

            // 3. Generate and save invoice
            console.log(`Fetching order ${orderId} and user ${userId} for invoice generation...`);
            const order = await storage.getOrder(orderId);
            const user = await storage.getUser(userId);

            if (order && user) {
              console.log('Order and user found. Generating invoice...');
              const invoiceNumber = await storage.generateInvoiceNumber();
              const invoiceData = {
                id: 0, // Placeholder, not used in PDF
                invoiceNumber: invoiceNumber,
                orderId: order.id,
                customerId: user.id,
                customerName: user.username || user.email,
                customerEmail: user.email,
                invoiceDate: Math.floor(Date.now() / 1000),
                dueDate: Math.floor(Date.now() / 1000),
                subtotal: order.finalAmount,
                totalAmount: order.finalAmount,
                currency: order.currency || 'USD',
                status: 'paid',
                paidAt: Math.floor(Date.now() / 1000),
                createdAt: Math.floor(Date.now() / 1000),
                updatedAt: Math.floor(Date.now() / 1000),
                notes: `Invoice for order #${order.id}`,
                discountAmount: order.discountAmount || '0.00',
                taxAmount: '0.00',
                customerAddress: null,
                billingAddress: null,
                items: [{
                  productName: 'OCUS Job Hunter Extension',
                  description: 'Chrome extension for job hunting automation',
                  quantity: 1,
                  unitPrice: order.finalAmount,
                  totalPrice: order.finalAmount
                }]
              };
              const invoiceSettings = await storage.getInvoiceSettings();
              const pdfBuffer = await generateInvoicePDF(invoiceData, invoiceSettings);

              // Save the PDF to a file
              const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
              await fsp.mkdir(invoicesDir, { recursive: true });
              const invoiceFilename = `invoice-${invoiceData.invoiceNumber}.pdf`;
              const invoiceFilePath = path.join(invoicesDir, invoiceFilename);
              await fsp.writeFile(invoiceFilePath, pdfBuffer);

              // Store the public URL path in the database
              const publicInvoiceUrl = `/invoices/${invoiceFilename}`;

              // Update order with invoice URL using direct database query
              await db.update(orders).set({ invoiceUrl: publicInvoiceUrl }).where(eq(orders.id, orderId));
              console.log(`Invoice generated and saved for order ${orderId} at ${publicInvoiceUrl}`);
            } else {
              console.error(`Could not find order ${orderId} or user ${userId} to generate invoice.`);
            }
            console.log('--- Purchase Fulfillment Successful ---');
          } catch (error) {
            console.error('--- Purchase Fulfillment Error ---');
            console.error(`Failed to fulfill purchase for userId: ${userId}, orderId: ${orderId}.`);
            console.error('Error details:', error);
          }
        } else {
          console.error('--- Invalid Webhook Metadata ---');
          console.error('Webhook received checkout.session.completed but is missing userId or orderId in metadata.');
          console.error('Session metadata:', session.metadata);
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
  });

  return server;
}