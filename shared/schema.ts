import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Link to authenticated users
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
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
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  beforePrice: decimal("before_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("eur"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"), // null for unlimited
  usageCount: integer("usage_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Dashboard features control
export const dashboardFeatures = pgTable("dashboard_features", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull().unique(),
  isEnabled: boolean("is_enabled").default(true),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mission tracking for extension usage
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  missionId: text("mission_id").notNull().unique(), // OCUS mission ID
  userId: text("user_id").notNull(), // Extension user ID
  customerId: integer("customer_id"), // References users table if logged in
  missionName: text("mission_name").notNull(),
  compensationAmount: decimal("compensation_amount", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("assignment_accepted"), // assignment_accepted, appointment_confirmation, media_upload, billing_payment, assignment_complete
  assignmentAcceptedAt: timestamp("assignment_accepted_at").defaultNow(),
  appointmentConfirmedAt: timestamp("appointment_confirmed_at"),
  mediaUploadedAt: timestamp("media_uploaded_at"),
  billingCompletedAt: timestamp("billing_completed_at"),
  assignmentCompletedAt: timestamp("assignment_completed_at"),
  trialUsed: boolean("trial_used").default(false), // Whether this mission used a trial attempt
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User trial usage tracking
export const userTrials = pgTable("user_trials", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Extension user ID
  customerId: integer("customer_id"), // References users table if logged in
  trialsUsed: integer("trials_used").default(0),
  maxTrials: integer("max_trials").default(3),
  isActivated: boolean("is_activated").default(false),
  activationKey: text("activation_key"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cross-browser trial tracking
export const trialUsage = pgTable("trial_usage", {
  id: serial("id").primaryKey(),
  trialKey: text("trial_key").notNull().unique(), // Combination of extensionId + userFingerprint
  extensionId: text("extension_id").notNull(),
  userFingerprint: text("user_fingerprint").notNull(),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used").defaultNow(),
  isExpired: boolean("is_expired").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authSettings = pgTable("auth_settings", {
  id: serial("id").primaryKey(),
  // Google OAuth
  googleClientId: text("google_client_id"),
  googleClientSecret: text("google_client_secret"),
  googleRedirectUri: text("google_redirect_uri"),
  googleEnabled: boolean("google_enabled").default(false),
  
  // Facebook OAuth
  facebookAppId: text("facebook_app_id"),
  facebookAppSecret: text("facebook_app_secret"),
  facebookEnabled: boolean("facebook_enabled").default(false),
  
  // GitHub OAuth
  githubClientId: text("github_client_id"),
  githubClientSecret: text("github_client_secret"),
  githubEnabled: boolean("github_enabled").default(false),
  
  // reCAPTCHA settings
  recaptchaSiteKey: text("recaptcha_site_key"),
  recaptchaSecretKey: text("recaptcha_secret_key"),
  recaptchaEnabled: boolean("recaptcha_enabled").default(false),
  recaptchaMode: text("recaptcha_mode").default("v2"), // v2 or v3
  recaptchaCustomerEnabled: boolean("recaptcha_customer_enabled").default(false),
  recaptchaAdminEnabled: boolean("recaptcha_admin_enabled").default(true),
  
  // Payment Gateway Settings
  stripePublicKey: text("stripe_public_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeEnabled: boolean("stripe_enabled").default(false),
  paypalClientId: text("paypal_client_id"),
  paypalClientSecret: text("paypal_client_secret"),
  paypalEnabled: boolean("paypal_enabled").default(false),
  defaultPaymentMethod: text("default_payment_method").default("stripe"), // stripe or paypal
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "technical", "billing", "feature-request", "bug-report", "general"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  status: text("status").notNull().default("open"), // "open", "in-progress", "resolved", "closed"
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  message: text("message").notNull(),
  isFromCustomer: boolean("is_from_customer").notNull().default(true),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activationKeys = pgTable("activation_keys", {
  id: serial("id").primaryKey(),
  activationKey: text("activation_key").notNull().unique(),
  isActive: boolean("is_active").default(true),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user
  installationId: varchar("installation_id", { length: 36 }), // Bind to specific installation
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const demoUsers = pgTable("demo_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // UUID from extension
  demoCount: integer("demo_count").default(0),
  maxDemoUses: integer("max_demo_uses").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Optional for social logins
  name: varchar("name", { length: 255 }).notNull(),
  
  // Extension activation and usage
  activationKey: varchar("activation_key", { length: 100 }).unique(),
  activationKeyRevealed: boolean("activation_key_revealed").default(false).notNull(),
  activationKeyGeneratedAt: timestamp("activation_key_generated_at").defaultNow(),
  isActivated: boolean("is_activated").default(false).notNull(),
  extensionActivated: boolean("extension_activated").default(false).notNull(),
  extensionLastUsed: timestamp("extension_last_used"),
  extensionUsageCount: integer("extension_usage_count").default(0).notNull(),
  extensionSuccessfulJobs: integer("extension_successful_jobs").default(0).notNull(),
  extensionTrialJobsUsed: integer("extension_trial_jobs_used").default(0).notNull(),
  extensionTrialLimit: integer("extension_trial_limit").default(3).notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  blockedReason: text("blocked_reason"),
  blockedAt: timestamp("blocked_at"),
  
  // Account status
  isAdmin: boolean("is_admin").default(false).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive").notNull(), // inactive, active, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  
  // Payment integration
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  paypalCustomerId: varchar("paypal_customer_id", { length: 255 }),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  lastOrderDate: timestamp("last_order_date"),
  
  // Social login fields
  googleId: varchar("google_id", { length: 255 }),
  facebookId: varchar("facebook_id", { length: 255 }),
  githubId: varchar("github_id", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  
  // Affiliate program
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: varchar("referred_by", { length: 255 }),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // 10% default
  
  // Profile
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  dateOfBirth: varchar("date_of_birth", { length: 10 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en").notNull(),
  marketingOptIn: boolean("marketing_opt_in").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const affiliateTransactions = pgTable("affiliate_transactions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => customers.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Extension usage statistics table
export const extensionUsageStats = pgTable("extension_usage_stats", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  usageDate: timestamp("usage_date").defaultNow().notNull(),
  jobsFound: integer("jobs_found").default(0).notNull(),
  jobsApplied: integer("jobs_applied").default(0).notNull(),
  successfulJobs: integer("successful_jobs").default(0).notNull(),
  sessionDuration: integer("session_duration_minutes").default(0).notNull(), // in minutes
  platform: varchar("platform", { length: 50 }).default("ocus").notNull(), // ocus, ubereats, foodora
  location: varchar("location", { length: 100 }),
  userAgent: text("user_agent"),
  extensionVersion: varchar("extension_version", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Customer payments tracking table
export const customerPayments = pgTable("customer_payments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // stripe, paypal
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  paypalOrderId: varchar("paypal_order_id", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, failed, refunded
  failureReason: text("failure_reason"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
  refundReason: text("refund_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Global extension usage statistics
export const globalUsageStats = pgTable("global_usage_stats", {
  id: serial("id").primaryKey(),
  statDate: varchar("stat_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  totalUsers: integer("total_users").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalJobsFound: integer("total_jobs_found").default(0).notNull(),
  totalJobsApplied: integer("total_jobs_applied").default(0).notNull(),
  totalSuccessfulJobs: integer("total_successful_jobs").default(0).notNull(),
  avgSessionDuration: decimal("avg_session_duration", { precision: 8, scale: 2 }).default("0").notNull(),
  topPlatform: varchar("top_platform", { length: 50 }),
  topLocation: varchar("top_location", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Premium device registration for single-device restriction
export const premiumDevices = pgTable("premium_devices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(), // Extension user ID
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }).notNull().unique(),
  extensionId: varchar("extension_id", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at"),
  deactivationReason: text("deactivation_reason")
});

// SEO Settings table for managing meta tags and social media previews
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  siteTitle: varchar("site_title", { length: 100 }).default("OCUS Job Hunter - Premium Chrome Extension").notNull(),
  siteDescription: text("site_description").default("Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.").notNull(),
  siteKeywords: text("site_keywords").default("OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation"),
  siteAuthor: varchar("site_author", { length: 100 }).default("OCUS Job Hunter"),
  
  // Open Graph settings
  ogTitle: varchar("og_title", { length: 100 }),
  ogDescription: text("og_description"),
  ogImage: text("og_image").default("/og-image.svg"), // URL or path to image
  ogImageAlt: varchar("og_image_alt", { length: 200 }),
  ogSiteName: varchar("og_site_name", { length: 100 }).default("OCUS Job Hunter"),
  ogType: varchar("og_type", { length: 50 }).default("website"),
  ogUrl: varchar("og_url", { length: 255 }).default("https://jobhunter.one/"),
  
  // Twitter Card settings  
  twitterCard: varchar("twitter_card", { length: 50 }).default("summary_large_image"),
  twitterTitle: varchar("twitter_title", { length: 100 }),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image").default("/og-image.svg"),
  twitterSite: varchar("twitter_site", { length: 50 }),
  twitterCreator: varchar("twitter_creator", { length: 50 }),
  
  // Additional SEO settings
  metaRobots: varchar("meta_robots", { length: 100 }).default("index, follow"),
  canonicalUrl: varchar("canonical_url", { length: 255 }),
  themeColor: varchar("theme_color", { length: 7 }).default("#2563eb"),
  
  // Custom image uploads
  customLogo: text("custom_logo"), // Base64 or URL
  customFavicon: text("custom_favicon"), // Base64 or URL
  customOgImage: text("custom_og_image"), // Base64 or URL
  
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});



export const ordersRelations = relations(orders, ({ many }) => ({
  downloads: many(downloads),
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
export const countdownBanners = pgTable('countdown_banners', {
  id: serial('id').primaryKey(),
  isEnabled: boolean('is_enabled').default(false),
  titleEn: text('title_en').notNull(),
  subtitleEn: text('subtitle_en').notNull(),
  titleTranslations: json('title_translations').$type<Record<string, string>>().default({}),
  subtitleTranslations: json('subtitle_translations').$type<Record<string, string>>().default({}),
  targetPrice: decimal('target_price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  endDateTime: timestamp('end_date_time').notNull(),
  backgroundColor: varchar('background_color', { length: 20 }).default('gradient-primary'),
  textColor: varchar('text_color', { length: 20 }).default('white'),
  priority: integer('priority').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Announcement Badge table for hero section badge
export const announcementBadges = pgTable('announcement_badges', {
  id: serial('id').primaryKey(),
  isEnabled: boolean('is_enabled').default(true),
  textEn: text('text_en').notNull(),
  textTranslations: json('text_translations').$type<Record<string, string>>().default({}),
  backgroundColor: varchar('background_color', { length: 20 }).default('gradient-primary'),
  textColor: varchar('text_color', { length: 20 }).default('white'),
  priority: integer('priority').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Extension downloads tracking for registered users
export const extensionDownloads = pgTable("extension_downloads", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  downloadToken: varchar("download_token", { length: 255 }).notNull().unique(),
  downloadType: varchar("download_type", { length: 50 }).default("premium").notNull(), // premium, trial, etc.
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  downloadCount: integer("download_count").default(1).notNull(),
  maxDownloads: integer("max_downloads").default(3).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Extension usage logs for trial limitations
export const extensionUsageLogs = pgTable("extension_usage_logs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  jobsUsed: integer("jobs_used").default(1).notNull(),
  platform: varchar("platform", { length: 50 }).default("ocus").notNull(),
  location: varchar("location", { length: 100 }),
  usageDate: timestamp("usage_date").defaultNow().notNull(),
  extensionVersion: varchar("extension_version", { length: 20 }),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Activation codes for extension licensing
export const activationCodes = pgTable("activation_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user
  installationId: varchar("installation_id", { length: 36 }), // Unique installation identifier
  versionToken: varchar("version_token", { length: 36 }).unique(),
  activatedAt: timestamp("activated_at"),
  activationCount: integer("activation_count").default(0).notNull(),
  maxActivations: integer("max_activations").default(1).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").default(true).notNull(),
  dailyValidationCount: integer("daily_validation_count").default(0).notNull(), // Daily rate limiting
  lastValidationDate: timestamp("last_validation_date"), // Track daily reset
  isRevoked: boolean("is_revoked").default(false).notNull(), // Manual revocation flag
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// New table to track extension installations
export const extensionInstallations = pgTable("extension_installations", {
  id: serial("id").primaryKey(),
  installationId: varchar("installation_id", { length: 36 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id), // Link to authenticated user if logged in
  customerId: integer("customer_id").references(() => customers.id), // Fixed to integer
  deviceFingerprint: text("device_fingerprint"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  extensionVersion: varchar("extension_version", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
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
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  rewardType: varchar("reward_type", { length: 20 }).default("percentage").notNull(), // percentage, fixed
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // for percentage
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }), // for fixed amount
  minPayout: decimal("min_payout", { precision: 10, scale: 2 }).default("50.00"),
  cookieLifetime: integer("cookie_lifetime").default(30), // days
  autoApproval: boolean("auto_approval").default(false),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Affiliate Settings - Single row configuration table
export const affiliateSettings = pgTable("affiliate_settings", {
  id: serial("id").primaryKey(),
  defaultRewardType: varchar("default_reward_type", { length: 20 }).default("percentage").notNull(),
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  defaultFixedAmount: decimal("default_fixed_amount", { precision: 10, scale: 2 }).default("5.00"),
  minPayoutAmount: decimal("min_payout_amount", { precision: 10, scale: 2 }).default("50.00"),
  cookieLifetimeDays: integer("cookie_lifetime_days").default(30),
  autoApprovalEnabled: boolean("auto_approval_enabled").default(false),
  autoApprovalThreshold: decimal("auto_approval_threshold", { precision: 10, scale: 2 }).default("100.00"),
  payoutFrequency: varchar("payout_frequency", { length: 20 }).default("monthly"), // weekly, monthly, quarterly
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => customers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // paypal, bank, manual
  paymentEmail: varchar("payment_email", { length: 255 }),
  bankDetails: json("bank_details"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, processing, paid, failed
  transactionId: varchar("transaction_id", { length: 255 }),
  notes: text("notes"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;
export type InsertAffiliateProgram = typeof affiliatePrograms.$inferInsert;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;
export type AffiliateSettings = typeof affiliateSettings.$inferSelect;
export type InsertAffiliateSettings = typeof affiliateSettings.$inferInsert;

// Invoice Configuration Table
export const invoiceSettings = pgTable("invoice_settings", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).default("OCUS Job Hunter").notNull(),
  companyLogo: text("company_logo"), // Base64 or URL
  companyAddress: text("company_address"),
  companyPhone: varchar("company_phone", { length: 50 }),
  companyEmail: varchar("company_email", { length: 255 }),
  companyWebsite: varchar("company_website", { length: 255 }),
  taxNumber: varchar("tax_number", { length: 100 }),
  invoicePrefix: varchar("invoice_prefix", { length: 10 }).default("INV").notNull(),
  receiptPrefix: varchar("receipt_prefix", { length: 10 }).default("RCP").notNull(),
  invoiceNotes: text("invoice_notes"),
  termsAndConditions: text("terms_and_conditions"),
  footerText: text("footer_text"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#007bff"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#6c757d"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Invoices Table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  orderId: integer("order_id").references(() => orders.id),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerAddress: text("customer_address"),
  billingAddress: text("billing_address"),
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 20 }).default("issued").notNull(), // issued, paid, overdue, cancelled
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Invoice Items Table
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
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
export const continents = pgTable("continents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  continentId: integer("continent_id").references(() => continents.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  assignedUserId: integer("assigned_user_id").references(() => customers.id),
  assignedAt: timestamp("assigned_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User location assignments
export const userLocationAssignments = pgTable("user_location_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => customers.id).notNull().unique(),
  continentId: integer("continent_id").references(() => continents.id).notNull(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedBy: integer("assigned_by").references(() => customers.id), // null for self-assignment, admin user id for admin assignment
  isLocked: boolean("is_locked").notNull().default(true),
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
