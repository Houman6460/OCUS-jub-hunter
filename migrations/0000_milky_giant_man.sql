CREATE TABLE `activation_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text(50) NOT NULL,
	`customer_id` integer,
	`order_id` integer,
	`user_id` integer,
	`installation_id` text(36),
	`version_token` text(36),
	`activated_at` integer,
	`activation_count` integer DEFAULT 0 NOT NULL,
	`max_activations` integer DEFAULT 1 NOT NULL,
	`device_id` text(100),
	`ip_address` text,
	`is_active` integer DEFAULT true NOT NULL,
	`daily_validation_count` integer DEFAULT 0 NOT NULL,
	`last_validation_date` integer,
	`is_revoked` integer DEFAULT false NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activation_codes_code_unique` ON `activation_codes` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `activation_codes_version_token_unique` ON `activation_codes` (`version_token`);--> statement-breakpoint
CREATE TABLE `activation_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activation_key` text NOT NULL,
	`is_active` integer DEFAULT true,
	`order_id` integer,
	`user_id` integer,
	`installation_id` text(36),
	`used_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activation_keys_activation_key_unique` ON `activation_keys` (`activation_key`);--> statement-breakpoint
CREATE TABLE `affiliate_payouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`affiliate_id` integer NOT NULL,
	`amount` text NOT NULL,
	`payment_method` text(20) NOT NULL,
	`payment_email` text(255),
	`bank_details` text,
	`status` text(20) DEFAULT 'pending' NOT NULL,
	`transaction_id` text(255),
	`notes` text,
	`requested_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`processed_at` integer,
	`paid_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`affiliate_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `affiliate_programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL,
	`reward_type` text(20) DEFAULT 'percentage' NOT NULL,
	`commission_rate` text,
	`fixed_amount` text,
	`min_payout` text DEFAULT '50.00',
	`cookie_lifetime` integer DEFAULT 30,
	`auto_approval` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`description` text,
	`terms_and_conditions` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `affiliate_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`default_reward_type` text(20) DEFAULT 'percentage' NOT NULL,
	`default_commission_rate` text DEFAULT '10.00',
	`default_fixed_amount` text DEFAULT '5.00',
	`min_payout_amount` text DEFAULT '50.00',
	`cookie_lifetime_days` integer DEFAULT 30,
	`auto_approval_enabled` integer DEFAULT false,
	`auto_approval_threshold` text DEFAULT '100.00',
	`payout_frequency` text(20) DEFAULT 'monthly',
	`is_active` integer DEFAULT true,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `affiliate_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`affiliate_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	`commission` text NOT NULL,
	`status` text(20) DEFAULT 'pending' NOT NULL,
	`paid_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`affiliate_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `announcement_badges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_enabled` integer DEFAULT true,
	`text_en` text NOT NULL,
	`text_translations` text DEFAULT '{}',
	`background_color` text(20) DEFAULT 'gradient-primary',
	`text_color` text(20) DEFAULT 'white',
	`priority` integer DEFAULT 1,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `auth_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`google_client_id` text,
	`google_client_secret` text,
	`google_redirect_uri` text,
	`google_enabled` integer DEFAULT false,
	`facebook_app_id` text,
	`facebook_app_secret` text,
	`facebook_enabled` integer DEFAULT false,
	`github_client_id` text,
	`github_client_secret` text,
	`github_enabled` integer DEFAULT false,
	`recaptcha_site_key` text,
	`recaptcha_secret_key` text,
	`recaptcha_enabled` integer DEFAULT false,
	`recaptcha_mode` text DEFAULT 'v2',
	`recaptcha_customer_enabled` integer DEFAULT false,
	`recaptcha_admin_enabled` integer DEFAULT true,
	`stripe_public_key` text,
	`stripe_secret_key` text,
	`stripe_enabled` integer DEFAULT false,
	`paypal_client_id` text,
	`paypal_client_secret` text,
	`paypal_enabled` integer DEFAULT false,
	`default_payment_method` text DEFAULT 'stripe',
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL,
	`country_id` integer NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`assigned_user_id` integer,
	`assigned_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `continents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL,
	`code` text(2) NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `continents_name_unique` ON `continents` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `continents_code_unique` ON `continents` (`code`);--> statement-breakpoint
CREATE TABLE `countdown_banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_enabled` integer DEFAULT false,
	`title_en` text NOT NULL,
	`subtitle_en` text NOT NULL,
	`title_translations` text DEFAULT '{}',
	`subtitle_translations` text DEFAULT '{}',
	`target_price` text NOT NULL,
	`original_price` text,
	`end_date_time` integer NOT NULL,
	`background_color` text(20) DEFAULT 'gradient-primary',
	`text_color` text(20) DEFAULT 'white',
	`priority` integer DEFAULT 1,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100) NOT NULL,
	`code` text(2) NOT NULL,
	`continent_id` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`continent_id`) REFERENCES `continents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `countries_code_unique` ON `countries` (`code`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` text NOT NULL,
	`is_active` integer DEFAULT true,
	`usage_limit` integer,
	`usage_count` integer DEFAULT 0,
	`expires_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `customer_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	`payment_method` text(20) NOT NULL,
	`payment_intent_id` text(255),
	`paypal_order_id` text(255),
	`amount` text NOT NULL,
	`currency` text(3) DEFAULT 'usd' NOT NULL,
	`status` text(20) DEFAULT 'pending' NOT NULL,
	`failure_reason` text,
	`refund_amount` text DEFAULT '0',
	`refund_reason` text,
	`processed_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text(255) NOT NULL,
	`password` text(255),
	`name` text(255) NOT NULL,
	`activation_key` text(100),
	`activation_key_revealed` integer DEFAULT false NOT NULL,
	`activation_key_generated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`is_activated` integer DEFAULT false NOT NULL,
	`extension_activated` integer DEFAULT false NOT NULL,
	`extension_last_used` integer,
	`extension_usage_count` integer DEFAULT 0 NOT NULL,
	`extension_successful_jobs` integer DEFAULT 0 NOT NULL,
	`extension_trial_jobs_used` integer DEFAULT 0 NOT NULL,
	`extension_trial_limit` integer DEFAULT 3 NOT NULL,
	`is_blocked` integer DEFAULT false NOT NULL,
	`blocked_reason` text,
	`blocked_at` integer,
	`is_admin` integer DEFAULT false NOT NULL,
	`subscription_status` text(20) DEFAULT 'inactive' NOT NULL,
	`subscription_expires_at` integer,
	`stripe_customer_id` text(255),
	`stripe_subscription_id` text(255),
	`paypal_customer_id` text(255),
	`total_spent` text DEFAULT '0' NOT NULL,
	`total_orders` integer DEFAULT 0 NOT NULL,
	`last_order_date` integer,
	`google_id` text(255),
	`facebook_id` text(255),
	`github_id` text(255),
	`avatar` text(500),
	`referral_code` text(20),
	`referred_by` text(255),
	`total_earnings` text DEFAULT '0',
	`commission_rate` text DEFAULT '10.00',
	`phone` text(50),
	`address` text,
	`date_of_birth` text(10),
	`preferred_language` text(10) DEFAULT 'en' NOT NULL,
	`marketing_opt_in` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_activation_key_unique` ON `customers` (`activation_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_referral_code_unique` ON `customers` (`referral_code`);--> statement-breakpoint
CREATE TABLE `dashboard_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feature_name` text NOT NULL,
	`is_enabled` integer DEFAULT true,
	`description` text,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dashboard_features_feature_name_unique` ON `dashboard_features` (`feature_name`);--> statement-breakpoint
CREATE TABLE `demo_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`demo_count` integer DEFAULT 0,
	`max_demo_uses` integer DEFAULT 3,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`last_used_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_users_user_id_unique` ON `demo_users` (`user_id`);--> statement-breakpoint
CREATE TABLE `downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`downloaded_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`ip_address` text,
	`user_agent` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extension_downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`download_token` text(255) NOT NULL,
	`download_type` text(50) DEFAULT 'premium' NOT NULL,
	`downloaded_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`ip_address` text(45),
	`user_agent` text,
	`download_count` integer DEFAULT 1 NOT NULL,
	`max_downloads` integer DEFAULT 3 NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extension_downloads_download_token_unique` ON `extension_downloads` (`download_token`);--> statement-breakpoint
CREATE TABLE `extension_installations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`installation_id` text(36) NOT NULL,
	`user_id` integer,
	`customer_id` integer,
	`device_fingerprint` text,
	`user_agent` text,
	`ip_address` text,
	`extension_version` text(20),
	`is_active` integer DEFAULT true NOT NULL,
	`last_seen_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extension_installations_installation_id_unique` ON `extension_installations` (`installation_id`);--> statement-breakpoint
CREATE TABLE `extension_usage_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`session_id` text(100) NOT NULL,
	`jobs_used` integer DEFAULT 1 NOT NULL,
	`platform` text(50) DEFAULT 'ocus' NOT NULL,
	`location` text(100),
	`usage_date` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`extension_version` text(20),
	`ip_address` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `extension_usage_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`session_id` text(100) NOT NULL,
	`usage_date` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`jobs_found` integer DEFAULT 0 NOT NULL,
	`jobs_applied` integer DEFAULT 0 NOT NULL,
	`successful_jobs` integer DEFAULT 0 NOT NULL,
	`session_duration_minutes` integer DEFAULT 0 NOT NULL,
	`platform` text(50) DEFAULT 'ocus' NOT NULL,
	`location` text(100),
	`user_agent` text,
	`extension_version` text(20),
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `global_usage_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stat_date` text(10) NOT NULL,
	`total_users` integer DEFAULT 0 NOT NULL,
	`active_users` integer DEFAULT 0 NOT NULL,
	`total_sessions` integer DEFAULT 0 NOT NULL,
	`total_jobs_found` integer DEFAULT 0 NOT NULL,
	`total_jobs_applied` integer DEFAULT 0 NOT NULL,
	`total_successful_jobs` integer DEFAULT 0 NOT NULL,
	`avg_session_duration` text DEFAULT '0' NOT NULL,
	`top_platform` text(50),
	`top_location` text(100),
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`product_name` text(255) NOT NULL,
	`description` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` text NOT NULL,
	`total_price` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoice_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text(255) DEFAULT 'OCUS Job Hunter' NOT NULL,
	`company_logo` text,
	`company_address` text,
	`company_phone` text(50),
	`company_email` text(255),
	`company_website` text(255),
	`tax_number` text(100),
	`invoice_prefix` text(10) DEFAULT 'INV' NOT NULL,
	`receipt_prefix` text(10) DEFAULT 'RCP' NOT NULL,
	`invoice_notes` text,
	`terms_and_conditions` text,
	`footer_text` text,
	`primary_color` text(7) DEFAULT '#007bff',
	`secondary_color` text(7) DEFAULT '#6c757d',
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text(50) NOT NULL,
	`order_id` integer,
	`customer_id` integer,
	`customer_name` text(255) NOT NULL,
	`customer_email` text(255) NOT NULL,
	`customer_address` text,
	`billing_address` text,
	`invoice_date` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`due_date` integer NOT NULL,
	`subtotal` text NOT NULL,
	`tax_amount` text DEFAULT '0.00',
	`discount_amount` text DEFAULT '0.00',
	`total_amount` text NOT NULL,
	`currency` text(3) DEFAULT 'USD' NOT NULL,
	`status` text(20) DEFAULT 'issued' NOT NULL,
	`paid_at` integer,
	`notes` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `missions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mission_id` text NOT NULL,
	`user_id` text NOT NULL,
	`customer_id` integer,
	`mission_name` text NOT NULL,
	`compensation_amount` text,
	`status` text DEFAULT 'assignment_accepted' NOT NULL,
	`assignment_accepted_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`appointment_confirmed_at` integer,
	`media_uploaded_at` integer,
	`billing_completed_at` integer,
	`assignment_completed_at` integer,
	`trial_used` integer DEFAULT false,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `missions_mission_id_unique` ON `missions` (`mission_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`customer_email` text NOT NULL,
	`customer_name` text NOT NULL,
	`original_amount` text NOT NULL,
	`final_amount` text NOT NULL,
	`discount_amount` text DEFAULT '0',
	`coupon_code` text,
	`referral_code` text,
	`currency` text DEFAULT 'usd',
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text NOT NULL,
	`payment_intent_id` text,
	`paypal_order_id` text,
	`download_token` text NOT NULL,
	`download_count` integer DEFAULT 0,
	`max_downloads` integer DEFAULT 3,
	`activation_code` text,
	`invoice_url` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `premium_devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text(100) NOT NULL,
	`device_fingerprint` text(64) NOT NULL,
	`extension_id` text(100) NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`registered_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_seen_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`deactivated_at` integer,
	`deactivation_reason` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `premium_devices_device_fingerprint_unique` ON `premium_devices` (`device_fingerprint`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`before_price` text,
	`currency` text DEFAULT 'eur',
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `seo_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_title` text(100) DEFAULT 'OCUS Job Hunter - Premium Chrome Extension' NOT NULL,
	`site_description` text DEFAULT 'Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.' NOT NULL,
	`site_keywords` text DEFAULT 'OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation',
	`site_author` text(100) DEFAULT 'OCUS Job Hunter',
	`og_title` text(100),
	`og_description` text,
	`og_image` text DEFAULT '/og-image.svg',
	`og_image_alt` text(200),
	`og_site_name` text(100) DEFAULT 'OCUS Job Hunter',
	`og_type` text(50) DEFAULT 'website',
	`og_url` text(255) DEFAULT 'https://jobhunter.one/',
	`twitter_card` text(50) DEFAULT 'summary_large_image',
	`twitter_title` text(100),
	`twitter_description` text,
	`twitter_image` text DEFAULT '/og-image.svg',
	`twitter_site` text(50),
	`twitter_creator` text(50),
	`meta_robots` text(100) DEFAULT 'index, follow',
	`canonical_url` text(255),
	`theme_color` text(7) DEFAULT '#2563eb',
	`custom_logo` text,
	`custom_favicon` text,
	`custom_og_image` text,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` integer NOT NULL,
	`message` text NOT NULL,
	`is_from_customer` integer DEFAULT true NOT NULL,
	`sender_name` text NOT NULL,
	`sender_email` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`customer_email` text NOT NULL,
	`customer_name` text NOT NULL,
	`assigned_to_user_id` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`resolved_at` integer,
	FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trial_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trial_key` text NOT NULL,
	`extension_id` text NOT NULL,
	`user_fingerprint` text NOT NULL,
	`usage_count` integer DEFAULT 0,
	`last_used` integer DEFAULT (CURRENT_TIMESTAMP),
	`is_expired` integer DEFAULT false,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trial_usage_trial_key_unique` ON `trial_usage` (`trial_key`);--> statement-breakpoint
CREATE TABLE `user_location_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`continent_id` integer NOT NULL,
	`country_id` integer NOT NULL,
	`city_id` integer NOT NULL,
	`assigned_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`assigned_by` integer,
	`is_locked` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`continent_id`) REFERENCES `continents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_location_assignments_user_id_unique` ON `user_location_assignments` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_trials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`customer_id` integer,
	`trials_used` integer DEFAULT 0,
	`max_trials` integer DEFAULT 3,
	`is_activated` integer DEFAULT false,
	`activation_key` text,
	`activated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_trials_user_id_unique` ON `user_trials` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`is_admin` integer DEFAULT false,
	`stripe_customer_id` text,
	`is_premium` integer DEFAULT false,
	`extension_activated` integer DEFAULT false,
	`premium_activated_at` text,
	`total_spent` text DEFAULT '0',
	`total_orders` integer DEFAULT 0,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);