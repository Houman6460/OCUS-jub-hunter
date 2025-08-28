import { sqliteTable, text, integer, blob, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: integer("is_admin", { mode: 'boolean' }).default(false),
  stripeCustomerId: text("stripe_customer_id"),
  isPremium: integer("is_premium", { mode: 'boolean' }).default(false),
  extensionActivated: integer("extension_activated", { mode: 'boolean' }).default(false),
  premiumActivatedAt: text("premium_activated_at"),
  totalSpent: text("total_spent", { precision: 10, scale: 2 }).default("0"),
  totalOrders: integer("total_orders").default(0),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id), // Link to authenticated users
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  originalAmount: text("original_amount", { precision: 10, scale: 2 }).notNull(),
  finalAmount: text("final_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: text("discount_amount", { precision: 10, scale: 2 }).default("0"),
  couponCode: text("coupon_code"),
  referralCode: text("referral_code"), // Added for affiliate tracking
  currency: text("currency").default("usd"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method").notNull(), // stripe, paypal
  paymentIntentId: text("payment_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  downloadToken: text("download_token").notNull(),
  downloadCount: integer("download_count").default(0),
  maxDownloads: integer("max_downloads").default(3),
  activationCode: text("activation_code"), // Generated activation code for the extension
  invoiceUrl: text("invoice_url"), // Path to generated invoice PDF
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  completedAt: integer("completed_at"),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price", { precision: 10, scale: 2 }).notNull(),
  beforePrice: text("before_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("eur"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: text("discount_value", { precision: 10, scale: 2 }).notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  usageLimit: integer("usage_limit"), // null for unlimited
  usageCount: integer("usage_count").default(0),
  expiresAt: integer("expires_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});



// Dashboard features control
export const dashboardFeatures = sqliteTable("dashboard_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  featureName: text("feature_name").notNull().unique(),
  isEnabled: integer("is_enabled", { mode: 'boolean' }).default(true),
  description: text("description"),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Mission tracking for extension usage
export const missions = sqliteTable("missions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  missionId: text("mission_id").notNull().unique(), // OCUS mission ID
  userId: text("user_id").notNull(), // Extension user ID
  customerId: integer("customer_id"), // References users table if logged in
  missionName: text("mission_name").notNull(),
  compensationAmount: text("compensation_amount", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("assignment_accepted"), // assignment_accepted, appointment_confirmation, media_upload, billing_payment, assignment_complete
  assignmentAcceptedAt: integer("assignment_accepted_at").default(sql`(CURRENT_TIMESTAMP)`),
  appointmentConfirmedAt: integer("appointment_confirmed_at"),
  mediaUploadedAt: integer("media_uploaded_at"),
  billingCompletedAt: integer("billing_completed_at"),
  assignmentCompletedAt: integer("assignment_completed_at"),
  trialUsed: integer("trial_used", { mode: 'boolean' }).default(false), // Whether this mission used a trial attempt
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// User trial usage tracking
export const userTrials = sqliteTable("user_trials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(), // Extension user ID
  customerId: integer("customer_id"), // References users table if logged in
  trialsUsed: integer("trials_used").default(0),
  maxTrials: integer("max_trials").default(3),
  isActivated: integer("is_activated", { mode: 'boolean' }).default(false),
  activationKey: text("activation_key"),
  activatedAt: integer("activated_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Cross-browser trial tracking
export const trialUsage = sqliteTable("trial_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trialKey: text("trial_key").notNull().unique(), // Combination of extensionId + userFingerprint
  extensionId: text("extension_id").notNull(),
  userFingerprint: text("user_fingerprint").notNull(),
  usageCount: integer("usage_count").default(0),
  lastUsed: integer("last_used").default(sql`(CURRENT_TIMESTAMP)`),
  isExpired: integer("is_expired", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const authSettings = sqliteTable("auth_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Google OAuth
  googleClientId: text("google_client_id"),
  googleClientSecret: text("google_client_secret"),
  googleRedirectUri: text("google_redirect_uri"),
  googleEnabled: integer("google_enabled", { mode: 'boolean' }).default(false),
  
  // Facebook OAuth
  facebookAppId: text("facebook_app_id"),
  facebookAppSecret: text("facebook_app_secret"),
  facebookEnabled: integer("facebook_enabled", { mode: 'boolean' }).default(false),
  
  // GitHub OAuth
  githubClientId: text("github_client_id"),
  githubClientSecret: text("github_client_secret"),
  githubEnabled: integer("github_enabled", { mode: 'boolean' }).default(false),
  
  // reCAPTCHA settings
  recaptchaSiteKey: text("recaptcha_site_key"),
  recaptchaSecretKey: text("recaptcha_secret_key"),
  recaptchaEnabled: integer("recaptcha_enabled", { mode: 'boolean' }).default(false),
  recaptchaMode: text("recaptcha_mode").default("v2"), // v2 or v3
  recaptchaCustomerEnabled: integer("recaptcha_customer_enabled", { mode: 'boolean' }).default(false),
  recaptchaAdminEnabled: integer("recaptcha_admin_enabled", { mode: 'boolean' }).default(true),
  
  // Payment Gateway Settings
  stripePublicKey: text("stripe_public_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeEnabled: integer("stripe_enabled", { mode: 'boolean' }).default(false),
  paypalClientId: text("paypal_client_id"),
  paypalClientSecret: text("paypal_client_secret"),
  paypalEnabled: integer("paypal_enabled", { mode: 'boolean' }).default(false),
  defaultPaymentMethod: text("default_payment_method").default("stripe"), // stripe or paypal
  
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const downloads = sqliteTable("downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  downloadedAt: integer("downloaded_at").default(sql`(CURRENT_TIMESTAMP)`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const tickets = sqliteTable("tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "technical", "billing", "feature-request", "bug-report", "general"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  status: text("status").notNull().default("open"), // "open", "in-progress", "resolved", "closed"
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  resolvedAt: integer("resolved_at"),
});

export const ticketMessages = sqliteTable("ticket_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  message: text("message").notNull(),
  isFromCustomer: integer("is_from_customer", { mode: 'boolean' }).notNull().default(true),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const activationKeys = sqliteTable("activation_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activationKey: text("activation_key").notNull().unique(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user
  installationId: text("installation_id", { length: 36 }), // Bind to specific installation
  usedAt: integer("used_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const demoUsers = sqliteTable("demo_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(), // UUID from extension
  demoCount: integer("demo_count").default(0),
  maxDemoUses: integer("max_demo_uses").default(3),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  lastUsedAt: integer("last_used_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email", { length: 255 }).notNull().unique(),
  password: text("password", { length: 255 }), // Optional for social logins
  name: text("name", { length: 255 }).notNull(),
  
  // Extension activation and usage
  activationKey: text("activation_key", { length: 100 }).unique(),
  activationKeyRevealed: integer("activation_key_revealed", { mode: 'boolean' }).default(false).notNull(),
  activationKeyGeneratedAt: integer("activation_key_generated_at").default(sql`(CURRENT_TIMESTAMP)`),
  isActivated: integer("is_activated", { mode: 'boolean' }).default(false).notNull(),
  extensionActivated: integer("extension_activated", { mode: 'boolean' }).default(false).notNull(),
  extensionLastUsed: integer("extension_last_used"),
  extensionUsageCount: integer("extension_usage_count").default(0).notNull(),
  extensionSuccessfulJobs: integer("extension_successful_jobs").default(0).notNull(),
  extensionTrialJobsUsed: integer("extension_trial_jobs_used").default(0).notNull(),
  extensionTrialLimit: integer("extension_trial_limit").default(3).notNull(),
  isBlocked: integer("is_blocked", { mode: 'boolean' }).default(false).notNull(),
  blockedReason: text("blocked_reason"),
  blockedAt: integer("blocked_at"),
  
  // Account status
  isAdmin: integer("is_admin", { mode: 'boolean' }).default(false).notNull(),
  subscriptionStatus: text("subscription_status", { length: 20 }).default("inactive").notNull(), // inactive, active, cancelled, expired
  subscriptionExpiresAt: integer("subscription_expires_at"),
  
  // Payment integration
  stripeCustomerId: text("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: text("stripe_subscription_id", { length: 255 }),
  paypalCustomerId: text("paypal_customer_id", { length: 255 }),
  totalSpent: text("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  lastOrderDate: integer("last_order_date"),
  
  // Social login fields
  googleId: text("google_id", { length: 255 }),
  facebookId: text("facebook_id", { length: 255 }),
  githubId: text("github_id", { length: 255 }),
  avatar: text("avatar", { length: 500 }),
  
  // Affiliate program
  referralCode: text("referral_code", { length: 20 }).unique(),
  referredBy: text("referred_by", { length: 255 }),
  totalEarnings: text("total_earnings", { precision: 10, scale: 2 }).default("0"),
  commissionRate: text("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // 10% default
  
  // Profile
  phone: text("phone", { length: 50 }),
  address: text("address"),
  dateOfBirth: text("date_of_birth", { length: 10 }),
  preferredLanguage: text("preferred_language", { length: 10 }).default("en").notNull(),
  marketingOptIn: integer("marketing_opt_in", { mode: 'boolean' }).default(false).notNull(),
  
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const affiliateTransactions = sqliteTable("affiliate_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  affiliateId: integer("affiliate_id").notNull().references(() => customers.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  commission: text("commission", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { length: 20 }).default("pending").notNull(), // pending, paid, cancelled
  paidAt: integer("paid_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Extension usage statistics table
export const extensionUsageStats = sqliteTable("extension_usage_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  sessionId: text("session_id", { length: 100 }).notNull(),
  usageDate: integer("usage_date").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  jobsFound: integer("jobs_found").default(0).notNull(),
  jobsApplied: integer("jobs_applied").default(0).notNull(),
  successfulJobs: integer("successful_jobs").default(0).notNull(),
  sessionDuration: integer("session_duration_minutes").default(0).notNull(), // in minutes
  platform: text("platform", { length: 50 }).default("ocus").notNull(), // ocus, ubereats, foodora
  location: text("location", { length: 100 }),
  userAgent: text("user_agent"),
  extensionVersion: text("extension_version", { length: 20 }),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Customer payments tracking table
export const customerPayments = sqliteTable("customer_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  paymentMethod: text("payment_method", { length: 20 }).notNull(), // stripe, paypal
  paymentIntentId: text("payment_intent_id", { length: 255 }),
  paypalOrderId: text("paypal_order_id", { length: 255 }),
  amount: text("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency", { length: 3 }).default("usd").notNull(),
  status: text("status", { length: 20 }).default("pending").notNull(), // pending, completed, failed, refunded
  failureReason: text("failure_reason"),
  refundAmount: text("refund_amount", { precision: 10, scale: 2 }).default("0"),
  refundReason: text("refund_reason"),
  processedAt: integer("processed_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Global extension usage statistics
export const globalUsageStats = sqliteTable("global_usage_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  statDate: text("stat_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  totalUsers: integer("total_users").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalJobsFound: integer("total_jobs_found").default(0).notNull(),
  totalJobsApplied: integer("total_jobs_applied").default(0).notNull(),
  totalSuccessfulJobs: integer("total_successful_jobs").default(0).notNull(),
  avgSessionDuration: text("avg_session_duration", { precision: 8, scale: 2 }).default("0").notNull(),
  topPlatform: text("top_platform", { length: 50 }),
  topLocation: text("top_location", { length: 100 }),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Premium device registration for single-device restriction
export const premiumDevices = sqliteTable("premium_devices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id", { length: 100 }).notNull(), // Extension user ID
  deviceFingerprint: text("device_fingerprint", { length: 64 }).notNull().unique(),
  extensionId: text("extension_id", { length: 100 }).notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  registeredAt: integer("registered_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  lastSeenAt: integer("last_seen_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deactivatedAt: integer("deactivated_at"),
  deactivationReason: text("deactivation_reason")
});

// SEO Settings table for managing meta tags and social media previews
export const seoSettings = sqliteTable("seo_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteTitle: text("site_title", { length: 100 }).default("OCUS Job Hunter - Premium Chrome Extension").notNull(),
  siteDescription: text("site_description").default("Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.").notNull(),
  siteKeywords: text("site_keywords").default("OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation"),
  siteAuthor: text("site_author", { length: 100 }).default("OCUS Job Hunter"),
  
  // Open Graph settings
  ogTitle: text("og_title", { length: 100 }),
  ogDescription: text("og_description"),
  ogImage: text("og_image").default("/og-image.svg"), // URL or path to image
  ogImageAlt: text("og_image_alt", { length: 200 }),
  ogSiteName: text("og_site_name", { length: 100 }).default("OCUS Job Hunter"),
  ogType: text("og_type", { length: 50 }).default("website"),
  ogUrl: text("og_url", { length: 255 }).default("https://jobhunter.one/"),
  
  // Twitter Card settings  
  twitterCard: text("twitter_card", { length: 50 }).default("summary_large_image"),
  twitterTitle: text("twitter_title", { length: 100 }),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image").default("/og-image.svg"),
  twitterSite: text("twitter_site", { length: 50 }),
  twitterCreator: text("twitter_creator", { length: 50 }),
  
  // Additional SEO settings
  metaRobots: text("meta_robots", { length: 100 }).default("index, follow"),
  canonicalUrl: text("canonical_url", { length: 255 }),
  themeColor: text("theme_color", { length: 7 }).default("#2563eb"),
  
  // Custom image uploads
  customLogo: text("custom_logo"), // Base64 or URL
  customFavicon: text("custom_favicon"), // Base64 or URL
  customOgImage: text("custom_og_image"), // Base64 or URL
  
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});


export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  downloads: many(downloads),
  invoice: one(invoices, {
    fields: [orders.id],
    references: [invoices.orderId],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  order: one(orders, {
    fields: [downloads.orderId],
    references: [orders.id],
  }),
}));




export const activationKeysRelations = relations(activationKeys, ({ one }) => ({
  order: one(orders, {
    fields: [activationKeys.orderId],
    references: [orders.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ many, one }) => ({
  messages: many(ticketMessages),
  assignedTo: one(users, {
    fields: [tickets.assignedToUserId],
    references: [users.id],
  }),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));

// Customer relations
export const customersRelations = relations(customers, ({ many }) => ({
  payments: many(customerPayments),
  usageStats: many(extensionUsageStats),
  affiliateTransactions: many(affiliateTransactions),
}));

export const customerPaymentsRelations = relations(customerPayments, ({ one }) => ({
  customer: one(customers, {
    fields: [customerPayments.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [customerPayments.orderId],
    references: [orders.id],
  }),
}));

export const extensionUsageStatsRelations = relations(extensionUsageStats, ({ one }) => ({
  customer: one(customers, {
    fields: [extensionUsageStats.customerId],
    references: [customers.id],
  }),
}));

export const affiliateTransactionsRelations = relations(affiliateTransactions, ({ one }) => ({
  affiliate: one(customers, {
    fields: [affiliateTransactions.affiliateId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [affiliateTransactions.orderId],
    references: [orders.id],
  }),
}));

// Countdown Banner table for promotional campaigns
export const countdownBanners = sqliteTable('countdown_banners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(false),
  titleEn: text('title_en').notNull(),
  subtitleEn: text('subtitle_en').notNull(),
  titleTranslations: text('title_translations').default('{}'),
  subtitleTranslations: text('subtitle_translations').default('{}'),
  targetPrice: text('target_price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: text('original_price', { precision: 10, scale: 2 }),
  endDateTime: integer('end_date_time').notNull(),
  backgroundColor: text('background_color', { length: 20 }).default('gradient-primary'),
  textColor: text('text_color', { length: 20 }).default('white'),
  priority: integer('priority').default(1),
  createdAt: integer('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Announcement Badge table for hero section badge
export const announcementBadges = sqliteTable('announcement_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  textEn: text('text_en').notNull(),
  textTranslations: text('text_translations').default('{}'),
  backgroundColor: text('background_color', { length: 20 }).default('gradient-primary'),
  textColor: text('text_color', { length: 20 }).default('white'),
  priority: integer('priority').default(1),
  createdAt: integer('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Extension downloads tracking for registered users
export const extensionDownloads = sqliteTable("extension_downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  downloadToken: text("download_token", { length: 255 }).notNull().unique(),
  downloadType: text("download_type", { length: 50 }).default("premium").notNull(), // premium, trial, etc.
  downloadedAt: integer("downloaded_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  ipAddress: text("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  downloadCount: integer("download_count").default(1).notNull(),
  maxDownloads: integer("max_downloads").default(3).notNull(),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Extension usage logs for trial limitations
export const extensionUsageLogs = sqliteTable("extension_usage_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  sessionId: text("session_id", { length: 100 }).notNull(),
  jobsUsed: integer("jobs_used").default(1).notNull(),
  platform: text("platform", { length: 50 }).default("ocus").notNull(),
  location: text("location", { length: 100 }),
  usageDate: integer("usage_date").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  extensionVersion: text("extension_version", { length: 20 }),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Activation codes for extension licensing
export const activationCodes = sqliteTable("activation_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user
  installationId: text("installation_id", { length: 36 }), // Unique installation identifier
  versionToken: text("version_token", { length: 36 }).unique(),
  activatedAt: integer("activated_at"),
  activationCount: integer("activation_count").default(0).notNull(),
  maxActivations: integer("max_activations").default(1).notNull(),
  deviceId: text("device_id", { length: 100 }),
  ipAddress: text("ip_address"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  dailyValidationCount: integer("daily_validation_count").default(0).notNull(), // Daily rate limiting
  lastValidationDate: integer("last_validation_date"), // Track daily reset
  isRevoked: integer("is_revoked", { mode: 'boolean' }).default(false).notNull(), // Manual revocation flag
  expiresAt: integer("expires_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// New table to track extension installations
export const extensionInstallations = sqliteTable("extension_installations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  installationId: text("installation_id", { length: 36 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user if logged in
  customerId: integer("customer_id").references(() => customers.id), // Fixed to integer
  deviceFingerprint: text("device_fingerprint"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  extensionVersion: text("extension_version", { length: 20 }),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  lastSeenAt: integer("last_seen_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  customerEmail: true,
  customerName: true,
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).pick({
  ticketId: true,
  message: true,
  isFromCustomer: true,
  senderName: true,
  senderEmail: true,
});

export const insertExtensionInstallationSchema = createInsertSchema(extensionInstallations).omit({
  id: true,
  createdAt: true,
  lastSeenAt: true,
});

export const insertActivationCodeSchema = createInsertSchema(activationCodes).omit({
  id: true,
  createdAt: true,
  activatedAt: true,
  activationCount: true,
  dailyValidationCount: true,
  lastValidationDate: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  downloadToken: true,
  downloadCount: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAuthSettingSchema = createInsertSchema(authSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExtensionDownloadSchema = createInsertSchema(extensionDownloads).omit({
  id: true,
  createdAt: true,
  downloadedAt: true,
});

export const insertAnnouncementBadgeSchema = createInsertSchema(announcementBadges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExtensionUsageLogSchema = createInsertSchema(extensionUsageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPremiumDeviceSchema = createInsertSchema(premiumDevices).omit({
  id: true,
  registeredAt: true,
  lastSeenAt: true,
});

// Removed duplicate - using the one defined earlier

// Types
export type Customer = typeof customers.$inferSelect;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type ActivationKey = typeof activationKeys.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type AuthSetting = typeof authSettings.$inferSelect;
export type DemoUser = typeof demoUsers.$inferSelect;
export type AffiliateTransaction = typeof affiliateTransactions.$inferSelect;
export type ExtensionDownload = typeof extensionDownloads.$inferSelect;
export type ExtensionUsageLog = typeof extensionUsageLogs.$inferSelect;
export type ExtensionUsageStats = typeof extensionUsageStats.$inferSelect;
export type CustomerPayment = typeof customerPayments.$inferSelect;
export type GlobalUsageStats = typeof globalUsageStats.$inferSelect;
export type ActivationCode = typeof activationCodes.$inferSelect;
export type ExtensionInstallation = typeof extensionInstallations.$inferSelect;
export type PremiumDevice = typeof premiumDevices.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type InsertAuthSetting = z.infer<typeof insertAuthSettingSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertExtensionInstallation = z.infer<typeof insertExtensionInstallationSchema>;
export type InsertActivationCode = z.infer<typeof insertActivationCodeSchema>;
export type InsertAffiliateTransaction = typeof affiliateTransactions.$inferInsert;
export type CountdownBanner = typeof countdownBanners.$inferSelect;
export type AnnouncementBadge = typeof announcementBadges.$inferSelect;
export type InsertAnnouncementBadge = z.infer<typeof insertAnnouncementBadgeSchema>;
export type InsertExtensionDownload = z.infer<typeof insertExtensionDownloadSchema>;
export type InsertExtensionUsageLog = z.infer<typeof insertExtensionUsageLogSchema>;
export type InsertExtensionUsageStats = z.infer<typeof insertExtensionUsageStatsSchema>;
export type InsertCustomerPayment = z.infer<typeof insertCustomerPaymentSchema>;
export type InsertGlobalUsageStats = z.infer<typeof insertGlobalUsageStatsSchema>;
export type InsertPremiumDevice = z.infer<typeof insertPremiumDeviceSchema>;

export const insertDashboardFeaturesSchema = createInsertSchema(dashboardFeatures).omit({
  id: true,
  updatedAt: true,
});

export type DashboardFeature = typeof dashboardFeatures.$inferSelect;
export type InsertDashboardFeature = z.infer<typeof insertDashboardFeaturesSchema>;

export const insertAffiliateTransactionSchema = createInsertSchema(affiliateTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertCountdownBannerSchema = createInsertSchema(countdownBanners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCountdownBanner = z.infer<typeof insertCountdownBannerSchema>;

export const insertActivationKeySchema = createInsertSchema(activationKeys).omit({
  id: true,
  createdAt: true,
});

export const insertDemoUserSchema = createInsertSchema(demoUsers).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertActivationKey = z.infer<typeof insertActivationKeySchema>;

// Enhanced Affiliate Marketing Tables
export const affiliatePrograms = sqliteTable("affiliate_programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  rewardType: text("reward_type", { length: 20 }).default("percentage").notNull(), // percentage, fixed
  commissionRate: text("commission_rate", { precision: 5, scale: 2 }), // for percentage
  fixedAmount: text("fixed_amount", { precision: 10, scale: 2 }), // for fixed amount
  minPayout: text("min_payout", { precision: 10, scale: 2 }).default("50.00"),
  cookieLifetime: integer("cookie_lifetime").default(30), // days
  autoApproval: integer("auto_approval", { mode: 'boolean' }).default(false),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  description: text("description"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Affiliate Settings - Single row configuration table
export const affiliateSettings = sqliteTable("affiliate_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  defaultRewardType: text("default_reward_type", { length: 20 }).default("percentage").notNull(),
  defaultCommissionRate: text("default_commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  defaultFixedAmount: text("default_fixed_amount", { precision: 10, scale: 2 }).default("5.00"),
  minPayoutAmount: text("min_payout_amount", { precision: 10, scale: 2 }).default("50.00"),
  cookieLifetimeDays: integer("cookie_lifetime_days").default(30),
  autoApprovalEnabled: integer("auto_approval_enabled", { mode: 'boolean' }).default(false),
  autoApprovalThreshold: text("auto_approval_threshold", { precision: 10, scale: 2 }).default("100.00"),
  payoutFrequency: text("payout_frequency", { length: 20 }).default("monthly"), // weekly, monthly, quarterly
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const affiliatePayouts = sqliteTable("affiliate_payouts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  affiliateId: integer("affiliate_id").notNull().references(() => customers.id),
  amount: text("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { length: 20 }).notNull(), // paypal, bank, manual
  paymentEmail: text("payment_email", { length: 255 }),
  bankDetails: text("bank_details"),
  status: text("status", { length: 20 }).default("pending").notNull(), // pending, processing, paid, failed
  transactionId: text("transaction_id", { length: 255 }),
  notes: text("notes"),
  requestedAt: integer("requested_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  processedAt: integer("processed_at"),
  paidAt: integer("paid_at"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;
export type InsertAffiliateProgram = typeof affiliatePrograms.$inferInsert;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;
export type AffiliateSettings = typeof affiliateSettings.$inferSelect;
export type InsertAffiliateSettings = typeof affiliateSettings.$inferInsert;

// Invoice Configuration Table
export const invoiceSettings = sqliteTable("invoice_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name", { length: 255 }).default("OCUS Job Hunter").notNull(),
  companyLogo: text("company_logo"), // Base64 or URL
  companyAddress: text("company_address"),
  companyPhone: text("company_phone", { length: 50 }),
  companyEmail: text("company_email", { length: 255 }),
  companyWebsite: text("company_website", { length: 255 }),
  taxNumber: text("tax_number", { length: 100 }),
  invoicePrefix: text("invoice_prefix", { length: 10 }).default("INV").notNull(),
  receiptPrefix: text("receipt_prefix", { length: 10 }).default("RCP").notNull(),
  invoiceNotes: text("invoice_notes"),
  termsAndConditions: text("terms_and_conditions"),
  footerText: text("footer_text"),
  primaryColor: text("primary_color", { length: 7 }).default("#007bff"),
  secondaryColor: text("secondary_color", { length: 7 }).default("#6c757d"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Invoices Table
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number", { length: 50 }).notNull().unique(),
  orderId: integer("order_id").references(() => orders.id),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name", { length: 255 }).notNull(),
  customerEmail: text("customer_email", { length: 255 }).notNull(),
  customerAddress: text("customer_address"),
  billingAddress: text("billing_address"),
  invoiceDate: integer("invoice_date").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  dueDate: integer("due_date").notNull(),
  subtotal: text("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: text("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: text("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: text("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency", { length: 3 }).default("USD").notNull(),
  status: text("status", { length: 20 }).default("issued").notNull(), // issued, paid, overdue, cancelled
  paidAt: integer("paid_at"),
  notes: text("notes"),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

// Invoice Items Table
export const invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  productName: text("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: text("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: text("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export type InvoiceSettings = typeof invoiceSettings.$inferSelect;
export type InsertInvoiceSettings = typeof invoiceSettings.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;
export type InsertDemoUser = z.infer<typeof insertDemoUserSchema>;

// Mission schema exports
export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTrialSchema = createInsertSchema(userTrials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type UserTrial = typeof userTrials.$inferSelect;
export type TrialUsage = typeof trialUsage.$inferSelect;
export type InsertTrialUsage = typeof trialUsage.$inferInsert;
export type InsertUserTrial = z.infer<typeof insertUserTrialSchema>;

// New schema exports
export const insertExtensionUsageStatsSchema = createInsertSchema(extensionUsageStats).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerPaymentSchema = createInsertSchema(customerPayments).omit({
  id: true,
  createdAt: true,
});

export const insertGlobalUsageStatsSchema = createInsertSchema(globalUsageStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Location tables for the locking system
export const continents = sqliteTable("continents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull().unique(),
  code: text("code", { length: 2 }).notNull().unique(),
  createdAt: integer("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  code: text("code", { length: 2 }).notNull().unique(),
  continentId: integer("continent_id").references(() => continents.id).notNull(),
  createdAt: integer("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  isAvailable: integer("is_available", { mode: 'boolean' }).notNull().default(true),
  assignedUserId: integer("assigned_user_id").references(() => customers.id),
  assignedAt: integer("assigned_at"),
  createdAt: integer("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// User location assignments
export const userLocationAssignments = sqliteTable("user_location_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => customers.id).notNull().unique(),
  continentId: integer("continent_id").references(() => continents.id).notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  assignedAt: integer("assigned_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  assignedBy: integer("assigned_by").references(() => customers.id), // null for self-assignment, admin user id for admin assignment
  isLocked: integer("is_locked", { mode: 'boolean' }).notNull().default(true),
});

// Location relations
export const continentsRelations = relations(continents, ({ many }) => ({
  countries: many(countries),
}));

export const countriesRelations = relations(countries, ({ one, many }) => ({
  continent: one(continents, {
    fields: [countries.continentId],
    references: [continents.id],
  }),
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  assignedUser: one(customers, {
    fields: [cities.assignedUserId],
    references: [customers.id],
  }),
}));

export const userLocationAssignmentsRelations = relations(userLocationAssignments, ({ one }) => ({
  user: one(customers, {
    fields: [userLocationAssignments.userId],
    references: [customers.id],
  }),
  continent: one(continents, {
    fields: [userLocationAssignments.continentId],
    references: [continents.id],
  }),
  country: one(countries, {
    fields: [userLocationAssignments.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [userLocationAssignments.cityId],
    references: [cities.id],
  }),
  assignedBy: one(customers, {
    fields: [userLocationAssignments.assignedBy],
    references: [customers.id],
  }),
}));

// Location schemas
export const insertContinentSchema = createInsertSchema(continents);
export const insertCountrySchema = createInsertSchema(countries);
export const insertCitySchema = createInsertSchema(cities);
export const insertUserLocationAssignmentSchema = createInsertSchema(userLocationAssignments);

export type InsertContinent = typeof continents.$inferInsert;
export type SelectContinent = typeof continents.$inferSelect;

export type InsertCountry = typeof countries.$inferInsert;
export type SelectCountry = typeof countries.$inferSelect;

export type InsertCity = typeof cities.$inferInsert;  
export type SelectCity = typeof cities.$inferSelect;

export type InsertUserLocationAssignment = typeof userLocationAssignments.$inferInsert;
export type SelectUserLocationAssignment = typeof userLocationAssignments.$inferSelect;
