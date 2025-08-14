-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'usd',
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"before_price" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"downloaded_at" timestamp DEFAULT now(),
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"currency" text DEFAULT 'usd',
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"payment_intent_id" text,
	"paypal_order_id" text,
	"download_token" text NOT NULL,
	"download_count" integer DEFAULT 0,
	"max_downloads" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"original_amount" numeric(10, 2),
	"final_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"coupon_code" text
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_key" UNIQUE("key"),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "activation_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"activation_key" varchar(255) NOT NULL,
	"order_id" integer,
	"is_active" boolean DEFAULT true,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "activation_keys_activation_key_key" UNIQUE("activation_key")
);
--> statement-breakpoint
CREATE TABLE "demo_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"demo_count" integer DEFAULT 0,
	"max_demo_uses" integer DEFAULT 3,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "demo_users_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"assigned_to_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_from_customer" boolean DEFAULT true NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_enabled" boolean DEFAULT false,
	"google_client_id" varchar(255),
	"google_client_secret" varchar(255),
	"facebook_enabled" boolean DEFAULT false,
	"facebook_app_id" varchar(255),
	"facebook_app_secret" varchar(255),
	"github_enabled" boolean DEFAULT false,
	"github_client_id" varchar(255),
	"github_client_secret" varchar(255),
	"recaptcha_enabled" boolean DEFAULT false,
	"recaptcha_site_key" varchar(255),
	"recaptcha_secret_key" varchar(255),
	"recaptcha_mode" varchar(10) DEFAULT 'v2',
	"recaptcha_customer_enabled" boolean DEFAULT false,
	"recaptcha_admin_enabled" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"google_redirect_uri" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "extension_usage_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"usage_date" date NOT NULL,
	"jobs_found" integer DEFAULT 0,
	"jobs_applied" integer DEFAULT 0,
	"successful_jobs" integer DEFAULT 0,
	"platform" varchar(100),
	"location" varchar(255),
	"session_duration" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"phone" varchar(50),
	"country" varchar(100),
	"activation_key" varchar(255),
	"extension_activated" boolean DEFAULT false,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"paypal_subscription_id" varchar(255),
	"payment_method" varchar(50),
	"referral_code" varchar(50),
	"referred_by" varchar(50),
	"is_activated" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"extension_last_used" timestamp,
	CONSTRAINT "customers_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "global_usage_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"stat_date" date NOT NULL,
	"total_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"total_jobs_found" integer DEFAULT 0,
	"total_jobs_applied" integer DEFAULT 0,
	"total_successful_jobs" integer DEFAULT 0,
	"avg_session_duration" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"total_sessions" integer DEFAULT 0,
	CONSTRAINT "global_usage_stats_stat_date_key" UNIQUE("stat_date")
);
--> statement-breakpoint
CREATE TABLE "countdown_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"subtitle_en" text NOT NULL,
	"title_translations" jsonb DEFAULT '{}'::jsonb,
	"subtitle_translations" jsonb DEFAULT '{}'::jsonb,
	"target_price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"end_date_time" timestamp NOT NULL,
	"background_color" varchar(50) DEFAULT 'gradient-primary',
	"text_color" varchar(50) DEFAULT 'white',
	"priority" integer DEFAULT 1,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcement_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"text_en" text NOT NULL,
	"text_translations" json DEFAULT '{}'::json,
	"background_color" varchar(20) DEFAULT 'gradient-primary',
	"text_color" varchar(20) DEFAULT 'white',
	"priority" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_keys" ADD CONSTRAINT "activation_keys_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extension_usage_stats" ADD CONSTRAINT "extension_usage_stats_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
*/