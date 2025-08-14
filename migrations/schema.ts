import { pgTable, serial, text, numeric, boolean, timestamp, foreignKey, integer, unique, varchar, date, jsonb, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('usd'),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	beforePrice: numeric("before_price", { precision: 10, scale:  2 }),
});

export const downloads = pgTable("downloads", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	downloadedAt: timestamp("downloaded_at", { mode: 'string' }).defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "downloads_order_id_orders_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	customerEmail: text("customer_email").notNull(),
	customerName: text("customer_name").notNull(),
	currency: text().default('usd'),
	status: text().default('pending').notNull(),
	paymentMethod: text("payment_method").notNull(),
	paymentIntentId: text("payment_intent_id"),
	paypalOrderId: text("paypal_order_id"),
	downloadToken: text("download_token").notNull(),
	downloadCount: integer("download_count").default(0),
	maxDownloads: integer("max_downloads").default(3),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	originalAmount: numeric("original_amount", { precision: 10, scale:  2 }),
	finalAmount: numeric("final_amount", { precision: 10, scale:  2 }),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	couponCode: text("coupon_code"),
});

export const coupons = pgTable("coupons", {
	id: serial().primaryKey().notNull(),
	code: text().notNull(),
	discountType: text("discount_type").notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  2 }).notNull(),
	isActive: boolean("is_active").default(true),
	usageLimit: integer("usage_limit"),
	usageCount: integer("usage_count").default(0),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("coupons_code_key").on(table.code),
]);

export const settings = pgTable("settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("settings_key_key").on(table.key),
	unique("settings_key_unique").on(table.key),
]);

export const activationKeys = pgTable("activation_keys", {
	id: serial().primaryKey().notNull(),
	activationKey: varchar("activation_key", { length: 255 }).notNull(),
	orderId: integer("order_id"),
	isActive: boolean("is_active").default(true),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "activation_keys_order_id_fkey"
		}),
	unique("activation_keys_activation_key_key").on(table.activationKey),
]);

export const demoUsers = pgTable("demo_users", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	demoCount: integer("demo_count").default(0),
	maxDemoUses: integer("max_demo_uses").default(3),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("demo_users_user_id_key").on(table.userId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	email: text().notNull(),
	isAdmin: boolean("is_admin").default(false),
	stripeCustomerId: text("stripe_customer_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const tickets = pgTable("tickets", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	priority: text().default('medium').notNull(),
	status: text().default('open').notNull(),
	customerEmail: text("customer_email").notNull(),
	customerName: text("customer_name").notNull(),
	assignedToUserId: integer("assigned_to_user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.assignedToUserId],
			foreignColumns: [users.id],
			name: "tickets_assigned_to_user_id_fkey"
		}),
]);

export const ticketMessages = pgTable("ticket_messages", {
	id: serial().primaryKey().notNull(),
	ticketId: integer("ticket_id").notNull(),
	message: text().notNull(),
	isFromCustomer: boolean("is_from_customer").default(true).notNull(),
	senderName: text("sender_name").notNull(),
	senderEmail: text("sender_email"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_messages_ticket_id_fkey"
		}),
]);

export const authSettings = pgTable("auth_settings", {
	id: serial().primaryKey().notNull(),
	googleEnabled: boolean("google_enabled").default(false),
	googleClientId: varchar("google_client_id", { length: 255 }),
	googleClientSecret: varchar("google_client_secret", { length: 255 }),
	facebookEnabled: boolean("facebook_enabled").default(false),
	facebookAppId: varchar("facebook_app_id", { length: 255 }),
	facebookAppSecret: varchar("facebook_app_secret", { length: 255 }),
	githubEnabled: boolean("github_enabled").default(false),
	githubClientId: varchar("github_client_id", { length: 255 }),
	githubClientSecret: varchar("github_client_secret", { length: 255 }),
	recaptchaEnabled: boolean("recaptcha_enabled").default(false),
	recaptchaSiteKey: varchar("recaptcha_site_key", { length: 255 }),
	recaptchaSecretKey: varchar("recaptcha_secret_key", { length: 255 }),
	recaptchaMode: varchar("recaptcha_mode", { length: 10 }).default('v2'),
	recaptchaCustomerEnabled: boolean("recaptcha_customer_enabled").default(false),
	recaptchaAdminEnabled: boolean("recaptcha_admin_enabled").default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	googleRedirectUri: varchar("google_redirect_uri", { length: 255 }),
});

export const extensionUsageStats = pgTable("extension_usage_stats", {
	id: serial().primaryKey().notNull(),
	customerId: integer("customer_id"),
	usageDate: date("usage_date").notNull(),
	jobsFound: integer("jobs_found").default(0),
	jobsApplied: integer("jobs_applied").default(0),
	successfulJobs: integer("successful_jobs").default(0),
	platform: varchar({ length: 100 }),
	location: varchar({ length: 255 }),
	sessionDuration: integer("session_duration"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "extension_usage_stats_customer_id_fkey"
		}),
]);

export const customers = pgTable("customers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	country: varchar({ length: 100 }),
	activationKey: varchar("activation_key", { length: 255 }),
	extensionActivated: boolean("extension_activated").default(false),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
	paypalSubscriptionId: varchar("paypal_subscription_id", { length: 255 }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	referralCode: varchar("referral_code", { length: 50 }),
	referredBy: varchar("referred_by", { length: 50 }),
	isActivated: boolean("is_activated").default(false),
	isAdmin: boolean("is_admin").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	extensionLastUsed: timestamp("extension_last_used", { mode: 'string' }),
}, (table) => [
	unique("customers_email_key").on(table.email),
]);

export const globalUsageStats = pgTable("global_usage_stats", {
	id: serial().primaryKey().notNull(),
	statDate: date("stat_date").notNull(),
	totalUsers: integer("total_users").default(0),
	activeUsers: integer("active_users").default(0),
	totalJobsFound: integer("total_jobs_found").default(0),
	totalJobsApplied: integer("total_jobs_applied").default(0),
	totalSuccessfulJobs: integer("total_successful_jobs").default(0),
	avgSessionDuration: integer("avg_session_duration").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	totalSessions: integer("total_sessions").default(0),
}, (table) => [
	unique("global_usage_stats_stat_date_key").on(table.statDate),
]);

export const countdownBanners = pgTable("countdown_banners", {
	id: serial().primaryKey().notNull(),
	titleEn: text("title_en").notNull(),
	subtitleEn: text("subtitle_en").notNull(),
	titleTranslations: jsonb("title_translations").default({}),
	subtitleTranslations: jsonb("subtitle_translations").default({}),
	targetPrice: numeric("target_price", { precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	endDateTime: timestamp("end_date_time", { mode: 'string' }).notNull(),
	backgroundColor: varchar("background_color", { length: 50 }).default('gradient-primary'),
	textColor: varchar("text_color", { length: 50 }).default('white'),
	priority: integer().default(1),
	isEnabled: boolean("is_enabled").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const announcementBadges = pgTable("announcement_badges", {
	id: serial().primaryKey().notNull(),
	isEnabled: boolean("is_enabled").default(true),
	textEn: text("text_en").notNull(),
	textTranslations: json("text_translations").default({}),
	backgroundColor: varchar("background_color", { length: 20 }).default('gradient-primary'),
	textColor: varchar("text_color", { length: 20 }).default('white'),
	priority: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
