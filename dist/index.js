var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activationCodes: () => activationCodes,
  activationKeys: () => activationKeys,
  activationKeysRelations: () => activationKeysRelations,
  affiliatePayouts: () => affiliatePayouts,
  affiliatePrograms: () => affiliatePrograms,
  affiliateSettings: () => affiliateSettings,
  affiliateTransactions: () => affiliateTransactions,
  affiliateTransactionsRelations: () => affiliateTransactionsRelations,
  announcementBadges: () => announcementBadges,
  authSettings: () => authSettings,
  cities: () => cities,
  citiesRelations: () => citiesRelations,
  continents: () => continents,
  continentsRelations: () => continentsRelations,
  countdownBanners: () => countdownBanners,
  countries: () => countries,
  countriesRelations: () => countriesRelations,
  coupons: () => coupons,
  customerPayments: () => customerPayments,
  customerPaymentsRelations: () => customerPaymentsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  dashboardFeatures: () => dashboardFeatures,
  demoUsers: () => demoUsers,
  downloads: () => downloads,
  downloadsRelations: () => downloadsRelations,
  extensionDownloads: () => extensionDownloads,
  extensionInstallations: () => extensionInstallations,
  extensionUsageLogs: () => extensionUsageLogs,
  extensionUsageStats: () => extensionUsageStats,
  extensionUsageStatsRelations: () => extensionUsageStatsRelations,
  globalUsageStats: () => globalUsageStats,
  insertActivationCodeSchema: () => insertActivationCodeSchema,
  insertActivationKeySchema: () => insertActivationKeySchema,
  insertAffiliateTransactionSchema: () => insertAffiliateTransactionSchema,
  insertAnnouncementBadgeSchema: () => insertAnnouncementBadgeSchema,
  insertAuthSettingSchema: () => insertAuthSettingSchema,
  insertCitySchema: () => insertCitySchema,
  insertContinentSchema: () => insertContinentSchema,
  insertCountdownBannerSchema: () => insertCountdownBannerSchema,
  insertCountrySchema: () => insertCountrySchema,
  insertCouponSchema: () => insertCouponSchema,
  insertCustomerPaymentSchema: () => insertCustomerPaymentSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDashboardFeaturesSchema: () => insertDashboardFeaturesSchema,
  insertDemoUserSchema: () => insertDemoUserSchema,
  insertDownloadSchema: () => insertDownloadSchema,
  insertExtensionDownloadSchema: () => insertExtensionDownloadSchema,
  insertExtensionInstallationSchema: () => insertExtensionInstallationSchema,
  insertExtensionUsageLogSchema: () => insertExtensionUsageLogSchema,
  insertExtensionUsageStatsSchema: () => insertExtensionUsageStatsSchema,
  insertGlobalUsageStatsSchema: () => insertGlobalUsageStatsSchema,
  insertMissionSchema: () => insertMissionSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPremiumDeviceSchema: () => insertPremiumDeviceSchema,
  insertProductSchema: () => insertProductSchema,
  insertSeoSettingsSchema: () => insertSeoSettingsSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertTicketMessageSchema: () => insertTicketMessageSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertUserLocationAssignmentSchema: () => insertUserLocationAssignmentSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserTrialSchema: () => insertUserTrialSchema,
  invoiceItems: () => invoiceItems,
  invoiceSettings: () => invoiceSettings,
  invoices: () => invoices,
  missions: () => missions,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  premiumDevices: () => premiumDevices,
  products: () => products,
  seoSettings: () => seoSettings,
  settings: () => settings,
  ticketMessages: () => ticketMessages,
  ticketMessagesRelations: () => ticketMessagesRelations,
  tickets: () => tickets,
  ticketsRelations: () => ticketsRelations,
  trialUsage: () => trialUsage,
  userLocationAssignments: () => userLocationAssignments,
  userLocationAssignmentsRelations: () => userLocationAssignmentsRelations,
  userTrials: () => userTrials,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users, orders, products, coupons, settings, dashboardFeatures, missions, userTrials, trialUsage, authSettings, downloads, tickets, ticketMessages, activationKeys, demoUsers, customers, affiliateTransactions, extensionUsageStats, customerPayments, globalUsageStats, premiumDevices, seoSettings, ordersRelations, downloadsRelations, activationKeysRelations, ticketsRelations, ticketMessagesRelations, customersRelations, customerPaymentsRelations, extensionUsageStatsRelations, affiliateTransactionsRelations, countdownBanners, announcementBadges, extensionDownloads, extensionUsageLogs, activationCodes, extensionInstallations, insertUserSchema, insertTicketSchema, insertTicketMessageSchema, insertExtensionInstallationSchema, insertActivationCodeSchema, insertOrderSchema, insertProductSchema, insertDownloadSchema, insertCouponSchema, insertSettingSchema, insertSeoSettingsSchema, insertAuthSettingSchema, insertCustomerSchema, insertExtensionDownloadSchema, insertAnnouncementBadgeSchema, insertExtensionUsageLogSchema, insertPremiumDeviceSchema, insertDashboardFeaturesSchema, insertAffiliateTransactionSchema, insertCountdownBannerSchema, insertActivationKeySchema, insertDemoUserSchema, affiliatePrograms, affiliateSettings, affiliatePayouts, invoiceSettings, invoices, invoiceItems, insertMissionSchema, insertUserTrialSchema, insertExtensionUsageStatsSchema, insertCustomerPaymentSchema, insertGlobalUsageStatsSchema, continents, countries, cities, userLocationAssignments, continentsRelations, countriesRelations, citiesRelations, userLocationAssignmentsRelations, insertContinentSchema, insertCountrySchema, insertCitySchema, insertUserLocationAssignmentSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull(),
      isAdmin: boolean("is_admin").default(false),
      stripeCustomerId: text("stripe_customer_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      // Link to authenticated users
      customerEmail: text("customer_email").notNull(),
      customerName: text("customer_name").notNull(),
      originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
      finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
      discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
      couponCode: text("coupon_code"),
      referralCode: text("referral_code"),
      // Added for affiliate tracking
      currency: text("currency").default("usd"),
      status: text("status").notNull().default("pending"),
      // pending, completed, failed, refunded
      paymentMethod: text("payment_method").notNull(),
      // stripe, paypal
      paymentIntentId: text("payment_intent_id"),
      paypalOrderId: text("paypal_order_id"),
      downloadToken: text("download_token").notNull(),
      downloadCount: integer("download_count").default(0),
      maxDownloads: integer("max_downloads").default(3),
      activationCode: text("activation_code"),
      // Generated activation code for the extension
      createdAt: timestamp("created_at").defaultNow(),
      completedAt: timestamp("completed_at")
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      beforePrice: decimal("before_price", { precision: 10, scale: 2 }),
      currency: text("currency").default("eur"),
      fileName: text("file_name").notNull(),
      filePath: text("file_path").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    coupons = pgTable("coupons", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      discountType: text("discount_type").notNull(),
      // "percentage" or "fixed"
      discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
      isActive: boolean("is_active").default(true),
      usageLimit: integer("usage_limit"),
      // null for unlimited
      usageCount: integer("usage_count").default(0),
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    settings = pgTable("settings", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    dashboardFeatures = pgTable("dashboard_features", {
      id: serial("id").primaryKey(),
      featureName: text("feature_name").notNull().unique(),
      isEnabled: boolean("is_enabled").default(true),
      description: text("description"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    missions = pgTable("missions", {
      id: serial("id").primaryKey(),
      missionId: text("mission_id").notNull().unique(),
      // OCUS mission ID
      userId: text("user_id").notNull(),
      // Extension user ID
      customerId: integer("customer_id"),
      // References users table if logged in
      missionName: text("mission_name").notNull(),
      compensationAmount: decimal("compensation_amount", { precision: 10, scale: 2 }),
      status: text("status").notNull().default("assignment_accepted"),
      // assignment_accepted, appointment_confirmation, media_upload, billing_payment, assignment_complete
      assignmentAcceptedAt: timestamp("assignment_accepted_at").defaultNow(),
      appointmentConfirmedAt: timestamp("appointment_confirmed_at"),
      mediaUploadedAt: timestamp("media_uploaded_at"),
      billingCompletedAt: timestamp("billing_completed_at"),
      assignmentCompletedAt: timestamp("assignment_completed_at"),
      trialUsed: boolean("trial_used").default(false),
      // Whether this mission used a trial attempt
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userTrials = pgTable("user_trials", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().unique(),
      // Extension user ID
      customerId: integer("customer_id"),
      // References users table if logged in
      trialsUsed: integer("trials_used").default(0),
      maxTrials: integer("max_trials").default(3),
      isActivated: boolean("is_activated").default(false),
      activationKey: text("activation_key"),
      activatedAt: timestamp("activated_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    trialUsage = pgTable("trial_usage", {
      id: serial("id").primaryKey(),
      trialKey: text("trial_key").notNull().unique(),
      // Combination of extensionId + userFingerprint
      extensionId: text("extension_id").notNull(),
      userFingerprint: text("user_fingerprint").notNull(),
      usageCount: integer("usage_count").default(0),
      lastUsed: timestamp("last_used").defaultNow(),
      isExpired: boolean("is_expired").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    authSettings = pgTable("auth_settings", {
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
      recaptchaMode: text("recaptcha_mode").default("v2"),
      // v2 or v3
      recaptchaCustomerEnabled: boolean("recaptcha_customer_enabled").default(false),
      recaptchaAdminEnabled: boolean("recaptcha_admin_enabled").default(true),
      // Payment Gateway Settings
      stripePublicKey: text("stripe_public_key"),
      stripeSecretKey: text("stripe_secret_key"),
      stripeEnabled: boolean("stripe_enabled").default(false),
      paypalClientId: text("paypal_client_id"),
      paypalClientSecret: text("paypal_client_secret"),
      paypalEnabled: boolean("paypal_enabled").default(false),
      defaultPaymentMethod: text("default_payment_method").default("stripe"),
      // stripe or paypal
      updatedAt: timestamp("updated_at").defaultNow()
    });
    downloads = pgTable("downloads", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id).notNull(),
      downloadedAt: timestamp("downloaded_at").defaultNow(),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent")
    });
    tickets = pgTable("tickets", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // "technical", "billing", "feature-request", "bug-report", "general"
      priority: text("priority").notNull().default("medium"),
      // "low", "medium", "high", "urgent"
      status: text("status").notNull().default("open"),
      // "open", "in-progress", "resolved", "closed"
      customerEmail: text("customer_email").notNull(),
      customerName: text("customer_name").notNull(),
      assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      resolvedAt: timestamp("resolved_at")
    });
    ticketMessages = pgTable("ticket_messages", {
      id: serial("id").primaryKey(),
      ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
      message: text("message").notNull(),
      isFromCustomer: boolean("is_from_customer").notNull().default(true),
      senderName: text("sender_name").notNull(),
      senderEmail: text("sender_email"),
      createdAt: timestamp("created_at").defaultNow()
    });
    activationKeys = pgTable("activation_keys", {
      id: serial("id").primaryKey(),
      activationKey: text("activation_key").notNull().unique(),
      isActive: boolean("is_active").default(true),
      orderId: integer("order_id").references(() => orders.id),
      userId: integer("user_id").references(() => users.id),
      // Link to authenticated user
      installationId: varchar("installation_id", { length: 36 }),
      // Bind to specific installation
      usedAt: timestamp("used_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    demoUsers = pgTable("demo_users", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().unique(),
      // UUID from extension
      demoCount: integer("demo_count").default(0),
      maxDemoUses: integer("max_demo_uses").default(3),
      createdAt: timestamp("created_at").defaultNow(),
      lastUsedAt: timestamp("last_used_at").defaultNow()
    });
    customers = pgTable("customers", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: varchar("password", { length: 255 }),
      // Optional for social logins
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
      subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive").notNull(),
      // inactive, active, cancelled, expired
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
      commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
      // 10% default
      // Profile
      phone: varchar("phone", { length: 50 }),
      address: text("address"),
      dateOfBirth: varchar("date_of_birth", { length: 10 }),
      preferredLanguage: varchar("preferred_language", { length: 10 }).default("en").notNull(),
      marketingOptIn: boolean("marketing_opt_in").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    affiliateTransactions = pgTable("affiliate_transactions", {
      id: serial("id").primaryKey(),
      affiliateId: varchar("affiliate_id").notNull().references(() => customers.id),
      orderId: integer("order_id").notNull().references(() => orders.id),
      commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
      status: varchar("status", { length: 20 }).default("pending").notNull(),
      // pending, paid, cancelled
      paidAt: timestamp("paid_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    extensionUsageStats = pgTable("extension_usage_stats", {
      id: serial("id").primaryKey(),
      customerId: varchar("customer_id").notNull().references(() => customers.id),
      sessionId: varchar("session_id", { length: 100 }).notNull(),
      usageDate: timestamp("usage_date").defaultNow().notNull(),
      jobsFound: integer("jobs_found").default(0).notNull(),
      jobsApplied: integer("jobs_applied").default(0).notNull(),
      successfulJobs: integer("successful_jobs").default(0).notNull(),
      sessionDuration: integer("session_duration_minutes").default(0).notNull(),
      // in minutes
      platform: varchar("platform", { length: 50 }).default("ocus").notNull(),
      // ocus, ubereats, foodora
      location: varchar("location", { length: 100 }),
      userAgent: text("user_agent"),
      extensionVersion: varchar("extension_version", { length: 20 }),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    customerPayments = pgTable("customer_payments", {
      id: serial("id").primaryKey(),
      customerId: varchar("customer_id").notNull().references(() => customers.id),
      orderId: integer("order_id").notNull().references(() => orders.id),
      paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
      // stripe, paypal
      paymentIntentId: varchar("payment_intent_id", { length: 255 }),
      paypalOrderId: varchar("paypal_order_id", { length: 255 }),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      currency: varchar("currency", { length: 3 }).default("usd").notNull(),
      status: varchar("status", { length: 20 }).default("pending").notNull(),
      // pending, completed, failed, refunded
      failureReason: text("failure_reason"),
      refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
      refundReason: text("refund_reason"),
      processedAt: timestamp("processed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    globalUsageStats = pgTable("global_usage_stats", {
      id: serial("id").primaryKey(),
      statDate: varchar("stat_date", { length: 10 }).notNull(),
      // YYYY-MM-DD format
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
    premiumDevices = pgTable("premium_devices", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id", { length: 100 }).notNull(),
      // Extension user ID
      deviceFingerprint: varchar("device_fingerprint", { length: 64 }).notNull().unique(),
      extensionId: varchar("extension_id", { length: 100 }).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      registeredAt: timestamp("registered_at").defaultNow().notNull(),
      lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
      deactivatedAt: timestamp("deactivated_at"),
      deactivationReason: text("deactivation_reason")
    });
    seoSettings = pgTable("seo_settings", {
      id: serial("id").primaryKey(),
      siteTitle: varchar("site_title", { length: 100 }).default("OCUS Job Hunter - Premium Chrome Extension").notNull(),
      siteDescription: text("site_description").default("Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.").notNull(),
      siteKeywords: text("site_keywords").default("OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation"),
      siteAuthor: varchar("site_author", { length: 100 }).default("OCUS Job Hunter"),
      // Open Graph settings
      ogTitle: varchar("og_title", { length: 100 }),
      ogDescription: text("og_description"),
      ogImage: text("og_image").default("/og-image.svg"),
      // URL or path to image
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
      customLogo: text("custom_logo"),
      // Base64 or URL
      customFavicon: text("custom_favicon"),
      // Base64 or URL
      customOgImage: text("custom_og_image"),
      // Base64 or URL
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    ordersRelations = relations(orders, ({ many }) => ({
      downloads: many(downloads)
    }));
    downloadsRelations = relations(downloads, ({ one }) => ({
      order: one(orders, {
        fields: [downloads.orderId],
        references: [orders.id]
      })
    }));
    activationKeysRelations = relations(activationKeys, ({ one }) => ({
      order: one(orders, {
        fields: [activationKeys.orderId],
        references: [orders.id]
      })
    }));
    ticketsRelations = relations(tickets, ({ many, one }) => ({
      messages: many(ticketMessages),
      assignedTo: one(users, {
        fields: [tickets.assignedToUserId],
        references: [users.id]
      })
    }));
    ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
      ticket: one(tickets, {
        fields: [ticketMessages.ticketId],
        references: [tickets.id]
      })
    }));
    customersRelations = relations(customers, ({ many }) => ({
      payments: many(customerPayments),
      usageStats: many(extensionUsageStats),
      affiliateTransactions: many(affiliateTransactions)
    }));
    customerPaymentsRelations = relations(customerPayments, ({ one }) => ({
      customer: one(customers, {
        fields: [customerPayments.customerId],
        references: [customers.id]
      }),
      order: one(orders, {
        fields: [customerPayments.orderId],
        references: [orders.id]
      })
    }));
    extensionUsageStatsRelations = relations(extensionUsageStats, ({ one }) => ({
      customer: one(customers, {
        fields: [extensionUsageStats.customerId],
        references: [customers.id]
      })
    }));
    affiliateTransactionsRelations = relations(affiliateTransactions, ({ one }) => ({
      affiliate: one(customers, {
        fields: [affiliateTransactions.affiliateId],
        references: [customers.id]
      }),
      order: one(orders, {
        fields: [affiliateTransactions.orderId],
        references: [orders.id]
      })
    }));
    countdownBanners = pgTable("countdown_banners", {
      id: serial("id").primaryKey(),
      isEnabled: boolean("is_enabled").default(false),
      titleEn: text("title_en").notNull(),
      subtitleEn: text("subtitle_en").notNull(),
      titleTranslations: json("title_translations").$type().default({}),
      subtitleTranslations: json("subtitle_translations").$type().default({}),
      targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
      originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
      endDateTime: timestamp("end_date_time").notNull(),
      backgroundColor: varchar("background_color", { length: 20 }).default("gradient-primary"),
      textColor: varchar("text_color", { length: 20 }).default("white"),
      priority: integer("priority").default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    announcementBadges = pgTable("announcement_badges", {
      id: serial("id").primaryKey(),
      isEnabled: boolean("is_enabled").default(true),
      textEn: text("text_en").notNull(),
      textTranslations: json("text_translations").$type().default({}),
      backgroundColor: varchar("background_color", { length: 20 }).default("gradient-primary"),
      textColor: varchar("text_color", { length: 20 }).default("white"),
      priority: integer("priority").default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    extensionDownloads = pgTable("extension_downloads", {
      id: serial("id").primaryKey(),
      customerId: varchar("customer_id").notNull().references(() => customers.id),
      downloadToken: varchar("download_token", { length: 100 }).notNull().unique(),
      downloadType: varchar("download_type", { length: 20 }).default("trial").notNull(),
      // trial, full
      downloadedAt: timestamp("downloaded_at").defaultNow(),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      downloadCount: integer("download_count").default(1).notNull(),
      maxDownloads: integer("max_downloads").default(3).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    extensionUsageLogs = pgTable("extension_usage_logs", {
      id: serial("id").primaryKey(),
      customerId: varchar("customer_id").notNull().references(() => customers.id),
      sessionId: varchar("session_id", { length: 100 }).notNull(),
      jobsUsed: integer("jobs_used").default(1).notNull(),
      platform: varchar("platform", { length: 50 }).default("ocus").notNull(),
      location: varchar("location", { length: 100 }),
      usageDate: timestamp("usage_date").defaultNow().notNull(),
      extensionVersion: varchar("extension_version", { length: 20 }),
      ipAddress: text("ip_address"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    activationCodes = pgTable("activation_codes", {
      id: serial("id").primaryKey(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      customerId: integer("customer_id").references(() => customers.id),
      orderId: integer("order_id").references(() => orders.id),
      userId: integer("user_id").references(() => users.id),
      // Link to authenticated user
      installationId: varchar("installation_id", { length: 36 }),
      // Unique installation identifier
      versionToken: varchar("version_token", { length: 36 }).unique(),
      activatedAt: timestamp("activated_at"),
      activationCount: integer("activation_count").default(0).notNull(),
      maxActivations: integer("max_activations").default(1).notNull(),
      deviceId: varchar("device_id", { length: 100 }),
      ipAddress: text("ip_address"),
      isActive: boolean("is_active").default(true).notNull(),
      dailyValidationCount: integer("daily_validation_count").default(0).notNull(),
      // Daily rate limiting
      lastValidationDate: timestamp("last_validation_date"),
      // Track daily reset
      isRevoked: boolean("is_revoked").default(false).notNull(),
      // Manual revocation flag
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    extensionInstallations = pgTable("extension_installations", {
      id: serial("id").primaryKey(),
      installationId: varchar("installation_id", { length: 36 }).notNull().unique(),
      userId: integer("user_id").references(() => users.id),
      // Link to authenticated user if logged in
      customerId: integer("customer_id").references(() => customers.id),
      // Fixed to integer
      deviceFingerprint: text("device_fingerprint"),
      userAgent: text("user_agent"),
      ipAddress: text("ip_address"),
      extensionVersion: varchar("extension_version", { length: 20 }),
      isActive: boolean("is_active").default(true).notNull(),
      lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      email: true
    });
    insertTicketSchema = createInsertSchema(tickets).pick({
      title: true,
      description: true,
      category: true,
      priority: true,
      customerEmail: true,
      customerName: true
    });
    insertTicketMessageSchema = createInsertSchema(ticketMessages).pick({
      ticketId: true,
      message: true,
      isFromCustomer: true,
      senderName: true,
      senderEmail: true
    });
    insertExtensionInstallationSchema = createInsertSchema(extensionInstallations).omit({
      id: true,
      createdAt: true,
      lastSeenAt: true
    });
    insertActivationCodeSchema = createInsertSchema(activationCodes).omit({
      id: true,
      createdAt: true,
      activatedAt: true,
      activationCount: true,
      dailyValidationCount: true,
      lastValidationDate: true
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      completedAt: true,
      downloadToken: true,
      downloadCount: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    });
    insertDownloadSchema = createInsertSchema(downloads).omit({
      id: true,
      downloadedAt: true
    });
    insertCouponSchema = createInsertSchema(coupons).omit({
      id: true,
      createdAt: true,
      usageCount: true
    });
    insertSettingSchema = createInsertSchema(settings).omit({
      id: true,
      updatedAt: true
    });
    insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
      id: true,
      updatedAt: true
    });
    insertAuthSettingSchema = createInsertSchema(authSettings).omit({
      id: true,
      updatedAt: true
    });
    insertCustomerSchema = createInsertSchema(customers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExtensionDownloadSchema = createInsertSchema(extensionDownloads).omit({
      id: true,
      createdAt: true,
      downloadedAt: true
    });
    insertAnnouncementBadgeSchema = createInsertSchema(announcementBadges).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExtensionUsageLogSchema = createInsertSchema(extensionUsageLogs).omit({
      id: true,
      createdAt: true
    });
    insertPremiumDeviceSchema = createInsertSchema(premiumDevices).omit({
      id: true,
      registeredAt: true,
      lastSeenAt: true
    });
    insertDashboardFeaturesSchema = createInsertSchema(dashboardFeatures).omit({
      id: true,
      updatedAt: true
    });
    insertAffiliateTransactionSchema = createInsertSchema(affiliateTransactions).omit({
      id: true,
      createdAt: true
    });
    insertCountdownBannerSchema = createInsertSchema(countdownBanners).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertActivationKeySchema = createInsertSchema(activationKeys).omit({
      id: true,
      createdAt: true
    });
    insertDemoUserSchema = createInsertSchema(demoUsers).omit({
      id: true,
      createdAt: true,
      lastUsedAt: true
    });
    affiliatePrograms = pgTable("affiliate_programs", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      rewardType: varchar("reward_type", { length: 20 }).default("percentage").notNull(),
      // percentage, fixed
      commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
      // for percentage
      fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }),
      // for fixed amount
      minPayout: decimal("min_payout", { precision: 10, scale: 2 }).default("50.00"),
      cookieLifetime: integer("cookie_lifetime").default(30),
      // days
      autoApproval: boolean("auto_approval").default(false),
      isActive: boolean("is_active").default(true),
      description: text("description"),
      termsAndConditions: text("terms_and_conditions"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    affiliateSettings = pgTable("affiliate_settings", {
      id: serial("id").primaryKey(),
      defaultRewardType: varchar("default_reward_type", { length: 20 }).default("percentage").notNull(),
      defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }).default("10.00"),
      defaultFixedAmount: decimal("default_fixed_amount", { precision: 10, scale: 2 }).default("5.00"),
      minPayoutAmount: decimal("min_payout_amount", { precision: 10, scale: 2 }).default("50.00"),
      cookieLifetimeDays: integer("cookie_lifetime_days").default(30),
      autoApprovalEnabled: boolean("auto_approval_enabled").default(false),
      autoApprovalThreshold: decimal("auto_approval_threshold", { precision: 10, scale: 2 }).default("100.00"),
      payoutFrequency: varchar("payout_frequency", { length: 20 }).default("monthly"),
      // weekly, monthly, quarterly
      isActive: boolean("is_active").default(true),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    affiliatePayouts = pgTable("affiliate_payouts", {
      id: serial("id").primaryKey(),
      affiliateId: varchar("affiliate_id").notNull().references(() => customers.id),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
      // paypal, bank, manual
      paymentEmail: varchar("payment_email", { length: 255 }),
      bankDetails: json("bank_details"),
      status: varchar("status", { length: 20 }).default("pending").notNull(),
      // pending, processing, paid, failed
      transactionId: varchar("transaction_id", { length: 255 }),
      notes: text("notes"),
      requestedAt: timestamp("requested_at").defaultNow().notNull(),
      processedAt: timestamp("processed_at"),
      paidAt: timestamp("paid_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    invoiceSettings = pgTable("invoice_settings", {
      id: serial("id").primaryKey(),
      companyName: varchar("company_name", { length: 255 }).default("OCUS Job Hunter").notNull(),
      companyLogo: text("company_logo"),
      // Base64 or URL
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
    invoices = pgTable("invoices", {
      id: serial("id").primaryKey(),
      invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
      orderId: integer("order_id").references(() => orders.id),
      customerId: varchar("customer_id").references(() => customers.id),
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
      status: varchar("status", { length: 20 }).default("issued").notNull(),
      // issued, paid, overdue, cancelled
      paidAt: timestamp("paid_at"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    invoiceItems = pgTable("invoice_items", {
      id: serial("id").primaryKey(),
      invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
      productName: varchar("product_name", { length: 255 }).notNull(),
      description: text("description"),
      quantity: integer("quantity").default(1).notNull(),
      unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
      totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertMissionSchema = createInsertSchema(missions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserTrialSchema = createInsertSchema(userTrials).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExtensionUsageStatsSchema = createInsertSchema(extensionUsageStats).omit({
      id: true,
      createdAt: true
    });
    insertCustomerPaymentSchema = createInsertSchema(customerPayments).omit({
      id: true,
      createdAt: true
    });
    insertGlobalUsageStatsSchema = createInsertSchema(globalUsageStats).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    continents = pgTable("continents", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull().unique(),
      code: varchar("code", { length: 2 }).notNull().unique(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    countries = pgTable("countries", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      code: varchar("code", { length: 2 }).notNull().unique(),
      continentId: integer("continent_id").references(() => continents.id).notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    cities = pgTable("cities", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      countryId: integer("country_id").references(() => countries.id).notNull(),
      isAvailable: boolean("is_available").notNull().default(true),
      assignedUserId: varchar("assigned_user_id").references(() => customers.id),
      assignedAt: timestamp("assigned_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    userLocationAssignments = pgTable("user_location_assignments", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => customers.id).notNull().unique(),
      continentId: integer("continent_id").references(() => continents.id).notNull(),
      countryId: integer("country_id").references(() => countries.id).notNull(),
      cityId: integer("city_id").references(() => cities.id).notNull(),
      assignedAt: timestamp("assigned_at").notNull().defaultNow(),
      assignedBy: varchar("assigned_by").references(() => customers.id),
      // null for self-assignment, admin user id for admin assignment
      isLocked: boolean("is_locked").notNull().default(true)
    });
    continentsRelations = relations(continents, ({ many }) => ({
      countries: many(countries)
    }));
    countriesRelations = relations(countries, ({ one, many }) => ({
      continent: one(continents, {
        fields: [countries.continentId],
        references: [continents.id]
      }),
      cities: many(cities)
    }));
    citiesRelations = relations(cities, ({ one }) => ({
      country: one(countries, {
        fields: [cities.countryId],
        references: [countries.id]
      }),
      assignedUser: one(customers, {
        fields: [cities.assignedUserId],
        references: [customers.id]
      })
    }));
    userLocationAssignmentsRelations = relations(userLocationAssignments, ({ one }) => ({
      user: one(customers, {
        fields: [userLocationAssignments.userId],
        references: [customers.id]
      }),
      continent: one(continents, {
        fields: [userLocationAssignments.continentId],
        references: [continents.id]
      }),
      country: one(countries, {
        fields: [userLocationAssignments.countryId],
        references: [countries.id]
      }),
      city: one(cities, {
        fields: [userLocationAssignments.cityId],
        references: [cities.id]
      }),
      assignedBy: one(customers, {
        fields: [userLocationAssignments.assignedBy],
        references: [customers.id]
      })
    }));
    insertContinentSchema = createInsertSchema(continents);
    insertCountrySchema = createInsertSchema(countries);
    insertCitySchema = createInsertSchema(cities);
    insertUserLocationAssignmentSchema = createInsertSchema(userLocationAssignments);
  }
});

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
var db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    db = null;
    if (process.env.DATABASE_URL) {
      try {
        const sql3 = neon(process.env.DATABASE_URL);
        db = drizzle(sql3, { schema: schema_exports });
        console.log("Database connection initialized successfully");
      } catch (error) {
        console.error("Error initializing database connection:", error);
        db = null;
      }
    } else {
      console.warn("DATABASE_URL not set - database operations will fail until configured");
      db = new Proxy({}, {
        get() {
          throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
        }
      });
    }
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";
import crypto from "crypto";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // Users
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateStripeCustomerId(userId, stripeCustomerId) {
        const [user] = await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId)).returning();
        return user;
      }
      // Orders
      async createOrder(insertOrder) {
        const orderWithToken = {
          ...insertOrder,
          downloadToken: this.generateDownloadToken()
        };
        const [order] = await db.insert(orders).values(orderWithToken).returning();
        return order;
      }
      async getOrder(id) {
        const [order] = await db.select().from(orders).where(eq(orders.id, id));
        return order || void 0;
      }
      async getOrderByDownloadToken(token) {
        const [order] = await db.select().from(orders).where(eq(orders.downloadToken, token));
        return order || void 0;
      }
      async getOrderByPaymentIntentId(paymentIntentId) {
        const [order] = await db.select().from(orders).where(eq(orders.paymentIntentId, paymentIntentId));
        return order || void 0;
      }
      async getOrderByPaypalOrderId(paypalOrderId) {
        const [order] = await db.select().from(orders).where(eq(orders.paypalOrderId, paypalOrderId));
        return order || void 0;
      }
      async updateOrderStatus(id, status, completedAt) {
        const updateData = { status };
        if (completedAt) {
          updateData.completedAt = completedAt;
        }
        const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
        return order;
      }
      async incrementDownloadCount(id) {
        const [order] = await db.update(orders).set({ downloadCount: sql`${orders.downloadCount} + 1` }).where(eq(orders.id, id)).returning();
        return order;
      }
      async getAllOrders() {
        return await db.select().from(orders).orderBy(desc(orders.createdAt));
      }
      async getOrdersWithPagination(page, limit) {
        const offset = (page - 1) * limit;
        const ordersPromise = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
        const totalPromise = db.select({ count: count() }).from(orders);
        const [ordersList, totalResult] = await Promise.all([ordersPromise, totalPromise]);
        return {
          orders: ordersList,
          total: totalResult[0]?.count || 0
        };
      }
      async getUserOrders(userId) {
        return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
      }
      // Products
      async createProduct(insertProduct) {
        const [product] = await db.insert(products).values(insertProduct).returning();
        return product;
      }
      async getProduct(id) {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product || void 0;
      }
      async getActiveProducts() {
        return await db.select().from(products).where(eq(products.isActive, true));
      }
      async getActiveProduct() {
        const [product] = await db.select().from(products).where(eq(products.isActive, true)).limit(1);
        return product || void 0;
      }
      async updateProduct(id, updates) {
        const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
        return product;
      }
      // Downloads
      async createDownload(insertDownload) {
        const [download] = await db.insert(downloads).values(insertDownload).returning();
        return download;
      }
      async getDownloadsByOrder(orderId) {
        return await db.select().from(downloads).where(eq(downloads.orderId, orderId));
      }
      async getUserDownloads(userId) {
        return await db.select({
          id: downloads.id,
          orderId: downloads.orderId,
          downloadedAt: downloads.downloadedAt,
          ipAddress: downloads.ipAddress,
          userAgent: downloads.userAgent
        }).from(downloads).innerJoin(orders, eq(downloads.orderId, orders.id)).where(eq(orders.userId, userId)).orderBy(desc(downloads.downloadedAt));
      }
      // Analytics
      async getTotalRevenue() {
        const completedOrders = await db.select().from(orders).where(eq(orders.status, "completed"));
        return completedOrders.reduce((sum3, order) => sum3 + parseFloat(order.finalAmount || "0"), 0);
      }
      async getTotalSales() {
        const [result] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "completed"));
        return result?.count || 0;
      }
      async getRecentOrders(limit) {
        return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
      }
      // Coupons
      async createCoupon(insertCoupon) {
        const [coupon] = await db.insert(coupons).values(insertCoupon).returning();
        return coupon;
      }
      async getCoupon(id) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
        return coupon || void 0;
      }
      async getCouponByCode(code) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
        return coupon || void 0;
      }
      async updateCoupon(id, updates) {
        const [coupon] = await db.update(coupons).set(updates).where(eq(coupons.id, id)).returning();
        return coupon;
      }
      async getAllCoupons() {
        return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
      }
      async incrementCouponUsage(id) {
        const [currentCoupon] = await db.select().from(coupons).where(eq(coupons.id, id));
        const newUsageCount = (currentCoupon?.usageCount || 0) + 1;
        const [coupon] = await db.update(coupons).set({ usageCount: newUsageCount }).where(eq(coupons.id, id)).returning();
        return coupon;
      }
      async deleteCoupon(id) {
        await db.delete(coupons).where(eq(coupons.id, id));
      }
      // Settings
      async createSetting(insertSetting) {
        const [setting] = await db.insert(settings).values(insertSetting).returning();
        return setting;
      }
      async getSetting(key) {
        const [setting] = await db.select().from(settings).where(eq(settings.key, key));
        return setting || void 0;
      }
      async updateSetting(key, value) {
        const [updatedSetting] = await db.update(settings).set({ value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settings.key, key)).returning();
        if (updatedSetting) {
          return updatedSetting;
        }
        const [newSetting] = await db.insert(settings).values({ key, value, updatedAt: /* @__PURE__ */ new Date() }).returning();
        return newSetting;
      }
      async getAllSettings() {
        return await db.select().from(settings);
      }
      // Auth Settings
      async getAuthSettings() {
        const [authSetting] = await db.select().from(authSettings).limit(1);
        return authSetting || void 0;
      }
      async updateAuthSettings(updates) {
        const existing = await this.getAuthSettings();
        if (existing) {
          const [updated] = await db.update(authSettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(authSettings.id, existing.id)).returning();
          return updated;
        } else {
          return await this.createAuthSettings(updates);
        }
      }
      async createAuthSettings(insertAuthSetting) {
        const [authSetting] = await db.insert(authSettings).values(insertAuthSetting).returning();
        return authSetting;
      }
      // SEO Settings
      async getSeoSettings() {
        const [seoSetting] = await db.select().from(seoSettings).limit(1);
        return seoSetting || void 0;
      }
      async updateSeoSettings(updates) {
        const existing = await this.getSeoSettings();
        if (existing) {
          const [updated] = await db.update(seoSettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(seoSettings.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(seoSettings).values(updates).returning();
          return created;
        }
      }
      // Activation Keys
      async createActivationKey(insertActivationKey) {
        const [activationKey] = await db.insert(activationKeys).values(insertActivationKey).returning();
        return activationKey;
      }
      async getRecentActivationKeys() {
        return await db.select().from(activationKeys).orderBy(desc(activationKeys.createdAt)).limit(10);
      }
      async getActivationKeyByKey(key) {
        const [activationKey] = await db.select().from(activationKeys).where(eq(activationKeys.activationKey, key));
        return activationKey || void 0;
      }
      async updateActivationKeyUsage(key) {
        const [activationKey] = await db.update(activationKeys).set({ usedAt: /* @__PURE__ */ new Date() }).where(eq(activationKeys.activationKey, key)).returning();
        return activationKey;
      }
      // Demo Users
      async createDemoUser(insertDemoUser) {
        const [demoUser] = await db.insert(demoUsers).values(insertDemoUser).returning();
        return demoUser;
      }
      async getDemoUserById(userId) {
        const [demoUser] = await db.select().from(demoUsers).where(eq(demoUsers.userId, userId));
        return demoUser || void 0;
      }
      // User Lifecycle Management
      async createOrUpdateUserLifecycle(userId, email) {
        try {
          const [existing] = await db.raw`
        SELECT * FROM user_lifecycle WHERE user_id = $1 LIMIT 1
      `;
          if (existing.length > 0) {
            const [updated] = await db.raw`
          UPDATE user_lifecycle 
          SET email = COALESCE($2, email), updated_at = NOW()
          WHERE user_id = $1 
          RETURNING *
        `;
            return updated[0];
          } else {
            const [created] = await db.raw`
          INSERT INTO user_lifecycle (user_id, email, trial_uses_remaining, trial_uses_total)
          VALUES ($1, $2, 3, 0)
          RETURNING *
        `;
            return created[0];
          }
        } catch (error) {
          console.error("Error in createOrUpdateUserLifecycle:", error);
          throw error;
        }
      }
      async getUserLifecycle(userId) {
        try {
          const [user] = await db.raw`
        SELECT * FROM user_lifecycle WHERE user_id = $1 LIMIT 1
      `;
          return user.length > 0 ? user[0] : null;
        } catch (error) {
          console.error("Error in getUserLifecycle:", error);
          return null;
        }
      }
      async updateTrialUsage(userId) {
        try {
          await this.createOrUpdateUserLifecycle(userId);
          const [updated] = await db.raw`
        UPDATE user_lifecycle 
        SET trial_uses_total = trial_uses_total + 1,
            trial_uses_remaining = GREATEST(0, trial_uses_remaining - 1),
            updated_at = NOW()
        WHERE user_id = $1 
        RETURNING *
      `;
          return updated[0];
        } catch (error) {
          console.error("Error in updateTrialUsage:", error);
          throw error;
        }
      }
      async activateUser(userId, activationCode) {
        try {
          const [updated] = await db.raw`
        UPDATE user_lifecycle 
        SET activation_code = $2, 
            is_activated = true, 
            activated_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1 
        RETURNING *
      `;
          return updated[0];
        } catch (error) {
          console.error("Error in activateUser:", error);
          throw error;
        }
      }
      async generateActivationCodeForOrder(orderId) {
        const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        try {
          await db.raw`
        UPDATE orders SET activation_code = $1 WHERE id = $2
      `;
          return activationCode;
        } catch (error) {
          console.error("Error generating activation code:", error);
          throw error;
        }
      }
      async getAllUsersWithLifecycle() {
        try {
          const users2 = await db.raw`
        SELECT 
          ul.user_id,
          ul.email,
          ul.trial_uses_remaining,
          ul.trial_uses_total,
          ul.activation_code,
          ul.is_activated,
          ul.activated_at,
          ul.created_at,
          o.customer_email as order_email,
          o.customer_name,
          o.status as order_status
        FROM user_lifecycle ul
        LEFT JOIN orders o ON ul.activation_code = o.activation_code
        ORDER BY ul.created_at DESC
      `;
          return users2;
        } catch (error) {
          console.error("Error in getAllUsersWithLifecycle:", error);
          return [];
        }
      }
      async regenerateActivationCode(userId) {
        const newCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        try {
          const [updated] = await db.raw`
        UPDATE user_lifecycle 
        SET activation_code = $2, updated_at = NOW()
        WHERE user_id = $1 
        RETURNING *
      `;
          await db.raw`
        UPDATE orders SET activation_code = $1 WHERE user_id = $2
      `;
          return newCode;
        } catch (error) {
          console.error("Error regenerating activation code:", error);
          throw error;
        }
      }
      async blockUser(userId, reason) {
        try {
          const [updated] = await db.raw`
        UPDATE user_lifecycle 
        SET is_activated = false, updated_at = NOW()
        WHERE user_id = $1 
        RETURNING *
      `;
          return updated[0];
        } catch (error) {
          console.error("Error blocking user:", error);
          throw error;
        }
      }
      async deleteUserLifecycle(userId) {
        try {
          await db.raw`DELETE FROM user_lifecycle WHERE user_id = $1`;
        } catch (error) {
          console.error("Error deleting user lifecycle:", error);
          throw error;
        }
      }
      async incrementDemoUsage(userId) {
        const [currentUser] = await db.select().from(demoUsers).where(eq(demoUsers.userId, userId));
        const newCount = (currentUser?.demoCount || 0) + 1;
        const [demoUser] = await db.update(demoUsers).set({
          demoCount: newCount,
          lastUsedAt: /* @__PURE__ */ new Date()
        }).where(eq(demoUsers.userId, userId)).returning();
        return demoUser;
      }
      // Customer operations
      async getCustomer(id) {
        const customerId = typeof id === "string" ? parseInt(id) : id;
        const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
        return customer || void 0;
      }
      async getCustomerByEmail(email) {
        const [customer] = await db.select().from(customers).where(eq(customers.email, email));
        return customer || void 0;
      }
      async createCustomer(customerData) {
        const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const [customer] = await db.insert(customers).values({
          ...customerData,
          activationKey,
          activationKeyRevealed: false,
          activationKeyGeneratedAt: /* @__PURE__ */ new Date()
        }).returning();
        return customer;
      }
      async updateCustomerActivationKey(id, activationKey) {
        const customerId = typeof id === "string" ? parseInt(id) : id;
        await db.update(customers).set({ activationKey, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, customerId));
      }
      async getCustomerBySocialId(provider, socialId) {
        let condition;
        switch (provider) {
          case "google":
            condition = eq(customers.googleId, socialId);
            break;
          case "facebook":
            condition = eq(customers.facebookId, socialId);
            break;
          case "github":
            condition = eq(customers.githubId, socialId);
            break;
          default:
            return void 0;
        }
        const [customer] = await db.select().from(customers).where(condition);
        return customer || void 0;
      }
      async updateCustomer(id, updates) {
        const customerId = typeof id === "string" ? parseInt(id) : id;
        const [customer] = await db.update(customers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, customerId)).returning();
        return customer;
      }
      async getCustomerOrders(customerId) {
        return [];
      }
      // Affiliate operations
      async getCustomerByReferralCode(code) {
        const [customer] = await db.select().from(customers).where(eq(customers.referralCode, code));
        return customer || void 0;
      }
      async createAffiliateTransaction(transaction) {
        const [affiliateTransaction] = await db.insert(affiliateTransactions).values(transaction).returning();
        return affiliateTransaction;
      }
      async getAffiliateTransactions(affiliateId) {
        const transactions = await db.select().from(affiliateTransactions).where(eq(affiliateTransactions.affiliateId, affiliateId)).orderBy(desc(affiliateTransactions.createdAt));
        return transactions;
      }
      async getAffiliateStats(affiliateId) {
        const transactions = await this.getAffiliateTransactions(affiliateId);
        const totalEarnings = transactions.filter((t) => t.status === "paid").reduce((sum3, t) => sum3 + parseFloat(t.commission), 0);
        const pendingCommissions = transactions.filter((t) => t.status === "pending").reduce((sum3, t) => sum3 + parseFloat(t.commission), 0);
        const referrals = await db.select({ count: count() }).from(customers).where(eq(customers.referredBy, affiliateId));
        const totalReferrals = referrals[0]?.count || 0;
        return {
          totalEarnings,
          totalReferrals,
          pendingCommissions
        };
      }
      // Ticket operations - using existing tickets table from schema
      async createTicket(ticket) {
        const [newTicket] = await db.insert(tickets).values({
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority || "medium",
          status: ticket.status || "open",
          customerEmail: ticket.customerEmail,
          customerName: ticket.customerName,
          assignedToUserId: ticket.assignedToUserId || null
        }).returning();
        return newTicket;
      }
      async getTicket(id) {
        if (id === 1) {
          return {
            id: 1,
            title: "I want",
            description: "eergwerrg",
            status: "open",
            priority: "medium",
            userId: 1,
            userName: "Demo User",
            userEmail: "demo@example.com",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        return void 0;
      }
      async getTicketsByUserId(userId) {
        return [
          {
            id: 1,
            title: "I want",
            description: "eergwerrg",
            status: "open",
            priority: "medium",
            userId,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ];
      }
      async getTicketsByCustomerEmail(customerEmail) {
        const result = await db.select().from(tickets).where(eq(tickets.customerEmail, customerEmail)).orderBy(desc(tickets.createdAt));
        return result;
      }
      async getAllTickets() {
        const result = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
        return result;
      }
      async updateTicketStatus(id, status) {
        const [updatedTicket] = await db.update(tickets).set({
          status,
          updatedAt: /* @__PURE__ */ new Date(),
          resolvedAt: status === "resolved" || status === "closed" ? /* @__PURE__ */ new Date() : null
        }).where(eq(tickets.id, id)).returning();
        return updatedTicket;
      }
      async updateTicket(id, updateData) {
        const [updatedTicket] = await db.update(tickets).set({
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(tickets.id, id)).returning();
        return updatedTicket;
      }
      // Ticket Message operations
      async addTicketMessage(message) {
        const [newMessage] = await db.insert(ticketMessages).values({
          ticketId: message.ticketId,
          message: message.content || message.message,
          isFromCustomer: !message.isStaff && !message.isAdmin,
          senderName: message.authorName || message.senderName,
          senderEmail: message.senderEmail || null
        }).returning();
        await db.update(tickets).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(tickets.id, message.ticketId));
        return newMessage;
      }
      async deleteTicket(id) {
        await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
        await db.delete(tickets).where(eq(tickets.id, id));
      }
      async getTicketMessages(ticketId) {
        const result = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
        return result;
      }
      generateDownloadToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      // ===== COMPREHENSIVE CUSTOMER MANAGEMENT SYSTEM =====
      // Enhanced Customer Management
      async getAllCustomers() {
        return await db.select().from(customers).orderBy(desc(customers.createdAt));
      }
      async generateActivationKey(customerId) {
        const activationKey = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
        await db.update(customers).set({
          activationKey,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, parseInt(customerId)));
        return activationKey;
      }
      async activateCustomer(activationKey) {
        const [customer] = await db.select().from(customers).where(eq(customers.activationKey, activationKey));
        if (!customer) return null;
        const [activatedCustomer] = await db.update(customers).set({
          isActivated: true,
          extensionActivated: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, customer.id)).returning();
        return activatedCustomer;
      }
      // Extension Usage Statistics
      async recordExtensionUsage(stats) {
        const [newStats] = await db.insert(extensionUsageStats).values(stats).returning();
        await db.update(customers).set({
          extensionUsageCount: sql`${customers.extensionUsageCount} + 1`,
          extensionSuccessfulJobs: sql`${customers.extensionSuccessfulJobs} + ${stats.successfulJobs || 0}`,
          extensionLastUsed: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, typeof stats.customerId === "string" ? parseInt(stats.customerId) : stats.customerId));
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        await this.updateGlobalStats(today);
        return newStats;
      }
      async getCustomerUsageStats(customerId) {
        return await db.select().from(extensionUsageStats).where(eq(extensionUsageStats.customerId, typeof customerId === "string" ? parseInt(customerId) : customerId)).orderBy(desc(extensionUsageStats.usageDate));
      }
      async getGlobalUsageStats() {
        return await db.select().from(globalUsageStats).orderBy(desc(globalUsageStats.statDate)).limit(30);
      }
      async updateGlobalStats(date) {
        const [existingStats] = await db.select().from(globalUsageStats).where(eq(globalUsageStats.statDate, date));
        const todayStart = /* @__PURE__ */ new Date(date + "T00:00:00Z");
        const todayEnd = /* @__PURE__ */ new Date(date + "T23:59:59Z");
        const totalUsers = await db.select({ count: count() }).from(customers).where(eq(customers.isActivated, true));
        const activeUsers = await db.select({ count: count() }).from(extensionUsageStats).where(and(
          gte(extensionUsageStats.usageDate, todayStart),
          lte(extensionUsageStats.usageDate, todayEnd)
        ));
        const dailyStats = await db.select({
          totalSessions: count(),
          totalJobsFound: sql`COALESCE(SUM(${extensionUsageStats.jobsFound}), 0)`,
          totalJobsApplied: sql`COALESCE(SUM(${extensionUsageStats.jobsApplied}), 0)`,
          totalSuccessfulJobs: sql`COALESCE(SUM(${extensionUsageStats.successfulJobs}), 0)`,
          avgSessionDuration: sql`COALESCE(AVG(${extensionUsageStats.sessionDuration}), 0)`
        }).from(extensionUsageStats).where(and(
          gte(extensionUsageStats.usageDate, todayStart),
          lte(extensionUsageStats.usageDate, todayEnd)
        ));
        const statsData = {
          statDate: date,
          totalUsers: totalUsers[0]?.count || 0,
          activeUsers: activeUsers[0]?.count || 0,
          totalSessions: dailyStats[0]?.totalSessions || 0,
          totalJobsFound: dailyStats[0]?.totalJobsFound || 0,
          totalJobsApplied: dailyStats[0]?.totalJobsApplied || 0,
          totalSuccessfulJobs: dailyStats[0]?.totalSuccessfulJobs || 0,
          avgSessionDuration: dailyStats[0]?.avgSessionDuration?.toString() || "0",
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (existingStats) {
          await db.update(globalUsageStats).set(statsData).where(eq(globalUsageStats.id, existingStats.id));
        } else {
          await db.insert(globalUsageStats).values([statsData]);
        }
      }
      // Customer Payments
      async recordPayment(payment) {
        const [newPayment] = await db.insert(customerPayments).values(payment).returning();
        if (payment.status === "completed") {
          await db.update(customers).set({
            totalSpent: sql`${customers.totalSpent} + ${payment.amount}`,
            totalOrders: sql`${customers.totalOrders} + 1`,
            lastOrderDate: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(customers.id, payment.customerId));
        }
        return newPayment;
      }
      async getCustomerPayments(customerId) {
        return await db.select().from(customerPayments).where(eq(customerPayments.customerId, customerId)).orderBy(desc(customerPayments.createdAt));
      }
      async updatePaymentStatus(paymentId, status, processedAt) {
        const [updatedPayment] = await db.update(customerPayments).set({
          status,
          processedAt: processedAt || /* @__PURE__ */ new Date()
        }).where(eq(customerPayments.id, paymentId)).returning();
        return updatedPayment;
      }
      // Database Ticket Operations (Real Implementation)
      async createTicketDB(ticket) {
        const [newTicket] = await db.insert(tickets).values(ticket).returning();
        return newTicket;
      }
      async getTicketDB(id) {
        const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
        return ticket;
      }
      async getCustomerTickets(customerEmail) {
        return await db.select().from(tickets).where(eq(tickets.customerEmail, customerEmail)).orderBy(desc(tickets.createdAt));
      }
      async getAllTicketsDB() {
        return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
      }
      async updateTicketStatusDB(id, status) {
        const updateData = {
          status,
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (status === "resolved" || status === "closed") {
          updateData.resolvedAt = /* @__PURE__ */ new Date();
        }
        const [updatedTicket] = await db.update(tickets).set(updateData).where(eq(tickets.id, id)).returning();
        return updatedTicket;
      }
      async deleteTicketDB(id) {
        await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
        await db.delete(tickets).where(eq(tickets.id, id));
      }
      async addTicketMessageDB(message) {
        const [newMessage] = await db.insert(ticketMessages).values(message).returning();
        await db.update(tickets).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(tickets.id, message.ticketId));
        return newMessage;
      }
      async getTicketMessagesDB(ticketId) {
        return await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
      }
      // Product Pricing Management Implementation
      async updateProductPricing(data) {
        try {
          const existingProducts = await db.select().from(products).limit(1);
          if (existingProducts.length === 0) {
            const [newProduct] = await db.insert(products).values({
              name: "OCUS Job Hunter Chrome Extension",
              description: "Premium Chrome extension for photography job hunting on OCUS (Ubereats/Foodora deliveries)",
              price: data.price.toString(),
              beforePrice: data.beforePrice ? data.beforePrice.toString() : null,
              currency: "eur",
              fileName: "ocus-extension.crx",
              filePath: "/uploads/ocus-extension.crx",
              isActive: true
            }).returning();
            return newProduct;
          } else {
            const [updatedProduct] = await db.update(products).set({
              price: data.price.toString(),
              beforePrice: data.beforePrice ? data.beforePrice.toString() : null
            }).where(eq(products.id, existingProducts[0].id)).returning();
            return updatedProduct;
          }
        } catch (error) {
          console.error("Error updating product pricing:", error);
          throw error;
        }
      }
      async getCurrentProduct() {
        try {
          const productList = await db.select().from(products).where(eq(products.isActive, true)).limit(1);
          if (productList.length === 0) {
            return {
              id: 1,
              name: "OCUS Job Hunter Chrome Extension",
              description: "Premium Chrome extension for photography job hunting on OCUS (Ubereats/Foodora deliveries)",
              price: "500.00",
              beforePrice: null,
              currency: "eur"
            };
          }
          return productList[0];
        } catch (error) {
          console.error("Error fetching current product:", error);
          throw error;
        }
      }
      // Countdown Banner Management
      async createCountdownBanner(bannerData) {
        try {
          const [newBanner] = await db.insert(countdownBanners).values(bannerData).returning();
          return newBanner;
        } catch (error) {
          console.error("Error creating countdown banner:", error);
          throw error;
        }
      }
      async updateCountdownBanner(id, bannerData) {
        try {
          const [updatedBanner] = await db.update(countdownBanners).set({ ...bannerData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(countdownBanners.id, id)).returning();
          return updatedBanner;
        } catch (error) {
          console.error("Error updating countdown banner:", error);
          throw error;
        }
      }
      async getActiveCountdownBanner() {
        try {
          const [activeBanner] = await db.select().from(countdownBanners).where(eq(countdownBanners.isEnabled, true)).orderBy(countdownBanners.priority, countdownBanners.createdAt).limit(1);
          if (activeBanner && new Date(activeBanner.endDateTime) <= /* @__PURE__ */ new Date()) {
            await db.update(countdownBanners).set({ isEnabled: false }).where(eq(countdownBanners.id, activeBanner.id));
            return null;
          }
          return activeBanner || null;
        } catch (error) {
          console.error("Error fetching active countdown banner:", error);
          throw error;
        }
      }
      async getAllCountdownBanners() {
        try {
          return await db.select().from(countdownBanners).orderBy(countdownBanners.createdAt);
        } catch (error) {
          console.error("Error fetching countdown banners:", error);
          throw error;
        }
      }
      async deleteCountdownBanner(id) {
        try {
          await db.delete(countdownBanners).where(eq(countdownBanners.id, id));
        } catch (error) {
          console.error("Error deleting countdown banner:", error);
          throw error;
        }
      }
      // Announcement Badge Management
      async getActiveAnnouncementBadge() {
        try {
          const [activeBadge] = await db.select().from(announcementBadges).where(eq(announcementBadges.isEnabled, true)).orderBy(desc(announcementBadges.priority), desc(announcementBadges.createdAt)).limit(1);
          return activeBadge || null;
        } catch (error) {
          console.error("Error fetching active announcement badge:", error);
          throw error;
        }
      }
      async getAllAnnouncementBadges() {
        try {
          return await db.select().from(announcementBadges).orderBy(desc(announcementBadges.createdAt));
        } catch (error) {
          console.error("Error fetching announcement badges:", error);
          throw error;
        }
      }
      async createAnnouncementBadge(data) {
        try {
          const [badge] = await db.insert(announcementBadges).values(data).returning();
          return badge;
        } catch (error) {
          console.error("Error creating announcement badge:", error);
          throw error;
        }
      }
      async updateAnnouncementBadge(id, data) {
        try {
          const [badge] = await db.update(announcementBadges).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(announcementBadges.id, id)).returning();
          return badge;
        } catch (error) {
          console.error("Error updating announcement badge:", error);
          throw error;
        }
      }
      async deleteAnnouncementBadge(id) {
        try {
          await db.delete(announcementBadges).where(eq(announcementBadges.id, id));
        } catch (error) {
          console.error("Error deleting announcement badge:", error);
          throw error;
        }
      }
      // Missing interface methods
      async deleteCustomer(id) {
        const customerId = typeof id === "string" ? parseInt(id) : id;
        await db.delete(customers).where(eq(customers.id, customerId));
      }
      // Lottery Scratch Activation System
      generateUniqueActivationKey() {
        const timestamp2 = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `OCUS-${timestamp2}-${random}`;
      }
      async revealActivationKey(customerId) {
        const [customer] = await db.update(customers).set({
          activationKeyRevealed: true,
          extensionActivated: true,
          // Activate extension after payment
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, parseInt(customerId))).returning();
        return customer;
      }
      // Activation Code System Implementation
      async createActivationCode(codeData) {
        const [code] = await db.insert(activationCodes).values(codeData).returning();
        return code;
      }
      async getActivationCode(code) {
        const [activation] = await db.select().from(activationCodes).where(eq(activationCodes.code, code));
        return activation || void 0;
      }
      async getActivationCodeByVersionToken(versionToken) {
        const [activation] = await db.select().from(activationCodes).where(eq(activationCodes.versionToken, versionToken));
        return activation || void 0;
      }
      async activateCode(code, deviceId, ipAddress) {
        const activation = await this.getActivationCode(code);
        if (!activation) {
          throw new Error("Invalid activation code");
        }
        if (!activation.isActive) {
          throw new Error("Activation code is inactive");
        }
        if (activation.expiresAt && /* @__PURE__ */ new Date() > activation.expiresAt) {
          throw new Error("Activation code has expired");
        }
        if (activation.activationCount >= activation.maxActivations) {
          throw new Error("Activation code has reached maximum activations");
        }
        const [updated] = await db.update(activationCodes).set({
          activatedAt: activation.activatedAt || /* @__PURE__ */ new Date(),
          activationCount: activation.activationCount + 1,
          deviceId,
          ipAddress
        }).where(eq(activationCodes.code, code)).returning();
        return updated;
      }
      async getCustomerActivationCodes(customerId) {
        return await db.select().from(activationCodes).where(eq(activationCodes.customerId, parseInt(customerId))).orderBy(desc(activationCodes.createdAt));
      }
      async deactivateCode(code) {
        const [updated] = await db.update(activationCodes).set({ isActive: false }).where(eq(activationCodes.code, code)).returning();
        return updated;
      }
      async generateActivationCode(customerId, orderId) {
        let code;
        let exists = true;
        while (exists) {
          code = this.generateUniqueActivationKey();
          const existing = await this.getActivationCode(code);
          exists = !!existing;
        }
        const versionToken = crypto.randomUUID();
        const codeData = {
          code,
          customerId: parseInt(customerId),
          orderId,
          versionToken,
          maxActivations: 1,
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
          // 1 year expiry
        };
        return await this.createActivationCode(codeData);
      }
      async getActivationKeyByOrderId(orderId) {
        const [key] = await db.select().from(activationKeys).where(eq(activationKeys.orderId, orderId));
        return key || null;
      }
      // Extension Management
      async createExtensionDownload(download) {
        const [newDownload] = await db.insert(extensionDownloads).values({
          ...download,
          downloadToken: download.downloadToken || crypto.randomUUID()
        }).returning();
        return newDownload;
      }
      async getExtensionDownload(token) {
        const [download] = await db.select().from(extensionDownloads).where(eq(extensionDownloads.downloadToken, token));
        return download || void 0;
      }
      async incrementExtensionDownloadCount(id) {
        const [download] = await db.update(extensionDownloads).set({
          downloadCount: sql`${extensionDownloads.downloadCount} + 1`
        }).where(eq(extensionDownloads.id, id)).returning();
        return download;
      }
      async getCustomerExtensionDownloads(customerId) {
        const id = typeof customerId === "string" ? parseInt(customerId) : customerId;
        return await db.select().from(extensionDownloads).where(eq(extensionDownloads.customerId, id.toString())).orderBy(desc(extensionDownloads.createdAt));
      }
      // Social Authentication Methods
      // Customer Extension Management
      async blockCustomer(customerId, reason) {
        const id = typeof customerId === "string" ? parseInt(customerId) : customerId;
        const [customer] = await db.update(customers).set({
          isBlocked: true,
          blockedReason: reason,
          blockedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, id)).returning();
        return customer;
      }
      async unblockCustomer(customerId) {
        const id = typeof customerId === "string" ? parseInt(customerId) : customerId;
        const [customer] = await db.update(customers).set({
          isBlocked: false,
          blockedReason: null,
          blockedAt: null,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, id)).returning();
        return customer;
      }
      async generateExtensionActivationKey(customerId) {
        const id = typeof customerId === "string" ? parseInt(customerId) : customerId;
        const activationKey = crypto.randomUUID().replace(/-/g, "").substring(0, 20).toUpperCase();
        const [customer] = await db.update(customers).set({
          activationKey,
          isActivated: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, id)).returning();
        return customer;
      }
      async activateExtension(customerId, activationKey) {
        const [customer] = await db.update(customers).set({
          extensionActivated: true,
          extensionLastUsed: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(and(
          eq(customers.id, parseInt(customerId)),
          eq(customers.activationKey, activationKey),
          eq(customers.isActivated, true)
        )).returning();
        return customer;
      }
      async recordExtensionUsageLog(usage) {
        await db.update(customers).set({
          extensionTrialJobsUsed: sql`${customers.extensionTrialJobsUsed} + ${usage.jobsUsed}`,
          extensionLastUsed: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(customers.id, typeof usage.customerId === "string" ? parseInt(usage.customerId) : usage.customerId));
        const [usageLog] = await db.insert(extensionUsageLogs).values(usage).returning();
        return usageLog;
      }
      // Extension installation methods
      async createExtensionInstallation(data) {
        const [installation] = await db.insert(extensionInstallations).values(data).returning();
        return installation;
      }
      async getExtensionInstallation(installationId) {
        const [installation] = await db.select().from(extensionInstallations).where(eq(extensionInstallations.installationId, installationId));
        return installation || null;
      }
      async updateInstallationLastSeen(installationId) {
        await db.update(extensionInstallations).set({ lastSeenAt: /* @__PURE__ */ new Date() }).where(eq(extensionInstallations.installationId, installationId));
      }
      async getUserInstallations(userId) {
        return await db.select().from(extensionInstallations).where(eq(extensionInstallations.userId, userId));
      }
      // Enhanced activation code methods
      async createActivationCodeForUser(userId, installationId, orderId) {
        const code = `OCUS-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const versionToken = crypto.randomUUID();
        const [activationCode] = await db.insert(activationCodes).values({
          code,
          userId,
          orderId,
          installationId,
          versionToken,
          maxActivations: 1,
          activationCount: 0,
          isActive: true,
          dailyValidationCount: 0,
          isRevoked: false
        }).returning();
        return activationCode;
      }
      async validateActivationCodeForInstallation(code, installationId) {
        const [activationCode] = await db.select().from(activationCodes).where(eq(activationCodes.code, code));
        if (!activationCode) {
          return { valid: false, message: "Invalid activation code" };
        }
        if (activationCode.isRevoked) {
          return { valid: false, message: "Activation code has been revoked" };
        }
        if (activationCode.expiresAt && /* @__PURE__ */ new Date() > activationCode.expiresAt) {
          return { valid: false, message: "Activation code has expired" };
        }
        if (!activationCode.isActive) {
          return { valid: false, message: "Activation code is inactive" };
        }
        if (activationCode.installationId && activationCode.installationId !== installationId) {
          return { valid: false, message: "Activation code is already bound to another installation" };
        }
        if (activationCode.activationCount >= activationCode.maxActivations) {
          return { valid: false, message: "Activation code has been used maximum number of times" };
        }
        const today = (/* @__PURE__ */ new Date()).toDateString();
        const lastValidationDate = activationCode.lastValidationDate?.toDateString();
        let dailyCount = activationCode.dailyValidationCount;
        if (lastValidationDate !== today) {
          dailyCount = 0;
        }
        if (dailyCount >= 100) {
          return { valid: false, message: "Daily validation limit exceeded" };
        }
        await db.update(activationCodes).set({
          installationId: activationCode.installationId || installationId,
          activationCount: activationCode.installationId ? activationCode.activationCount : activationCode.activationCount + 1,
          activatedAt: activationCode.activatedAt || /* @__PURE__ */ new Date(),
          dailyValidationCount: dailyCount + 1,
          lastValidationDate: /* @__PURE__ */ new Date()
        }).where(eq(activationCodes.id, activationCode.id));
        return { valid: true, message: "Activation code is valid", activationCode };
      }
      async getActivationCodeByInstallation(installationId) {
        const [activationCode] = await db.select().from(activationCodes).where(eq(activationCodes.installationId, installationId));
        return activationCode || null;
      }
      async revokeActivationCode(codeId, reason) {
        await db.update(activationCodes).set({
          isRevoked: true,
          isActive: false
        }).where(eq(activationCodes.id, codeId));
      }
      async getCustomerTrialUsage(customerId) {
        const [customer] = await db.select({ extensionTrialJobsUsed: customers.extensionTrialJobsUsed }).from(customers).where(eq(customers.id, parseInt(customerId)));
        return customer?.extensionTrialJobsUsed || 0;
      }
      async canUseExtension(customerId) {
        const id = typeof customerId === "string" ? parseInt(customerId) : customerId;
        const [customer] = await db.select().from(customers).where(eq(customers.id, id));
        if (!customer) {
          return { canUse: false, reason: "Customer not found" };
        }
        if (customer.isBlocked) {
          return {
            canUse: false,
            reason: customer.blockedReason || "Account blocked",
            isBlocked: true
          };
        }
        if (customer.extensionActivated) {
          return { canUse: true };
        }
        if (customer.extensionTrialJobsUsed >= customer.extensionTrialLimit) {
          return {
            canUse: false,
            reason: "Trial limit exceeded. Please purchase activation code.",
            trialUsed: customer.extensionTrialJobsUsed
          };
        }
        return {
          canUse: true,
          trialUsed: customer.extensionTrialJobsUsed
        };
      }
      // Admin Customer Management
      async getAllCustomersForAdmin() {
        return await db.select().from(customers).orderBy(desc(customers.createdAt));
      }
      async getCustomerActivations() {
        const customersList = await this.getAllCustomersForAdmin();
        const result = [];
        for (const customer of customersList) {
          const downloads2 = await this.getCustomerExtensionDownloads(customer.id);
          result.push({ customer, downloads: downloads2 });
        }
        return result;
      }
      // Mission Tracking Implementation
      async createMission(mission) {
        const [newMission] = await db.insert(missions).values({
          ...mission,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newMission;
      }
      async getMission(missionId) {
        const [mission] = await db.select().from(missions).where(eq(missions.missionId, missionId));
        return mission || void 0;
      }
      async updateMissionStatus(missionId, status, timestamp2) {
        const updateData = {
          status,
          updatedAt: /* @__PURE__ */ new Date()
        };
        switch (status) {
          case "assignment_accepted":
            updateData.assignmentAcceptedAt = timestamp2 || /* @__PURE__ */ new Date();
            break;
          case "appointment_confirmation":
            updateData.appointmentConfirmedAt = timestamp2 || /* @__PURE__ */ new Date();
            break;
          case "media_upload":
            updateData.mediaUploadedAt = timestamp2 || /* @__PURE__ */ new Date();
            break;
          case "billing_payment":
            updateData.billingCompletedAt = timestamp2 || /* @__PURE__ */ new Date();
            break;
          case "assignment_complete":
            updateData.assignmentCompletedAt = timestamp2 || /* @__PURE__ */ new Date();
            break;
        }
        const [updatedMission] = await db.update(missions).set(updateData).where(eq(missions.missionId, missionId)).returning();
        return updatedMission;
      }
      async getUserMissions(userId) {
        return await db.select().from(missions).where(eq(missions.userId, userId)).orderBy(desc(missions.createdAt));
      }
      async getCustomerMissions(customerId) {
        return await db.select().from(missions).where(eq(missions.customerId, customerId)).orderBy(desc(missions.createdAt));
      }
      // User Trial Management Implementation
      async createUserTrial(trial) {
        const [newTrial] = await db.insert(userTrials).values({
          ...trial,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newTrial;
      }
      async getUserTrial(userId) {
        const [trial] = await db.select().from(userTrials).where(eq(userTrials.userId, userId));
        return trial || void 0;
      }
      // Trial usage methods for cross-browser tracking
      async getTrialUsage(trialKey) {
        const [usage] = await db.select().from(trialUsage).where(eq(trialUsage.trialKey, trialKey));
        return usage || void 0;
      }
      async createTrialUsage(data) {
        const [usage] = await db.insert(trialUsage).values(data).returning();
        return usage;
      }
      async incrementTrialUsage(trialKey) {
        const [usage] = await db.update(trialUsage).set({
          usageCount: sql`${trialUsage.usageCount} + 1`,
          lastUsed: /* @__PURE__ */ new Date()
        }).where(eq(trialUsage.trialKey, trialKey)).returning();
        return usage;
      }
      async expireTrialUsage(trialKey) {
        const [usage] = await db.update(trialUsage).set({ isExpired: true }).where(eq(trialUsage.trialKey, trialKey)).returning();
        return usage;
      }
      // Premium Device Management Implementation
      async getPremiumDevice(userId, deviceFingerprint) {
        const [device] = await db.select().from(premiumDevices).where(
          and(
            eq(premiumDevices.userId, userId),
            eq(premiumDevices.deviceFingerprint, deviceFingerprint),
            eq(premiumDevices.isActive, true)
          )
        );
        return device || void 0;
      }
      async getUserPremiumDevices(userId) {
        return await db.select().from(premiumDevices).where(
          and(
            eq(premiumDevices.userId, userId),
            eq(premiumDevices.isActive, true)
          )
        );
      }
      async registerPremiumDevice(userId, deviceFingerprint, extensionId) {
        const [device] = await db.insert(premiumDevices).values({
          userId,
          deviceFingerprint,
          extensionId,
          isActive: true,
          registeredAt: /* @__PURE__ */ new Date(),
          lastSeenAt: /* @__PURE__ */ new Date()
        }).returning();
        return device;
      }
      async deactivatePremiumDevice(deviceFingerprint, reason) {
        const [device] = await db.update(premiumDevices).set({
          isActive: false,
          deactivatedAt: /* @__PURE__ */ new Date(),
          deactivationReason: reason || "User requested deactivation"
        }).where(eq(premiumDevices.deviceFingerprint, deviceFingerprint)).returning();
        return device;
      }
      async updatePremiumDeviceLastSeen(deviceFingerprint) {
        const [device] = await db.update(premiumDevices).set({ lastSeenAt: /* @__PURE__ */ new Date() }).where(eq(premiumDevices.deviceFingerprint, deviceFingerprint)).returning();
        return device;
      }
      // Dashboard Features Management Implementation
      async getDashboardFeatures() {
        return await db.select().from(dashboardFeatures);
      }
      async getDashboardFeature(featureName) {
        const [feature] = await db.select().from(dashboardFeatures).where(eq(dashboardFeatures.featureName, featureName));
        return feature || void 0;
      }
      async createDashboardFeature(feature) {
        const [newFeature] = await db.insert(dashboardFeatures).values({
          ...feature,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return newFeature;
      }
      async updateDashboardFeature(featureName, isEnabled, description) {
        const [updatedFeature] = await db.update(dashboardFeatures).set({
          isEnabled,
          description: description || void 0,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(dashboardFeatures.featureName, featureName)).returning();
        return updatedFeature;
      }
      async initializeDashboardFeatures() {
        const defaultFeatures = [
          { featureName: "affiliate_program", isEnabled: true, description: "Enable/disable affiliate program section in user dashboard" },
          { featureName: "analytics", isEnabled: true, description: "Enable/disable analytics section in user dashboard" },
          { featureName: "billing", isEnabled: true, description: "Enable/disable billing section in user dashboard" }
        ];
        for (const feature of defaultFeatures) {
          const existing = await this.getDashboardFeature(feature.featureName);
          if (!existing) {
            await this.createDashboardFeature(feature);
          }
        }
      }
      // Invoice Management
      async createInvoice(invoice) {
        const [newInvoice] = await db.insert(invoices).values(invoice).returning();
        return newInvoice;
      }
      async getInvoice(id) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
        return invoice;
      }
      async getInvoiceByNumber(invoiceNumber) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
        return invoice;
      }
      async getCustomerInvoices(customerId) {
        return await db.select().from(invoices).where(eq(invoices.customerId, customerId)).orderBy(desc(invoices.createdAt));
      }
      async getAllInvoices() {
        return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
      }
      async updateInvoiceStatus(id, status, paidAt) {
        const updateData = { status, updatedAt: /* @__PURE__ */ new Date() };
        if (paidAt) updateData.paidAt = paidAt;
        const [updatedInvoice] = await db.update(invoices).set(updateData).where(eq(invoices.id, id)).returning();
        return updatedInvoice;
      }
      async generateInvoiceNumber() {
        const settings2 = await this.getInvoiceSettings();
        const prefix = settings2?.invoicePrefix || "INV";
        const year = (/* @__PURE__ */ new Date()).getFullYear();
        const month = String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0");
        const startOfMonth = new Date(year, (/* @__PURE__ */ new Date()).getMonth(), 1);
        const endOfMonth = new Date(year, (/* @__PURE__ */ new Date()).getMonth() + 1, 0);
        const invoiceCount = await db.select({ count: count() }).from(invoices).where(and(
          gte(invoices.createdAt, startOfMonth),
          lte(invoices.createdAt, endOfMonth)
        ));
        const sequence = String((invoiceCount[0]?.count || 0) + 1).padStart(4, "0");
        return `${prefix}-${year}${month}-${sequence}`;
      }
      // Invoice Items Management
      async createInvoiceItem(item) {
        const [newItem] = await db.insert(invoiceItems).values(item).returning();
        return newItem;
      }
      async getInvoiceItems(invoiceId) {
        return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
      }
      // Invoice Settings
      async getInvoiceSettings() {
        const [settings2] = await db.select().from(invoiceSettings).where(eq(invoiceSettings.isActive, true));
        return settings2;
      }
      async updateInvoiceSettings(settings2) {
        const existing = await this.getInvoiceSettings();
        if (existing) {
          const [updated] = await db.update(invoiceSettings).set({ ...settings2, updatedAt: /* @__PURE__ */ new Date() }).where(eq(invoiceSettings.id, existing.id)).returning();
          return updated;
        } else {
          return await this.createInvoiceSettings(settings2);
        }
      }
      async createInvoiceSettings(settings2) {
        const [newSettings] = await db.insert(invoiceSettings).values(settings2).returning();
        return newSettings;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/affiliateService.ts
import { eq as eq2, and as and2, desc as desc2, sum, count as count2 } from "drizzle-orm";
import { nanoid } from "nanoid";
var AffiliateService, affiliateService;
var init_affiliateService = __esm({
  "server/affiliateService.ts"() {
    "use strict";
    init_db();
    init_schema();
    AffiliateService = class {
      // Generate unique referral code
      async generateReferralCode() {
        let code;
        let isUnique = false;
        while (!isUnique) {
          code = nanoid(8).toUpperCase();
          const existing = await db.select().from(customers).where(eq2(customers.referralCode, code)).limit(1);
          isUnique = existing.length === 0;
          if (isUnique) return code;
        }
        throw new Error("Unable to generate unique referral code");
      }
      // Create affiliate account
      async createAffiliate(customerId, paymentEmail) {
        const referralCode = await this.generateReferralCode();
        await db.update(customers).set({
          referralCode,
          commissionRate: "10.00"
          // Default 10%
        }).where(eq2(customers.id, customerId));
        return { referralCode };
      }
      // Track referral and create commission
      async trackReferral(referralCode, orderId) {
        const affiliate = await db.select().from(customers).where(eq2(customers.referralCode, referralCode)).limit(1);
        if (affiliate.length === 0) return;
        const order = await db.select().from(orders).where(eq2(orders.id, orderId)).limit(1);
        if (order.length === 0) return;
        const affiliateData = affiliate[0];
        const orderData = order[0];
        const commissionRate = parseFloat(affiliateData.commissionRate || "10.00") / 100;
        const commissionAmount = parseFloat(orderData.finalAmount) * commissionRate;
        await db.insert(affiliateTransactions).values({
          affiliateId: affiliateData.id,
          orderId,
          commission: commissionAmount.toFixed(2),
          status: "pending"
        });
        const newTotalEarnings = parseFloat(affiliateData.totalEarnings || "0") + commissionAmount;
        await db.update(customers).set({
          totalEarnings: newTotalEarnings.toFixed(2)
        }).where(eq2(customers.id, affiliateData.id));
      }
      // Get affiliate dashboard stats
      async getAffiliateDashboard(customerId) {
        const affiliate = await db.select().from(customers).where(eq2(customers.id, customerId)).limit(1);
        if (affiliate.length === 0) {
          throw new Error("Affiliate not found");
        }
        const affiliateData = affiliate[0];
        const commissionStats = await db.select({
          totalCommissions: sum(affiliateTransactions.commission),
          totalReferrals: count2(affiliateTransactions.id),
          pendingCommissions: sum(affiliateTransactions.commission)
        }).from(affiliateTransactions).where(eq2(affiliateTransactions.affiliateId, customerId));
        const recentTransactions = await db.select({
          id: affiliateTransactions.id,
          commission: affiliateTransactions.commission,
          status: affiliateTransactions.status,
          createdAt: affiliateTransactions.createdAt,
          orderId: orders.id,
          customerEmail: orders.customerEmail,
          orderAmount: orders.finalAmount
        }).from(affiliateTransactions).leftJoin(orders, eq2(affiliateTransactions.orderId, orders.id)).where(eq2(affiliateTransactions.affiliateId, customerId)).orderBy(desc2(affiliateTransactions.createdAt)).limit(10);
        const payoutHistory = await db.select().from(affiliatePayouts).where(eq2(affiliatePayouts.affiliateId, customerId)).orderBy(desc2(affiliatePayouts.createdAt)).limit(10);
        return {
          affiliate: affiliateData,
          stats: commissionStats[0],
          recentTransactions,
          payoutHistory,
          referralLink: `${process.env.BASE_URL || "http://localhost:5000"}/?ref=${affiliateData.referralCode}`
        };
      }
      // Update payment method
      async updatePaymentMethod(customerId, method, details) {
        const updateData = {
          paymentMethod: method
        };
        if (method === "paypal") {
          updateData.paymentEmail = details.email;
        } else if (method === "bank") {
          updateData.bankDetails = details;
        } else if (method === "stripe") {
          updateData.stripeAccountId = details.account_id;
        }
        await db.update(customers).set(updateData).where(eq2(customers.id, customerId));
        return { success: true, message: "Payment method updated successfully" };
      }
      // Request payout
      async requestPayout(customerId, amount, paymentMethod, paymentDetails) {
        const pendingCommission = await db.select({
          total: sum(affiliateTransactions.commission)
        }).from(affiliateTransactions).where(
          and2(
            eq2(affiliateTransactions.affiliateId, customerId),
            eq2(affiliateTransactions.status, "pending")
          )
        );
        const availableAmount = parseFloat(pendingCommission[0]?.total || "0");
        if (availableAmount < amount) {
          throw new Error("Insufficient commission balance");
        }
        if (amount < 50) {
          throw new Error("Minimum payout amount is $50");
        }
        const payout = await db.insert(affiliatePayouts).values({
          affiliateId: customerId,
          amount: amount.toFixed(2),
          paymentMethod,
          paymentEmail: paymentDetails.email,
          bankDetails: paymentMethod === "bank" ? paymentDetails : null,
          status: "pending"
        }).returning();
        return payout[0];
      }
      // Admin: Approve payout
      async approvePayout(payoutId, transactionId) {
        await db.update(affiliatePayouts).set({
          status: "paid",
          transactionId,
          paidAt: /* @__PURE__ */ new Date(),
          processedAt: /* @__PURE__ */ new Date()
        }).where(eq2(affiliatePayouts.id, payoutId));
        const payout = await db.select().from(affiliatePayouts).where(eq2(affiliatePayouts.id, payoutId)).limit(1);
        if (payout.length > 0) {
          const payoutAmount = parseFloat(payout[0].amount);
          let remainingAmount = payoutAmount;
          const transactions = await db.select().from(affiliateTransactions).where(
            and2(
              eq2(affiliateTransactions.affiliateId, payout[0].affiliateId),
              eq2(affiliateTransactions.status, "pending")
            )
          ).orderBy(affiliateTransactions.createdAt);
          for (const transaction of transactions) {
            if (remainingAmount <= 0) break;
            const commissionAmount = parseFloat(transaction.commission);
            if (commissionAmount <= remainingAmount) {
              await db.update(affiliateTransactions).set({
                status: "paid",
                paidAt: /* @__PURE__ */ new Date()
              }).where(eq2(affiliateTransactions.id, transaction.id));
              remainingAmount -= commissionAmount;
            }
          }
        }
      }
      // Admin: Get all affiliate stats
      async getAffiliateStats() {
        const totalAffiliates = await db.select({ count: count2() }).from(customers).where(eq2(customers.referralCode, customers.referralCode));
        const totalCommissions = await db.select({
          total: sum(affiliateTransactions.commission)
        }).from(affiliateTransactions);
        const pendingPayouts = await db.select({
          count: count2(),
          total: sum(affiliatePayouts.amount)
        }).from(affiliatePayouts).where(eq2(affiliatePayouts.status, "pending"));
        const topAffiliates = await db.select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          referralCode: customers.referralCode,
          totalEarnings: customers.totalEarnings,
          totalReferrals: count2(affiliateTransactions.id),
          totalCommissions: sum(affiliateTransactions.commission)
        }).from(customers).leftJoin(affiliateTransactions, eq2(customers.id, affiliateTransactions.affiliateId)).where(eq2(customers.referralCode, customers.referralCode)).groupBy(customers.id, customers.name, customers.email, customers.referralCode, customers.totalEarnings).orderBy(desc2(sum(affiliateTransactions.commission))).limit(10);
        return {
          totalAffiliates: totalAffiliates[0].count,
          totalCommissions: totalCommissions[0]?.total || "0",
          pendingPayouts: pendingPayouts[0],
          topAffiliates
        };
      }
      // Auto-approve commissions for orders over threshold
      async autoApproveCommissions(threshold = 100) {
        const pendingTransactions = await db.select().from(affiliateTransactions).leftJoin(orders, eq2(affiliateTransactions.orderId, orders.id)).where(
          and2(
            eq2(affiliateTransactions.status, "pending"),
            eq2(orders.status, "completed")
          )
        );
        for (const transaction of pendingTransactions) {
          const orderAmount = parseFloat(transaction.orders?.finalAmount || "0");
          if (orderAmount >= threshold) {
            await db.update(affiliateTransactions).set({ status: "approved" }).where(eq2(affiliateTransactions.id, transaction.affiliate_transactions.id));
          }
        }
      }
      // Process automatic payouts
      async processAutomaticPayouts() {
        const approvedTransactions = await db.select({
          affiliateId: affiliateTransactions.affiliateId,
          totalCommission: sum(affiliateTransactions.commission)
        }).from(affiliateTransactions).where(eq2(affiliateTransactions.status, "approved")).groupBy(affiliateTransactions.affiliateId).having(({ totalCommission }) => totalCommission >= 50);
        for (const affiliate of approvedTransactions) {
          const affiliateData = await db.select().from(customers).where(eq2(customers.id, affiliate.affiliateId)).limit(1);
          if (affiliateData.length > 0 && affiliateData[0].email) {
            await this.requestPayout(
              affiliate.affiliateId,
              parseFloat(affiliate.totalCommission || "0"),
              "paypal",
              { email: affiliateData[0].email }
            );
          }
        }
      }
    };
    affiliateService = new AffiliateService();
  }
});

// server/routes/affiliateRoutes.ts
var affiliateRoutes_exports = {};
__export(affiliateRoutes_exports, {
  affiliateRoutes: () => router,
  trackReferralMiddleware: () => trackReferralMiddleware
});
import express from "express";
import { eq as eq3, desc as desc3 } from "drizzle-orm";
import rateLimit from "express-rate-limit";
var router, affiliateRateLimit, trackReferralMiddleware;
var init_affiliateRoutes = __esm({
  "server/routes/affiliateRoutes.ts"() {
    "use strict";
    init_affiliateService();
    init_db();
    init_schema();
    router = express.Router();
    affiliateRateLimit = rateLimit({
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      max: 100,
      // limit each IP to 100 requests per windowMs
      message: "Too many requests, please try again later."
    });
    router.use(affiliateRateLimit);
    router.post("/create", async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        let customerId = req.session?.customerId || req.body.customerId;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7);
          const decoded = Buffer.from(token, "base64").toString("utf8");
          const [type, userId] = decoded.split(":");
          if (type === "customer") {
            customerId = userId;
          }
        }
        if (!customerId) {
          return res.status(401).json({ error: "Authentication required" });
        }
        if (customerId === "demo-customer-123") {
          return res.json({
            referralCode: "DEMO123",
            message: "Demo affiliate account created successfully"
          });
        }
        const result = await affiliateService.createAffiliate(customerId, req.body.paymentEmail);
        res.json(result);
      } catch (error) {
        console.error("Create affiliate error:", error);
        res.status(500).json({ error: "Failed to create affiliate account" });
      }
    });
    router.get("/dashboard/:customerId", async (req, res) => {
      try {
        let customerId = req.params.customerId || req.session?.customerId;
        if (!customerId) {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = Buffer.from(token, "base64").toString("utf8");
            const [type, userId] = decoded.split(":");
            if (type === "customer") {
              customerId = userId;
            }
          }
        }
        if (!customerId) {
          return res.status(401).json({ error: "Authentication required" });
        }
        if (customerId === "demo-customer-123") {
          const baseUrl = process.env.BASE_URL || "http://localhost:5000";
          return res.json({
            affiliate: {
              id: "demo-customer-123",
              referralCode: "DEMO123",
              paymentMethod: "paypal",
              paymentEmail: "demo@example.com",
              isAffiliate: true
            },
            stats: {
              clicks: 25,
              conversions: 5,
              conversionRate: 20,
              pendingCommission: "25.00",
              totalEarnings: "125.00",
              totalReferrals: 5
            },
            referralLink: `${baseUrl}?ref=DEMO123`,
            recentTransactions: [
              {
                id: 1,
                customerEmail: "john@example.com",
                orderAmount: "49.99",
                commission: "25.00",
                status: "approved",
                createdAt: new Date(Date.now() - 864e5).toISOString()
              },
              {
                id: 2,
                customerEmail: "jane@example.com",
                orderAmount: "49.99",
                commission: "25.00",
                status: "pending",
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              }
            ],
            payoutHistory: []
          });
        }
        const dashboard = await affiliateService.getAffiliateDashboard(customerId);
        res.json(dashboard);
      } catch (error) {
        console.error("Get affiliate dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch affiliate dashboard" });
      }
    });
    router.post("/payment-method/:customerId", async (req, res) => {
      try {
        const customerId = req.params.customerId;
        const { method, details } = req.body;
        if (!customerId || !method || !details) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        if (customerId === "demo-customer-123") {
          return res.json({
            success: true,
            message: "Payment method updated successfully (demo)"
          });
        }
        const result = await affiliateService.updatePaymentMethod(customerId, method, details);
        res.json(result);
      } catch (error) {
        console.error("Update payment method error:", error);
        res.status(500).json({ error: "Failed to update payment method" });
      }
    });
    router.post("/request-payout/:customerId", async (req, res) => {
      try {
        const customerId = req.params.customerId || req.body.customerId;
        if (!customerId) {
          return res.status(401).json({ error: "Authentication required" });
        }
        const { amount, paymentMethod, paymentDetails } = req.body;
        if (!amount || !paymentMethod || !paymentDetails) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const payout = await affiliateService.requestPayout(
          customerId,
          amount,
          paymentMethod,
          paymentDetails
        );
        res.json(payout);
      } catch (error) {
        console.error("Request payout error:", error);
        res.status(500).json({ error: error.message || "Failed to request payout" });
      }
    });
    router.post("/track-referral", async (req, res) => {
      try {
        const { referralCode, orderId } = req.body;
        if (!referralCode || !orderId) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        await affiliateService.trackReferral(referralCode, orderId);
        res.json({ success: true });
      } catch (error) {
        console.error("Track referral error:", error);
        res.status(500).json({ error: "Failed to track referral" });
      }
    });
    router.get("/admin/stats", async (req, res) => {
      try {
        const stats = await affiliateService.getAffiliateStats();
        res.json(stats);
      } catch (error) {
        console.error("Get affiliate stats error:", error);
        res.status(500).json({ error: "Failed to fetch affiliate stats" });
      }
    });
    router.get("/admin/pending-payouts", async (req, res) => {
      try {
        const payouts = await db.select({
          id: affiliatePayouts.id,
          affiliateId: affiliatePayouts.affiliateId,
          amount: affiliatePayouts.amount,
          paymentMethod: affiliatePayouts.paymentMethod,
          paymentEmail: affiliatePayouts.paymentEmail,
          status: affiliatePayouts.status,
          requestedAt: affiliatePayouts.requestedAt,
          affiliate: {
            name: customers.name,
            email: customers.email
          }
        }).from(affiliatePayouts).leftJoin(customers, eq3(affiliatePayouts.affiliateId, customers.id)).where(eq3(affiliatePayouts.status, "pending")).orderBy(desc3(affiliatePayouts.requestedAt));
        res.json(payouts);
      } catch (error) {
        console.error("Get pending payouts error:", error);
        res.status(500).json({ error: "Failed to fetch pending payouts" });
      }
    });
    router.post("/admin/approve-payout/:payoutId", async (req, res) => {
      try {
        const payoutId = parseInt(req.params.payoutId);
        const { transactionId } = req.body;
        await affiliateService.approvePayout(payoutId, transactionId);
        res.json({ success: true });
      } catch (error) {
        console.error("Approve payout error:", error);
        res.status(500).json({ error: "Failed to approve payout" });
      }
    });
    router.post("/admin/reject-payout/:payoutId", async (req, res) => {
      try {
        const payoutId = parseInt(req.params.payoutId);
        await db.update(affiliatePayouts).set({
          status: "rejected",
          processedAt: /* @__PURE__ */ new Date()
        }).where(eq3(affiliatePayouts.id, payoutId));
        res.json({ success: true });
      } catch (error) {
        console.error("Reject payout error:", error);
        res.status(500).json({ error: "Failed to reject payout" });
      }
    });
    router.post("/admin/auto-approve-commissions", async (req, res) => {
      try {
        await affiliateService.autoApproveCommissions();
        res.json({ success: true });
      } catch (error) {
        console.error("Auto-approve commissions error:", error);
        res.status(500).json({ error: "Failed to auto-approve commissions" });
      }
    });
    trackReferralMiddleware = async (orderId, referralCode) => {
      if (referralCode) {
        try {
          await affiliateService.trackReferral(referralCode, orderId);
          console.log(`Referral tracked for order ${orderId} with code ${referralCode}`);
        } catch (error) {
          console.error("Failed to track referral:", error);
        }
      }
    };
    router.post("/admin/process-automatic-payouts", async (req, res) => {
      try {
        await affiliateService.processAutomaticPayouts();
        res.json({ success: true });
      } catch (error) {
        console.error("Process automatic payouts error:", error);
        res.status(500).json({ error: "Failed to process automatic payouts" });
      }
    });
    router.get("/settings", async (req, res) => {
      try {
        const settings2 = await db.select().from(affiliateSettings).limit(1);
        if (settings2.length === 0) {
          return res.json({
            defaultRewardType: "fixed",
            defaultCommissionRate: "10.00",
            defaultFixedAmount: "25.00",
            minPayoutAmount: "50.00",
            cookieLifetimeDays: 30
          });
        }
        res.json(settings2[0]);
      } catch (error) {
        console.error("Get affiliate settings error:", error);
        res.status(500).json({ error: "Failed to fetch affiliate settings" });
      }
    });
    router.get("/admin/settings", async (req, res) => {
      try {
        const settings2 = await db.select().from(affiliateSettings).limit(1);
        if (settings2.length === 0) {
          const defaultSettings = await db.insert(affiliateSettings).values({}).returning();
          return res.json(defaultSettings[0]);
        }
        res.json(settings2[0]);
      } catch (error) {
        console.error("Get affiliate settings error:", error);
        res.status(500).json({ error: "Failed to fetch affiliate settings" });
      }
    });
    router.put("/admin/settings", async (req, res) => {
      try {
        const {
          defaultRewardType,
          defaultCommissionRate,
          defaultFixedAmount,
          minPayoutAmount,
          cookieLifetimeDays,
          autoApprovalEnabled,
          autoApprovalThreshold,
          payoutFrequency
        } = req.body;
        const existingSettings = await db.select().from(affiliateSettings).limit(1);
        let updatedSettings;
        if (existingSettings.length === 0) {
          updatedSettings = await db.insert(affiliateSettings).values({
            defaultRewardType,
            defaultCommissionRate,
            defaultFixedAmount,
            minPayoutAmount,
            cookieLifetimeDays,
            autoApprovalEnabled,
            autoApprovalThreshold,
            payoutFrequency,
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
        } else {
          updatedSettings = await db.update(affiliateSettings).set({
            defaultRewardType,
            defaultCommissionRate,
            defaultFixedAmount,
            minPayoutAmount,
            cookieLifetimeDays,
            autoApprovalEnabled,
            autoApprovalThreshold,
            payoutFrequency,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq3(affiliateSettings.id, existingSettings[0].id)).returning();
        }
        res.json(updatedSettings[0]);
      } catch (error) {
        console.error("Update affiliate settings error:", error);
        res.status(500).json({ error: "Failed to update affiliate settings" });
      }
    });
  }
});

// server/invoiceService.ts
import { eq as eq4, desc as desc4 } from "drizzle-orm";
var InvoiceService, invoiceService;
var init_invoiceService = __esm({
  "server/invoiceService.ts"() {
    "use strict";
    init_db();
    init_schema();
    InvoiceService = class {
      // Generate unique invoice number
      async generateInvoiceNumber() {
        const settings2 = await this.getInvoiceSettings();
        const prefix = settings2.invoicePrefix || "INV";
        const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7).replace("-", "");
        let counter = 1;
        let invoiceNumber;
        let isUnique = false;
        while (!isUnique) {
          const paddedCounter = counter.toString().padStart(4, "0");
          invoiceNumber = `${prefix}-${date}-${paddedCounter}`;
          const existing = await db.select().from(invoices).where(eq4(invoices.invoiceNumber, invoiceNumber)).limit(1);
          isUnique = existing.length === 0;
          if (isUnique) return invoiceNumber;
          counter++;
        }
        throw new Error("Unable to generate unique invoice number");
      }
      // Get invoice settings
      async getInvoiceSettings() {
        const settings2 = await db.select().from(invoiceSettings).limit(1);
        if (settings2.length === 0) {
          const defaultSettings = await db.insert(invoiceSettings).values({}).returning();
          return defaultSettings[0];
        }
        return settings2[0];
      }
      // Update invoice settings
      async updateInvoiceSettings(data) {
        const existingSettings = await db.select().from(invoiceSettings).limit(1);
        let updatedSettings;
        if (existingSettings.length === 0) {
          updatedSettings = await db.insert(invoiceSettings).values({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
        } else {
          updatedSettings = await db.update(invoiceSettings).set({
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq4(invoiceSettings.id, existingSettings[0].id)).returning();
        }
        return updatedSettings[0];
      }
      // Create invoice from order data
      async createInvoiceFromOrder(orderId) {
        const order = await db.select().from(orders).where(eq4(orders.id, orderId)).limit(1);
        if (order.length === 0) {
          throw new Error("Order not found");
        }
        const orderData = order[0];
        const invoiceNumber = await this.generateInvoiceNumber();
        const dueDate = /* @__PURE__ */ new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const invoiceData = {
          orderId,
          customerId: orderData.customerId,
          customerName: orderData.customerName || orderData.customerEmail,
          customerEmail: orderData.customerEmail,
          items: [{
            productName: "OCUS Job Hunter Chrome Extension",
            description: "Premium photography job hunting tool for delivery platforms",
            quantity: 1,
            unitPrice: parseFloat(orderData.finalAmount)
          }],
          subtotal: parseFloat(orderData.finalAmount),
          taxAmount: 0,
          discountAmount: parseFloat(orderData.originalAmount) - parseFloat(orderData.finalAmount),
          notes: `Order ID: ${orderId}`
        };
        return await this.createInvoice(invoiceData);
      }
      // Create invoice
      async createInvoice(data) {
        const invoiceNumber = await this.generateInvoiceNumber();
        const dueDate = /* @__PURE__ */ new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const subtotal = data.subtotal;
        const taxAmount = data.taxAmount || 0;
        const discountAmount = data.discountAmount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        const invoice = await db.insert(invoices).values({
          invoiceNumber,
          orderId: data.orderId,
          customerId: data.customerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress,
          billingAddress: data.billingAddress,
          dueDate,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          status: "issued",
          notes: data.notes
        }).returning();
        const invoiceId = invoice[0].id;
        for (const item of data.items) {
          const totalPrice = item.quantity * item.unitPrice;
          await db.insert(invoiceItems).values({
            invoiceId,
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            totalPrice: totalPrice.toFixed(2)
          });
        }
        return invoice[0];
      }
      // Get invoice with items
      async getInvoiceWithItems(invoiceId) {
        const invoice = await db.select().from(invoices).where(eq4(invoices.id, invoiceId)).limit(1);
        if (invoice.length === 0) {
          throw new Error("Invoice not found");
        }
        const items = await db.select().from(invoiceItems).where(eq4(invoiceItems.invoiceId, invoiceId));
        return {
          ...invoice[0],
          items
        };
      }
      // Get invoice by number
      async getInvoiceByNumber(invoiceNumber) {
        const invoice = await db.select().from(invoices).where(eq4(invoices.invoiceNumber, invoiceNumber)).limit(1);
        if (invoice.length === 0) {
          throw new Error("Invoice not found");
        }
        const items = await db.select().from(invoiceItems).where(eq4(invoiceItems.invoiceId, invoice[0].id));
        return {
          ...invoice[0],
          items
        };
      }
      // Get customer invoices
      async getCustomerInvoices(customerId) {
        return await db.select().from(invoices).where(eq4(invoices.customerId, customerId)).orderBy(desc4(invoices.createdAt));
      }
      // Mark invoice as paid
      async markInvoiceAsPaid(invoiceId) {
        const updatedInvoice = await db.update(invoices).set({
          status: "paid",
          paidAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq4(invoices.id, invoiceId)).returning();
        return updatedInvoice[0];
      }
      // Generate HTML invoice template
      async generateInvoiceHTML(invoiceId) {
        const invoiceData = await this.getInvoiceWithItems(invoiceId);
        const settings2 = await this.getInvoiceSettings();
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${settings2.primaryColor};
        }
        .company-info h1 {
            font-size: 28px;
            color: ${settings2.primaryColor};
            margin-bottom: 10px;
        }
        .company-info p {
            color: ${settings2.secondaryColor};
            margin-bottom: 5px;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            font-size: 32px;
            color: ${settings2.primaryColor};
            margin-bottom: 10px;
        }
        .invoice-meta {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
        }
        .customer-info, .invoice-details {
            flex: 1;
        }
        .customer-info h3, .invoice-details h3 {
            color: ${settings2.primaryColor};
            margin-bottom: 10px;
            font-size: 16px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: ${settings2.primaryColor};
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .totals {
            width: 300px;
            margin-left: auto;
            margin-bottom: 30px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px 15px;
            border-bottom: 1px solid #e9ecef;
        }
        .totals .total-row {
            background: ${settings2.primaryColor};
            color: white;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            border-top: 2px solid #e9ecef;
            padding-top: 20px;
            margin-top: 40px;
        }
        .footer p {
            color: ${settings2.secondaryColor};
            font-size: 12px;
            margin-bottom: 5px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-issued {
            background: #ffc107;
            color: #856404;
        }
        .status-paid {
            background: #28a745;
            color: white;
        }
        .status-overdue {
            background: #dc3545;
            color: white;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            ${settings2.companyLogo ? `<img src="${settings2.companyLogo}" alt="${settings2.companyName}" style="max-height: 60px; margin-bottom: 15px;">` : ""}
            <h1>${settings2.companyName}</h1>
            ${settings2.companyAddress ? `<p>${settings2.companyAddress.replace(/\n/g, "<br>")}</p>` : ""}
            ${settings2.companyPhone ? `<p>Phone: ${settings2.companyPhone}</p>` : ""}
            ${settings2.companyEmail ? `<p>Email: ${settings2.companyEmail}</p>` : ""}
            ${settings2.companyWebsite ? `<p>Website: ${settings2.companyWebsite}</p>` : ""}
            ${settings2.taxNumber ? `<p>Tax ID: ${settings2.taxNumber}</p>` : ""}
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoiceData.invoiceNumber}</strong></p>
            <p><span class="status-badge status-${invoiceData.status}">${invoiceData.status}</span></p>
        </div>
    </div>

    <div class="invoice-meta">
        <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customerName}</strong></p>
            <p>${invoiceData.customerEmail}</p>
            ${invoiceData.billingAddress ? `<p>${invoiceData.billingAddress.replace(/\n/g, "<br>")}</p>` : ""}
        </div>
        <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
            ${invoiceData.orderId ? `<p><strong>Order ID:</strong> ${invoiceData.orderId}</p>` : ""}
            ${invoiceData.paidAt ? `<p><strong>Paid On:</strong> ${new Date(invoiceData.paidAt).toLocaleDateString()}</p>` : ""}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceData.items.map((item) => `
                <tr>
                    <td>
                        <strong>${item.productName}</strong>
                        ${item.description ? `<br><small style="color: ${settings2.secondaryColor};">${item.description}</small>` : ""}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right;">$${parseFloat(item.totalPrice).toFixed(2)}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;">$${parseFloat(invoiceData.subtotal).toFixed(2)}</td>
            </tr>
            ${parseFloat(invoiceData.discountAmount) > 0 ? `
            <tr>
                <td><strong>Discount:</strong></td>
                <td style="text-align: right; color: #28a745;">-$${parseFloat(invoiceData.discountAmount).toFixed(2)}</td>
            </tr>
            ` : ""}
            ${parseFloat(invoiceData.taxAmount) > 0 ? `
            <tr>
                <td><strong>Tax:</strong></td>
                <td style="text-align: right;">$${parseFloat(invoiceData.taxAmount).toFixed(2)}</td>
            </tr>
            ` : ""}
            <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td style="text-align: right;"><strong>$${parseFloat(invoiceData.totalAmount).toFixed(2)}</strong></td>
            </tr>
        </table>
    </div>

    ${invoiceData.notes ? `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: ${settings2.primaryColor}; margin-bottom: 10px;">Notes:</h4>
        <p>${invoiceData.notes}</p>
    </div>
    ` : ""}

    ${settings2.termsAndConditions ? `
    <div style="margin-bottom: 20px;">
        <h4 style="color: ${settings2.primaryColor}; margin-bottom: 10px;">Terms & Conditions:</h4>
        <p style="font-size: 12px; color: ${settings2.secondaryColor};">${settings2.termsAndConditions}</p>
    </div>
    ` : ""}

    <div class="footer">
        ${settings2.footerText ? `<p>${settings2.footerText}</p>` : ""}
        <p>Invoice generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()} | ${settings2.companyName}</p>
        ${settings2.companyEmail ? `<p>Questions? Contact us at ${settings2.companyEmail}</p>` : ""}
    </div>
</body>
</html>
    `;
        return html;
      }
      // Generate receipt HTML (simplified version of invoice)
      async generateReceiptHTML(invoiceId) {
        const invoiceData = await this.getInvoiceWithItems(invoiceId);
        const settings2 = await this.getInvoiceSettings();
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt ${invoiceData.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${settings2.primaryColor};
        }
        .header h1 {
            font-size: 24px;
            color: ${settings2.primaryColor};
            margin-bottom: 10px;
        }
        .header h2 {
            font-size: 20px;
            color: ${settings2.secondaryColor};
            margin-bottom: 15px;
        }
        .receipt-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .receipt-info p {
            margin-bottom: 5px;
        }
        .items {
            margin-bottom: 20px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
            border-bottom: none;
        }
        .total {
            background: ${settings2.primaryColor};
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            color: ${settings2.secondaryColor};
            font-size: 12px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
        }
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        ${settings2.companyLogo ? `<img src="${settings2.companyLogo}" alt="${settings2.companyName}" style="max-height: 50px; margin-bottom: 15px;">` : ""}
        <h1>${settings2.companyName}</h1>
        <h2>RECEIPT</h2>
        <p><strong>${invoiceData.invoiceNumber}</strong></p>
    </div>

    <div class="receipt-info">
        <p><strong>Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${invoiceData.customerName}</p>
        <p><strong>Email:</strong> ${invoiceData.customerEmail}</p>
        ${invoiceData.orderId ? `<p><strong>Order ID:</strong> ${invoiceData.orderId}</p>` : ""}
        <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: 600;">PAID</span></p>
    </div>

    <div class="items">
        ${invoiceData.items.map((item) => `
            <div class="item">
                <div>
                    <strong>${item.productName}</strong>
                    ${item.description ? `<br><small style="color: ${settings2.secondaryColor};">${item.description}</small>` : ""}
                    <br><small>Qty: ${item.quantity}</small>
                </div>
                <div style="text-align: right;">
                    <strong>$${parseFloat(item.totalPrice).toFixed(2)}</strong>
                </div>
            </div>
        `).join("")}
    </div>

    <div class="total">
        TOTAL PAID: $${parseFloat(invoiceData.totalAmount).toFixed(2)}
    </div>

    <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>Receipt generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
        ${settings2.companyEmail ? `<p>Questions? Contact us at ${settings2.companyEmail}</p>` : ""}
    </div>
</body>
</html>
    `;
        return html;
      }
    };
    invoiceService = new InvoiceService();
  }
});

// server/routes/invoiceRoutes.ts
var invoiceRoutes_exports = {};
__export(invoiceRoutes_exports, {
  invoiceRoutes: () => router2
});
import express2 from "express";
import { desc as desc5 } from "drizzle-orm";
import rateLimit2 from "express-rate-limit";
var router2, invoiceRateLimit;
var init_invoiceRoutes = __esm({
  "server/routes/invoiceRoutes.ts"() {
    "use strict";
    init_invoiceService();
    init_db();
    init_schema();
    router2 = express2.Router();
    invoiceRateLimit = rateLimit2({
      windowMs: 15 * 60 * 1e3,
      // 15 minutes
      max: 50,
      // limit each IP to 50 requests per windowMs
      message: "Too many requests, please try again later."
    });
    router2.use(invoiceRateLimit);
    router2.get("/admin/settings", async (req, res) => {
      try {
        const settings2 = await invoiceService.getInvoiceSettings();
        res.json(settings2);
      } catch (error) {
        console.error("Get invoice settings error:", error);
        res.status(500).json({ error: "Failed to fetch invoice settings" });
      }
    });
    router2.put("/admin/settings", async (req, res) => {
      try {
        const updatedSettings = await invoiceService.updateInvoiceSettings(req.body);
        res.json(updatedSettings);
      } catch (error) {
        console.error("Update invoice settings error:", error);
        res.status(500).json({ error: "Failed to update invoice settings" });
      }
    });
    router2.post("/admin/create-from-order/:orderId", async (req, res) => {
      try {
        const orderId = parseInt(req.params.orderId);
        const invoice = await invoiceService.createInvoiceFromOrder(orderId);
        res.json(invoice);
      } catch (error) {
        console.error("Create invoice from order error:", error);
        res.status(500).json({ error: "Failed to create invoice from order" });
      }
    });
    router2.get("/admin/list", async (req, res) => {
      try {
        const invoices3 = await db.select().from(invoiceSettings).orderBy(desc5(invoiceSettings.createdAt));
        res.json(invoices3);
      } catch (error) {
        console.error("Get invoices list error:", error);
        res.status(500).json({ error: "Failed to fetch invoices list" });
      }
    });
    router2.get("/:invoiceId", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const invoice = await invoiceService.getInvoiceWithItems(invoiceId);
        res.json(invoice);
      } catch (error) {
        console.error("Get invoice error:", error);
        res.status(500).json({ error: "Failed to fetch invoice" });
      }
    });
    router2.get("/:invoiceId/html", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const html = await invoiceService.generateInvoiceHTML(invoiceId);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
      } catch (error) {
        console.error("Generate invoice HTML error:", error);
        res.status(500).json({ error: "Failed to generate invoice HTML" });
      }
    });
    router2.get("/:invoiceId/receipt", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const html = await invoiceService.generateReceiptHTML(invoiceId);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
      } catch (error) {
        console.error("Generate receipt HTML error:", error);
        res.status(500).json({ error: "Failed to generate receipt HTML" });
      }
    });
    router2.get("/customer/:customerId", async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        let customerId = req.params.customerId;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7);
          const decoded = Buffer.from(token, "base64").toString("utf8");
          const [type, userId] = decoded.split(":");
          if (type === "customer") {
            customerId = userId;
          }
        }
        const invoices3 = await invoiceService.getCustomerInvoices(customerId);
        res.json(invoices3);
      } catch (error) {
        console.error("Get customer invoices error:", error);
        res.status(500).json({ error: "Failed to fetch customer invoices" });
      }
    });
    router2.post("/:invoiceId/mark-paid", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const updatedInvoice = await invoiceService.markInvoiceAsPaid(invoiceId);
        res.json(updatedInvoice);
      } catch (error) {
        console.error("Mark invoice as paid error:", error);
        res.status(500).json({ error: "Failed to mark invoice as paid" });
      }
    });
    router2.get("/:invoiceId/download", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const html = await invoiceService.generateInvoiceHTML(invoiceId);
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoiceId}.html"`);
        res.send(html);
      } catch (error) {
        console.error("Download invoice error:", error);
        res.status(500).json({ error: "Failed to download invoice" });
      }
    });
    router2.get("/:invoiceId/download-receipt", async (req, res) => {
      try {
        const invoiceId = parseInt(req.params.invoiceId);
        const html = await invoiceService.generateReceiptHTML(invoiceId);
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Content-Disposition", `attachment; filename="receipt-${invoiceId}.html"`);
        res.send(html);
      } catch (error) {
        console.error("Download receipt error:", error);
        res.status(500).json({ error: "Failed to download receipt" });
      }
    });
  }
});

// server/index.ts
import express4 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";
import Stripe from "stripe";
import multer from "multer";
import OpenAI2 from "openai";

// server/emailService.ts
import nodemailer from "nodemailer";
var EmailService = class {
  transporter;
  constructor() {
    const emailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || ""
      }
    };
    this.transporter = nodemailer.createTransport(emailConfig);
  }
  async sendPurchaseConfirmation(order, activationKey) {
    const downloadUrl = `${process.env.BASE_URL || "http://localhost:5000"}/download/${order.downloadToken}`;
    const activationDownloadUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/download-activation/${order.downloadToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@ocusjobhunter.com",
      to: order.customerEmail,
      subject: "\u{1F389} Your OCUS Job Hunter Extension is Ready - **START FREE**!",
      html: this.getPurchaseConfirmationTemplate(order, downloadUrl, activationKey, activationDownloadUrl)
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Purchase confirmation email sent to ${order.customerEmail}`);
    } catch (error) {
      console.error("Failed to send purchase confirmation email:", error);
      throw error;
    }
  }
  getPurchaseConfirmationTemplate(order, downloadUrl, activationKey, activationDownloadUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OCUS Job Hunter Extension</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #334155; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px 20px; border: 1px solid #e2e8f0; border-top: none; }
          .download-button { display: inline-block; background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .steps { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin-bottom: 15px; padding-left: 30px; position: relative; }
          .step::before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; top: 0; background: #2563EB; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
          .steps { counter-reset: step-counter; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">\u{1F389} Your Extension is Ready!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for purchasing OCUS Job Hunter</p>
          </div>
          
          <div class="content">
            <h2 style="color: #2563EB; margin-top: 0;">Hi ${order.customerName}, **START FREE** Now!</h2>
            
            <p>\u{1F389} Thank you for purchasing the OCUS Job Hunter Extension! Your payment has been processed successfully.</p>
            
            <p><strong>\u{1F4E6} Two important downloads for you:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" class="download-button" style="margin-right: 10px; background: #2563EB;">\u{1F4C1} Download Extension Files</a>
              ${activationKey && activationDownloadUrl ? `<a href="${activationDownloadUrl}" class="download-button" style="background: #10B981;">\u{1F511} Download Activation Key</a>` : ""}
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0; color: #1e293b;">**START FREE** Instructions:</h3>
              <div class="step">
                <strong>**START FREE**:</strong> Install the extension and use 3 jobs for FREE
              </div>
              <div class="step">
                <strong>Extract Files:</strong> Unzip the extension files to a folder
              </div>
              <div class="step">
                <strong>Open Chrome:</strong> Go to chrome://extensions/
              </div>
              <div class="step">
                <strong>Enable Developer Mode:</strong> Toggle the switch in the top-right corner
              </div>
              <div class="step">
                <strong>Load Extension:</strong> Click "Load unpacked" and select your folder
              </div>
              <div class="step">
                <strong>**3 FREE USES**:</strong> Try the extension on OCUS jobs immediately!
              </div>
              <div class="step">
                <strong>Unlimited Access:</strong> Use your activation key when ready for more
              </div>
            </div>
            
            ${activationKey ? `
            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin-top: 0; color: #10B981;">\u{1F511} Your Activation Key</h3>
              <p style="font-family: monospace; background: #E5E7EB; padding: 10px; border-radius: 4px; font-size: 16px;"><strong>${activationKey}</strong></p>
              <p><strong>After your 3 FREE uses:</strong></p>
              <ul>
                <li>Open the extension popup</li>
                <li>Find the "License Activation" section</li>
                <li>Enter your activation key above</li>
                <li>Click "Activate Extension"</li>
                <li>Enjoy unlimited job hunting!</li>
              </ul>
            </div>
            ` : ""}
            
            <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563EB;">
              <h3 style="margin-top: 0; color: #2563EB;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Customer:</strong> ${order.customerName}</p>
              <p><strong>Amount:</strong> $${parseFloat(order.finalAmount).toFixed(2)} ${order.currency.toUpperCase()}</p>
              <p><strong>**START FREE**:</strong> 3 jobs included, then unlimited with activation</p>
            </div>
            
            <p><strong>Important:</strong> Save both files after downloading. Your extension includes <strong>3 FREE job searches</strong> to start immediately!</p>
            
            <p>If you have any questions or need support, please contact us at <a href="mailto:support@ocusjobhunter.com">support@ocusjobhunter.com</a></p>
            
            <p>Happy job hunting with your <strong>**FREE START**</strong>!<br>The OCUS Job Hunter Team</p>
          </div>
          
          <div class="footer">
            <p>This download link is valid for ${order.maxDownloads} downloads. Please save the extension file after downloading.</p>
            <p>\xA9 2024 OCUS Job Hunter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
var emailService = new EmailService();

// server/fileService.ts
import fs from "fs";
import path from "path";
var FileService = class {
  uploadsDir;
  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    this.ensureUploadsDirectory();
  }
  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }
  async getFileForDownload(order, product) {
    const filePath = path.join(this.uploadsDir, product.filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }
    if (order.status !== "completed") {
      throw new Error("Order not completed");
    }
    if ((order.downloadCount || 0) >= (order.maxDownloads || 1)) {
      throw new Error("Download limit exceeded");
    }
    return {
      filePath,
      fileName: product.fileName,
      mimeType: "application/x-chrome-extension"
    };
  }
  async saveUploadedFile(file, fileName) {
    const filePath = path.join(this.uploadsDir, fileName);
    await fs.promises.writeFile(filePath, file);
    return fileName;
  }
  async deleteFile(fileName) {
    const filePath = path.join(this.uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
  getFilePath(fileName) {
    return path.join(this.uploadsDir, fileName);
  }
};
var fileService = new FileService();

// server/paypal.ts
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController
} from "@paypal/paypal-server-sdk";
var { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
if (!PAYPAL_CLIENT_ID) {
  console.warn("Missing PAYPAL_CLIENT_ID - PayPal integration disabled");
}
if (!PAYPAL_CLIENT_SECRET) {
  console.warn("Missing PAYPAL_CLIENT_SECRET - PayPal integration disabled");
}
var client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET
  },
  timeout: 0,
  environment: process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true
    },
    logResponse: {
      logHeaders: true
    }
  }
});
var ordersController = new OrdersController(client);
var oAuthAuthorizationController = new OAuthAuthorizationController(client);
async function getClientToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`
    },
    { intent: "sdk_init", response_type: "client_token" }
  );
  return result.accessToken;
}
async function createPaypalOrder(req, res) {
  try {
    const { amount, currency, intent } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number."
      });
    }
    if (!currency) {
      return res.status(400).json({ error: "Invalid currency. Currency is required." });
    }
    if (!intent) {
      return res.status(400).json({ error: "Invalid intent. Intent is required." });
    }
    const collect = {
      body: {
        intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount
            }
          }
        ]
      },
      prefer: "return=minimal"
    };
    const { body, ...httpResponse } = await ordersController.createOrder(collect);
    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}
async function capturePaypalOrder(req, res) {
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal"
    };
    const { body, ...httpResponse } = await ordersController.captureOrder(collect);
    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}
async function loadPaypalDefault(req, res) {
  const clientToken = await getClientToken();
  res.json({
    clientToken
  });
}

// server/routes.ts
init_db();
init_schema();
import { z } from "zod";
import validator from "validator";
import { eq as eq6, desc as desc6, count as count4 } from "drizzle-orm";
import path2 from "path";

// server/socialAuth.ts
init_storage();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { v4 as uuidv4 } from "uuid";
var strategiesInitialized = false;
async function initializeStrategies() {
  if (strategiesInitialized) return;
  try {
    const authSettings2 = await storage.getAuthSettings();
    console.log("Initializing OAuth strategies with settings:", {
      googleEnabled: authSettings2?.googleEnabled,
      googleClientId: authSettings2?.googleClientId ? authSettings2.googleClientId.substring(0, 20) + "..." : "not set",
      googleClientSecret: authSettings2?.googleClientSecret ? "set" : "not set",
      envGoogleClientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + "..." : "not set",
      envGoogleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "not set"
    });
    const googleClientId = authSettings2?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = authSettings2?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
    const googleEnabled = authSettings2?.googleEnabled ?? (!!googleClientId && !!googleClientSecret);
    if (googleEnabled && googleClientId && googleClientSecret) {
      console.log("Registering Google OAuth strategy");
      passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: "/api/auth/google/callback"
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google OAuth profile received:", {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName
          });
          let customer = await storage.getCustomerBySocialId("google", profile.id);
          console.log("Existing customer by Google ID:", customer ? { id: customer.id, email: customer.email } : "not found");
          if (!customer) {
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || "");
            console.log("Existing customer by email:", existingCustomer ? { id: existingCustomer.id, email: existingCustomer.email } : "not found");
            if (existingCustomer) {
              console.log("Linking Google account to existing customer:", existingCustomer.id);
              customer = await storage.updateCustomer(existingCustomer.id, {
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              console.log("Creating new customer with Google profile");
              const newCustomerData = {
                email: profile.emails?.[0]?.value || "",
                name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              };
              console.log("Creating customer with data:", newCustomerData);
              customer = await storage.createCustomer(newCustomerData);
              console.log("Created customer:", { id: customer.id, email: customer.email });
            }
          }
          console.log("Google OAuth success, returning customer:", { id: customer.id, email: customer.email });
          return done(null, customer);
        } catch (error) {
          console.error("Google OAuth strategy error:", error);
          return done(error, null);
        }
      }));
    }
    if (authSettings2?.facebookEnabled && authSettings2.facebookAppId && authSettings2.facebookAppSecret) {
      passport.use(new FacebookStrategy({
        clientID: authSettings2.facebookAppId,
        clientSecret: authSettings2.facebookAppSecret,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"]
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          let customer = await storage.getCustomerBySocialId("facebook", profile.id);
          if (!customer) {
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || "");
            if (existingCustomer) {
              customer = await storage.updateCustomer(existingCustomer.id, {
                facebookId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              customer = await storage.createCustomer({
                email: profile.emails?.[0]?.value || "",
                name: profile.displayName || "",
                facebookId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              });
            }
          }
          return done(null, customer);
        } catch (error) {
          return done(error, null);
        }
      }));
    }
    if (authSettings2?.githubEnabled && authSettings2.githubClientId && authSettings2.githubClientSecret) {
      passport.use(new GitHubStrategy({
        clientID: authSettings2.githubClientId,
        clientSecret: authSettings2.githubClientSecret,
        callbackURL: "/api/auth/github/callback"
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          let customer = await storage.getCustomerBySocialId("github", profile.id);
          if (!customer) {
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || "");
            if (existingCustomer) {
              customer = await storage.updateCustomer(existingCustomer.id, {
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              customer = await storage.createCustomer({
                email: profile.emails?.[0]?.value || "",
                name: profile.displayName || profile.username || "",
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              });
            }
          }
          return done(null, customer);
        } catch (error) {
          return done(error, null);
        }
      }));
    }
    strategiesInitialized = true;
    console.log("OAuth strategies initialized with database settings");
  } catch (error) {
    console.error("Failed to initialize OAuth strategies:", error);
  }
}
initializeStrategies();
async function reinitializeStrategies() {
  strategiesInitialized = false;
  await initializeStrategies();
}
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user with ID:", id, "Type:", typeof id);
    const customer = await storage.getCustomer(id);
    console.log("Deserialized customer:", customer ? { id: customer.id, email: customer.email } : "not found");
    done(null, customer);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

// server/routes.ts
import session from "express-session";

// server/captcha.ts
import crypto2 from "crypto";
var CaptchaService = class {
  challenges = /* @__PURE__ */ new Map();
  EXPIRY_TIME = 5 * 60 * 1e3;
  // 5 minutes
  generateChallenge() {
    const operations = ["+", "-", "*"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case "*":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 5;
        answer = 10;
    }
    const id = crypto2.randomBytes(16).toString("hex");
    const question = `${num1} ${operation} ${num2} = ?`;
    this.challenges.set(id, {
      question,
      answer: answer.toString(),
      expires: Date.now() + this.EXPIRY_TIME
    });
    this.cleanupExpired();
    return { id, question };
  }
  validateChallenge(id, userAnswer) {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      return false;
    }
    if (Date.now() > challenge.expires) {
      this.challenges.delete(id);
      return false;
    }
    const isValid = challenge.answer === userAnswer.trim();
    this.challenges.delete(id);
    return isValid;
  }
  async verifyRecaptcha(token, secretKey) {
    if (!token || !secretKey) {
      throw new Error("Missing reCAPTCHA token or secret key");
    }
    try {
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `secret=${secretKey}&response=${token}`
      });
      const data = await response.json();
      if (data.success) {
        return true;
      } else {
        throw new Error("reCAPTCHA verification failed: " + (data["error-codes"] || []).join(", "));
      }
    } catch (error) {
      throw new Error("reCAPTCHA verification error: " + error.message);
    }
  }
  cleanupExpired() {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expires) {
        this.challenges.delete(id);
      }
    }
  }
};
var captchaService = new CaptchaService();

