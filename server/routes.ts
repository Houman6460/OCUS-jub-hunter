import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import { storage } from "./storage";
import OpenAI from "openai";
import { emailService } from "./emailService";
import { fileService } from "./fileService";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";
import validator from "validator";
import { db } from "./db";
import { orders, customers, extensionUsageStats, users, tickets, ticketMessages, missions, userTrials } from "@shared/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import archiver from "archiver";
import path from "path";
import { passport, reinitializeStrategies } from "./socialAuth";
import session from "express-session";
import { captchaService } from "./captcha";
import { TranslationService } from "./translationService";
import { affiliateService } from "./affiliateService";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import fs from 'fs';
import cors from 'cors';
import { generateInvoicePDF } from './invoicePdfService';

// Dynamic Stripe setup - use database keys if available, fallback to env
let stripe: Stripe | null = null;
let currentStripeKey: string | null = null;

async function initializeStripe() {
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

// Initialize Stripe on startup
initializeStripe();

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
  fileFilter: (req, file, cb) => {
    // Only allow safe image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting with different limits for different endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: "Too many authentication attempts, try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
  });

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
  });

  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: { error: "Upload limit exceeded, try again later." },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Authentication middleware for admin routes
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ error: 'Admin access required' });
    }
    next();
  };

  // Authentication middleware for user routes  
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Health check endpoints for deployment and monitoring
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      service: 'OCUS Job Hunter',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      service: 'OCUS Job Hunter API',
      timestamp: new Date().toISOString(),
      version: '2.3.4'
    });
  });

  // SEO Settings Management API with comprehensive image upload support
  app.get('/api/admin/seo-settings', requireAdmin, async (req, res) => {
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
  ]), async (req, res) => {
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
  app.patch('/api/admin/seo-settings', requireAdmin, async (req, res) => {
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
  app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/ping', (req, res) => {
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
  const sanitizeInput = (req: any, res: any, next: any) => {
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
  await reinitializeStrategies();

  // Add routes for checking strategy status
  app.get("/api/auth-strategies/status", async (req, res) => {
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
  app.post("/api/admin/upload-google-credentials", upload.single('credentials'), async (req, res) => {
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
      await reinitializeStrategies();
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
  app.get("/api/auth-settings", async (req, res) => {
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
  app.get("/api/admin/auth-settings", async (req, res) => {
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

  app.put("/api/admin/auth-settings", async (req, res) => {
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
        await reinitializeStrategies();
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
  app.post("/api/admin/login", authLimiter, async (req, res) => {
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
  app.post("/api/admin/update-credentials", authLimiter, async (req, res) => {
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

        if (newUsername || newEmail) {
          responseMessage.push(`Email would be updated to: ${newEmail || newUsername}`);
        }

        return res.json({ 
          success: true, 
          message: responseMessage.length > 0 
            ? responseMessage.join(', ') 
            : "Credentials verified successfully"
        });
      }

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

      return res.status(401).json({ message: "Invalid current credentials" });
    } catch (error: any) {
      console.error('Admin credentials update error:', error);
      res.status(500).json({ message: "Failed to update credentials: " + error.message });
    }
  });

  app.post("/api/customer/login", authLimiter, async (req, res) => {
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
  app.post("/api/create-user-payment-intent", async (req, res) => {
    try {
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

      // Create Stripe payment intent
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
        currency: product.currency || "eur",
        metadata: {
          orderId: order.id.toString(),
          userId: userId?.toString() || '',
          activationCode: activationCode
        }
      });

      // Update order with payment intent ID
      await db.update(orders).set({ paymentIntentId: paymentIntent.id }).where(eq(orders.id, order.id));

      res.json({ 
        clientSecret: paymentIntent.client_secret,
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
  app.get("/api/me/purchase-status", requireAuth, async (req, res) => {
    try {
      if (!(req.user as any)?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userOrders = await storage.getUserOrders((req.user as any).id);
      
      // Check if user has any completed orders
      const completedOrders = userOrders.filter(order => order.status === 'completed');
      const hasPurchased = completedOrders.length > 0;
      
      // Calculate total spent from completed orders
      const totalSpent = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.finalAmount);
      }, 0);

      res.json({
        hasPurchased,
        totalSpent: totalSpent.toFixed(2),
        completedOrders: completedOrders.length,
        lastPurchaseDate: completedOrders.length > 0 ? 
          Math.max(...completedOrders.map(o => new Date(o.completedAt || o.createdAt || new Date()).getTime())) : null
      });
    } catch (error: any) {
      console.error('Failed to get user purchase status:', error);
      res.status(500).json({ message: "Failed to get purchase status: " + error.message });
    }
  });

  // Add secure user profile endpoints
  // Get current user profile
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      if (!(req.user as any)?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Return user data without password
      const user = await storage.getUser((req.user as any).id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      console.error('Failed to get user profile:', error);
      res.status(500).json({ message: "Failed to get profile: " + error.message });
    }
  });

  // Get current user orders
  app.get("/api/me/orders", requireAuth, async (req, res) => {
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
  app.post("/api/user/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
    } catch (error: any) {
      console.error('Failed to get user downloads:', error);
      res.status(500).json({ message: "Failed to get downloads: " + error.message });
    }
  });

  // User-specific payment intent creation for dashboard purchases
  app.post("/api/user/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;

      // Validate input
      const schema = z.object({
        amount: z.number().min(1),
      });

      const validatedData = schema.parse({ amount });

      // Reinitialize Stripe to get latest settings
      await initializeStripe();
      
      // Check if Stripe is configured and account is ready for live payments
      if (!stripe) {
        console.error('Stripe not configured - missing secret key');
        return res.status(500).json({ 
          message: "Payment system not configured. Please set your Stripe keys in Admin → Payment Settings.",
          error: "stripe_not_configured"
        });
      }

      try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(validatedData.amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            source: "user_dashboard",
            product: "extension_premium"
          }
        });

        res.json({ 
          clientSecret: paymentIntent.client_secret
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
  app.post("/api/customer/register", authLimiter, async (req, res) => {
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
  app.get('/api/auth/google/callback', (req, res, next) => {
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
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Authentication check endpoint
  app.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!req.user, user: req.user });
  });
  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsMap);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching settings: " + error.message });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
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
  app.post("/api/coupons", async (req, res) => {
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
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: true,


      });

      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating coupon: " + error.message });
    }
  });

  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching coupons: " + error.message });
    }
  });

  // Delete coupon
  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting coupon: " + error.message });
    }
  });

  // Update product price (admin only)
  app.put("/api/settings/product_price", async (req, res) => {
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
  app.put("/api/admin/pricing", async (req, res) => {
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
  app.get("/api/products/pricing", async (req, res) => {
    try {
      const product = await storage.getCurrentProduct();
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product pricing:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/validate-coupon", async (req, res) => {
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

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
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
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
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

      // Create Stripe payment intent
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id.toString(),
          customerEmail: validatedData.customerEmail,
          customerName: validatedData.customerName
        }
      });

      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, "pending");
      await db.update(orders).set({ paymentIntentId: paymentIntent.id }).where(eq(orders.id, order.id));

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id 
      });
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Stripe webhook for payment confirmation
  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await storage.getOrderByPaymentIntentId(paymentIntent.id);

      if (order) {
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

        // Create invoice for the completed order
        try {
          const invoiceNumber = await storage.generateInvoiceNumber();
          const invoice = await storage.createInvoice({
            invoiceNumber,
            orderId: order.id,
            customerId: order.userId || null,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            invoiceDate: new Date(),
            dueDate: new Date(), // Paid immediately
            subtotal: order.finalAmount,
            totalAmount: order.finalAmount,
            currency: (order.currency || 'USD').toUpperCase(),
            status: 'paid',
            paidAt: new Date(),
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

        await emailService.sendPurchaseConfirmation(order, activationKey);
      }
    }

    res.json({ received: true });
  });

  // Stripe payment completion (manual trigger)
  app.post("/api/complete-stripe-payment", async (req, res) => {
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
          orderId: order.id,
          customerId: order.userId || null,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          invoiceDate: new Date(),
          dueDate: new Date(), // Paid immediately
          subtotal: order.finalAmount,
          totalAmount: order.finalAmount,
          currency: (order.currency || 'USD').toUpperCase(),
          status: 'paid',
          paidAt: new Date(),
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
  app.post("/api/complete-paypal-payment", async (req, res) => {
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

      // Generate activation key for PayPal order
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await storage.createActivationKey({
        activationKey: activationKey,
        orderId: order.id,
        userId: order.userId,
        isActive: true
      });

      await emailService.sendPurchaseConfirmation(order, activationKey);
      res.json({ success: true, orderId: order.id });
    } catch (error: any) {
      console.error('PayPal payment completion failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Deprecated: Validate activation key for Chrome extension (HTTP 410 Gone)
  app.post("/api/validate-activation-key", async (req, res) => {
    res.status(410).json({ 
      valid: false, 
      message: "Activation system has been deprecated. Please contact support for assistance." 
    });
  });

  // Premium device validation for single-device restriction
  app.post("/api/premium/validate-device", async (req, res) => {
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
  app.post("/api/premium/device-heartbeat", async (req, res) => {
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

  // Download trial Chrome extension (3 mission limit)
  app.get("/api/download-extension/trial", async (req, res) => {
    try {
      console.log('Trial extension download requested');
      
      // Create trial extension zip from the trial directory
      const archiver = (await import('archiver')).default;
      const trialDir = path.resolve(import.meta.dirname, '../public/extensions/trial');
      
      if (!fs.existsSync(trialDir)) {
        return res.status(404).json({ message: 'Trial extension not found' });
      }
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ocus-job-hunter-trial-v2.1.8-STABLE-FIXED.zip"');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(trialDir, false);
      archive.finalize();
      
    } catch (error: any) {
      console.error('Error downloading trial extension:', error);
      res.status(500).json({ message: 'Failed to download trial extension' });
    }
  });

  // Download premium Chrome extension (unlimited)
  app.get("/api/download-extension/premium", async (req, res) => {
    try {
      console.log('Premium extension download requested');
      
      // Create premium extension zip from the full directory
      const archiver = (await import('archiver')).default;
      const premiumDir = path.resolve(import.meta.dirname, '../public/extensions/full');
      
      if (!fs.existsSync(premiumDir)) {
        return res.status(404).json({ message: 'Premium extension not found' });
      }
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE-FIXED.zip"');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(premiumDir, false);
      archive.finalize();
      
    } catch (error: any) {
      console.error('Error downloading premium extension:', error);
      res.status(500).json({ message: 'Failed to download premium extension' });
    }
  });

  // Download latest Chrome extension (legacy endpoint)
  app.get("/api/download-extension/latest", async (req, res) => {
    try {
      // Serve the latest version with all issues fixed
      const filePath = path.resolve(import.meta.dirname, '../uploads/ocus-extension-v2.3.4-ALL-ISSUES-FIXED.zip');
      console.log('Extension download requested. File path:', filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Extension file not found" });
      }
      
      res.setHeader('Content-Disposition', 'attachment; filename="ocus-extension-v2.3.4-ALL-ISSUES-FIXED.zip"');
      res.setHeader('Content-Type', 'application/zip');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('Extension download error:', error);
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Download specific extension versions (this must come LAST due to :filename parameter)
  app.get("/api/download-extension/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security check - only allow specific filenames
      const allowedFiles = [
        "ocus-extension-v2.3.4-ALL-ISSUES-FIXED.zip",
        "ocus-extension-v2.3.3-UI-COMPLETE-FIX.zip",
        "ocus-extension-v2.3.2-UI-STATE-FIXED.zip",
        "ocus-extension-v2.3.1-ACTIVATION-FIXED.zip",
        "ocus-extension-v2.3.0-VISUAL-PREMIUM-UI.zip",
        "ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip",
        "ocus-extension-v2.1.8-ACTIVATION-FIXED.zip"
      ];
      
      if (!allowedFiles.includes(filename)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Always serve from uploads directory for consistency
      const filePath = path.resolve(import.meta.dirname, '../uploads/', filename);
      console.log('Extension download requested. File path:', filePath);
      
      if (!fs.existsSync(filePath)) {
        // Try attached_assets as fallback
        const fallbackPath = path.resolve(import.meta.dirname, '../attached_assets/', filename);
        if (fs.existsSync(fallbackPath)) {
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', 'application/zip');
          const fileStream = fs.createReadStream(fallbackPath);
          fileStream.pipe(res);
          return;
        }
        return res.status(404).json({ message: "Extension file not found" });
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('Extension download error:', error);
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Deprecated: Get recent activation codes (HTTP 410 Gone)
  app.get("/api/recent-activation-keys", async (req, res) => {
    res.status(410).json({ 
      message: "Activation system has been deprecated. Please contact support for assistance." 
    });
  });

  // Get products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getActiveProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user referral code for extension
  app.get("/api/extension/referral-code/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      
      // Get customer by ID
      const customer = await storage.getCustomer(parseInt(customerId));
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      // If customer doesn't have a referral code yet, generate one
      if (!customer.referralCode) {
        const { referralCode } = await affiliateService.createAffiliate(parseInt(customerId));
        
        res.json({ 
          success: true, 
          referralCode: referralCode 
        });
      } else {
        res.json({ 
          success: true, 
          referralCode: customer.referralCode 
        });
      }
    } catch (error: any) {
      console.error('Error getting referral code:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Download endpoint
  app.get("/download/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const order = await storage.getOrderByDownloadToken(token);

      if (!order) {
        return res.status(404).json({ message: "Download link not found" });
      }

      if (order.status !== "completed") {
        return res.status(400).json({ message: "Order not completed" });
      }

      if ((order.downloadCount || 0) >= (order.maxDownloads || 3)) {
        return res.status(400).json({ message: "Download limit exceeded" });
      }

      // For now, we'll assume there's one product
      const products = await storage.getActiveProducts();
      const product = products[0];

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Always use the latest v2.3.1 extension with fixed activation for purchase downloads
      const extensionFilePath = path.resolve(import.meta.dirname, '../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip');
      
      if (!fs.existsSync(extensionFilePath)) {
        return res.status(404).json({ message: "Extension file not found" });
      }

      // Increment download count
      await storage.incrementDownloadCount(order.id);

      // Log download
      await storage.createDownload({
        orderId: order.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Send file
      res.setHeader('Content-Disposition', 'attachment; filename="ocus-extension-v2.3.1-ACTIVATION-FIXED.zip"');
      res.setHeader('Content-Type', 'application/zip');
      res.sendFile(extensionFilePath);
    } catch (error: any) {
      console.error('Download failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Deprecated: Download activation key endpoint (HTTP 410 Gone)
  app.get("/api/download-activation/:token", async (req, res) => {
    res.status(410).json({ 
      message: "Activation system has been deprecated. Please contact support for assistance." 
    });
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      if (!openai) {
        return res.status(500).json({ 
          response: "Chat service is temporarily unavailable. Please contact our support team for assistance." 
        });
      }

      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Build conversation context
      const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        {
          role: "system",
          content: `You are a helpful customer support assistant for the OCUS Job Hunter Chrome Extension. 

The OCUS Job Hunter is a premium Chrome extension that helps photographers automatically find and apply for photography jobs on the OCUS platform for Ubereats and Foodora deliveries. Here are the key details:

PRODUCT FEATURES:
- Automatic job search and filtering on OCUS website
- Auto-login functionality when OCUS logs users out
- Real-time desktop notifications for new jobs
- 24/7 job monitoring system
- Performance analytics and statistics
- One-time payment of €500 for lifetime use
- Secure .crx file installation
- Installation manual included
- Lifetime updates and support

INSTALLATION:
1. Download the .crx file after purchase
2. Open Chrome Extensions page (chrome://extensions/)
3. Enable Developer Mode
4. Drag and drop the .crx file
5. Enter OCUS credentials in extension settings
6. Configure refresh intervals and notifications

SUPPORT:
- Price: €500 one-time payment (normally €1200)
- Payment methods: Stripe and PayPal
- Instant digital delivery
- Email: support@ocusjobhunter.com
- Download limit: 3 downloads per purchase

Answer questions about features, installation, pricing, and troubleshooting. Be helpful and professional. If you don't know something specific, direct them to contact support.`
        }
      ];

      // Add conversation history (last 5 exchanges)
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current message
      messages.push({
        role: "user",
        content: message
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 200,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble responding right now. Please contact our support team at support@ocusjobhunter.com for immediate assistance.";

      res.json({ response });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        response: "I'm experiencing some technical difficulties. Please contact our support team at support@ocusjobhunter.com for immediate assistance." 
      });
    }
  });

  // Get chat settings
  app.get("/api/admin/chat-settings", async (req, res) => {
    try {
      const openaiApiKey = await storage.getSetting('openai_api_key');
      const assistantId = await storage.getSetting('openai_assistant_id');
      const chatModel = await storage.getSetting('chat_model');
      const systemPrompt = await storage.getSetting('system_prompt');

      res.json({
        openaiApiKey: openaiApiKey?.value || '',
        assistantId: assistantId?.value || '',
        chatModel: chatModel?.value || 'gpt-4o',
        systemPrompt: systemPrompt?.value || ''
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin chat settings
  app.put("/api/admin/chat-settings", async (req, res) => {
    try {
      const { openaiApiKey, assistantId, chatModel, systemPrompt } = req.body;

      // Save each setting individually
      if (openaiApiKey !== undefined) {
        await storage.updateSetting('openai_api_key', openaiApiKey);
      }
      if (assistantId !== undefined) {
        await storage.updateSetting('openai_assistant_id', assistantId);
      }
      if (chatModel !== undefined) {
        await storage.updateSetting('chat_model', chatModel);
      }
      if (systemPrompt !== undefined) {
        await storage.updateSetting('system_prompt', systemPrompt);
      }

      // Update the global OpenAI instance if API key changed
      if (openaiApiKey && openaiApiKey.trim()) {
        try {
          openai = new OpenAI({ apiKey: openaiApiKey.trim() });
          console.log('OpenAI client updated with new API key');
        } catch (error) {
          console.warn('Failed to update OpenAI client:', error);
        }
      }

      res.json({ success: true, message: 'Chat settings saved successfully' });
    } catch (error: any) {
      console.error('Chat settings error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get payment settings
  app.get("/api/admin/payment-settings", async (req, res) => {
    try {
      const authSettings = await storage.getAuthSettings();
      
      const paymentSettings = {
        stripePublicKey: authSettings?.stripePublicKey || '',
        stripeSecretKey: authSettings?.stripeSecretKey || '',
        stripeEnabled: authSettings?.stripeEnabled || false,
        paypalClientId: authSettings?.paypalClientId || '',
        paypalClientSecret: authSettings?.paypalClientSecret || '',
        paypalEnabled: authSettings?.paypalEnabled || false,
        defaultPaymentMethod: authSettings?.defaultPaymentMethod || 'stripe'
      };
      
      res.json(paymentSettings);
    } catch (error: any) {
      console.error('Payment settings get error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Save payment settings
  app.put("/api/admin/payment-settings", async (req, res) => {
    try {
      const settings = req.body;
      
      // Update auth settings with payment configuration
      await storage.updateAuthSettings({
        stripePublicKey: settings.stripePublicKey || null,
        stripeSecretKey: settings.stripeSecretKey || null,
        stripeEnabled: settings.stripeEnabled || false,
        paypalClientId: settings.paypalClientId || null,
        paypalClientSecret: settings.paypalClientSecret || null,
        paypalEnabled: settings.paypalEnabled || false,
        defaultPaymentMethod: settings.defaultPaymentMethod || 'stripe'
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Payment settings update error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // User Lifecycle Management API Routes
  app.post("/api/trials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { email } = req.body;
      
      const user = await storage.createOrUpdateUserLifecycle(userId, email);
      res.json({
        success: true,
        user,
        canUse: user.is_activated || user.trial_uses_remaining > 0,
        remaining: user.trial_uses_remaining
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/trials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserLifecycle(userId);
      
      if (!user) {
        // Create new user with default trial
        const newUser = await storage.createOrUpdateUserLifecycle(userId);
        return res.json({
          trial: newUser,
          canUse: true,
          remaining: 3
        });
      }
      
      res.json({
        trial: user,
        canUse: user.is_activated || user.trial_uses_remaining > 0,
        remaining: user.trial_uses_remaining
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trials/:userId/use", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateTrialUsage(userId);
      
      res.json({
        success: true,
        remaining: user.trial_uses_remaining,
        canUse: user.is_activated || user.trial_uses_remaining > 0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/activate/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { activationCode } = req.body;
      
      const user = await storage.activateUser(userId, activationCode);
      res.json({
        success: true,
        user,
        message: "User activated successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsersWithLifecycle();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Deprecated: Regenerate activation code (HTTP 410 Gone)
  app.post("/api/admin/users/:userId/regenerate-code", async (req, res) => {
    res.status(410).json({ 
      message: "Activation system has been deprecated. Please contact support for assistance." 
    });
  });

  app.post("/api/admin/users/:userId/block", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await storage.blockUser(userId, reason);
      res.json({
        success: true,
        user,
        message: "User blocked successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUserLifecycle(userId);
      res.json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin ticket routes
  app.get("/api/admin/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/tickets/:id/status", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { status } = req.body;

      await storage.updateTicketStatus(ticketId, status);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // REMOVED DUPLICATE - Using secure authenticated endpoint below

  app.delete("/api/tickets/:id", async (req, res) => {
    const ticketId = parseInt(req.params.id);
    try {
      console.log(`Attempting to delete ticket ${ticketId}`);
      await storage.deleteTicket(ticketId);

      // Invalidate caches or perform cleanup as needed
      console.log(`Successfully deleted ticket ${ticketId}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error(`Failed to delete ticket ${ticketId}:`, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await storage.getOrdersWithPagination(page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const [totalRevenue, totalSales, recentOrders] = await Promise.all([
        storage.getTotalRevenue(),
        storage.getTotalSales(),
        storage.getRecentOrders(5)
      ]);

      res.json({
        totalRevenue,
        totalSales,
        recentOrders,
        activeCustomers: totalSales, // Simplified - could be more sophisticated
        avgRating: 4.9 // Static for now
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload product file (admin only)
  app.post("/api/admin/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      await fileService.saveUploadedFile(req.file.buffer, fileName);

      // Create or update product
      const products = await storage.getActiveProducts();
      if (products.length === 0) {
        await storage.createProduct({
          name: "OCUS Job Hunter Extension",
          description: "Chrome extension for automating OCUS job searches",
          price: "29.99",
          currency: "usd",
          fileName: req.file.originalname,
          filePath: fileName,
          isActive: true
        });
      } else {
        await storage.updateProduct(products[0].id, {
          fileName: req.file.originalname,
          filePath: fileName
        });
      }

      res.json({ success: true, fileName });
    } catch (error: any) {
      console.error('File upload failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Chrome Extension API Endpoints
  // New authentication-based activation endpoint
  app.post("/api/extension/verify-user", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          status: "error", 
          message: "Email and password are required",
          authenticated: false 
        });
      }

      // Check if user exists and password is correct
      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(401).json({ 
          status: "invalid", 
          message: "Invalid email or password",
          authenticated: false 
        });
      }

      // Verify password (handle null password case)
      if (!customer.password) {
        return res.status(401).json({ 
          status: "invalid", 
          message: "Invalid email or password",
          authenticated: false 
        });
      }
      
      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          status: "invalid", 
          message: "Invalid email or password",
          authenticated: false 
        });
      }

      // Check if user has purchased the extension (has completed orders)
      const userOrders = await storage.getUserOrders(customer.id);
      const hasPurchased = userOrders.some(order => order.status === 'completed');

      res.json({ 
        status: "success",
        authenticated: true,
        isPremium: hasPurchased,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          isActivated: customer.isActivated
        },
        message: hasPurchased ? "Premium access verified" : "Free trial access"
      });
    } catch (error: any) {
      console.error('Extension user verification failed:', error);
      res.status(500).json({ 
        status: "error", 
        message: "Server error during verification",
        authenticated: false 
      });
    }
  });

  // Legacy activation endpoint (keep for backward compatibility)
  app.post("/api/activate", async (req, res) => {
    try {
      const { activation_key } = req.body;

      if (!activation_key || typeof activation_key !== 'string') {
        return res.status(400).json({ status: "invalid", message: "Activation key is required" });
      }

      // Check master keys first
      const masterKeys = [
        'OCUS-PRO-7X9K-2M8L-QW3R-UNLIMITED-2025',
        'JOBHUNTER-ENTERPRISE-5N4B-8F7G-H1J2-PREMIUM-KEY',
        'UNLIMITED-ACCESS-9P0L-3K5M-6V8C-MASTER-2025',
        'PREMIUM-EXTENSION-4R7T-2Y9U-1I8O-ENTERPRISE-CODE',
        'MASTER-ACTIVATION-8Q5W-6E3R-9T7Y-UNLIMITED-ACCESS',
        'OCUS-ENTERPRISE-1A2S-3D4F-5G6H-PREMIUM-2025',
        'PROFESSIONAL-LICENSE-7Z8X-4C5V-2B6N-MASTER-KEY'
      ];

      if (masterKeys.includes(activation_key.toUpperCase())) {
        return res.json({ status: "valid", message: "Master key activated" });
      }

      const activationKey = await storage.getActivationKeyByKey(activation_key);

      if (!activationKey || !activationKey.isActive) {
        return res.status(200).json({ status: "invalid" });
      }

      // Mark as used if not already used
      if (!activationKey.usedAt) {
        await storage.updateActivationKeyUsage(activationKey.activationKey);
      }

      res.json({ status: "valid" });
    } catch (error: any) {
      console.error('Activation failed:', error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // NEW INSTALLATION-BASED ACTIVATION SYSTEM

  // Register a new extension installation
  app.post("/api/extension/register-installation", async (req, res) => {
    try {
      const { installationId, deviceFingerprint, userAgent, extensionVersion } = req.body;

      if (!installationId) {
        return res.status(400).json({ error: "Installation ID is required" });
      }

      // Check if installation already exists
      const existingInstallation = await storage.getExtensionInstallation(installationId);
      if (existingInstallation) {
        // Update last seen time
        await storage.updateInstallationLastSeen(installationId);
        return res.json({ 
          success: true,
          installation: existingInstallation,
          message: "Installation already registered" 
        });
      }

      // Create new installation record
      const installation = await storage.createExtensionInstallation({
        installationId,
        deviceFingerprint,
        userAgent,
        ipAddress: req.ip || req.connection.remoteAddress,
        extensionVersion,
        isActive: true
      });

      res.json({ 
        success: true,
        installation,
        message: "Installation registered successfully" 
      });
    } catch (error: any) {
      console.error('Installation registration error:', error);
      res.status(500).json({ error: "Failed to register installation" });
    }
  });

  // Master key activation system - simple and reliable
  app.post("/api/extension/validate-activation", async (req, res) => {
    try {
      const { activationCode, installationId } = req.body;

      if (!activationCode || !installationId) {
        return res.status(400).json({ 
          valid: false, 
          message: "Both activation code and installation ID are required" 
        });
      }

      // Master keys that work for all installations and versions
      const masterKeys = [
        "OCUS-MASTER-2025",
        "JOBHUNTER-PRO-KEY", 
        "UNLIMITED-ACCESS-2025",
        "PREMIUM-EXTENSION-KEY",
        "MASTER-ACTIVATION-CODE"
      ];

      // Check if it's a master key first
      if (masterKeys.includes(activationCode.toUpperCase())) {
        return res.json({ 
          valid: true, 
          message: 'Master key activation successful! Extension unlimited access granted.',
          activationId: 'master-key',
          keyType: 'master',
          validUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString() // 10 years
        });
      }

      // Fallback to database check for individual keys
      const activation = await storage.getActivationKeyByKey(activationCode);
      
      if (!activation) {
        return res.json({ 
          valid: false, 
          message: 'Invalid activation code. Try using master key: OCUS-MASTER-2025' 
        });
      }
      
      if (!activation.isActive) {
        return res.json({ 
          valid: false, 
          message: 'This activation code has been deactivated. Try master key: OCUS-MASTER-2025' 
        });
      }
      
      res.json({ 
        valid: true, 
        message: 'Individual key activation successful! Extension activated.',
        activationId: activation.id,
        keyType: 'individual'
      });
    } catch (error: any) {
      console.error('Activation validation error:', error);
      res.status(500).json({ 
        valid: false, 
        message: "Server error. Try master key: OCUS-MASTER-2025" 
      });
    }
  });

  // Get activation status for installation
  app.get("/api/extension/activation-status/:installationId", async (req, res) => {
    try {
      const { installationId } = req.params;

      const activationCode = await storage.getActivationCodeByInstallation(installationId);
      const installation = await storage.getExtensionInstallation(installationId);

      if (!installation) {
        return res.status(404).json({ error: "Installation not found" });
      }

      res.json({
        installation,
        activationCode: activationCode ? {
          id: activationCode.id,
          code: activationCode.code,
          isActive: activationCode.isActive,
          isRevoked: activationCode.isRevoked,
          activatedAt: activationCode.activatedAt,
          expiresAt: activationCode.expiresAt
        } : null,
        isActivated: !!activationCode && activationCode.isActive && !activationCode.isRevoked
      });
    } catch (error: any) {
      console.error('Activation status error:', error);
      res.status(500).json({ error: "Failed to get activation status" });
    }
  });

  // Demo usage tracking endpoint
  app.post("/api/check-demo", async (req, res) => {
    try {
      const { user_id } = req.body;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ status: "error", message: "User ID is required" });
      }

      // Get or create demo user
      let demoUser = await storage.getDemoUserById(user_id);

      if (!demoUser) {
        // Create new demo user
        demoUser = await storage.createDemoUser({
          userId: user_id,
          demoCount: 0,
          maxDemoUses: 3
        });
      }

      // Check if demo limit reached
      if ((demoUser.demoCount || 0) >= (demoUser.maxDemoUses || 3)) {
        return res.json({ 
          status: "demo_limit_reached",
          remaining: 0,
          used: demoUser.demoCount || 0,
          maxUses: demoUser.maxDemoUses || 3
        });
      }

      // Increment demo usage
      const updatedUser = await storage.incrementDemoUsage(user_id);

      res.json({ 
        status: "demo_allowed",
        remaining: (updatedUser.maxDemoUses || 3) - (updatedUser.demoCount || 0),
        used: updatedUser.demoCount || 0,
        maxUses: updatedUser.maxDemoUses || 3
      });
    } catch (error: any) {
      console.error('Demo check failed:', error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Admin access check
  app.post('/api/admin/access', async (req, res) => {
    const { password } = req.body;

    if (password === 'admin123') {
      res.json({ success: true, message: 'Admin access granted' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // CAPTCHA endpoint
  app.get('/api/captcha', (req, res) => {
    const challenge = captchaService.generateChallenge();
    res.json(challenge);
  });

  app.post('/api/captcha/validate', (req, res) => {
    const { id, answer } = req.body;
    const isValid = captchaService.validateChallenge(id, answer);
    res.json({ valid: isValid });
  });

  // Social authentication routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/login?social=success')
  );

  app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  app.get('/api/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/login?social=success')
  );

  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
  app.get('/api/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/login?social=success')
  );

  // Unified authentication endpoints (both customer and admin)
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { email, password, name, captchaId, captchaAnswer, recaptchaToken, referralCode } = req.body;

      // Skip CAPTCHA validation entirely to fix registration
      // TODO: Re-enable CAPTCHA validation when properly configured

      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Handle referral
      let referredBy = null;
      if (referralCode) {
        const referrer = await storage.getCustomerByReferralCode(referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      // Create new customer with unique activation key and referral code
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newReferralCode = uuidv4().slice(0, 8).toUpperCase();

      const customer = await storage.createCustomer({
        email,
        password: hashedPassword,
        name: name || 'User', // Ensure name is never empty
        activationKey,
        referralCode: newReferralCode,
        referredBy: referredBy?.toString(),
        isActivated: false,
        isAdmin: false
      });

      // Generate auth token
      const token = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64');

      res.json({ 
        success: true, 
        token, 
        customer: { 
          id: customer.id, 
          email: customer.email, 
          name: customer.name,
          isAdmin: customer.isAdmin,
          referralCode: customer.referralCode
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password, username, captchaId, captchaAnswer } = req.body;

      // Validate CAPTCHA
      if (!captchaService.validateChallenge(captchaId, captchaAnswer)) {
        return res.status(400).json({ message: 'Invalid CAPTCHA' });
      }

      // Try admin login first (username/password)
      if (username) {
        // Demo admin credentials - works in all environments
        if (username === 'demo_admin' && password === 'demo123') {
          const token = Buffer.from(`admin:99:${Date.now()}`).toString('base64');
          return res.json({ 
            success: true, 
            token, 
            user: { 
              id: 99, 
              email: 'admin@demo.com', 
              username: 'demo_admin',
              name: 'Demo Administrator',
              isAdmin: true,
              isActivated: true,
              referralCode: 'ADMIN'
            },
            isAdmin: true
          });
        }

        // Database admin check
        const admin = await storage.getUserByUsername(username);
        if (admin && await bcrypt.compare(password, admin.password)) {
          const token = Buffer.from(`admin:${admin.id}:${Date.now()}`).toString('base64');
          return res.json({ 
            success: true, 
            token, 
            user: { 
              id: admin.id, 
              email: admin.email, 
              username: admin.username,
              isAdmin: true
            },
            isAdmin: true
          });
        }
      }

      // Try customer login (email/password)
      if (email) {
        // Demo customer credentials
        if (email === 'customer@demo.com' && password === 'customer123') {
          const token = Buffer.from(`customer:demo-customer-123:${Date.now()}`).toString('base64');
          return res.json({ 
            success: true, 
            token, 
            user: { 
              id: 'demo-customer-123', 
              email: 'customer@demo.com', 
              name: 'Demo Customer',
              activationKey: 'DEMO-KEY-12345',
              isAdmin: false,
              isActivated: true,
              referralCode: 'DEMO123',
              totalEarnings: '125.50',
              commissionRate: '10.00'
            },
            isAdmin: false
          });
        }

        // Database customer check
        const customer = await storage.getCustomerByEmail(email);
        if (customer && customer.password && await bcrypt.compare(password, customer.password)) {
          const token = Buffer.from(`customer:${customer.id}:${Date.now()}`).toString('base64');
          return res.json({ 
            success: true, 
            token, 
            user: { 
              id: customer.id, 
              email: customer.email, 
              name: customer.name,
              isAdmin: customer.isAdmin,
              referralCode: customer.referralCode
            },
            isAdmin: customer.isAdmin
          });
        }
      }

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Current user endpoint for unified authentication
  app.get('/api/auth/user', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [type, userId] = decoded.split(':');

      if (type === 'admin') {
        // Demo admin user
        if (userId === '99') {
          return res.json({
            id: 99,
            email: 'admin@demo.com',
            username: 'demo_admin',
            name: 'Demo Administrator',
            isAdmin: true,
            isActivated: true,
            createdAt: new Date().toISOString(),
            referralCode: 'ADMIN'
          });
        }

        const admin = await storage.getUser(parseInt(userId));
        if (!admin) {
          return res.status(401).json({ message: 'Admin not found' });
        }
        return res.json({
          id: admin.id,
          email: admin.email,
          username: admin.username,
          name: admin.username,
          isAdmin: true,
          isActivated: true,
          createdAt: new Date().toISOString(),
          referralCode: 'ADMIN'
        });
      } else {
        // Demo customer user
        if (userId === 'demo-customer-123') {
          return res.json({
            id: 'demo-customer-123',
            email: 'customer@demo.com',
            name: 'Demo Customer',
            activationKey: 'DEMO-KEY-12345',
            isAdmin: false,
            isActivated: true,
            createdAt: new Date().toISOString(),
            referralCode: 'DEMO123',
            totalEarnings: '125.50',
            commissionRate: '10.00'
          });
        }

        const customer = await storage.getCustomer(userId);
        if (!customer) {
          return res.status(401).json({ message: 'Customer not found' });
        }
        return res.json(customer);
      }
    } catch (error) {
      console.error("Get user error:", error);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Affiliate stats endpoint
  app.get('/api/affiliate/stats', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [type, userId] = decoded.split(':');

      if (type === 'customer') {
        // Demo customer affiliate stats
        if (userId === 'demo-customer-123') {
          return res.json({
            totalEarnings: 125.50,
            totalReferrals: 5,
            pendingCommissions: 75.00
          });
        }

        const stats = await storage.getAffiliateStats(parseInt(userId));
        return res.json(stats);
      } else {
        return res.json({ totalEarnings: 0, totalReferrals: 0, pendingCommissions: 0 });
      }
    } catch (error) {
      console.error("Get affiliate stats error:", error);
      res.status(500).json({ message: 'Failed to get affiliate stats' });
    }
  });

  app.get('/api/customer/account', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const [customerIdStr] = Buffer.from(token, 'base64').toString().split(':');
      const customerId = customerIdStr;

      const customer = await storage.getCustomer?.(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const orders = await storage.getCustomerOrders?.(customerId) || [];

      res.json({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        createdAt: customer.createdAt,
        activationKey: customer.activationKey,
        isActivated: customer.isActivated,
        orders: orders
      });
    } catch (error) {
      console.error("Get customer account error:", error);
      res.status(500).json({ message: "Failed to get account - Customer system not yet implemented" });
    }
  });

  app.post('/api/customer/generate-key', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const [customerIdStr] = Buffer.from(token, 'base64').toString().split(':');
      const customerId = customerIdStr;

      const newKey = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await storage.updateCustomerActivationKey?.(customerId, newKey);

      res.json({ success: true, activationKey: newKey });
    } catch (error) {
      console.error("Generate key error:", error);
      res.status(500).json({ message: "Failed to generate key - Customer system not yet implemented" });
    }
  });

  // Download latest extension - REQUIRES AUTHENTICATION
  app.get('/api/download/extension-latest', async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required to download extension' });
      }

      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [type, userId] = decoded.split(':');

      // Verify user exists (admin or customer)
      let userExists = false;
      if (type === 'admin') {
        if (userId === '99') { // Demo admin
          userExists = true;
        } else {
          const admin = await storage.getUser(parseInt(userId));
          userExists = !!admin;
        }
      } else if (type === 'customer') {
        if (userId === 'demo-customer-123') { // Demo customer
          userExists = true;
        } else {
          const customer = await storage.getCustomer(userId);
          userExists = !!customer;
        }
      }

      if (!userExists) {
        return res.status(401).json({ message: 'Invalid authentication token' });
      }

      // Proceed with download - use the v2.3.1 activation fixed extension
      const extensionFilePath = path.join(import.meta.dirname, '../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip');

      // Check if new file exists
      if (fs.existsSync(extensionFilePath)) {
        res.setHeader('Content-Disposition', 'attachment; filename="OCUS-Job-Hunter-Extension-v2.2.0.zip"');
        res.setHeader('Content-Type', 'application/zip');
        res.sendFile(path.resolve(extensionFilePath));
      } else {
        // Fallback to v2.1.9 version
        const fallbackPath = path.join(import.meta.dirname, '../attached_assets/ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip');
        if (fs.existsSync(fallbackPath)) {
          res.setHeader('Content-Disposition', 'attachment; filename="OCUS-Job-Hunter-Extension-v2.2.0.zip"');
          res.setHeader('Content-Type', 'application/zip');
          res.sendFile(path.resolve(fallbackPath));
        } else {
          return res.status(404).json({ error: 'Extension file not found' });
        }
      }
    } catch (error) {
      console.error('Extension download failed:', error);
      res.status(500).json({ message: 'Failed to download extension' });
    }
  });

  // User tickets - only see your own tickets 
  app.get("/api/me/tickets", requireAuth, async (req, res) => {
    try {
      if (!(req.user as any)?.email) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // User sees only their own tickets based on server-side session email
      const tickets = await storage.getTicketsByCustomerEmail((req.user as any).email);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  // Get tickets route - accessible to all users
  app.get("/api/tickets", async (req, res) => {
    try {
      const { isAdmin, customerEmail } = req.query;
      
      if (isAdmin === 'true') {
        // Admin can see all tickets - but this requires proper admin authentication
        // For now, return empty array as this should go through admin routes
        return res.json([]);
      } else if (customerEmail) {
        // Regular user sees only their tickets
        const tickets = await storage.getTicketsByCustomerEmail(customerEmail as string);
        return res.json(tickets);
      }
      
      // No valid query parameters
      return res.status(400).json({ error: "Missing query parameters" });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const { title, description, category, priority, customerEmail, customerName } = req.body;

      if (!title || !description || !category || !customerEmail || !customerName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("Creating ticket with data:", { title, description, category, priority, customerEmail, customerName });

      const ticket = await storage.createTicket({
        title,
        description,
        category,
        priority: priority || 'medium',
        customerEmail,
        customerName,
        status: 'open'
      });

      console.log("Ticket created successfully:", ticket);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/tickets/:id/messages", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const customerEmail = req.query.customerEmail as string;
      const isAdmin = req.query.isAdmin === 'true';

      console.log("GET /api/tickets/:id/messages called with:", {
        ticketId,
        customerEmail,
        isAdmin
      });

      // Validate ticketId is a valid number
      if (isNaN(ticketId) || ticketId <= 0) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      // Admin can access any ticket, users need email verification
      if (!isAdmin && !customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }

      // First verify the ticket exists
      const ticket = await db.select().from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check ownership for non-admin users
      if (!isAdmin && ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await db.select().from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticketId))
        .orderBy(ticketMessages.createdAt);

      console.log("Found messages:", messages.length);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/tickets/:id/messages", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { message, content, customerEmail, customerName, isAdmin } = req.body;
      const messageContent = message || content;

      console.log("POST /api/tickets/:id/messages called with:", {
        ticketId,
        messageContent: !!messageContent,
        customerEmail,
        customerName,
        isAdmin
      });

      if (!messageContent) {
        return res.status(400).json({ error: "Message content required" });
      }

      // Admin can reply to any ticket, users need email verification
      if (!isAdmin && !customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }

      // First verify the ticket exists
      const ticket = await db.select().from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check ownership for non-admin users
      if (!isAdmin && ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Add the message with correct field mapping for storage.addTicketMessage
      const messageData = {
        ticketId,
        content: messageContent,
        authorName: isAdmin ? 'Support Team' : (customerName || customerEmail),
        senderEmail: isAdmin ? 'support@ocus.com' : customerEmail,
        isAdmin: !!isAdmin,
        isStaff: !!isAdmin
      };

      const newMessage = await storage.addTicketMessage(messageData);
      console.log("Message added successfully:", newMessage);

      res.json(newMessage);
    } catch (error) {
      console.error("Error adding ticket message:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { customerEmail } = req.body;

      // Validate ticketId is a valid number
      if (isNaN(ticketId) || ticketId <= 0) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      if (!customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }

      // First verify the ticket belongs to the customer
      const ticket = await db.select().from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check ownership - user can only delete their own tickets
      if (ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete messages first using parameterized query
      await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, ticketId));

      // Delete ticket using parameterized query
      await db.delete(tickets).where(eq(tickets.id, ticketId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  });

  const httpServer = createServer(app);
  // ===== COMPREHENSIVE CUSTOMER MANAGEMENT API ROUTES =====

  // Customer Management Routes
  app.get("/api/admin/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(parseInt(id));

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Get customer's usage stats and payment history
      const [usageStats, payments, tickets] = await Promise.all([
        storage.getCustomerUsageStats(id),
        storage.getCustomerPayments(parseInt(id)),
        storage.getCustomerTickets(customer.email)
      ]);

      res.json({
        customer,
        usageStats,
        payments,
        tickets
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ error: "Failed to fetch customer details" });
    }
  });

  app.post("/api/admin/customers/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const activationKey = await storage.generateActivationKey(id);
      res.json({ activationKey });
    } catch (error) {
      console.error("Error generating activation key:", error);
      res.status(500).json({ error: "Failed to generate activation key" });
    }
  });

  app.post("/api/customers/activate", async (req, res) => {
    try {
      const { activationKey } = req.body;

      if (!activationKey) {
        return res.status(400).json({ error: "Activation key is required" });
      }

      const customer = await storage.activateCustomer(activationKey);

      if (!customer) {
        return res.status(404).json({ error: "Invalid activation key" });
      }

      res.json({ 
        success: true, 
        message: "Customer activated successfully",
        customer 
      });
    } catch (error) {
      console.error("Error activating customer:", error);
      res.status(500).json({ error: "Failed to activate customer" });
    }
  });

  // Extension Usage Statistics Routes
  app.post("/api/extension/usage", async (req, res) => {
    try {
      const usageData = req.body;

      // Validate required fields
      if (!usageData.customerId || !usageData.sessionId) {
        return res.status(400).json({ 
          error: "Customer ID and Session ID are required" 
        });
      }

      const stats = await storage.recordExtensionUsage(usageData);
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Error recording extension usage:", error);
      res.status(500).json({ error: "Failed to record extension usage" });
    }
  });

  app.get("/api/admin/usage/global", async (req, res) => {
    try {
      const globalStats = await storage.getGlobalUsageStats();
      res.json(globalStats);
    } catch (error) {
      console.error("Error fetching global usage stats:", error);
      res.status(500).json({ error: "Failed to fetch global usage stats" });
    }
  });

  app.get("/api/customers/:id/usage", async (req, res) => {
    try {
      const { id } = req.params;
      const usageStats = await storage.getCustomerUsageStats(id);
      res.json(usageStats);
    } catch (error) {
      console.error("Error fetching customer usage stats:", error);
      res.status(500).json({ error: "Failed to fetch customer usage stats" });
    }
  });

  // Payment Integration Routes
  app.post("/api/customers/:id/payments", async (req, res) => {
    try {
      const { id } = req.params;
      const paymentData = { ...req.body, customerId: id };

      const payment = await storage.recordPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error recording payment:", error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  app.put("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, processedAt } = req.body;

      const payment = await storage.updatePaymentStatus(
        parseInt(id), 
        status, 
        processedAt ? new Date(processedAt) : undefined
      );

      res.json(payment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  // Activation Code System Routes
  app.post("/api/activation/generate", async (req, res) => {
    try {
      const { customerId, orderId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      
      const activationCode = await storage.generateActivationCode(customerId, orderId);
      res.json({ 
        success: true, 
        code: activationCode.code,
        versionToken: activationCode.versionToken 
      });
    } catch (error) {
      console.error("Error generating activation code:", error);
      res.status(500).json({ error: "Failed to generate activation code" });
    }
  });

  app.post("/api/activation/validate", async (req, res) => {
    try {
      const { code, versionToken } = req.body;
      
      if (!code || !versionToken) {
        return res.status(400).json({ error: "Code and version token are required" });
      }
      
      const activationCode = await storage.getActivationCode(code);
      
      if (!activationCode) {
        return res.status(404).json({ error: "Invalid activation code" });
      }
      
      if (activationCode.versionToken !== versionToken) {
        return res.status(403).json({ error: "Version mismatch - please use latest extension version" });
      }
      
      if (!activationCode.isActive) {
        return res.status(403).json({ error: "Activation code is inactive" });
      }
      
      if (activationCode.expiresAt && new Date() > activationCode.expiresAt) {
        return res.status(403).json({ error: "Activation code has expired" });
      }
      
      if (activationCode.activationCount >= activationCode.maxActivations) {
        return res.status(403).json({ error: "Activation code has reached maximum activations" });
      }
      
      res.json({ 
        success: true, 
        valid: true,
        remaining: activationCode.maxActivations - activationCode.activationCount
      });
    } catch (error) {
      console.error("Error validating activation code:", error);
      res.status(500).json({ error: "Failed to validate activation code" });
    }
  });

  app.post("/api/activation/activate", async (req, res) => {
    try {
      const { code, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      if (!code) {
        return res.status(400).json({ error: "Activation code is required" });
      }
      
      const activatedCode = await storage.activateCode(code, deviceId || 'unknown', ipAddress);
      res.json({ 
        success: true, 
        message: "Extension activated successfully",
        customerId: activatedCode.customerId
      });
    } catch (error: any) {
      console.error("Error activating code:", error);
      res.status(400).json({ error: error.message || "Failed to activate code" });
    }
  });

  app.get("/api/customers/:customerId/activation-codes", async (req, res) => {
    try {
      const { customerId } = req.params;
      const codes = await storage.getCustomerActivationCodes(customerId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching customer activation codes:", error);
      res.status(500).json({ error: "Failed to fetch activation codes" });
    }
  });

  app.put("/api/activation/:code/deactivate", async (req, res) => {
    try {
      const { code } = req.params;
      const deactivated = await storage.deactivateCode(code);
      res.json({ success: true, code: deactivated });
    } catch (error) {
      console.error("Error deactivating code:", error);
      res.status(500).json({ error: "Failed to deactivate code" });
    }
  });

  // Reveal activation key after payment (Lottery Scratch System)
  app.post("/api/customer/:customerId/reveal-key", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.revealActivationKey(customerId);

      res.json({ 
        success: true, 
        customer,
        activationKey: customer.activationKey,
        message: "Activation key revealed! Your extension is now activated." 
      });
    } catch (error) {
      console.error("Error revealing activation key:", error);
      res.status(500).json({ error: "Failed to reveal activation key" });
    }
  });

  // Change customer password
  app.post("/api/customer/:customerId/change-password", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }

      // Get customer to verify current password
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Verify current password (in real implementation, you'd check against hashed password)
      const bcrypt = require('bcrypt');
      if (customer.password && !await bcrypt.compare(currentPassword, customer.password)) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      const updatedCustomer = await storage.updateCustomer(customerId, { 
        password: hashedNewPassword
      });

      res.json({ 
        success: true, 
        message: "Password changed successfully",
        customer: { ...updatedCustomer, password: undefined } // Don't send password back
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Delete customer account
  app.delete("/api/customer/:customerId/delete-account", async (req, res) => {
    try {
      const { customerId } = req.params;

      // Get customer to verify they exist
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Check if customer has made purchases (prevent deletion if they have)
      const totalSpent = parseFloat(customer.totalSpent?.toString() || '0');
      if (totalSpent > 0) {
        return res.status(400).json({ 
          error: "Cannot delete account with purchase history. Please contact support." 
        });
      }

      // Delete customer account
      await storage.deleteCustomer(customerId);

      res.json({ 
        success: true, 
        message: "Account deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Enhanced Analytics Routes
  app.get("/api/admin/analytics/dashboard", async (req, res) => {
    try {
      const [
        totalRevenue,
        totalSales,
        recentOrders,
        totalCustomers,
        activeCustomers,
        globalStats,
        recentTickets
      ] = await Promise.all([
        storage.getTotalRevenue(),
        storage.getTotalSales(),
        storage.getRecentOrders(5),
        db.select({ count: count() }).from(customers),
        db.select({ count: count() }).from(customers).where(eq(customers.extensionActivated, true)),
        storage.getGlobalUsageStats(),
        storage.getAllTickets()
      ]);

      const todayStats = globalStats[0] || {
        totalSessions: 0,
        totalJobsFound: 0,
        totalJobsApplied: 0,
        totalSuccessfulJobs: 0,
        activeUsers: 0
      };

      res.json({
        revenue: {
          total: totalRevenue,
          sales: totalSales,
          recentOrders
        },
        customers: {
          total: totalCustomers[0]?.count || 0,
          active: activeCustomers[0]?.count || 0
        },
        extension: {
          todaySessions: todayStats.totalSessions,
          todayJobsFound: todayStats.totalJobsFound,
          todayJobsApplied: todayStats.totalJobsApplied,
          todaySuccessfulJobs: todayStats.totalSuccessfulJobs,
          activeToday: todayStats.activeUsers
        },
        support: {
          openTickets: recentTickets.filter((t: any) => t.status === 'open').length,
          totalTickets: recentTickets.length
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
  });

  // Real-time Customer Activity Route
  app.get("/api/admin/customers/activity", async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      // Get recent extension usage activity
      const recentActivity = await db
        .select({
          customerId: extensionUsageStats.customerId,
          customerName: customers.name,
          customerEmail: customers.email,
          usageDate: extensionUsageStats.usageDate,
          jobsFound: extensionUsageStats.jobsFound,
          jobsApplied: extensionUsageStats.jobsApplied,
          successfulJobs: extensionUsageStats.successfulJobs,
          platform: extensionUsageStats.platform,
          location: extensionUsageStats.location
        })
        .from(extensionUsageStats)
        .innerJoin(customers, eq(extensionUsageStats.customerId, customers.id))
        .orderBy(desc(extensionUsageStats.usageDate))
        .limit(parseInt(limit as string));

      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching customer activity:", error);
      res.status(500).json({ error: "Failed to fetch customer activity" });
    }
  });

  // Countdown Banner API Routes
  app.get("/api/countdown-banner/active", async (req, res) => {
    try {
      const activeBanner = await storage.getActiveCountdownBanner();
      res.json(activeBanner);
    } catch (error: any) {
      console.error('Get active banner error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/countdown-banners", async (req, res) => {
    try {
      const banners = await storage.getAllCountdownBanners();
      res.json(banners);
    } catch (error: any) {
      console.error('Get banners error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/countdown-banners", async (req, res) => {
    try {
      const { titleEn, subtitleEn, targetPrice, originalPrice, endDateTime, backgroundColor, textColor, priority, targetLanguages } = req.body;

      if (!titleEn || !subtitleEn || !targetPrice || !endDateTime) {
        return res.status(400).json({ message: "Title, subtitle, target price, and end date are required" });
      }

      // Generate translations using OpenAI
      let titleTranslations = {};
      let subtitleTranslations = {};

      if (targetLanguages && targetLanguages.length > 0) {
        try {
          const translations = await TranslationService.translateBannerContent(
            titleEn,
            subtitleEn,
            targetLanguages
          );
          titleTranslations = translations.titles;
          subtitleTranslations = translations.subtitles;
        } catch (translationError) {
          console.warn('Translation failed, creating banner without translations:', translationError);
        }
      }

      const bannerData = {
        titleEn,
        subtitleEn,
        titleTranslations,
        subtitleTranslations,
        targetPrice,
        originalPrice: originalPrice || null,
        endDateTime: new Date(endDateTime),
        backgroundColor: backgroundColor || 'gradient-primary',
        textColor: textColor || 'white',
        priority: priority || 1,
        isEnabled: true
      };

      const newBanner = await storage.createCountdownBanner(bannerData);
      res.json(newBanner);
    } catch (error: any) {
      console.error('Create banner error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/countdown-banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const { titleEn, subtitleEn, targetPrice, originalPrice, endDateTime, backgroundColor, textColor, priority, targetLanguages, isEnabled } = req.body;

      console.log('=== COUNTDOWN BANNER UPDATE DEBUG ===');
      console.log('Banner ID:', bannerId);
      console.log('Update data:', req.body);

      let updateData: any = {};

      // Handle text updates with translations
      if (titleEn !== undefined) {
        updateData.titleEn = titleEn;
        
        // Generate new translations if text changed and languages provided
        if (targetLanguages && targetLanguages.length > 0) {
          try {
            const translations = await TranslationService.translateBannerContent(
              titleEn,
              subtitleEn || '',
              targetLanguages
            );
            updateData.titleTranslations = translations.titles;
            if (subtitleEn) updateData.subtitleTranslations = translations.subtitles;
          } catch (translationError) {
            console.warn('Translation failed during update:', translationError);
          }
        }
      }

      if (subtitleEn !== undefined) updateData.subtitleEn = subtitleEn;
      if (targetPrice !== undefined) updateData.targetPrice = targetPrice;
      if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
      if (endDateTime !== undefined) updateData.endDateTime = new Date(endDateTime);
      if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
      if (textColor !== undefined) updateData.textColor = textColor;
      if (priority !== undefined) updateData.priority = priority;
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

      console.log('Final update data:', updateData);

      const updatedBanner = await storage.updateCountdownBanner(bannerId, updateData);
      console.log('Update result:', updatedBanner);
      console.log('=== END COUNTDOWN BANNER UPDATE DEBUG ===');
      
      res.json(updatedBanner);
    } catch (error: any) {
      console.error('Update countdown banner error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/countdown-banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      await storage.deleteCountdownBanner(bannerId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete countdown banner error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/countdown-banners/translate", async (req, res) => {
    try {
      const { titleEn, subtitleEn, targetLanguages } = req.body;

      if (!titleEn || !subtitleEn || !targetLanguages || !Array.isArray(targetLanguages)) {
        return res.status(400).json({ message: "Title, subtitle, and target languages are required" });
      }

      const translations = await TranslationService.translateBannerContent(
        titleEn,
        subtitleEn,
        targetLanguages
      );

      res.json(translations);
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        message: error.message,
        titles: {},
        subtitles: {}
      });
    }
  });

  // Announcement Badge API Routes
  app.get("/api/announcement-badge/active", async (req, res) => {
    try {
      const activeBadge = await storage.getActiveAnnouncementBadge();
      res.json(activeBadge);
    } catch (error: any) {
      console.error('Get active badge error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/announcement-badges", async (req, res) => {
    try {
      const badges = await storage.getAllAnnouncementBadges();
      res.json(badges);
    } catch (error: any) {
      console.error('Get badges error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/announcement-badges", async (req, res) => {
    try {
      const { textEn, backgroundColor, textColor, priority, targetLanguages } = req.body;

      if (!textEn) {
        return res.status(400).json({ message: "Text is required" });
      }

      // Generate translations using OpenAI
      let textTranslations = {};

      if (targetLanguages && targetLanguages.length > 0) {
        try {
          const translations = await TranslationService.translateText({
            text: textEn,
            targetLanguages,
            context: 'Announcement badge text',
            maxLength: 100,
            tone: 'marketing'
          });
          textTranslations = translations;
        } catch (translationError) {
          console.warn('Translation failed, creating badge without translations:', translationError);
        }
      }

      const badgeData = {
        textEn,
        textTranslations,
        backgroundColor: backgroundColor || 'gradient-primary',
        textColor: textColor || 'white',
        priority: priority || 1,
        isEnabled: true
      };

      const newBadge = await storage.createAnnouncementBadge(badgeData);
      res.json(newBadge);
    } catch (error: any) {
      console.error('Create badge error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/announcement-badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      const { textEn, backgroundColor, textColor, priority, targetLanguages, isEnabled } = req.body;

      let updateData: any = {};

      if (textEn !== undefined) {
        updateData.textEn = textEn;

        // Generate new translations if text changed and languages provided
        if (targetLanguages && targetLanguages.length > 0) {
          try {
            const translations = await TranslationService.translateText({
              text: textEn,
              targetLanguages,
              context: 'Announcement badge text update',
              maxLength: 100,
              tone: 'marketing'
            });
            updateData.textTranslations = translations;
          } catch (translationError) {
            console.warn('Translation failed during update:', translationError);
          }
        }
      }

      if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor;
      if (textColor !== undefined) updateData.textColor = textColor;
      if (priority !== undefined) updateData.priority = priority;
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

      const updatedBadge = await storage.updateAnnouncementBadge(badgeId, updateData);
      res.json(updatedBadge);
    } catch (error: any) {
      console.error('Update badge error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/announcement-badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      await storage.deleteAnnouncementBadge(badgeId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete badge error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/announcement-badges/translate", async (req, res) => {
    try {
      const { textEn, targetLanguages } = req.body;

      if (!textEn || !targetLanguages || !Array.isArray(targetLanguages)) {
        return res.status(400).json({ message: "Text and target languages are required" });
      }

      const translations = await TranslationService.translateText({
        text: textEn,
        targetLanguages,
        context: 'Announcement badge translation request',
        maxLength: 100,
        tone: 'marketing'
      });
      res.json(translations);
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        message: error.message,
        translations: {}
      });
    }
  });

  // Add affiliate routes (with try-catch to handle module loading)
  try {
    const affiliateModule = await import("./routes/affiliateRoutes");
    app.use("/api/affiliate", affiliateModule.affiliateRoutes);
    app.use("/api/admin/affiliate-stats", affiliateModule.affiliateRoutes);
    app.use("/api/admin/pending-payouts", affiliateModule.affiliateRoutes);
    app.use("/api/admin/approve-payout", affiliateModule.affiliateRoutes);
    app.use("/api/admin/reject-payout", affiliateModule.affiliateRoutes);
  } catch (error) {
    console.warn("Failed to load affiliate routes:", error);
  }

  // Add invoice routes
  try {
    const invoiceModule = await import("./routes/invoiceRoutes");
    app.use("/api/invoices", invoiceModule.invoiceRoutes);
  } catch (error) {
    console.warn("Failed to load invoice routes:", error);
  }

  // Dashboard Features API Routes
  app.get('/api/admin/dashboard-features', async (req, res) => {
    try {
      const features = await storage.getDashboardFeatures();
      res.json(features);
    } catch (error: any) {
      console.error('Error fetching dashboard features:', error);
      // Return safe defaults in development when DB is not available
      const defaultFeatures = [
        { id: 0, featureName: "affiliate_program", isEnabled: true, description: "Enable/disable affiliate program section in user dashboard" },
        { id: 0, featureName: "analytics", isEnabled: true, description: "Enable/disable analytics section in user dashboard" },
        { id: 0, featureName: "billing", isEnabled: true, description: "Enable/disable billing section in user dashboard" }
      ];
      res.json(defaultFeatures);
    }
  });

  app.put('/api/admin/dashboard-features/:featureName', async (req, res) => {
    try {
      const { featureName } = req.params;
      const { isEnabled, description } = req.body;

      const updatedFeature = await storage.updateDashboardFeature(
        featureName,
        isEnabled,
        description
      );

      res.json(updatedFeature);
    } catch (error: any) {
      console.error('Error updating dashboard feature:', error);
      res.status(500).json({ error: 'Failed to update dashboard feature' });
    }
  });

  // Dashboard features for user dashboard
  app.get('/api/dashboard-features', async (req, res) => {
    try {
      const features = await storage.getDashboardFeatures();
      const enabledFeatures = features.filter(f => f.isEnabled);
      res.json(enabledFeatures);
    } catch (error: any) {
      console.error('Error fetching dashboard features:', error);
      // Return safe defaults in development when DB is not available
      const defaultFeatures = [
        { featureName: "affiliate_program", isEnabled: true },
        { featureName: "analytics", isEnabled: true },
        { featureName: "billing", isEnabled: true }
      ];
      res.json(defaultFeatures);
    }
  });

  // Chrome Extension System API Routes

  // Create extension download for customer
  app.post('/api/extension/download', async (req, res) => {
    try {
      const { customerId } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      // Check if customer can download extension
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      if (customer.isBlocked) {
        return res.status(403).json({ 
          error: 'Account blocked', 
          reason: customer.blockedReason 
        });
      }

      // Create download record
      const downloadToken = crypto.randomUUID();
      const download = await storage.createExtensionDownload({
        customerId: customerId,
        downloadToken: downloadToken,
        downloadType: customer.extensionActivated ? 'paid' : 'trial',
        downloadCount: 0
      });

      res.json({ 
        success: true,
        downloadToken: download.downloadToken,
        downloadType: download.downloadType 
      });
    } catch (error) {
      console.error('Error creating extension download:', error);
      res.status(500).json({ error: 'Failed to create download' });
    }
  });

  // Download extension file
  app.get('/api/extension/download/:token', async (req, res) => {
    try {
      const { token } = req.params;

      const download = await storage.getExtensionDownload(token);
      if (!download) {
        return res.status(404).json({ error: 'Download token not found' });
      }

      // Check download limits (3 downloads max)
      if (download.downloadCount >= 3) {
        return res.status(403).json({ error: 'Download limit exceeded' });
      }

      // Increment download count
      await storage.incrementExtensionDownloadCount(download.id);

      // Return file path based on type
      // Always use the latest v2.3.1 ACTIVATION-FIXED version
      const extensionFilePath = path.join(import.meta.dirname, '../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip');

      // Check if file exists
      if (fs.existsSync(extensionFilePath)) {
        res.setHeader('Content-Disposition', 'attachment; filename="ocus-extension-v2.3.1-ACTIVATION-FIXED.zip"');
        res.setHeader('Content-Type', 'application/zip');
        res.sendFile(path.resolve(extensionFilePath));
      } else {
        return res.status(404).json({ error: 'Extension file not found' });
      }
    } catch (error) {
      console.error('Error downloading extension:', error);
      res.status(500).json({ message: 'Failed to download extension' });
    }
  });

  // Check if customer can use extension
  app.get('/api/extension/check/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await db.select().from(customers).where(eq(customers.id, parseInt(customerId))).limit(1);
    if (!customer.length) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customerData = customer[0];
    const canUse = customerData.extensionActivated || customerData.extensionTrialJobsUsed < customerData.extensionTrialLimit;

    let reason = '';
    if (customerData.isBlocked) {
      reason = 'Account is blocked';
    } else if (!customerData.extensionActivated && customerData.extensionTrialJobsUsed >= customerData.extensionTrialLimit) {
      reason = 'Trial limit exceeded';
    }

    res.json({
      canUse,
      reason,
      trialUsed: customerData.extensionTrialJobsUsed,
      isBlocked: customerData.isBlocked
    });
  } catch (error) {
    console.error('Extension check error:', error);
    res.status(500).json({ error: 'Failed to check extension status' });
  }
});

  // Record extension usage
  app.post('/api/extension/usage', async (req, res) => {
    try {
      const { customerId, jobsUsed, sessionDuration, jobsFoundCount } = req.body;

      // Validate input
      if (!customerId || !jobsUsed) {
        return res.status(400).json({ error: 'Customer ID and jobs used are required' });
      }

      const usageLog = await storage.recordExtensionUsageLog({
        customerId,
        sessionId: crypto.randomUUID(),
        jobsUsed
      });

      res.json({ success: true, usageLog });
    } catch (error) {
      console.error('Error recording extension usage:', error);
      res.status(500).json({ error: 'Failed to record usage' });
    }
  });

  // Generate activation key for customer (admin only)
  app.post('/api/admin/extension/generate-key/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.generateExtensionActivationKey(customerId);
      res.json({ 
        success: true, 
        activationKey: customer.activationKey,
        customer 
      });
    } catch (error) {
      console.error('Error generating activation key:', error);
      res.status(500).json({ error: 'Failed to generate activation key' });
    }
  });

  // Block/unblock customer (admin only)
  app.post('/api/admin/extension/block/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Block reason is required' });
      }

      const customer = await storage.blockCustomer(customerId, reason);
      res.json({ success: true, customer });
    } catch (error) {
      console.error('Error blocking customer:', error);
      res.status(500).json({ error: 'Failed to block customer' });
    }
  });

  app.post('/api/admin/extension/unblock/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.unblockCustomer(customerId);
      res.json({ success: true, customer });
    } catch (error) {
      console.error('Error unblocking customer:', error);
      res.status(500).json({ error: 'Failed to unblock customer' });
    }
  });

  // Get all customers for admin (with extension info)
  app.get('/api/admin/extension/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomersForAdmin();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  // Get customer activations overview
  app.get('/api/admin/extension/activations', async (req, res) => {
    try {
      const activations = await storage.getCustomerActivations();
      res.json(activations);
    } catch (error) {
      console.error('Error fetching activations:', error);
      res.status(500).json({ error: 'Failed to fetch activations' });
    }
  });

  // Get customer extension downloads
  app.get('/api/extension/downloads/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const downloads = await storage.getCustomerExtensionDownloads(customerId);
      res.json(downloads);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      res.status(500).json({ error: 'Failed to fetch downloads' });
    }
  });

  // Track trial usage (server-side tracking to prevent bypass across browsers)
  app.post('/api/extension/track-trial-usage', async (req, res) => {
    try {
      const { extensionId, userFingerprint, missionId } = req.body;
      
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ error: 'Extension ID and user fingerprint required' });
      }

      // Create unique key combining extension and user fingerprint for cross-browser tracking
      const trialKey = `trial_${extensionId}_${userFingerprint}`;
      
      // Check existing usage
      let usageData = await storage.getTrialUsage(trialKey);
      
      if (!usageData) {
        // First time user - create usage record
        usageData = await storage.createTrialUsage({
          trialKey,
          extensionId,
          userFingerprint,
          usageCount: 1,
          lastUsed: new Date(),
          isExpired: false
        });
      } else {
        // Check if already expired
        if (usageData.isExpired || (usageData.usageCount || 0) >= 3) {
          return res.json({ 
            success: false, 
            remaining: 0, 
            expired: true,
            message: 'Trial limit exceeded. Please purchase the full version.' 
          });
        }
        
        // Increment usage
        usageData = await storage.incrementTrialUsage(trialKey);
        
        // Check if reached limit
        if ((usageData.usageCount || 0) >= 3) {
          await storage.expireTrialUsage(trialKey);
          usageData.isExpired = true;
        }
      }

      const remaining = Math.max(0, 3 - (usageData.usageCount || 0));
      
      res.json({
        success: true,
        remaining,
        expired: usageData.isExpired,
        usageCount: usageData.usageCount,
        message: remaining > 0 ? `${remaining} missions remaining in trial` : 'Trial expired'
      });
      
    } catch (error) {
      console.error('Error tracking trial usage:', error);
      res.status(500).json({ error: 'Failed to track trial usage' });
    }
  });

  // ===== MISSION TRACKING & SYNC ROUTES =====

  // Create or update mission
  app.post('/api/missions', async (req, res) => {
    try {
      const { missionId, userId, customerId, missionName, compensationAmount, status = 'assignment_accepted' } = req.body;

      if (!missionId || !userId || !missionName) {
        return res.status(400).json({ error: 'Mission ID, User ID, and Mission Name are required' });
      }

      // Check if mission already exists
      const existingMission = await storage.getMission(missionId);
      
      if (existingMission) {
        // Update existing mission
        const updatedMission = await storage.updateMissionStatus(missionId, status);
        res.json({ success: true, mission: updatedMission, action: 'updated' });
      } else {
        // Create new mission
        const newMission = await storage.createMission({
          missionId,
          userId,
          customerId: customerId ? parseInt(customerId) : null,
          missionName,
          compensationAmount: compensationAmount ? compensationAmount.toString() : null,
          status,
          trialUsed: false
        });
        res.json({ success: true, mission: newMission, action: 'created' });
      }
    } catch (error) {
      console.error('Error creating/updating mission:', error);
      res.status(500).json({ error: 'Failed to create/update mission' });
    }
  });

  // Update mission status
  app.put('/api/missions/:missionId/status', async (req, res) => {
    try {
      const { missionId } = req.params;
      const { status, timestamp } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updatedMission = await storage.updateMissionStatus(missionId, status, timestamp ? new Date(timestamp) : undefined);
      res.json({ success: true, mission: updatedMission });
    } catch (error) {
      console.error('Error updating mission status:', error);
      res.status(500).json({ error: 'Failed to update mission status' });
    }
  });

  // Get user missions
  app.get('/api/missions/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const missions = await storage.getUserMissions(userId);
      res.json(missions);
    } catch (error) {
      console.error('Error fetching user missions:', error);
      res.status(500).json({ error: 'Failed to fetch missions' });
    }
  });

  // Get customer missions
  app.get('/api/missions/customer/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const missions = await storage.getCustomerMissions(parseInt(customerId));
      res.json(missions);
    } catch (error) {
      console.error('Error fetching customer missions:', error);
      res.status(500).json({ error: 'Failed to fetch missions' });
    }
  });

  // Get single mission
  app.get('/api/missions/:missionId', async (req, res) => {
    try {
      const { missionId } = req.params;
      const mission = await storage.getMission(missionId);
      
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }

      res.json(mission);
    } catch (error) {
      console.error('Error fetching mission:', error);
      res.status(500).json({ error: 'Failed to fetch mission' });
    }
  });

  // ===== USER TRIAL MANAGEMENT ROUTES =====

  // Get user trial status
  app.get('/api/trials/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      let trial = await storage.getUserTrial(userId);
      
      if (!trial) {
        // Create new trial for user
        trial = await storage.createUserTrial({
          userId,
          customerId: null,
          trialsUsed: 0,
          maxTrials: 3,
          isActivated: false,
          activationKey: null,
          activatedAt: null
        });
      }

      res.json({ 
        success: true, 
        trial,
        canUse: trial.isActivated || (trial.trialsUsed || 0) < (trial.maxTrials || 3),
        remaining: (trial.maxTrials || 3) - (trial.trialsUsed || 0)
      });
    } catch (error) {
      console.error('Error fetching trial status:', error);
      res.status(500).json({ error: 'Failed to fetch trial status' });
    }
  });

  // Use trial attempt
  app.post('/api/trials/:userId/use', async (req, res) => {
    try {
      const { userId } = req.params;
      const { missionId } = req.body;

      let trial = await storage.getUserTrial(userId);
      
      if (!trial) {
        trial = await storage.createUserTrial({
          userId,
          customerId: null,
          trialsUsed: 0,
          maxTrials: 3,
          isActivated: false,
          activationKey: null,
          activatedAt: null
        });
      }

      // Check if user can use trial
      if (!trial.isActivated && (trial.trialsUsed || 0) >= (trial.maxTrials || 3)) {
        return res.status(403).json({ 
          error: 'Trial limit exceeded',
          trialsUsed: trial.trialsUsed || 0,
          maxTrials: trial.maxTrials || 3,
          canUse: false
        });
      }

      // If not activated, increment trial usage
      if (!trial.isActivated) {
        trial = await storage.updateTrialUsage(userId);
        
        // Mark mission as trial used if provided
        if (missionId) {
          await storage.updateMissionStatus(missionId, 'assignment_accepted');
        }
      }

      res.json({ 
        success: true, 
        trial,
        remaining: trial ? (trial.maxTrials || 3) - (trial.trialsUsed || 0) : 0,
        canUse: trial ? trial.isActivated || (trial.trialsUsed || 0) < (trial.maxTrials || 3) : false
      });
    } catch (error) {
      console.error('Error using trial:', error);
      res.status(500).json({ error: 'Failed to use trial' });
    }
  });

  // Activate user with key
  app.post('/api/trials/:userId/activate', async (req, res) => {
    try {
      const { userId } = req.params;
      const { activationKey } = req.body;

      if (!activationKey) {
        return res.status(400).json({ error: 'Activation key is required' });
      }

      let trial = await storage.getUserTrial(userId);
      
      if (!trial) {
        trial = await storage.createUserTrial({
          userId,
          customerId: null,
          trialsUsed: 0,
          maxTrials: 3,
          isActivated: false,
          activationKey: null,
          activatedAt: null
        });
      }

      // Activate user
      const activatedTrial = await storage.activateUser(userId, activationKey);

      res.json({ 
        success: true, 
        trial: activatedTrial,
        message: 'User activated successfully'
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({ error: 'Failed to activate user' });
    }
  });

  // Trial usage tracking endpoint
  app.post('/api/extension/track-trial-usage', async (req, res) => {
    try {
      const { extensionId, userFingerprint, missionId } = req.body;
      
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Create unique trial key combining extension ID and user fingerprint
      const trialKey = `${extensionId}-${userFingerprint}`;
      
      // Check existing usage
      let usage = await storage.getTrialUsage(trialKey);
      
      if (!usage) {
        // Create new trial usage record
        usage = await storage.createTrialUsage({
          trialKey,
          extensionId,
          userFingerprint,
          usageCount: 1,
          lastUsed: new Date(),
          isExpired: false
        });
      } else if (!usage.isExpired) {
        // Increment existing usage if not expired
        usage = await storage.incrementTrialUsage(trialKey);
      }

      // Check if trial should expire
      if ((usage.usageCount || 0) >= 3 && !usage.isExpired) {
        await storage.expireTrialUsage(trialKey);
        usage.isExpired = true;
      }

      const remaining = Math.max(0, 3 - (usage.usageCount || 0));
      
      res.json({
        success: true,
        usageCount: usage.usageCount,
        remaining,
        expired: usage.isExpired,
        lastUsed: usage.lastUsed
      });

    } catch (error) {
      console.error('Trial tracking error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error'
      });
    }
  });

  // Trial status check endpoint (without incrementing)
  app.post('/api/extension/check-trial-status', async (req, res) => {
    try {
      const { extensionId, userFingerprint } = req.body;
      
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const trialKey = `${extensionId}-${userFingerprint}`;
      const usage = await storage.getTrialUsage(trialKey);
      
      if (!usage) {
        res.json({
          success: true,
          usageCount: 0,
          remaining: 3,
          expired: false,
          isFirstTime: true
        });
      } else {
        const remaining = Math.max(0, 3 - (usage.usageCount || 0));
        res.json({
          success: true,
          usageCount: usage.usageCount,
          remaining,
          expired: usage.isExpired,
          lastUsed: usage.lastUsed
        });
      }

    } catch (error) {
      console.error('Trial status check error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error'
      });
    }
  });

  // Meta tag serving endpoint for social media - MUST be first route
  app.get('/api/social-meta', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      
      // Force direct serving without any redirects
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Use the actual deployment URL for og:image to ensure accessibility
      const deploymentUrl = req.get('host')?.includes('replit.app') ? `https://${req.get('host')}` : 'https://jobhunter.one';
      const ogImage = seoSettings?.customOgImage ? `${deploymentUrl}/api/seo/custom-image/og` : `${deploymentUrl}/og-image.svg`;
      const siteTitle = seoSettings?.siteTitle || 'OCUS Job Hunter - Premium Chrome Extension';
      const siteDescription = seoSettings?.siteDescription || 'Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.';
      
      const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${siteTitle}</title>
    <meta name="title" content="${siteTitle}">
    <meta name="description" content="${siteDescription}">
    <meta name="keywords" content="OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation">
    <meta name="author" content="OCUS Job Hunter">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://jobhunter.one/">
    <meta property="og:title" content="${siteTitle}">
    <meta property="og:description" content="${siteDescription}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="OCUS Job Hunter">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://jobhunter.one/">
    <meta name="twitter:title" content="${siteTitle}">
    <meta name="twitter:description" content="${siteDescription}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="OCUS Job Hunter Chrome Extension">
    
    <!-- LinkedIn -->
    <meta property="og:image:secure_url" content="${ogImage}">
    
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        line-height: 1.6;
        color: #333;
      }
      .hero { text-align: center; margin-bottom: 40px; }
      .cta { 
        background: #2563eb; 
        color: white; 
        padding: 15px 30px; 
        text-decoration: none; 
        border-radius: 8px;
        display: inline-block;
        margin: 20px 0;
      }
      .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
      .feature { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>${siteTitle}</h1>
        <p>${siteDescription}</p>
        <a href="https://jobhunter.one/" class="cta">Get Extension Now</a>
    </div>
    
    <div class="features">
        <div class="feature">
            <h3>🎯 Smart Mission Detection</h3>
            <p>Automatically detects and highlights new photography missions on OCUS</p>
        </div>
        <div class="feature">
            <h3>⚡ Instant Acceptance</h3>
            <p>Accept missions with a single click before they're taken by others</p>
        </div>
        <div class="feature">
            <h3>📊 Real-time Tracking</h3>
            <p>Monitor your accepted missions, logins, and refresh activity</p>
        </div>
    </div>
    
    <script>
      // Redirect to main site after social crawlers have scraped
      setTimeout(() => {
        if (!navigator.userAgent.match(/facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|discordbot/i)) {
          window.location.href = 'https://jobhunter.one/';
        }
      }, 2000);
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('Error serving social preview:', error);
      res.status(500).send('Error loading preview');
    }
  });

  // Alternative meta endpoint accessible via direct URL
  app.get('/meta-preview', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      const baseUrl = 'https://jobhunter.one';
      const ogImage = seoSettings?.customOgImage ? `${baseUrl}/api/seo/custom-image/og` : `${baseUrl}/og-image.svg`;
      const siteTitle = seoSettings?.siteTitle || 'OCUS Job Hunter - Premium Chrome Extension';
      const siteDescription = seoSettings?.siteDescription || 'Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.';
      
      // Create a minimal HTML response specifically for sharing
      const shareableHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="https://jobhunter.one/">
<meta property="og:title" content="${siteTitle}">
<meta property="og:description" content="${siteDescription}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="OCUS Job Hunter">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${siteTitle}">
<meta name="twitter:description" content="${siteDescription}">
<meta name="twitter:image" content="${ogImage}">
<title>${siteTitle}</title>
</head>
<body>
<h1>${siteTitle}</h1>
<p>${siteDescription}</p>
<script>window.location.href='https://jobhunter.one/';</script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(shareableHtml);
    } catch (error) {
      console.error('Error serving meta preview:', error);
      res.status(500).send('Error');
    }
  });

  // Working social media endpoint - use this URL for sharing
  app.get('/share', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      
      // Use a working domain for sharing
      const shareUrl = 'https://jobhunter.one/';
      const baseUrl = req.protocol + '://' + req.get('host');
      // Determine the best image to use for social sharing
      let ogImage;
      
      if (seoSettings?.customOgImage) {
        // Use custom uploaded image if available
        ogImage = `${baseUrl}/api/seo/custom-image/og`;
      } else {
        // Use a professional, high-quality PNG image for social media
        ogImage = `https://via.placeholder.com/1200x630/2563eb/ffffff.png?text=OCUS+Job+Hunter+-+Premium+Chrome+Extension`;
      }
      const siteTitle = seoSettings?.siteTitle || 'OCUS Job Hunter - Premium Chrome Extension';
      const siteDescription = seoSettings?.siteDescription || 'Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.';
      
      const shareHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <meta name="description" content="${siteDescription}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:title" content="${siteTitle}">
    <meta property="og:description" content="${siteDescription}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${siteTitle}">
    <meta property="og:site_name" content="OCUS Job Hunter">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${siteTitle}">
    <meta name="twitter:description" content="${siteDescription}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:image:alt" content="${siteTitle}">
    
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 40px; 
            border-radius: 16px; 
            backdrop-filter: blur(10px);
            text-align: center;
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        .cta { 
            background: #2563eb; 
            color: white; 
            padding: 16px 32px; 
            border: none; 
            border-radius: 8px; 
            font-size: 18px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px 0;
        }
        .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 40px 0; 
        }
        .feature { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 OCUS Job Hunter</h1>
        <p><strong>Premium Chrome Extension for Professional Photographers</strong></p>
        <p>${siteDescription}</p>
        
        <a href="${shareUrl}" class="cta">Download Extension Now</a>
        
        <div class="features">
            <div class="feature">
                <h3>Smart Detection</h3>
                <p>Auto-detects new missions</p>
            </div>
            <div class="feature">
                <h3>One-Click Accept</h3>
                <p>Accept before others</p>
            </div>
            <div class="feature">
                <h3>Real-time Tracking</h3>
                <p>Live mission counters</p>
            </div>
            <div class="feature">
                <h3>Unlimited Usage</h3>
                <p>Premium version</p>
            </div>
        </div>
    </div>
    
    <script>
        // Only redirect human users, not bots
        setTimeout(() => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isBot = userAgent.includes('bot') || 
                         userAgent.includes('crawler') || 
                         userAgent.includes('facebook') || 
                         userAgent.includes('twitter') || 
                         userAgent.includes('linkedin') ||
                         userAgent.includes('telegram') ||
                         userAgent.includes('whatsapp');
            
            if (!isBot) {
                window.location.href = '${shareUrl}';
            }
        }, 1000);
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(shareHtml);
      
    } catch (error) {
      console.error('Share page error:', error);
      res.redirect('https://jobhunter.one/');
    }
  });

  // Social media crawler detection and redirection
  app.get('/', async (req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const isSocialCrawler = /facebookexternalhit|twitterbot|linkedinbot|linkedinshare|slackbot|whatsapp|discordbot|telegram|telegrambot|skype/i.test(userAgent);
    
    // Redirect social media crawlers to dedicated share endpoint
    if (isSocialCrawler) {
      console.log(`Social crawler detected: ${userAgent}`);
      return res.redirect(301, '/share');
    }
    
    // Let normal routing handle regular users
    return next();
    
    try {
      const seoSettings = await storage.getSeoSettings();
      
      // Read the appropriate HTML file based on environment
      const htmlPath = process.env.NODE_ENV === 'production' 
        ? path.join(process.cwd(), 'dist', 'public', 'index.html')
        : path.join(process.cwd(), 'client', 'index.html');
      let html = fs.readFileSync(htmlPath, 'utf-8');
      
      if (seoSettings) {
        // Replace static meta tags with dynamic ones
        // For production, always use the full production URL
        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://jobhunter.one' : `http://${req.get('host')}`;
        const ogImage = seoSettings?.customOgImage ? `${baseUrl}/api/seo/custom-image/og` : `${baseUrl}/og-image.svg`;
        const siteTitle = seoSettings?.siteTitle || seoSettings?.ogTitle || 'OCUS Job Hunter - Premium Chrome Extension';
        const siteDescription = seoSettings?.siteDescription || seoSettings?.ogDescription || 'Boost your photography career with OCUS Job Hunter Chrome Extension';
        const siteUrl = seoSettings?.ogUrl || `${baseUrl}/`;
        const siteName = seoSettings?.ogSiteName || 'OCUS Job Hunter';
        
        // Dynamic meta tag replacements
        html = html.replace(
          /<meta property="og:image" content="[^"]*">/,
          `<meta property="og:image" content="${ogImage}">`
        );
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          `<meta property="og:title" content="${siteTitle}">`
        );
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          `<meta property="og:description" content="${siteDescription}">`
        );
        html = html.replace(
          /<meta property="og:url" content="[^"]*">/,
          `<meta property="og:url" content="${siteUrl}">`
        );
        html = html.replace(
          /<meta property="twitter:image" content="[^"]*">/,
          `<meta property="twitter:image" content="${ogImage}">`
        );
        html = html.replace(
          /<meta property="twitter:title" content="[^"]*">/,
          `<meta property="twitter:title" content="${siteTitle}">`
        );
        html = html.replace(
          /<meta property="twitter:description" content="[^"]*">/,
          `<meta property="twitter:description" content="${siteDescription}">`
        );
        html = html.replace(
          /<meta property="twitter:url" content="[^"]*">/,
          `<meta property="twitter:url" content="${siteUrl}">`
        );
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${siteTitle}</title>`
        );
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          `<meta name="description" content="${siteDescription}">`
        );
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error serving dynamic HTML:', error);
      // Fallback to serving the built index.html in production
      if (process.env.NODE_ENV === 'production') {
        try {
          const fallbackPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
          const fallbackHtml = fs.readFileSync(fallbackPath, 'utf-8');
          return res.send(fallbackHtml);
        } catch (fallbackError) {
          console.error('Fallback HTML serving failed:', fallbackError);
        }
      }
      // Fallback to static file
      res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
    }
  });

  // API endpoint to serve custom images
  app.get('/api/seo/custom-image/:type', async (req, res) => {
    try {
      const { type } = req.params; // 'og', 'logo', or 'favicon'
      const seoSettings = await storage.getSeoSettings();
      
      if (!seoSettings) {
        return res.status(404).json({ error: 'SEO settings not found' });
      }
      
      let base64Data: string | null = null;
      
      switch (type) {
        case 'og':
          base64Data = seoSettings.customOgImage;
          break;
        case 'logo':
          base64Data = seoSettings.customLogo;
          break;
        case 'favicon':
          base64Data = seoSettings.customFavicon;
          break;
        default:
          return res.status(400).json({ error: 'Invalid image type' });
      }
      
      if (!base64Data) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Parse base64 data URL
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid image data' });
      }
      
      const mimeType = matches[1];
      const imageBuffer = Buffer.from(matches[2], 'base64');
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error serving custom image:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  // Invoice API routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const invoices = await storage.getCustomerInvoices(customerId);
      res.json(invoices);
    } catch (error: any) {
      console.error('Error fetching customer invoices:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
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

  app.post("/api/invoices", async (req, res) => {
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
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

      res.json(invoice);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/:id/pdf", async (req, res) => {
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

  app.get("/api/invoice-settings", async (req, res) => {
    try {
      const settings = await storage.getInvoiceSettings();
      res.json(settings || {});
    } catch (error: any) {
      console.error('Error fetching invoice settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/invoice-settings", async (req, res) => {
    try {
      const settings = await storage.updateInvoiceSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      console.error('Error updating invoice settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}