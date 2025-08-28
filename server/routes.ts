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
import { orders, customers, extensionUsageStats, users, tickets, ticketMessages, missions, userTrials, invoices, invoiceItems } from "@shared/schema";
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
      const customer = await storage.getUserByEmail(email);
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

  app.get("/api/invoices/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      const items = await storage.getInvoiceItems(invoice.id);
      res.json({ ...invoice, items });
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ error: error.message });
    }
  });


  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // ...

    if (event && event.type === 'checkout.session.completed') {
      try {
        const session = (event as any).data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', JSON.stringify(session.metadata, null, 2));

        const orderId = session.metadata?.orderId ? parseInt(session.metadata.orderId) : null;
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;

        if (!orderId) {
          console.error('Webhook Error: Missing orderId in session metadata');
          return res.status(400).json({ message: 'Missing orderId' });
        }

        const order = await storage.getOrder(orderId);
        if (!order) {
          console.error(`Webhook Error: Order with ID ${orderId} not found.`);
          return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'paid') {
          console.log(`Order ${orderId} already processed.`);
          return res.json({ received: true, message: 'Order already processed' });
        }

        if (userId) {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Update user to premium
          await storage.updateUser(user.id, { accountType: 'Premium', premiumActivatedAt: new Date() });

          // Update order status
          await storage.updateOrderStatus(order.id, 'paid');

          // Generate and save invoice
          const invoiceNumber = await storage.generateInvoiceNumber();
          const invoice = await storage.createInvoice({
            subtotal: order.finalAmount,
            invoiceNumber,
            customerId: user.id,
            customerName: user.username || '',
            customerEmail: user.email,
            invoiceDate: Math.floor(new Date().getTime() / 1000),
            dueDate: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days
            status: 'paid',
            totalAmount: order.finalAmount,
            paidAt: Math.floor(new Date().getTime() / 1000),
          });

          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            productName: 'Premium Subscription',
            quantity: 1,
            unitPrice: order.finalAmount.toString(),
            totalPrice: order.finalAmount.toString(),
            description: `Premium subscription activation`
          });
          console.log(`Invoice item created for invoice ${invoice.id}.`);

          const invoiceWithItems = {
            ...invoice,
            items: await storage.getInvoiceItems(invoice.id),
          };

          const invoiceSettings = await storage.getInvoiceSettings();
          if (!invoiceSettings) {
            throw new Error('Invoice settings not found');
          }
          const pdfBuffer = await generateInvoicePDF(invoiceWithItems, invoiceSettings);
          const pdfPath = path.join(__dirname, `../../public/invoices/invoice-${invoiceNumber}.pdf`);
          await fsp.mkdir(path.dirname(pdfPath), { recursive: true });
          await fsp.writeFile(pdfPath, pdfBuffer);
          const pdfUrl = `/invoices/invoice-${invoiceNumber}.pdf`;
          console.log(`Invoice PDF generated at ${pdfUrl}`);

          await storage.updateInvoice(invoice.id, { pdfPath: pdfUrl });
          console.log(`Invoice ${invoice.id} updated with PDF URL.`);
        }
      } catch (error) {
        console.error('Error processing checkout.session.completed:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
    res.json({ received: true });
  });

  // #endregion

  return server;
}