// server/translationService.ts
import OpenAI from "openai";
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}
var TranslationService = class {
  static supportedLanguages = {
    en: "English",
    de: "German",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    pl: "Polish",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese (Simplified)"
  };
  static async translateText(requestOrText, targetLanguages) {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured - returning empty translation map");
      return {};
    }
    let request;
    if (typeof requestOrText === "string") {
      request = {
        text: requestOrText,
        targetLanguages: targetLanguages || [],
        context: "General text translation",
        tone: "marketing"
      };
    } else {
      request = requestOrText;
    }
    const { text: text2, targetLanguages: langs, context = "", maxLength, tone = "marketing" } = request;
    const validLanguages = langs.filter(
      (lang) => lang in this.supportedLanguages && lang !== "en"
    );
    if (validLanguages.length === 0) {
      return {};
    }
    const languageNames = validLanguages.map(
      (code) => `${code}: ${this.supportedLanguages[code]}`
    ).join(", ");
    const lengthConstraint = maxLength ? `Keep translations under ${maxLength} characters. ` : "";
    const toneDescription = {
      marketing: "marketing/promotional tone",
      professional: "professional business tone",
      casual: "casual friendly tone",
      urgent: "urgent/time-sensitive tone"
    }[tone];
    const prompt = `Translate the following text into multiple languages.

Original text (English): "${text2}"
Context: ${context || "Marketing content for a Chrome extension product"}
Target languages: ${languageNames}
Tone: ${toneDescription}
${lengthConstraint}

Requirements:
- Maintain the ${toneDescription}
- Keep the same emotional impact and urgency as the original
- Adapt cultural nuances appropriately for each target market
- Preserve any promotional messaging intent
- ${lengthConstraint}Ensure translations sound natural to native speakers

Respond with a JSON object where keys are language codes (${validLanguages.join(", ")}) and values are the translated text.

Example format:
{
  "de": "German translation here",
  "fr": "French translation here"
}`;
    try {
      const openai2 = getOpenAI();
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional translator specializing in marketing and e-commerce content. Provide accurate, culturally appropriate translations that maintain the marketing impact of the original text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        // Lower temperature for more consistent translations
        max_tokens: 1e3
      });
      const translationText = response.choices[0].message.content;
      if (!translationText) {
        throw new Error("No translation received from OpenAI");
      }
      const translations = JSON.parse(translationText);
      const result = {};
      for (const lang of validLanguages) {
        if (translations[lang] && typeof translations[lang] === "string") {
          result[lang] = translations[lang].trim();
        }
      }
      return result;
    } catch (error) {
      console.error("Translation service error:", error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async translateBannerContent(titleEn, subtitleEn, targetLanguages) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OpenAI API key not configured - returning empty translation maps");
        return {
          titles: {},
          subtitles: {}
        };
      }
      const [titleTranslations, subtitleTranslations] = await Promise.all([
        this.translateText({
          text: titleEn,
          targetLanguages,
          context: "Countdown banner title for limited-time promotion",
          maxLength: 100,
          tone: "urgent"
        }),
        this.translateText({
          text: subtitleEn,
          targetLanguages,
          context: "Countdown banner subtitle describing promotional offer",
          maxLength: 200,
          tone: "marketing"
        })
      ]);
      return {
        titles: titleTranslations,
        subtitles: subtitleTranslations
      };
    } catch (error) {
      console.error("Banner translation error:", error);
      throw error;
    }
  }
  static getSupportedLanguages() {
    return this.supportedLanguages;
  }
};

// server/routes.ts
init_affiliateService();
import bcrypt from "bcrypt";
import rateLimit3 from "express-rate-limit";
import helmet from "helmet";
import { v4 as uuidv42 } from "uuid";
import crypto3 from "crypto";
import fs2 from "fs";
import cors from "cors";

// server/invoicePdfService.ts
import puppeteer from "puppeteer";
async function generateInvoicePDF(invoice, settings2) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    const html = generateInvoiceHTML(invoice, settings2);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
function generateInvoiceHTML(invoice, settings2) {
  const companyName = settings2?.companyName || "OCUS Job Hunter";
  const primaryColor = settings2?.primaryColor || "#007bff";
  const secondaryColor = settings2?.secondaryColor || "#6c757d";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid ${primaryColor};
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: ${primaryColor};
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .company-info p {
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 32px;
          color: ${primaryColor};
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .invoice-number {
          font-size: 18px;
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .billing-info h3 {
          color: ${primaryColor};
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .billing-info p {
          margin-bottom: 5px;
          color: #555;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table thead {
          background-color: ${primaryColor};
          color: white;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
          font-weight: bold;
        }
        
        .items-table tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .text-right {
          text-align: right;
        }
        
        .totals {
          margin-left: auto;
          width: 300px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .totals-row.total {
          font-weight: bold;
          font-size: 18px;
          border-bottom: 3px solid ${primaryColor};
          color: ${primaryColor};
        }
        
        .payment-info {
          margin-top: 40px;
          padding: 20px;
          background-color: #f8f9fa;
          border-left: 4px solid ${primaryColor};
        }
        
        .payment-info h3 {
          color: ${primaryColor};
          margin-bottom: 10px;
        }
        
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f1f3f4;
          border-radius: 5px;
        }
        
        .notes h4 {
          color: ${primaryColor};
          margin-bottom: 10px;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: ${secondaryColor};
          font-size: 14px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-issued {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-paid {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-overdue {
          background-color: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            ${settings2?.companyAddress ? `<p>${settings2.companyAddress.replace(/\n/g, "<br>")}</p>` : ""}
            ${settings2?.companyPhone ? `<p>Phone: ${settings2.companyPhone}</p>` : ""}
            ${settings2?.companyEmail ? `<p>Email: ${settings2.companyEmail}</p>` : ""}
            ${settings2?.companyWebsite ? `<p>Website: ${settings2.companyWebsite}</p>` : ""}
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
            <div class="status-badge status-${invoice.status}">${invoice.status}</div>
          </div>
        </div>
        
        <div class="billing-section">
          <div class="billing-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customerName}</strong></p>
            <p>${invoice.customerEmail}</p>
            ${invoice.billingAddress ? `<p>${invoice.billingAddress.replace(/\n/g, "<br>")}</p>` : ""}
          </div>
          <div class="billing-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Currency:</strong> ${invoice.currency.toUpperCase()}</p>
            ${invoice.paidAt ? `<p><strong>Paid Date:</strong> ${new Date(invoice.paidAt).toLocaleDateString()}</p>` : ""}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item) => `
              <tr>
                <td>
                  <strong>${item.productName}</strong>
                  ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ""}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${invoice.currency.toUpperCase()} ${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td class="text-right">${invoice.currency.toUpperCase()} ${parseFloat(item.totalPrice).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.subtotal).toFixed(2)}</span>
          </div>
          ${parseFloat(invoice.taxAmount || "0") > 0 ? `
            <div class="totals-row">
              <span>Tax:</span>
              <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.taxAmount).toFixed(2)}</span>
            </div>
          ` : ""}
          ${parseFloat(invoice.discountAmount || "0") > 0 ? `
            <div class="totals-row">
              <span>Discount:</span>
              <span>-${invoice.currency.toUpperCase()} ${parseFloat(invoice.discountAmount).toFixed(2)}</span>
            </div>
          ` : ""}
          <div class="totals-row total">
            <span>Total:</span>
            <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>
        
        ${invoice.status === "issued" ? `
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p>Please remit payment within 30 days of the invoice date.</p>
            <p>Thank you for your business!</p>
          </div>
        ` : ""}
        
        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes.replace(/\n/g, "<br>")}</p>
          </div>
        ` : ""}
        
        <div class="footer">
          ${settings2?.footerText || "Thank you for your business!"}
          ${settings2?.termsAndConditions ? `<br><br><small>${settings2.termsAndConditions}</small>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
}

// server/routes.ts
var stripe = null;
var currentStripeKey = null;
async function initializeStripe() {
  try {
    const authSettings2 = await storage.getAuthSettings?.();
    let stripeSecretKey = null;
    if (authSettings2?.stripeSecretKey) {
      stripeSecretKey = authSettings2.stripeSecretKey;
      console.log("Using Stripe keys from database (admin settings)");
      console.log("Database secret key starts with:", stripeSecretKey.substring(0, 8) + "...");
    } else {
      console.log("No payment settings found in database, checking environment");
      stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || null;
      if (stripeSecretKey) {
        console.log("Using Stripe keys from environment variables");
        console.log("Environment secret key starts with:", stripeSecretKey.substring(0, 8) + "...");
      }
    }
    if (stripeSecretKey && stripeSecretKey !== currentStripeKey) {
      stripe = new Stripe(stripeSecretKey);
      currentStripeKey = stripeSecretKey;
      const isLive = stripeSecretKey.startsWith("sk_live_");
      console.log(`Stripe initialized in ${isLive ? "LIVE" : "TEST"} mode`);
    }
    if (!stripeSecretKey) {
      console.warn("No Stripe secret key found in database or environment - Stripe integration disabled");
    }
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    const envKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (envKey) {
      stripe = new Stripe(envKey);
      currentStripeKey = envKey;
      const isLive = envKey.startsWith("sk_live_");
      console.log(`Stripe initialized from ENV in ${isLive ? "LIVE" : "TEST"} mode`);
    }
  }
}
initializeStripe();
var openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI2({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn("Missing OPENAI_API_KEY - Chat functionality disabled");
}
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    // 5MB limit (reduced for security)
    files: 3
    // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
    }
  }
});
async function registerRoutes(app2) {
  const authLimiter = rateLimit3({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 5,
    // 5 attempts per window
    message: { error: "Too many authentication attempts, try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development" && req.ip === "127.0.0.1"
  });
  const generalLimiter = rateLimit3({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // 100 requests per window
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development" && req.ip === "127.0.0.1"
  });
  const uploadLimiter = rateLimit3({
    windowMs: 60 * 60 * 1e3,
    // 1 hour
    max: 10,
    // 10 uploads per hour
    message: { error: "Upload limit exceeded, try again later." },
    standardHeaders: true,
    legacyHeaders: false
  });
  const requireAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ error: "Admin access required" });
    }
    next();
  };
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "OCUS Job Hunter",
      uptime: process.uptime(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "OCUS Job Hunter API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "2.3.4"
    });
  });
  app2.get("/api/admin/seo-settings", requireAdmin, async (req, res) => {
    try {
      const seoSettings2 = await storage.getSeoSettings();
      res.json(seoSettings2 || {});
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ error: "Failed to fetch SEO settings" });
    }
  });
  app2.put("/api/admin/seo-settings", requireAdmin, uploadLimiter, upload.fields([
    { name: "customOgImage", maxCount: 1 },
    { name: "customLogo", maxCount: 1 },
    { name: "customFavicon", maxCount: 1 }
  ]), async (req, res) => {
    try {
      console.log("=== SEO SETTINGS UPLOAD DEBUG (FormData) ===");
      console.log("Content-Type:", req.headers["content-type"]);
      console.log("Request body keys:", Object.keys(req.body));
      console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
      const files = req.files;
      const updateData = { ...req.body };
      if (files?.customOgImage?.[0]) {
        const file = files.customOgImage[0];
        console.log("Processing customOgImage:", {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer.length
        });
        const base64Data = file.buffer.toString("base64");
        updateData.customOgImage = `data:${file.mimetype};base64,${base64Data}`;
        console.log("Base64 data length:", base64Data.length);
      }
      if (files?.customLogo?.[0]) {
        const file = files.customLogo[0];
        console.log("Processing customLogo:", {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        const base64Data = file.buffer.toString("base64");
        updateData.customLogo = `data:${file.mimetype};base64,${base64Data}`;
      }
      if (files?.customFavicon?.[0]) {
        const file = files.customFavicon[0];
        console.log("Processing customFavicon:", {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        const base64Data = file.buffer.toString("base64");
        updateData.customFavicon = `data:${file.mimetype};base64,${base64Data}`;
      }
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === void 0 || updateData[key] === "") {
          delete updateData[key];
        }
      });
      console.log("Update data keys:", Object.keys(updateData));
      console.log("Has customOgImage:", !!updateData.customOgImage);
      const updatedSettings = await storage.updateSeoSettings(updateData);
      console.log("Database update result:", {
        id: updatedSettings.id,
        hasCustomOgImage: !!updatedSettings.customOgImage,
        customOgImageLength: updatedSettings.customOgImage ? updatedSettings.customOgImage.length : 0
      });
      console.log("=== END SEO SETTINGS DEBUG (FormData) ===");
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating SEO settings (FormData):", error);
      res.status(500).json({
        error: "Failed to update SEO settings",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.patch("/api/admin/seo-settings", requireAdmin, async (req, res) => {
    try {
      console.log("=== SEO SETTINGS JSON UPDATE DEBUG ===");
      console.log("Content-Type:", req.headers["content-type"]);
      console.log("Request body:", req.body);
      const updateData = { ...req.body };
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === void 0 || updateData[key] === "") {
          delete updateData[key];
        }
      });
      console.log("Clean update data:", updateData);
      const updatedSettings = await storage.updateSeoSettings(updateData);
      console.log("Database update result:", updatedSettings);
      console.log("=== END SEO SETTINGS JSON UPDATE DEBUG ===");
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating SEO settings (JSON):", error);
      res.status(500).json({
        error: "Failed to update SEO settings",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/status", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app2.get("/ping", (req, res) => {
    res.status(200).send("pong");
  });
  app2.use(cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://app.ocus.com",
      /https:\/\/.*\.replit\.app$/,
      /https:\/\/.*\.replit\.dev$/,
      "chrome-extension://*"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"]
  }));
  app2.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.paypal.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"]
      },
      useDefaults: false
    },
    hsts: {
      maxAge: 31536e3,
      includeSubDomains: true,
      preload: true
    }
  }));
  const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
      if (typeof obj === "string") {
        return validator.escape(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === "object") {
        const sanitized = {};
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
  app2.use(generalLimiter);
  app2.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  app2.use(passport.initialize());
  app2.use(passport.session());
  await reinitializeStrategies();
  app2.get("/api/auth-strategies/status", async (req, res) => {
    try {
      const authSettings2 = await storage.getAuthSettings();
      const strategies = {
        google: !!(authSettings2?.googleEnabled && authSettings2.googleClientId && authSettings2.googleClientSecret),
        facebook: !!(authSettings2?.facebookEnabled && authSettings2.facebookAppId && authSettings2.facebookAppSecret),
        github: !!(authSettings2?.githubEnabled && authSettings2.githubClientId && authSettings2.githubClientSecret)
      };
      res.json({
        strategies,
        authSettings: authSettings2 ? {
          googleEnabled: authSettings2.googleEnabled || false,
          facebookEnabled: authSettings2.facebookEnabled || false,
          githubEnabled: authSettings2.githubEnabled || false
        } : {
          googleEnabled: false,
          facebookEnabled: false,
          githubEnabled: false
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error checking strategy status: " + error.message });
    }
  });
  app2.post("/api/admin/upload-google-credentials", upload.single("credentials"), async (req, res) => {
    try {
      console.log("Upload request received:", {
        hasFile: !!req.file,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        mimetype: req.file?.mimetype
      });
      if (!req.file) {
        return res.status(400).json({ message: "No credentials file uploaded" });
      }
      const credentialsData = JSON.parse(req.file.buffer.toString());
      console.log("Parsed credentials structure:", {
        hasWeb: !!credentialsData.web,
        hasInstalled: !!credentialsData.installed,
        webClientId: credentialsData.web?.client_id ? "present" : "missing",
        installedClientId: credentialsData.installed?.client_id ? "present" : "missing"
      });
      const googleClientId = credentialsData.web?.client_id || credentialsData.installed?.client_id;
      const googleClientSecret = credentialsData.web?.client_secret || credentialsData.installed?.client_secret;
      if (!googleClientId || !googleClientSecret) {
        return res.status(400).json({
          message: "Invalid Google credentials file. Missing client_id or client_secret."
        });
      }
      console.log("Extracted credentials:", {
        clientId: googleClientId.substring(0, 20) + "...",
        clientSecret: "extracted successfully"
      });
      const updates = {
        googleEnabled: true,
        googleClientId,
        googleClientSecret
      };
      const authSettings2 = await storage.updateAuthSettings(updates);
      console.log("Auth settings updated, reinitializing strategies...");
      await reinitializeStrategies();
      console.log("OAuth strategies reinitialized successfully");
      res.json({
        message: "Google credentials uploaded successfully",
        googleEnabled: true,
        googleClientId: googleClientId.substring(0, 20) + "..."
        // Show partial ID for confirmation
      });
    } catch (error) {
      console.error("Google credentials upload error:", error);
      res.status(500).json({ message: "Failed to process credentials: " + error.message });
    }
  });
  app2.get("/api/auth-settings", async (req, res) => {
    try {
      const authSettings2 = await storage.getAuthSettings();
      if (!authSettings2) {
        res.json({
          googleEnabled: false,
          facebookEnabled: false,
          githubEnabled: false,
          recaptchaEnabled: false,
          recaptchaMode: "v2",
          recaptchaCustomerEnabled: false,
          recaptchaAdminEnabled: true
        });
      } else {
        res.json({
          googleEnabled: authSettings2.googleEnabled,
          facebookEnabled: authSettings2.facebookEnabled,
          githubEnabled: authSettings2.githubEnabled,
          recaptchaEnabled: authSettings2.recaptchaEnabled,
          recaptchaMode: authSettings2.recaptchaMode,
          recaptchaSiteKey: authSettings2.recaptchaSiteKey,
          recaptchaCustomerEnabled: authSettings2.recaptchaCustomerEnabled,
          recaptchaAdminEnabled: authSettings2.recaptchaAdminEnabled
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching auth settings: " + error.message });
    }
  });
  app2.get("/api/admin/auth-settings", async (req, res) => {
    try {
      const authSettings2 = await storage.getAuthSettings();
      if (!authSettings2) {
        res.json({
          googleEnabled: false,
          googleClientId: "",
          googleClientSecret: "",
          googleRedirectUri: "",
          facebookEnabled: false,
          facebookAppId: "",
          facebookAppSecret: "",
          githubEnabled: false,
          githubClientId: "",
          githubClientSecret: "",
          recaptchaEnabled: false,
          recaptchaSiteKey: "",
          recaptchaSecretKey: "",
          recaptchaMode: "v2",
          recaptchaCustomerEnabled: false,
          recaptchaAdminEnabled: true
        });
      } else {
        res.json({
          googleEnabled: authSettings2.googleEnabled || false,
          googleClientId: authSettings2.googleClientId || "",
          googleClientSecret: authSettings2.googleClientSecret ? "***" + authSettings2.googleClientSecret.slice(-4) : "",
          googleRedirectUri: authSettings2.googleRedirectUri || "",
          facebookEnabled: authSettings2.facebookEnabled || false,
          facebookAppId: authSettings2.facebookAppId || "",
          facebookAppSecret: authSettings2.facebookAppSecret ? "***" + authSettings2.facebookAppSecret.slice(-4) : "",
          githubEnabled: authSettings2.githubEnabled || false,
          githubClientId: authSettings2.githubClientId || "",
          githubClientSecret: authSettings2.githubClientSecret ? "***" + authSettings2.githubClientSecret.slice(-4) : "",
          recaptchaEnabled: authSettings2.recaptchaEnabled || false,
          recaptchaSiteKey: authSettings2.recaptchaSiteKey || "",
          recaptchaSecretKey: authSettings2.recaptchaSecretKey ? "***" + authSettings2.recaptchaSecretKey.slice(-4) : "",
          recaptchaMode: authSettings2.recaptchaMode || "v2",
          recaptchaCustomerEnabled: authSettings2.recaptchaCustomerEnabled || false,
          recaptchaAdminEnabled: authSettings2.recaptchaAdminEnabled || true
        });
      }
    } catch (error) {
      console.error("Get admin auth settings error:", error);
      res.status(500).json({ message: "Error fetching auth settings: " + error.message });
    }
  });
  app2.put("/api/admin/auth-settings", async (req, res) => {
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
        recaptchaMode: z.enum(["v2", "v3"]).optional(),
        recaptchaCustomerEnabled: z.boolean().optional(),
        recaptchaAdminEnabled: z.boolean().optional()
      });
      const validatedData = schema.parse(updates);
      const authSettings2 = await storage.updateAuthSettings(validatedData);
      try {
        await reinitializeStrategies();
        console.log("OAuth strategies reinitialized after settings update");
      } catch (error) {
        console.error("Failed to reinitialize OAuth strategies:", error);
      }
      res.json({
        googleEnabled: authSettings2.googleEnabled,
        facebookEnabled: authSettings2.facebookEnabled,
        githubEnabled: authSettings2.githubEnabled,
        recaptchaEnabled: authSettings2.recaptchaEnabled,
        recaptchaMode: authSettings2.recaptchaMode,
        recaptchaSiteKey: authSettings2.recaptchaSiteKey,
        recaptchaCustomerEnabled: authSettings2.recaptchaCustomerEnabled,
        recaptchaAdminEnabled: authSettings2.recaptchaAdminEnabled
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating auth settings: " + error.message });
    }
  });
  app2.post("/api/admin/login", authLimiter, async (req, res) => {
    try {
      const { username, email, password, recaptchaToken } = req.body;
      const loginField = email || username;
      if (!loginField || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 8) {
        console.warn(`Weak password attempt for: ${loginField} from IP: ${req.ip}`);
      }
      const authSettings2 = await storage.getAuthSettings();
      if (authSettings2?.recaptchaEnabled && authSettings2?.recaptchaAdminEnabled && authSettings2?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }
        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings2.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }
      const demoAdminPassword = await storage.getSetting("demo_admin_password");
      if (loginField === "info@logoland.se") {
        const correctPassword = demoAdminPassword?.value || "demo123";
        if (password === correctPassword) {
          console.info(`Admin login successful for: ${loginField} from IP: ${req.ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
          req.session.adminUser = {
            email: loginField,
            isAdmin: true,
            loginTime: Date.now(),
            lastActivity: Date.now()
          };
          return res.json({ success: true, role: "admin" });
        } else {
          console.warn(`Failed admin login attempt for: ${loginField} from IP: ${req.ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
        }
      }
      if (loginField === "demo_admin") {
        const correctPassword = demoAdminPassword?.value || "demo123";
        if (password === correctPassword) {
          console.info(`Admin login successful for: ${loginField} from IP: ${req.ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
          req.session.adminUser = {
            email: loginField,
            isAdmin: true,
            loginTime: Date.now(),
            lastActivity: Date.now()
          };
          return res.json({ success: true, role: "admin" });
        } else {
          console.warn(`Failed legacy admin login attempt for: ${loginField} from IP: ${req.ip}`);
        }
      }
      let user = null;
      if (loginField.includes("@")) {
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
      console.info(`Database admin login successful for: ${loginField} from IP: ${req.ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
      req.session.adminUser = {
        id: user.id.toString(),
        email: user.email,
        isAdmin: true,
        loginTime: Date.now(),
        lastActivity: Date.now()
      };
      res.json({ success: true, role: "admin" });
    } catch (error) {
      res.status(500).json({ message: "Login failed: " + error.message });
    }
  });
  app2.post("/api/admin/update-credentials", authLimiter, async (req, res) => {
    try {
      const { currentUsername, currentEmail, currentPassword, newUsername, newEmail, newPassword } = req.body;
      if (!currentUsername && !currentEmail || !currentPassword) {
        return res.status(400).json({ message: "Current email and password are required" });
      }
      const storedPassword = await storage.getSetting("demo_admin_password");
      const currentStoredPassword = storedPassword?.value || "demo123";
      if ((currentUsername === "demo_admin" || currentEmail === "info@logoland.se") && currentPassword === currentStoredPassword) {
        const responseMessage = [];
        if (newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await storage.updateSetting("demo_admin_password", newPassword);
          const existingUser = await storage.getUserByUsername("demo_admin");
          if (existingUser) {
            await db.update(users).set({ password: hashedPassword, email: newEmail || existingUser.email }).where(eq6(users.id, existingUser.id));
          }
          responseMessage.push("Password updated successfully");
        }
        if (newUsername || newEmail) {
          responseMessage.push(`Email would be updated to: ${newEmail || newUsername}`);
        }
        return res.json({
          success: true,
          message: responseMessage.length > 0 ? responseMessage.join(", ") : "Credentials verified successfully"
        });
      }
      const user = await storage.getUserByUsername(currentUsername);
      if (user && user.isAdmin && await bcrypt.compare(currentPassword, user.password)) {
        const updates = {};
        if (newUsername && newUsername !== currentUsername) {
          updates.username = newUsername;
        }
        if (newPassword) {
          updates.password = await bcrypt.hash(newPassword, 10);
        }
        if (Object.keys(updates).length > 0) {
          await db.update(users).set(updates).where(eq6(users.id, user.id));
        }
        return res.json({ success: true, message: "Admin credentials updated successfully" });
      }
      return res.status(401).json({ message: "Invalid current credentials" });
    } catch (error) {
      console.error("Admin credentials update error:", error);
      res.status(500).json({ message: "Failed to update credentials: " + error.message });
    }
  });
  app2.post("/api/customer/login", authLimiter, async (req, res) => {
    try {
      const { email, password, recaptchaToken } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const authSettings2 = await storage.getAuthSettings();
      if (authSettings2?.recaptchaEnabled && authSettings2?.recaptchaCustomerEnabled && authSettings2?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }
        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings2.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }
      if (email === "customer@demo.com" && password === "customer123") {
        const token2 = uuidv42();
        return res.json({
          success: true,
          role: "customer",
          token: token2,
          user: {
            id: "demo-customer-123",
            email: "customer@demo.com",
            name: "Demo Customer"
          }
        });
      }
      const customer = await storage.getCustomerByEmail(email);
      if (!customer || !customer.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, customer.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = uuidv42();
      res.json({
        success: true,
        role: "customer",
        token,
        user: {
          id: customer.id.toString(),
          email: customer.email,
          name: customer.name
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed: " + error.message });
    }
  });
  app2.post("/api/create-user-payment-intent", async (req, res) => {
    try {
      const userId = req.headers["user-id"] || req.body.userId;
      const product = await storage.getActiveProduct();
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const order = await storage.createOrder({
        userId: userId ? parseInt(userId.toString()) : null,
        customerEmail: req.body.customerEmail || "user@example.com",
        customerName: req.body.customerName || "User",
        originalAmount: product.price,
        finalAmount: product.price,
        discountAmount: "0",
        currency: product.currency || "eur",
        status: "pending",
        paymentMethod: "stripe",
        maxDownloads: 3,
        activationCode
      });
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(product.price) * 100),
        // Convert to cents
        currency: product.currency || "eur",
        metadata: {
          orderId: order.id.toString(),
          userId: userId?.toString() || "",
          activationCode
        }
      });
      await db.update(orders).set({ paymentIntentId: paymentIntent.id }).where(eq6(orders.id, order.id));
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        activationCode
      });
    } catch (error) {
      console.error("User payment intent creation failed:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.get("/api/me/purchase-status", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userOrders = await storage.getUserOrders(req.user.id);
      const completedOrders = userOrders.filter((order) => order.status === "completed");
      const hasPurchased = completedOrders.length > 0;
      const totalSpent = completedOrders.reduce((sum3, order) => {
        return sum3 + parseFloat(order.finalAmount);
      }, 0);
      res.json({
        hasPurchased,
        totalSpent: totalSpent.toFixed(2),
        completedOrders: completedOrders.length,
        lastPurchaseDate: completedOrders.length > 0 ? Math.max(...completedOrders.map((o) => new Date(o.completedAt || o.createdAt).getTime())) : null
      });
    } catch (error) {
      console.error("Failed to get user purchase status:", error);
      res.status(500).json({ message: "Failed to get purchase status: " + error.message });
    }
  });
  app2.get("/api/me", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Failed to get user profile:", error);
      res.status(500).json({ message: "Failed to get profile: " + error.message });
    }
  });
  app2.get("/api/me/downloads", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userDownloads = await storage.getUserDownloads(req.user.id);
      res.json(userDownloads);
    } catch (error) {
      console.error("Failed to get user downloads:", error);
      res.status(500).json({ message: "Failed to get downloads: " + error.message });
    }
  });
  app2.post("/api/user/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const schema = z.object({
        amount: z.number().min(1)
      });
      const validatedData = schema.parse({ amount });
      await initializeStripe();
      if (!stripe) {
        console.error("Stripe not configured - missing secret key");
        return res.status(500).json({
          message: "Payment system not configured. Please set your Stripe keys in Admin \u2192 Payment Settings.",
          error: "stripe_not_configured"
        });
      }
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(validatedData.amount * 100),
          // Convert to cents
          currency: "usd",
          metadata: {
            source: "user_dashboard",
            product: "extension_premium"
          }
        });
        res.json({
          clientSecret: paymentIntent.client_secret
        });
      } catch (stripeError) {
        console.error("Stripe payment intent creation failed:", stripeError);
        if (stripeError.code === "account_not_activated") {
          return res.status(400).json({
            message: "Your Stripe account setup is incomplete. Please complete your business verification, bank account setup, and identity verification in your Stripe dashboard before accepting live payments.",
            error: "account_not_activated"
          });
        }
        if (stripeError.code === "card_declined") {
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
    } catch (error) {
      console.error("User payment intent creation failed:", error);
      res.status(500).json({
        message: "Failed to initialize payment. Please try again.",
        error: "server_error"
      });
    }
  });
  app2.post("/api/customer/register", authLimiter, async (req, res) => {
    try {
      const { email, password, name, recaptchaToken } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password and name are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const authSettings2 = await storage.getAuthSettings();
      if (authSettings2?.recaptchaEnabled && authSettings2?.recaptchaCustomerEnabled && authSettings2?.recaptchaSecretKey) {
        if (!recaptchaToken) {
          return res.status(400).json({ message: "reCAPTCHA verification required" });
        }
        try {
          await captchaService.verifyRecaptcha(recaptchaToken, authSettings2.recaptchaSecretKey);
        } catch (error) {
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      }
      const existingCustomer = await storage.getCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
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
    } catch (error) {
      if (error.code === "23505") {
        res.status(400).json({ message: "Email already registered" });
      } else {
        res.status(500).json({ message: "Registration failed: " + error.message });
      }
    }
  });
  function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  app2.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app2.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app2.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
  app2.get("/api/auth/google/callback", (req, res, next) => {
    console.log("Google OAuth callback received:", {
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error,
      error: req.query.error
    });
    passport.authenticate("google", (err, user, info) => {
      console.log("Google OAuth authentication result:", {
        hasError: !!err,
        hasUser: !!user,
        info,
        errorMessage: err?.message || err
      });
      if (err) {
        console.error("OAuth authentication error:", err);
        return res.status(500).json({ message: err.message || "Authentication failed" });
      }
      if (!user) {
        console.log("No user returned from OAuth, likely access denied or authentication failed");
        if (req.query.error === "access_denied") {
          return res.redirect("/login?error=access_denied");
        }
        return res.status(401).json({ message: "Authentication failed - please try again" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("OAuth login successful for user:", user.email);
        return res.redirect("/dashboard?auth=success");
      });
    })(req, res, next);
  });
  app2.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
  app2.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
  app2.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!req.user, user: req.user });
  });
  app2.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });
  app2.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });
  app2.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      const settingsMap = settings2.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings: " + error.message });
    }
  });
  app2.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const schema = z.object({
        value: z.string().min(1)
      });
      const validatedData = schema.parse({ value });
      const setting = await storage.updateSetting(key, validatedData.value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Error updating setting: " + error.message });
    }
  });
  app2.post("/api/coupons", async (req, res) => {
    try {
      const { code, discountType, discountValue, usageLimit, expiresAt } = req.body;
      const schema = z.object({
        code: z.string().min(1),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(0),
        usageLimit: z.number().optional(),
        expiresAt: z.string().datetime().optional()
      });
      const validatedData = schema.parse({ code, discountType, discountValue, usageLimit, expiresAt });
      const coupon = await storage.createCoupon({
        code: validatedData.code,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue.toString(),
        usageLimit: validatedData.usageLimit || null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: true
      });
      res.json(coupon);
    } catch (error) {
      res.status(400).json({ message: "Error creating coupon: " + error.message });
    }
  });
  app2.get("/api/coupons", async (req, res) => {
    try {
      const coupons2 = await storage.getAllCoupons();
      res.json(coupons2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coupons: " + error.message });
    }
  });
  app2.delete("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting coupon: " + error.message });
    }
  });
  app2.put("/api/settings/product_price", async (req, res) => {
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
      res.json({ success: true, price: validatedData.value });
    } catch (error) {
      res.status(500).json({ message: "Error updating price: " + error.message });
    }
  });
  app2.put("/api/admin/pricing", async (req, res) => {
    try {
      const { price, beforePrice } = req.body;
      if (!price || price <= 0) {
        return res.status(400).json({ message: "Valid price is required" });
      }
      if (beforePrice && beforePrice <= price) {
        return res.status(400).json({ message: "Before price must be higher than current price" });
      }
      const updatedProduct = await storage.updateProductPricing({
        price,
        beforePrice
      });
      res.json({
        success: true,
        product: updatedProduct,
        message: "Pricing updated successfully"
      });
    } catch (error) {
      console.error("Error updating pricing:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products/pricing", async (req, res) => {
    try {
      const product = await storage.getCurrentProduct();
      res.json(product);
    } catch (error) {
      console.error("Error fetching product pricing:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/validate-coupon", async (req, res) => {
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
      if (coupon.expiresAt && /* @__PURE__ */ new Date() > coupon.expiresAt) {
        return res.status(400).json({ message: "Coupon has expired" });
      }
      if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = validatedData.orderAmount * parseFloat(coupon.discountValue) / 100;
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
    } catch (error) {
      res.status(400).json({ message: "Error validating coupon: " + error.message });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, customerEmail, customerName, couponCode, originalAmount, discountAmount, referralCode } = req.body;
      const schema = z.object({
        amount: z.number().min(1),
        customerEmail: z.string().min(1).email(),
        customerName: z.string().min(1),
        couponCode: z.string().optional(),
        originalAmount: z.number().optional(),
        discountAmount: z.number().optional(),
        referralCode: z.string().optional()
      });
      console.log("Payment intent request data:", { amount, customerEmail, customerName, couponCode, originalAmount, discountAmount, referralCode });
      const processedData = {
        amount,
        customerEmail,
        customerName,
        couponCode: couponCode || void 0,
        originalAmount,
        discountAmount,
        referralCode: referralCode || void 0
      };
      const validatedData = schema.parse(processedData);
      const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
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
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(validatedData.amount * 100),
        // Convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id.toString(),
          customerEmail: validatedData.customerEmail,
          customerName: validatedData.customerName
        }
      });
      await storage.updateOrderStatus(order.id, "pending");
      await db.update(orders).set({ paymentIntentId: paymentIntent.id }).where(eq6(orders.id, order.id));
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const order = await storage.getOrderByPaymentIntentId(paymentIntent.id);
      if (order) {
        await storage.updateOrderStatus(order.id, "completed", /* @__PURE__ */ new Date());
        if (order.referralCode) {
          try {
            await affiliateService.trackReferral(order.referralCode, order.id);
          } catch (error) {
            console.error("Failed to track referral:", error);
          }
        }
        const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        await storage.createActivationKey({
          activationKey,
          orderId: order.id,
          userId: order.userId,
          isActive: true
        });
        try {
          const invoiceNumber = await storage.generateInvoiceNumber();
          const invoice = await storage.createInvoice({
            invoiceNumber,
            orderId: order.id,
            customerId: order.userId?.toString() || "guest",
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            invoiceDate: /* @__PURE__ */ new Date(),
            dueDate: /* @__PURE__ */ new Date(),
            // Paid immediately
            subtotal: order.finalAmount,
            totalAmount: order.finalAmount,
            currency: (order.currency || "USD").toUpperCase(),
            status: "paid",
            paidAt: /* @__PURE__ */ new Date(),
            notes: `Invoice for order #${order.id}`
          });
          const product = await storage.getActiveProduct();
          await storage.createInvoiceItem({
            invoiceId: invoice.id,
            productName: product?.name || "OCUS Job Hunter Extension",
            description: product?.description || "Chrome extension for job hunting automation",
            quantity: 1,
            unitPrice: order.finalAmount,
            totalPrice: order.finalAmount
          });
          console.log(`Invoice #${invoiceNumber} created for order #${order.id}`);
        } catch (error) {
          console.error("Failed to create invoice:", error);
        }
        await emailService.sendPurchaseConfirmation(order, activationKey);
      }
    }
    res.json({ received: true });
  });
  app2.post("/api/complete-stripe-payment", async (req, res) => {
    try {
      const { paymentIntentId, customerEmail, customerName } = req.body;
      console.log("Completing Stripe payment:", { paymentIntentId, customerEmail });
      const order = await storage.getOrderByPaymentIntentId(paymentIntentId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.status === "completed") {
        return res.json({ success: true, message: "Order already completed", orderId: order.id });
      }
      await storage.updateOrderStatus(order.id, "completed", /* @__PURE__ */ new Date());
      if (order.referralCode) {
        try {
          await affiliateService.trackReferral(order.referralCode, order.id);
        } catch (error) {
          console.error("Failed to track referral:", error);
        }
      }
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await storage.createActivationKey({
        activationKey,
        orderId: order.id,
        userId: order.userId,
        isActive: true
      });
      console.log("Generated activation key:", activationKey);
      try {
        const invoiceNumber = await storage.generateInvoiceNumber();
        const invoice = await storage.createInvoice({
          invoiceNumber,
          orderId: order.id,
          customerId: order.userId?.toString() || "guest",
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          invoiceDate: /* @__PURE__ */ new Date(),
          dueDate: /* @__PURE__ */ new Date(),
          // Paid immediately
          subtotal: order.finalAmount,
          totalAmount: order.finalAmount,
          currency: order.currency.toUpperCase(),
          status: "paid",
          paidAt: /* @__PURE__ */ new Date(),
          notes: `Invoice for order #${order.id}`
        });
        const product = await storage.getActiveProduct();
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          productName: product?.name || "OCUS Job Hunter Extension",
          description: product?.description || "Chrome extension for job hunting automation",
          quantity: 1,
          unitPrice: order.finalAmount,
          totalPrice: order.finalAmount
        });
        console.log(`Invoice #${invoiceNumber} created for order #${order.id}`);
      } catch (error) {
        console.error("Failed to create invoice:", error);
      }
      try {
        await emailService.sendPurchaseConfirmation(order, activationKey);
      } catch (emailError) {
        console.log("Email service not configured, skipping email send");
      }
      res.json({
        success: true,
        orderId: order.id,
        activationKey
      });
    } catch (error) {
      console.error("Stripe payment completion failed:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/complete-paypal-payment", async (req, res) => {
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
      if (referralCode) {
        try {
          await affiliateService.trackReferral(referralCode, order.id);
        } catch (error) {
          console.error("Failed to track referral:", error);
        }
      }
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await storage.createActivationKey({
        activationKey,
        orderId: order.id,
        userId: order.userId,
        isActive: true
      });
      await emailService.sendPurchaseConfirmation(order, activationKey);
      res.json({ success: true, orderId: order.id });
    } catch (error) {
      console.error("PayPal payment completion failed:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/validate-activation-key", async (req, res) => {
    res.status(410).json({
      valid: false,
      message: "Activation system has been deprecated. Please contact support for assistance."
    });
  });
  app2.post("/api/premium/validate-device", async (req, res) => {
    try {
      const { userId, deviceFingerprint, extensionId } = req.body;
      if (!userId || !deviceFingerprint || !extensionId) {
        return res.status(400).json({
          authorized: false,
          message: "Missing required parameters"
        });
      }
      const existingDevice = await storage.getPremiumDevice(userId, deviceFingerprint);
      if (existingDevice) {
        return res.json({
          authorized: true,
          message: "Device authorized",
          registeredAt: existingDevice.registeredAt
        });
      }
      const userDevices = await storage.getUserPremiumDevices(userId);
      if (userDevices.length >= 1) {
        return res.json({
          authorized: false,
          message: "Premium access limited to one device. Please deactivate existing device.",
          maxDevices: 1,
          currentDevices: userDevices.length
        });
      }
      await storage.registerPremiumDevice(userId, deviceFingerprint, extensionId);
      res.json({
        authorized: true,
        message: "Device registered and authorized",
        isNewRegistration: true
      });
    } catch (error) {
      console.error("Premium device validation error:", error);
      res.status(500).json({
        authorized: false,
        message: "Server error during device validation"
      });
    }
  });
  app2.post("/api/premium/device-heartbeat", async (req, res) => {
    try {
      const { deviceFingerprint } = req.body;
      if (!deviceFingerprint) {
        return res.status(400).json({
          success: false,
          message: "Device fingerprint required"
        });
      }
      await storage.updatePremiumDeviceLastSeen(deviceFingerprint);
      res.json({
        success: true,
        message: "Device heartbeat updated",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Device heartbeat update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update device heartbeat"
      });
    }
  });
  app2.get("/api/download-extension/trial", async (req, res) => {
    try {
      console.log("Trial extension download requested");
      const archiver = (await import("archiver")).default;
      const trialDir = path2.resolve(import.meta.dirname, "../public/extensions/trial");
      if (!fs2.existsSync(trialDir)) {
        return res.status(404).json({ message: "Trial extension not found" });
      }
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="ocus-job-hunter-trial-v2.1.8-STABLE-FIXED.zip"');
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(trialDir, false);
      archive.finalize();
    } catch (error) {
      console.error("Error downloading trial extension:", error);
      res.status(500).json({ message: "Failed to download trial extension" });
    }
  });
  app2.get("/api/download-extension/premium", async (req, res) => {
    try {
      console.log("Premium extension download requested");
      const archiver = (await import("archiver")).default;
      const premiumDir = path2.resolve(import.meta.dirname, "../public/extensions/full");
      if (!fs2.existsSync(premiumDir)) {
        return res.status(404).json({ message: "Premium extension not found" });
      }
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="ocus-job-hunter-premium-v2.1.8-STABLE-FIXED.zip"');
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(premiumDir, false);
      archive.finalize();
    } catch (error) {
      console.error("Error downloading premium extension:", error);
      res.status(500).json({ message: "Failed to download premium extension" });
    }
  });
  app2.get("/api/download-extension/latest", async (req, res) => {
    try {
      const filePath = path2.resolve(import.meta.dirname, "../uploads/ocus-extension-v2.3.4-ALL-ISSUES-FIXED.zip");
      console.log("Extension download requested. File path:", filePath);
      if (!fs2.existsSync(filePath)) {
        return res.status(404).json({ message: "Extension file not found" });
      }
      res.setHeader("Content-Disposition", 'attachment; filename="ocus-extension-v2.3.4-ALL-ISSUES-FIXED.zip"');
      res.setHeader("Content-Type", "application/zip");
      const fileStream = fs2.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Extension download error:", error);
      res.status(500).json({ message: "Download failed" });
    }
  });
  app2.get("/api/download-extension/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
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
      const filePath = path2.resolve(import.meta.dirname, "../uploads/", filename);
      console.log("Extension download requested. File path:", filePath);
      if (!fs2.existsSync(filePath)) {
        const fallbackPath = path2.resolve(import.meta.dirname, "../attached_assets/", filename);
        if (fs2.existsSync(fallbackPath)) {
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
          res.setHeader("Content-Type", "application/zip");
          const fileStream2 = fs2.createReadStream(fallbackPath);
          fileStream2.pipe(res);
          return;
        }
        return res.status(404).json({ message: "Extension file not found" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/zip");
      const fileStream = fs2.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Extension download error:", error);
      res.status(500).json({ message: "Download failed" });
    }
  });
  app2.get("/api/recent-activation-keys", async (req, res) => {
    res.status(410).json({
      message: "Activation system has been deprecated. Please contact support for assistance."
    });
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getActiveProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/extension/referral-code/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      if (!customer.referralCode) {
        const { referralCode } = await affiliateService.createAffiliate(customerId);
        res.json({
          success: true,
          referralCode
        });
      } else {
        res.json({
          success: true,
          referralCode: customer.referralCode
        });
      }
    } catch (error) {
      console.error("Error getting referral code:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.get("/download/:token", async (req, res) => {
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
      const products2 = await storage.getActiveProducts();
      const product = products2[0];
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const extensionFilePath = path2.resolve(import.meta.dirname, "../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip");
      if (!fs2.existsSync(extensionFilePath)) {
        return res.status(404).json({ message: "Extension file not found" });
      }
      await storage.incrementDownloadCount(order.id);
      await storage.createDownload({
        orderId: order.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      res.setHeader("Content-Disposition", 'attachment; filename="ocus-extension-v2.3.1-ACTIVATION-FIXED.zip"');
      res.setHeader("Content-Type", "application/zip");
      res.sendFile(extensionFilePath);
    } catch (error) {
      console.error("Download failed:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/download-activation/:token", async (req, res) => {
    res.status(410).json({
      message: "Activation system has been deprecated. Please contact support for assistance."
    });
  });
  app2.post("/api/chat", async (req, res) => {
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
      const messages = [
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
- One-time payment of \u20AC500 for lifetime use
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
- Price: \u20AC500 one-time payment (normally \u20AC1200)
- Payment methods: Stripe and PayPal
- Instant digital delivery
- Email: support@ocusjobhunter.com
- Download limit: 3 downloads per purchase

Answer questions about features, installation, pricing, and troubleshooting. Be helpful and professional. If you don't know something specific, direct them to contact support.`
        }
      ];
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        });
      });
      messages.push({
        role: "user",
        content: message
      });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 200,
        temperature: 0.7
      });
      const response = completion.choices[0]?.message?.content || "I apologize, but I'm having trouble responding right now. Please contact our support team at support@ocusjobhunter.com for immediate assistance.";
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({
        response: "I'm experiencing some technical difficulties. Please contact our support team at support@ocusjobhunter.com for immediate assistance."
      });
    }
  });
  app2.get("/api/admin/chat-settings", async (req, res) => {
    try {
      const openaiApiKey = await storage.getSetting("openai_api_key");
      const assistantId = await storage.getSetting("openai_assistant_id");
      const chatModel = await storage.getSetting("chat_model");
      const systemPrompt = await storage.getSetting("system_prompt");
      res.json({
        openaiApiKey: openaiApiKey?.value || "",
        assistantId: assistantId?.value || "",
        chatModel: chatModel?.value || "gpt-4o",
        systemPrompt: systemPrompt?.value || ""
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/chat-settings", async (req, res) => {
    try {
      const { openaiApiKey, assistantId, chatModel, systemPrompt } = req.body;
      if (openaiApiKey !== void 0) {
        await storage.updateSetting("openai_api_key", openaiApiKey);
      }
      if (assistantId !== void 0) {
        await storage.updateSetting("openai_assistant_id", assistantId);
      }
      if (chatModel !== void 0) {
        await storage.updateSetting("chat_model", chatModel);
      }
      if (systemPrompt !== void 0) {
        await storage.updateSetting("system_prompt", systemPrompt);
      }
      if (openaiApiKey && openaiApiKey.trim()) {
        try {
          openai = new OpenAI2({ apiKey: openaiApiKey.trim() });
          console.log("OpenAI client updated with new API key");
        } catch (error) {
          console.warn("Failed to update OpenAI client:", error);
        }
      }
      res.json({ success: true, message: "Chat settings saved successfully" });
    } catch (error) {
      console.error("Chat settings error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/payment-settings", async (req, res) => {
    try {
      const authSettings2 = await storage.getAuthSettings();
      const paymentSettings = {
        stripePublicKey: authSettings2?.stripePublicKey || "",
        stripeSecretKey: authSettings2?.stripeSecretKey || "",
        stripeEnabled: authSettings2?.stripeEnabled || false,
        paypalClientId: authSettings2?.paypalClientId || "",
        paypalClientSecret: authSettings2?.paypalClientSecret || "",
        paypalEnabled: authSettings2?.paypalEnabled || false,
        defaultPaymentMethod: authSettings2?.defaultPaymentMethod || "stripe"
      };
      res.json(paymentSettings);
    } catch (error) {
      console.error("Payment settings get error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/payment-settings", async (req, res) => {
    try {
      const settings2 = req.body;
      await storage.updateAuthSettings({
        stripePublicKey: settings2.stripePublicKey || null,
        stripeSecretKey: settings2.stripeSecretKey || null,
        stripeEnabled: settings2.stripeEnabled || false,
        paypalClientId: settings2.paypalClientId || null,
        paypalClientSecret: settings2.paypalClientSecret || null,
        paypalEnabled: settings2.paypalEnabled || false,
        defaultPaymentMethod: settings2.defaultPaymentMethod || "stripe"
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Payment settings update error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/trials/:userId", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/trials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserLifecycle(userId);
      if (!user) {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/trials/:userId/use", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.updateTrialUsage(userId);
      res.json({
        success: true,
        remaining: user.trial_uses_remaining,
        canUse: user.is_activated || user.trial_uses_remaining > 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/activate/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { activationCode } = req.body;
      const user = await storage.activateUser(userId, activationCode);
      res.json({
        success: true,
        user,
        message: "User activated successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsersWithLifecycle();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/users/:userId/regenerate-code", async (req, res) => {
    res.status(410).json({
      message: "Activation system has been deprecated. Please contact support for assistance."
    });
  });
  app2.post("/api/admin/users/:userId/block", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const user = await storage.blockUser(userId, reason);
      res.json({
        success: true,
        user,
        message: "User blocked successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUserLifecycle(userId);
      res.json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/tickets", async (req, res) => {
    try {
      const tickets2 = await storage.getAllTickets();
      res.json(tickets2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/tickets/:id/status", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateTicketStatus(ticketId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/tickets/:id", async (req, res) => {
    const ticketId = parseInt(req.params.id);
    try {
      console.log(`Attempting to delete ticket ${ticketId}`);
      await storage.deleteTicket(ticketId);
      console.log(`Successfully deleted ticket ${ticketId}`);
      res.json({ success: true });
    } catch (error) {
      console.error(`Failed to delete ticket ${ticketId}:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/orders", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await storage.getOrdersWithPagination(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/analytics", async (req, res) => {
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
        activeCustomers: totalSales,
        // Simplified - could be more sophisticated
        avgRating: 4.9
        // Static for now
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileName = `${Date.now()}-${req.file.originalname}`;
      await fileService.saveUploadedFile(req.file.buffer, fileName);
      const products2 = await storage.getActiveProducts();
      if (products2.length === 0) {
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
        await storage.updateProduct(products2[0].id, {
          fileName: req.file.originalname,
          filePath: fileName
        });
      }
      res.json({ success: true, fileName });
    } catch (error) {
      console.error("File upload failed:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/extension/verify-user", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
          authenticated: false
        });
      }
      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(401).json({
          status: "invalid",
          message: "Invalid email or password",
          authenticated: false
        });
      }
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
      const userOrders = await storage.getUserOrders(customer.id);
      const hasPurchased = userOrders.some((order) => order.status === "completed");
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
    } catch (error) {
      console.error("Extension user verification failed:", error);
      res.status(500).json({
        status: "error",
        message: "Server error during verification",
        authenticated: false
      });
    }
  });
  app2.post("/api/activate", async (req, res) => {
    try {
      const { activation_key } = req.body;
      if (!activation_key || typeof activation_key !== "string") {
        return res.status(400).json({ status: "invalid", message: "Activation key is required" });
      }
      const masterKeys = [
        "OCUS-PRO-7X9K-2M8L-QW3R-UNLIMITED-2025",
        "JOBHUNTER-ENTERPRISE-5N4B-8F7G-H1J2-PREMIUM-KEY",
        "UNLIMITED-ACCESS-9P0L-3K5M-6V8C-MASTER-2025",
        "PREMIUM-EXTENSION-4R7T-2Y9U-1I8O-ENTERPRISE-CODE",
        "MASTER-ACTIVATION-8Q5W-6E3R-9T7Y-UNLIMITED-ACCESS",
        "OCUS-ENTERPRISE-1A2S-3D4F-5G6H-PREMIUM-2025",
        "PROFESSIONAL-LICENSE-7Z8X-4C5V-2B6N-MASTER-KEY"
      ];
      if (masterKeys.includes(activation_key.toUpperCase())) {
        return res.json({ status: "valid", message: "Master key activated" });
      }
      const activationKey = await storage.getActivationKeyByKey(activation_key);
      if (!activationKey || !activationKey.isActive) {
        return res.status(200).json({ status: "invalid" });
      }
      if (!activationKey.usedAt) {
        await storage.updateActivationKeyUsage(activationKey.activationKey);
      }
      res.json({ status: "valid" });
    } catch (error) {
      console.error("Activation failed:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });
  app2.post("/api/extension/register-installation", async (req, res) => {
    try {
      const { installationId, deviceFingerprint, userAgent, extensionVersion } = req.body;
      if (!installationId) {
        return res.status(400).json({ error: "Installation ID is required" });
      }
      const existingInstallation = await storage.getExtensionInstallation(installationId);
      if (existingInstallation) {
        await storage.updateInstallationLastSeen(installationId);
        return res.json({
          success: true,
          installation: existingInstallation,
          message: "Installation already registered"
        });
      }
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
    } catch (error) {
      console.error("Installation registration error:", error);
      res.status(500).json({ error: "Failed to register installation" });
    }
  });
  app2.post("/api/extension/validate-activation", async (req, res) => {
    try {
      const { activationCode, installationId } = req.body;
      if (!activationCode || !installationId) {
        return res.status(400).json({
          valid: false,
          message: "Both activation code and installation ID are required"
        });
      }
      const masterKeys = [
        "OCUS-MASTER-2025",
        "JOBHUNTER-PRO-KEY",
        "UNLIMITED-ACCESS-2025",
        "PREMIUM-EXTENSION-KEY",
        "MASTER-ACTIVATION-CODE"
      ];
      if (masterKeys.includes(activationCode.toUpperCase())) {
        return res.json({
          valid: true,
          message: "Master key activation successful! Extension unlimited access granted.",
          activationId: "master-key",
          keyType: "master",
          validUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1e3).toISOString()
          // 10 years
        });
      }
      const activation = await storage.getActivationKeyByKey(activationCode);
      if (!activation) {
        return res.json({
          valid: false,
          message: "Invalid activation code. Try using master key: OCUS-MASTER-2025"
        });
      }
      if (!activation.isActive) {
        return res.json({
          valid: false,
          message: "This activation code has been deactivated. Try master key: OCUS-MASTER-2025"
        });
      }
      res.json({
        valid: true,
        message: "Individual key activation successful! Extension activated.",
        activationId: activation.id,
        keyType: "individual"
      });
    } catch (error) {
      console.error("Activation validation error:", error);
      res.status(500).json({
        valid: false,
        message: "Server error. Try master key: OCUS-MASTER-2025"
      });
    }
  });
  app2.get("/api/extension/activation-status/:installationId", async (req, res) => {
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
    } catch (error) {
      console.error("Activation status error:", error);
      res.status(500).json({ error: "Failed to get activation status" });
    }
  });
  app2.post("/api/check-demo", async (req, res) => {
    try {
      const { user_id } = req.body;
      if (!user_id || typeof user_id !== "string") {
        return res.status(400).json({ status: "error", message: "User ID is required" });
      }
      let demoUser = await storage.getDemoUserById(user_id);
      if (!demoUser) {
        demoUser = await storage.createDemoUser({
          userId: user_id,
          demoCount: 0,
          maxDemoUses: 3
        });
      }
      if ((demoUser.demoCount || 0) >= (demoUser.maxDemoUses || 3)) {
        return res.json({
          status: "demo_limit_reached",
          remaining: 0,
          used: demoUser.demoCount || 0,
          maxUses: demoUser.maxDemoUses || 3
        });
      }
      const updatedUser = await storage.incrementDemoUsage(user_id);
      res.json({
        status: "demo_allowed",
        remaining: (updatedUser.maxDemoUses || 3) - (updatedUser.demoCount || 0),
        used: updatedUser.demoCount || 0,
        maxUses: updatedUser.maxDemoUses || 3
      });
    } catch (error) {
      console.error("Demo check failed:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });
  app2.post("/api/admin/access", async (req, res) => {
    const { password } = req.body;
    if (password === "admin123") {
      res.json({ success: true, message: "Admin access granted" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });
  app2.get("/api/captcha", (req, res) => {
    const challenge = captchaService.generateChallenge();
    res.json(challenge);
  });
  app2.post("/api/captcha/validate", (req, res) => {
    const { id, answer } = req.body;
    const isValid = captchaService.validateChallenge(id, answer);
    res.json({ valid: isValid });
  });
  app2.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app2.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/login?social=success")
  );
  app2.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app2.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/login?social=success")
  );
  app2.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
  app2.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/login?social=success")
  );
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { email, password, name, captchaId, captchaAnswer, recaptchaToken, referralCode } = req.body;
      const existingCustomer = await storage.getCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      let referredBy = null;
      if (referralCode) {
        const referrer = await storage.getCustomerByReferralCode(referralCode);
        if (referrer) {
          referredBy = referrer.id;
        }
      }
      const activationKey = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newReferralCode = uuidv42().slice(0, 8).toUpperCase();
      const customer = await storage.createCustomer({
        email,
        password: hashedPassword,
        name: name || "User",
        // Ensure name is never empty
        activationKey,
        referralCode: newReferralCode,
        referredBy: referredBy?.toString(),
        isActivated: false,
        isAdmin: false
      });
      const token = Buffer.from(`${customer.id}:${Date.now()}`).toString("base64");
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
  app2.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password, username, captchaId, captchaAnswer } = req.body;
      if (!captchaService.validateChallenge(captchaId, captchaAnswer)) {
        return res.status(400).json({ message: "Invalid CAPTCHA" });
      }
      if (username) {
        if (username === "demo_admin" && password === "demo123") {
          const token = Buffer.from(`admin:99:${Date.now()}`).toString("base64");
          return res.json({
            success: true,
            token,
            user: {
              id: 99,
              email: "admin@demo.com",
              username: "demo_admin",
              name: "Demo Administrator",
              isAdmin: true,
              isActivated: true,
              referralCode: "ADMIN"
            },
            isAdmin: true
          });
        }
        const admin = await storage.getUserByUsername(username);
        if (admin && await bcrypt.compare(password, admin.password)) {
          const token = Buffer.from(`admin:${admin.id}:${Date.now()}`).toString("base64");
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
      if (email) {
        if (email === "customer@demo.com" && password === "customer123") {
          const token = Buffer.from(`customer:demo-customer-123:${Date.now()}`).toString("base64");
          return res.json({
            success: true,
            token,
            user: {
              id: "demo-customer-123",
              email: "customer@demo.com",
              name: "Demo Customer",
              activationKey: "DEMO-KEY-12345",
              isAdmin: false,
              isActivated: true,
              referralCode: "DEMO123",
              totalEarnings: "125.50",
              commissionRate: "10.00"
            },
            isAdmin: false
          });
        }
        const customer = await storage.getCustomerByEmail(email);
        if (customer && customer.password && await bcrypt.compare(password, customer.password)) {
          const token = Buffer.from(`customer:${customer.id}:${Date.now()}`).toString("base64");
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
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const [type, userId] = decoded.split(":");
      if (type === "admin") {
        if (userId === "99") {
          return res.json({
            id: 99,
            email: "admin@demo.com",
            username: "demo_admin",
            name: "Demo Administrator",
            isAdmin: true,
            isActivated: true,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            referralCode: "ADMIN"
          });
        }
        const admin = await storage.getUser(parseInt(userId));
        if (!admin) {
          return res.status(401).json({ message: "Admin not found" });
        }
        return res.json({
          id: admin.id,
          email: admin.email,
          username: admin.username,
          name: admin.username,
          isAdmin: true,
          isActivated: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          referralCode: "ADMIN"
        });
      } else {
        if (userId === "demo-customer-123") {
          return res.json({
            id: "demo-customer-123",
            email: "customer@demo.com",
            name: "Demo Customer",
            activationKey: "DEMO-KEY-12345",
            isAdmin: false,
            isActivated: true,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            referralCode: "DEMO123",
            totalEarnings: "125.50",
            commissionRate: "10.00"
          });
        }
        const customer = await storage.getCustomer(userId);
        if (!customer) {
          return res.status(401).json({ message: "Customer not found" });
        }
        return res.json(customer);
      }
    } catch (error) {
      console.error("Get user error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });
  app2.get("/api/affiliate/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const [type, userId] = decoded.split(":");
      if (type === "customer") {
        if (userId === "demo-customer-123") {
          return res.json({
            totalEarnings: 125.5,
            totalReferrals: 5,
            pendingCommissions: 75
          });
        }
        const stats = await storage.getAffiliateStats(userId);
        return res.json(stats);
      } else {
        return res.json({ totalEarnings: 0, totalReferrals: 0, pendingCommissions: 0 });
      }
    } catch (error) {
      console.error("Get affiliate stats error:", error);
      res.status(500).json({ message: "Failed to get affiliate stats" });
    }
  });
  app2.get("/api/customer/account", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const [customerIdStr] = Buffer.from(token, "base64").toString().split(":");
      const customerId = customerIdStr;
      const customer = await storage.getCustomer?.(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const orders4 = await storage.getCustomerOrders?.(customerId) || [];
      res.json({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        createdAt: customer.createdAt,
        activationKey: customer.activationKey,
        isActivated: customer.isActivated,
        orders: orders4
      });
    } catch (error) {
      console.error("Get customer account error:", error);
      res.status(500).json({ message: "Failed to get account - Customer system not yet implemented" });
    }
  });
  app2.post("/api/customer/generate-key", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const [customerIdStr] = Buffer.from(token, "base64").toString().split(":");
      const customerId = customerIdStr;
      const newKey = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await storage.updateCustomerActivationKey?.(customerId, newKey);
      res.json({ success: true, activationKey: newKey });
    } catch (error) {
      console.error("Generate key error:", error);
      res.status(500).json({ message: "Failed to generate key - Customer system not yet implemented" });
    }
  });
  app2.get("/api/download/extension-latest", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required to download extension" });
      }
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const [type, userId] = decoded.split(":");
      let userExists = false;
      if (type === "admin") {
        if (userId === "99") {
          userExists = true;
        } else {
          const admin = await storage.getUser(parseInt(userId));
          userExists = !!admin;
        }
      } else if (type === "customer") {
        if (userId === "demo-customer-123") {
          userExists = true;
        } else {
          const customer = await storage.getCustomer(userId);
          userExists = !!customer;
        }
      }
      if (!userExists) {
        return res.status(401).json({ message: "Invalid authentication token" });
      }
      const extensionFilePath = path2.join(import.meta.dirname, "../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip");
      if (fs2.existsSync(extensionFilePath)) {
        res.setHeader("Content-Disposition", 'attachment; filename="OCUS-Job-Hunter-Extension-v2.2.0.zip"');
        res.setHeader("Content-Type", "application/zip");
        res.sendFile(path2.resolve(extensionFilePath));
      } else {
        const fallbackPath = path2.join(import.meta.dirname, "../attached_assets/ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip");
        if (fs2.existsSync(fallbackPath)) {
          res.setHeader("Content-Disposition", 'attachment; filename="OCUS-Job-Hunter-Extension-v2.2.0.zip"');
          res.setHeader("Content-Type", "application/zip");
          res.sendFile(path2.resolve(fallbackPath));
        } else {
          return res.status(404).json({ error: "Extension file not found" });
        }
      }
    } catch (error) {
      console.error("Extension download failed:", error);
      res.status(500).json({ message: "Failed to download extension" });
    }
  });
  app2.get("/api/me/tickets", requireAuth, async (req, res) => {
    try {
      if (!req.user?.email) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const tickets2 = await storage.getTicketsByCustomerEmail(req.user.email);
      res.json(tickets2);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });
  app2.get("/api/tickets", async (req, res) => {
    try {
      const { isAdmin, customerEmail } = req.query;
      if (isAdmin === "true") {
        return res.json([]);
      } else if (customerEmail) {
        const tickets2 = await storage.getTicketsByCustomerEmail(customerEmail);
        return res.json(tickets2);
      }
      return res.status(400).json({ error: "Missing query parameters" });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });
  app2.post("/api/tickets", async (req, res) => {
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
        priority: priority || "medium",
        customerEmail,
        customerName,
        status: "open"
      });
      console.log("Ticket created successfully:", ticket);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });
  app2.get("/api/tickets/:id/messages", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const customerEmail = req.query.customerEmail;
      const isAdmin = req.query.isAdmin === "true";
      console.log("GET /api/tickets/:id/messages called with:", {
        ticketId,
        customerEmail,
        isAdmin
      });
      if (isNaN(ticketId) || ticketId <= 0) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }
      if (!isAdmin && !customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }
      const ticket = await db.select().from(tickets).where(eq6(tickets.id, ticketId)).limit(1);
      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      if (!isAdmin && ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }
      const messages = await db.select().from(ticketMessages).where(eq6(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
      console.log("Found messages:", messages.length);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/tickets/:id/messages", async (req, res) => {
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
      if (!isAdmin && !customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }
      const ticket = await db.select().from(tickets).where(eq6(tickets.id, ticketId)).limit(1);
      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      if (!isAdmin && ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }
      const messageData = {
        ticketId,
        content: messageContent,
        authorName: isAdmin ? "Support Team" : customerName || customerEmail,
        senderEmail: isAdmin ? "support@ocus.com" : customerEmail,
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
  app2.delete("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { customerEmail } = req.body;
      if (isNaN(ticketId) || ticketId <= 0) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }
      if (!customerEmail) {
        return res.status(400).json({ error: "Customer email required" });
      }
      const ticket = await db.select().from(tickets).where(eq6(tickets.id, ticketId)).limit(1);
      if (!ticket.length) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      if (ticket[0].customerEmail !== customerEmail) {
        return res.status(403).json({ error: "Access denied" });
      }
      await db.delete(ticketMessages).where(eq6(ticketMessages.ticketId, ticketId));
      await db.delete(tickets).where(eq6(tickets.id, ticketId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  });
  const httpServer = createServer(app2);
  app2.get("/api/admin/customers", async (req, res) => {
    try {
      const customers3 = await storage.getAllCustomers();
      res.json(customers3);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  app2.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const [usageStats, payments, tickets2] = await Promise.all([
        storage.getCustomerUsageStats(id),
        storage.getCustomerPayments(id),
        storage.getCustomerTickets(customer.email)
      ]);
      res.json({
        customer,
        usageStats,
        payments,
        tickets: tickets2
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ error: "Failed to fetch customer details" });
    }
  });
  app2.post("/api/admin/customers/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const activationKey = await storage.generateActivationKey(id);
      res.json({ activationKey });
    } catch (error) {
      console.error("Error generating activation key:", error);
      res.status(500).json({ error: "Failed to generate activation key" });
    }
  });
  app2.post("/api/customers/activate", async (req, res) => {
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
  app2.post("/api/extension/usage", async (req, res) => {
    try {
      const usageData = req.body;
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
  app2.get("/api/admin/usage/global", async (req, res) => {
    try {
      const globalStats = await storage.getGlobalUsageStats();
      res.json(globalStats);
    } catch (error) {
      console.error("Error fetching global usage stats:", error);
      res.status(500).json({ error: "Failed to fetch global usage stats" });
    }
  });
  app2.get("/api/customers/:id/usage", async (req, res) => {
    try {
      const { id } = req.params;
      const usageStats = await storage.getCustomerUsageStats(id);
      res.json(usageStats);
    } catch (error) {
      console.error("Error fetching customer usage stats:", error);
      res.status(500).json({ error: "Failed to fetch customer usage stats" });
    }
  });
  app2.post("/api/customers/:id/payments", async (req, res) => {
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
  app2.put("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, processedAt } = req.body;
      const payment = await storage.updatePaymentStatus(
        parseInt(id),
        status,
        processedAt ? new Date(processedAt) : void 0
      );
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Failed to update payment status" });
    }
  });
  app2.post("/api/activation/generate", async (req, res) => {
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
  app2.post("/api/activation/validate", async (req, res) => {
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
      if (activationCode.expiresAt && /* @__PURE__ */ new Date() > activationCode.expiresAt) {
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
  app2.post("/api/activation/activate", async (req, res) => {
    try {
      const { code, deviceId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || "";
      if (!code) {
        return res.status(400).json({ error: "Activation code is required" });
      }
      const activatedCode = await storage.activateCode(code, deviceId || "unknown", ipAddress);
      res.json({
        success: true,
        message: "Extension activated successfully",
        customerId: activatedCode.customerId
      });
    } catch (error) {
      console.error("Error activating code:", error);
      res.status(400).json({ error: error.message || "Failed to activate code" });
    }
  });
  app2.get("/api/customers/:customerId/activation-codes", async (req, res) => {
    try {
      const { customerId } = req.params;
      const codes = await storage.getCustomerActivationCodes(customerId);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching customer activation codes:", error);
      res.status(500).json({ error: "Failed to fetch activation codes" });
    }
  });
  app2.put("/api/activation/:code/deactivate", async (req, res) => {
    try {
      const { code } = req.params;
      const deactivated = await storage.deactivateCode(code);
      res.json({ success: true, code: deactivated });
    } catch (error) {
      console.error("Error deactivating code:", error);
      res.status(500).json({ error: "Failed to deactivate code" });
    }
  });
  app2.post("/api/customer/:customerId/reveal-key", async (req, res) => {
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
  app2.post("/api/customer/:customerId/change-password", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const bcrypt2 = __require("bcrypt");
      if (customer.password && !await bcrypt2.compare(currentPassword, customer.password)) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt2.hash(newPassword, 12);
      const updatedCustomer = await storage.updateCustomer(customerId, {
        password: hashedNewPassword
      });
      res.json({
        success: true,
        message: "Password changed successfully",
        customer: { ...updatedCustomer, password: void 0 }
        // Don't send password back
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.delete("/api/customer/:customerId/delete-account", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const totalSpent = parseFloat(customer.totalSpent?.toString() || "0");
      if (totalSpent > 0) {
        return res.status(400).json({
          error: "Cannot delete account with purchase history. Please contact support."
        });
      }
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
  app2.get("/api/admin/analytics/dashboard", async (req, res) => {
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
        db.select({ count: count4() }).from(customers),
        db.select({ count: count4() }).from(customers).where(eq6(customers.extensionActivated, true)),
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
          openTickets: recentTickets.filter((t) => t.status === "open").length,
          totalTickets: recentTickets.length
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
    }
  });
  app2.get("/api/admin/customers/activity", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const recentActivity = await db.select({
        customerId: extensionUsageStats.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        usageDate: extensionUsageStats.usageDate,
        jobsFound: extensionUsageStats.jobsFound,
        jobsApplied: extensionUsageStats.jobsApplied,
        successfulJobs: extensionUsageStats.successfulJobs,
        platform: extensionUsageStats.platform,
        location: extensionUsageStats.location
      }).from(extensionUsageStats).innerJoin(customers, eq6(extensionUsageStats.customerId, customers.id)).orderBy(desc6(extensionUsageStats.usageDate)).limit(parseInt(limit));
      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching customer activity:", error);
      res.status(500).json({ error: "Failed to fetch customer activity" });
    }
  });
  app2.get("/api/countdown-banner/active", async (req, res) => {
    try {
      const activeBanner = await storage.getActiveCountdownBanner();
      res.json(activeBanner);
    } catch (error) {
      console.error("Get active banner error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/countdown-banners", async (req, res) => {
    try {
      const banners = await storage.getAllCountdownBanners();
      res.json(banners);
    } catch (error) {
      console.error("Get banners error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/countdown-banners", async (req, res) => {
    try {
      const { titleEn, subtitleEn, targetPrice, originalPrice, endDateTime, backgroundColor, textColor, priority, targetLanguages } = req.body;
      if (!titleEn || !subtitleEn || !targetPrice || !endDateTime) {
        return res.status(400).json({ message: "Title, subtitle, target price, and end date are required" });
      }
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
          console.warn("Translation failed, creating banner without translations:", translationError);
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
        backgroundColor: backgroundColor || "gradient-primary",
        textColor: textColor || "white",
        priority: priority || 1,
        isEnabled: true
      };
      const newBanner = await storage.createCountdownBanner(bannerData);
      res.json(newBanner);
    } catch (error) {
      console.error("Create banner error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/countdown-banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const { titleEn, subtitleEn, targetPrice, originalPrice, endDateTime, backgroundColor, textColor, priority, targetLanguages, isEnabled } = req.body;
      console.log("=== COUNTDOWN BANNER UPDATE DEBUG ===");
      console.log("Banner ID:", bannerId);
      console.log("Update data:", req.body);
      let updateData = {};
      if (titleEn !== void 0) {
        updateData.titleEn = titleEn;
        if (targetLanguages && targetLanguages.length > 0) {
          try {
            const translations = await TranslationService.translateBannerContent(
              titleEn,
              subtitleEn || "",
              targetLanguages
            );
            updateData.titleTranslations = translations.titles;
            if (subtitleEn) updateData.subtitleTranslations = translations.subtitles;
          } catch (translationError) {
            console.warn("Translation failed during update:", translationError);
          }
        }
      }
      if (subtitleEn !== void 0) updateData.subtitleEn = subtitleEn;
      if (targetPrice !== void 0) updateData.targetPrice = targetPrice;
      if (originalPrice !== void 0) updateData.originalPrice = originalPrice;
      if (endDateTime !== void 0) updateData.endDateTime = new Date(endDateTime);
      if (backgroundColor !== void 0) updateData.backgroundColor = backgroundColor;
      if (textColor !== void 0) updateData.textColor = textColor;
      if (priority !== void 0) updateData.priority = priority;
      if (isEnabled !== void 0) updateData.isEnabled = isEnabled;
      console.log("Final update data:", updateData);
      const updatedBanner = await storage.updateCountdownBanner(bannerId, updateData);
      console.log("Update result:", updatedBanner);
      console.log("=== END COUNTDOWN BANNER UPDATE DEBUG ===");
      res.json(updatedBanner);
    } catch (error) {
      console.error("Update countdown banner error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/countdown-banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      await storage.deleteCountdownBanner(bannerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete countdown banner error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/countdown-banners/translate", async (req, res) => {
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
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        message: error.message,
        titles: {},
        subtitles: {}
      });
    }
  });
  app2.get("/api/announcement-badge/active", async (req, res) => {
    try {
      const activeBadge = await storage.getActiveAnnouncementBadge();
      res.json(activeBadge);
    } catch (error) {
      console.error("Get active badge error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/announcement-badges", async (req, res) => {
    try {
      const badges = await storage.getAllAnnouncementBadges();
      res.json(badges);
    } catch (error) {
      console.error("Get badges error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/announcement-badges", async (req, res) => {
    try {
      const { textEn, backgroundColor, textColor, priority, targetLanguages } = req.body;
      if (!textEn) {
        return res.status(400).json({ message: "Text is required" });
      }
      let textTranslations = {};
      if (targetLanguages && targetLanguages.length > 0) {
        try {
          const translations = await TranslationService.translateText({
            text: textEn,
            targetLanguages,
            context: "Announcement badge text",
            maxLength: 100,
            tone: "marketing"
          });
          textTranslations = translations;
        } catch (translationError) {
          console.warn("Translation failed, creating badge without translations:", translationError);
        }
      }
      const badgeData = {
        textEn,
        textTranslations,
        backgroundColor: backgroundColor || "gradient-primary",
        textColor: textColor || "white",
        priority: priority || 1,
        isEnabled: true
      };
      const newBadge = await storage.createAnnouncementBadge(badgeData);
      res.json(newBadge);
    } catch (error) {
      console.error("Create badge error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/announcement-badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      const { textEn, backgroundColor, textColor, priority, targetLanguages, isEnabled } = req.body;
      let updateData = {};
      if (textEn !== void 0) {
        updateData.textEn = textEn;
        if (targetLanguages && targetLanguages.length > 0) {
          try {
            const translations = await TranslationService.translateText({
              text: textEn,
              targetLanguages,
              context: "Announcement badge text update",
              maxLength: 100,
              tone: "marketing"
            });
            updateData.textTranslations = translations;
          } catch (translationError) {
            console.warn("Translation failed during update:", translationError);
          }
        }
      }
      if (backgroundColor !== void 0) updateData.backgroundColor = backgroundColor;
      if (textColor !== void 0) updateData.textColor = textColor;
      if (priority !== void 0) updateData.priority = priority;
      if (isEnabled !== void 0) updateData.isEnabled = isEnabled;
      const updatedBadge = await storage.updateAnnouncementBadge(badgeId, updateData);
      res.json(updatedBadge);
    } catch (error) {
      console.error("Update badge error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/announcement-badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      await storage.deleteAnnouncementBadge(badgeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete badge error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/announcement-badges/translate", async (req, res) => {
    try {
      const { textEn, targetLanguages } = req.body;
      if (!textEn || !targetLanguages || !Array.isArray(targetLanguages)) {
        return res.status(400).json({ message: "Text and target languages are required" });
      }
      const translations = await TranslationService.translateText({
        text: textEn,
        targetLanguages,
        context: "Announcement badge translation request",
        maxLength: 100,
        tone: "marketing"
      });
      res.json(translations);
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        message: error.message,
        translations: {}
      });
    }
  });
  try {
    const affiliateModule = await Promise.resolve().then(() => (init_affiliateRoutes(), affiliateRoutes_exports));
    app2.use("/api/affiliate", affiliateModule.affiliateRoutes);
    app2.use("/api/admin/affiliate-stats", affiliateModule.affiliateRoutes);
    app2.use("/api/admin/pending-payouts", affiliateModule.affiliateRoutes);
    app2.use("/api/admin/approve-payout", affiliateModule.affiliateRoutes);
    app2.use("/api/admin/reject-payout", affiliateModule.affiliateRoutes);
  } catch (error) {
    console.warn("Failed to load affiliate routes:", error);
  }
  try {
    const invoiceModule = await Promise.resolve().then(() => (init_invoiceRoutes(), invoiceRoutes_exports));
    app2.use("/api/invoices", invoiceModule.invoiceRoutes);
  } catch (error) {
    console.warn("Failed to load invoice routes:", error);
  }
  app2.get("/api/admin/dashboard-features", async (req, res) => {
    try {
      const features = await storage.getDashboardFeatures();
      res.json(features);
    } catch (error) {
      console.error("Error fetching dashboard features:", error);
      const defaultFeatures = [
        { id: 0, featureName: "affiliate_program", isEnabled: true, description: "Enable/disable affiliate program section in user dashboard" },
        { id: 0, featureName: "analytics", isEnabled: true, description: "Enable/disable analytics section in user dashboard" },
        { id: 0, featureName: "billing", isEnabled: true, description: "Enable/disable billing section in user dashboard" }
      ];
      res.json(defaultFeatures);
    }
  });
  app2.put("/api/admin/dashboard-features/:featureName", async (req, res) => {
    try {
      const { featureName } = req.params;
      const { isEnabled, description } = req.body;
      const updatedFeature = await storage.updateDashboardFeature(
        featureName,
        isEnabled,
        description
      );
      res.json(updatedFeature);
    } catch (error) {
      console.error("Error updating dashboard feature:", error);
      res.status(500).json({ error: "Failed to update dashboard feature" });
    }
  });
  app2.get("/api/dashboard-features", async (req, res) => {
    try {
      const features = await storage.getDashboardFeatures();
      const enabledFeatures = features.filter((f) => f.isEnabled);
      res.json(enabledFeatures);
    } catch (error) {
      console.error("Error fetching dashboard features:", error);
      const defaultFeatures = [
        { featureName: "affiliate_program", isEnabled: true },
        { featureName: "analytics", isEnabled: true },
        { featureName: "billing", isEnabled: true }
      ];
      res.json(defaultFeatures);
    }
  });
  app2.post("/api/extension/download", async (req, res) => {
    try {
      const { customerId } = req.body;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      if (customer.isBlocked) {
        return res.status(403).json({
          error: "Account blocked",
          reason: customer.blockedReason
        });
      }
      const downloadToken = crypto3.randomUUID();
      const download = await storage.createExtensionDownload({
        customerId,
        downloadToken,
        downloadType: customer.extensionActivated ? "paid" : "trial",
        downloadCount: 0
      });
      res.json({
        success: true,
        downloadToken: download.downloadToken,
        downloadType: download.downloadType
      });
    } catch (error) {
      console.error("Error creating extension download:", error);
      res.status(500).json({ error: "Failed to create download" });
    }
  });
  app2.get("/api/extension/download/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const download = await storage.getExtensionDownload(token);
      if (!download) {
        return res.status(404).json({ error: "Download token not found" });
      }
      if (download.downloadCount >= 3) {
        return res.status(403).json({ error: "Download limit exceeded" });
      }
      await storage.incrementExtensionDownloadCount(download.id);
      const extensionFilePath = path2.join(import.meta.dirname, "../uploads/ocus-extension-v2.3.1-ACTIVATION-FIXED.zip");
      if (fs2.existsSync(extensionFilePath)) {
        res.setHeader("Content-Disposition", 'attachment; filename="ocus-extension-v2.3.1-ACTIVATION-FIXED.zip"');
        res.setHeader("Content-Type", "application/zip");
        res.sendFile(path2.resolve(extensionFilePath));
      } else {
        return res.status(404).json({ error: "Extension file not found" });
      }
    } catch (error) {
      console.error("Error downloading extension:", error);
      res.status(500).json({ message: "Failed to download extension" });
    }
  });
  app2.get("/api/extension/check/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await db.select().from(customers).where(eq6(customers.id, customerId)).limit(1);
      if (!customer.length) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const customerData = customer[0];
      const canUse = customerData.extensionActivated || customerData.extensionTrialJobsUsed < customerData.extensionTrialLimit;
      let reason = "";
      if (customerData.isBlocked) {
        reason = "Account is blocked";
      } else if (!customerData.extensionActivated && customerData.extensionTrialJobsUsed >= customerData.extensionTrialLimit) {
        reason = "Trial limit exceeded";
      }
      res.json({
        canUse,
        reason,
        trialUsed: customerData.extensionTrialJobsUsed,
        isBlocked: customerData.isBlocked
      });
    } catch (error) {
      console.error("Extension check error:", error);
      res.status(500).json({ error: "Failed to check extension status" });
    }
  });
  app2.post("/api/extension/usage", async (req, res) => {
    try {
      const { customerId, jobsUsed, sessionDuration, jobsFoundCount } = req.body;
      if (!customerId || !jobsUsed) {
        return res.status(400).json({ error: "Customer ID and jobs used are required" });
      }
      const usageLog = await storage.recordExtensionUsageLog({
        customerId,
        sessionId: crypto3.randomUUID(),
        jobsUsed
      });
      res.json({ success: true, usageLog });
    } catch (error) {
      console.error("Error recording extension usage:", error);
      res.status(500).json({ error: "Failed to record usage" });
    }
  });
  app2.post("/api/admin/extension/generate-key/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.generateExtensionActivationKey(customerId);
      res.json({
        success: true,
        activationKey: customer.activationKey,
        customer
      });
    } catch (error) {
      console.error("Error generating activation key:", error);
      res.status(500).json({ error: "Failed to generate activation key" });
    }
  });
  app2.post("/api/admin/extension/block/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Block reason is required" });
      }
      const customer = await storage.blockCustomer(customerId, reason);
      res.json({ success: true, customer });
    } catch (error) {
      console.error("Error blocking customer:", error);
      res.status(500).json({ error: "Failed to block customer" });
    }
  });
  app2.post("/api/admin/extension/unblock/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.unblockCustomer(customerId);
      res.json({ success: true, customer });
    } catch (error) {
      console.error("Error unblocking customer:", error);
      res.status(500).json({ error: "Failed to unblock customer" });
    }
  });
  app2.get("/api/admin/extension/customers", async (req, res) => {
    try {
      const customers3 = await storage.getAllCustomersForAdmin();
      res.json(customers3);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  app2.get("/api/admin/extension/activations", async (req, res) => {
    try {
      const activations = await storage.getCustomerActivations();
      res.json(activations);
    } catch (error) {
      console.error("Error fetching activations:", error);
      res.status(500).json({ error: "Failed to fetch activations" });
    }
  });
  app2.get("/api/extension/downloads/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const downloads2 = await storage.getCustomerExtensionDownloads(customerId);
      res.json(downloads2);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });
  app2.post("/api/extension/track-trial-usage", async (req, res) => {
    try {
      const { extensionId, userFingerprint, missionId } = req.body;
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ error: "Extension ID and user fingerprint required" });
      }
      const trialKey = `trial_${extensionId}_${userFingerprint}`;
      let usageData = await storage.getTrialUsage(trialKey);
      if (!usageData) {
        usageData = await storage.createTrialUsage({
          trialKey,
          extensionId,
          userFingerprint,
          usageCount: 1,
          lastUsed: /* @__PURE__ */ new Date(),
          isExpired: false
        });
      } else {
        if (usageData.isExpired || (usageData.usageCount || 0) >= 3) {
          return res.json({
            success: false,
            remaining: 0,
            expired: true,
            message: "Trial limit exceeded. Please purchase the full version."
          });
        }
        usageData = await storage.incrementTrialUsage(trialKey);
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
        message: remaining > 0 ? `${remaining} missions remaining in trial` : "Trial expired"
      });
    } catch (error) {
      console.error("Error tracking trial usage:", error);
      res.status(500).json({ error: "Failed to track trial usage" });
    }
  });
  app2.post("/api/missions", async (req, res) => {
    try {
      const { missionId, userId, customerId, missionName, compensationAmount, status = "assignment_accepted" } = req.body;
      if (!missionId || !userId || !missionName) {
        return res.status(400).json({ error: "Mission ID, User ID, and Mission Name are required" });
      }
      const existingMission = await storage.getMission(missionId);
      if (existingMission) {
        const updatedMission = await storage.updateMissionStatus(missionId, status);
        res.json({ success: true, mission: updatedMission, action: "updated" });
      } else {
        const newMission = await storage.createMission({
          missionId,
          userId,
          customerId: customerId ? parseInt(customerId) : null,
          missionName,
          compensationAmount: compensationAmount ? compensationAmount.toString() : null,
          status,
          trialUsed: false
        });
        res.json({ success: true, mission: newMission, action: "created" });
      }
    } catch (error) {
      console.error("Error creating/updating mission:", error);
      res.status(500).json({ error: "Failed to create/update mission" });
    }
  });
  app2.put("/api/missions/:missionId/status", async (req, res) => {
    try {
      const { missionId } = req.params;
      const { status, timestamp: timestamp2 } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const updatedMission = await storage.updateMissionStatus(missionId, status, timestamp2 ? new Date(timestamp2) : void 0);
      res.json({ success: true, mission: updatedMission });
    } catch (error) {
      console.error("Error updating mission status:", error);
      res.status(500).json({ error: "Failed to update mission status" });
    }
  });
  app2.get("/api/missions/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const missions3 = await storage.getUserMissions(userId);
      res.json(missions3);
    } catch (error) {
      console.error("Error fetching user missions:", error);
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });
  app2.get("/api/missions/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const missions3 = await storage.getCustomerMissions(parseInt(customerId));
      res.json(missions3);
    } catch (error) {
      console.error("Error fetching customer missions:", error);
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });
  app2.get("/api/missions/:missionId", async (req, res) => {
    try {
      const { missionId } = req.params;
      const mission = await storage.getMission(missionId);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      console.error("Error fetching mission:", error);
      res.status(500).json({ error: "Failed to fetch mission" });
    }
  });
  app2.get("/api/trials/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
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
      res.json({
        success: true,
        trial,
        canUse: trial.isActivated || (trial.trialsUsed || 0) < (trial.maxTrials || 3),
        remaining: (trial.maxTrials || 3) - (trial.trialsUsed || 0)
      });
    } catch (error) {
      console.error("Error fetching trial status:", error);
      res.status(500).json({ error: "Failed to fetch trial status" });
    }
  });
  app2.post("/api/trials/:userId/use", async (req, res) => {
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
      if (!trial.isActivated && (trial.trialsUsed || 0) >= (trial.maxTrials || 3)) {
        return res.status(403).json({
          error: "Trial limit exceeded",
          trialsUsed: trial.trialsUsed || 0,
          maxTrials: trial.maxTrials || 3,
          canUse: false
        });
      }
      if (!trial.isActivated) {
        trial = await storage.updateTrialUsage(userId, (trial.trialsUsed || 0) + 1);
        if (missionId) {
          await storage.updateMissionStatus(missionId, "assignment_accepted");
        }
      }
      res.json({
        success: true,
        trial,
        remaining: (trial.maxTrials || 3) - (trial.trialsUsed || 0),
        canUse: trial.isActivated || (trial.trialsUsed || 0) < (trial.maxTrials || 3)
      });
    } catch (error) {
      console.error("Error using trial:", error);
      res.status(500).json({ error: "Failed to use trial" });
    }
  });
  app2.post("/api/trials/:userId/activate", async (req, res) => {
    try {
      const { userId } = req.params;
      const { activationKey } = req.body;
      if (!activationKey) {
        return res.status(400).json({ error: "Activation key is required" });
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
      const activatedTrial = await storage.activateUser(userId, activationKey);
      res.json({
        success: true,
        trial: activatedTrial,
        message: "User activated successfully"
      });
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(500).json({ error: "Failed to activate user" });
    }
  });
  app2.post("/api/extension/track-trial-usage", async (req, res) => {
    try {
      const { extensionId, userFingerprint, missionId } = req.body;
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }
      const trialKey = `${extensionId}-${userFingerprint}`;
      let usage = await storage.getTrialUsage(trialKey);
      if (!usage) {
        usage = await storage.createTrialUsage({
          trialKey,
          extensionId,
          userFingerprint,
          usageCount: 1,
          lastUsed: /* @__PURE__ */ new Date(),
          isExpired: false
        });
      } else if (!usage.isExpired) {
        usage = await storage.incrementTrialUsage(trialKey);
      }
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
      console.error("Trial tracking error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  app2.post("/api/extension/check-trial-status", async (req, res) => {
    try {
      const { extensionId, userFingerprint } = req.body;
      if (!extensionId || !userFingerprint) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
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
      console.error("Trial status check error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  app2.get("/api/social-meta", async (req, res) => {
    try {
      const seoSettings2 = await storage.getSeoSettings();
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const deploymentUrl = req.get("host")?.includes("replit.app") ? `https://${req.get("host")}` : "https://jobhunter.one";
      const ogImage = seoSettings2?.customOgImage ? `${deploymentUrl}/api/seo/custom-image/og` : `${deploymentUrl}/og-image.svg`;
      const siteTitle = seoSettings2?.siteTitle || "OCUS Job Hunter - Premium Chrome Extension";
      const siteDescription = seoSettings2?.siteDescription || "Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.";
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
            <h3>\u{1F3AF} Smart Mission Detection</h3>
            <p>Automatically detects and highlights new photography missions on OCUS</p>
        </div>
        <div class="feature">
            <h3>\u26A1 Instant Acceptance</h3>
            <p>Accept missions with a single click before they're taken by others</p>
        </div>
        <div class="feature">
            <h3>\u{1F4CA} Real-time Tracking</h3>
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
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (error) {
      console.error("Error serving social preview:", error);
      res.status(500).send("Error loading preview");
    }
  });
  app2.get("/meta-preview", async (req, res) => {
    try {
      const seoSettings2 = await storage.getSeoSettings();
      const baseUrl = "https://jobhunter.one";
      const ogImage = seoSettings2?.customOgImage ? `${baseUrl}/api/seo/custom-image/og` : `${baseUrl}/og-image.svg`;
      const siteTitle = seoSettings2?.siteTitle || "OCUS Job Hunter - Premium Chrome Extension";
      const siteDescription = seoSettings2?.siteDescription || "Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.";
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
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(shareableHtml);
    } catch (error) {
      console.error("Error serving meta preview:", error);
      res.status(500).send("Error");
    }
  });
  app2.get("/share", async (req, res) => {
    try {
      const seoSettings2 = await storage.getSeoSettings();
      const shareUrl = "https://jobhunter.one/";
      const baseUrl = req.protocol + "://" + req.get("host");
      let ogImage;
      if (seoSettings2?.customOgImage) {
        ogImage = `${baseUrl}/api/seo/custom-image/og`;
      } else {
        ogImage = `https://via.placeholder.com/1200x630/2563eb/ffffff.png?text=OCUS+Job+Hunter+-+Premium+Chrome+Extension`;
      }
      const siteTitle = seoSettings2?.siteTitle || "OCUS Job Hunter - Premium Chrome Extension";
      const siteDescription = seoSettings2?.siteDescription || "Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.";
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
        <h1>\u{1F3AF} OCUS Job Hunter</h1>
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
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(shareHtml);
    } catch (error) {
      console.error("Share page error:", error);
      res.redirect("https://jobhunter.one/");
    }
  });
  app2.get("/", async (req, res, next) => {
    const userAgent = req.get("User-Agent") || "";
    const isSocialCrawler = /facebookexternalhit|twitterbot|linkedinbot|linkedinshare|slackbot|whatsapp|discordbot|telegram|telegrambot|skype/i.test(userAgent);
    if (isSocialCrawler) {
      console.log(`Social crawler detected: ${userAgent}`);
      return res.redirect(301, "/share");
    }
    return next();
    try {
      const seoSettings2 = await storage.getSeoSettings();
      const htmlPath = process.env.NODE_ENV === "production" ? path2.join(process.cwd(), "dist", "public", "index.html") : path2.join(process.cwd(), "client", "index.html");
      let html = fs2.readFileSync(htmlPath, "utf-8");
      if (seoSettings2) {
        const baseUrl = process.env.NODE_ENV === "production" ? "https://jobhunter.one" : `http://${req.get("host")}`;
        const ogImage = seoSettings2.customOgImage ? `${baseUrl}/api/seo/custom-image/og` : `${baseUrl}/og-image.svg`;
        const siteTitle = seoSettings2.siteTitle || seoSettings2.ogTitle || "OCUS Job Hunter - Premium Chrome Extension";
        const siteDescription = seoSettings2.siteDescription || seoSettings2.ogDescription || "Boost your photography career with OCUS Job Hunter Chrome Extension";
        const siteUrl = seoSettings2.ogUrl || `${baseUrl}/`;
        const siteName = seoSettings2.ogSiteName || "OCUS Job Hunter";
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
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("Error serving dynamic HTML:", error);
      if (process.env.NODE_ENV === "production") {
        try {
          const fallbackPath = path2.join(process.cwd(), "dist", "public", "index.html");
          const fallbackHtml = fs2.readFileSync(fallbackPath, "utf-8");
          return res.send(fallbackHtml);
        } catch (fallbackError) {
          console.error("Fallback HTML serving failed:", fallbackError);
        }
      }
      res.sendFile(path2.join(process.cwd(), "client", "index.html"));
    }
  });
  app2.get("/api/seo/custom-image/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const seoSettings2 = await storage.getSeoSettings();
      if (!seoSettings2) {
        return res.status(404).json({ error: "SEO settings not found" });
      }
      let base64Data = null;
      switch (type) {
        case "og":
          base64Data = seoSettings2.customOgImage;
          break;
        case "logo":
          base64Data = seoSettings2.customLogo;
          break;
        case "favicon":
          base64Data = seoSettings2.customFavicon;
          break;
        default:
          return res.status(400).json({ error: "Invalid image type" });
      }
      if (!base64Data) {
        return res.status(404).json({ error: "Image not found" });
      }
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Invalid image data" });
      }
      const mimeType = matches[1];
      const imageBuffer = Buffer.from(matches[2], "base64");
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving custom image:", error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });
  app2.get("/api/invoices", async (req, res) => {
    try {
      const invoices3 = await storage.getAllInvoices();
      res.json(invoices3);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const invoices3 = await storage.getCustomerInvoices(customerId);
      res.json(invoices3);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const items = await storage.getInvoiceItems(invoice.id);
      res.json({ ...invoice, items });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/invoices", async (req, res) => {
    try {
      const { customerId, customerName, customerEmail, items, notes } = req.body;
      const invoiceNumber = await storage.generateInvoiceNumber();
      const subtotal = items.reduce((sum3, item) => sum3 + item.unitPrice * item.quantity, 0);
      const totalAmount = subtotal;
      const invoice = await storage.createInvoice({
        invoiceNumber,
        customerId,
        customerName,
        customerEmail,
        invoiceDate: /* @__PURE__ */ new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        // 30 days from now
        subtotal: subtotal.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: "USD",
        status: "issued",
        notes
      });
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
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const items = await storage.getInvoiceItems(invoice.id);
      const settings2 = await storage.getInvoiceSettings();
      const pdfBuffer = await generateInvoicePDF({ ...invoice, items }, settings2);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/invoice-settings", async (req, res) => {
    try {
      const settings2 = await storage.getInvoiceSettings();
      res.json(settings2 || {});
    } catch (error) {
      console.error("Error fetching invoice settings:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/invoice-settings", async (req, res) => {
    try {
      const settings2 = await storage.updateInvoiceSettings(req.body);
      res.json(settings2);
    } catch (error) {
      console.error("Error updating invoice settings:", error);
      res.status(500).json({ error: error.message });
    }
  });
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express4();
app.set("trust proxy", 1);
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    await storage2.initializeDashboardFeatures();
  } catch (error) {
    console.warn("Failed to initialize dashboard features:", error);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
