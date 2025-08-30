-- D1 Database Schema for OCUS Ticket System
-- Run: wrangler d1 execute ocus-tickets --file=./functions/schema.sql

-- Enable FK enforcement
PRAGMA foreign_keys = ON;

-- Drop existing tables if they exist (child tables first)
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS invoice_settings;

DROP TABLE IF EXISTS affiliate_transactions;
DROP TABLE IF EXISTS affiliate_payouts;
DROP TABLE IF EXISTS affiliate_programs;
DROP TABLE IF EXISTS affiliate_settings;

DROP TABLE IF EXISTS extension_usage_stats;
DROP TABLE IF EXISTS extension_usage_logs;
DROP TABLE IF EXISTS customer_payments;
DROP TABLE IF EXISTS global_usage_stats;
DROP TABLE IF EXISTS premium_devices;
DROP TABLE IF EXISTS extension_downloads;
DROP TABLE IF EXISTS extension_installations;
DROP TABLE IF EXISTS demo_users;

DROP TABLE IF EXISTS activation_codes;
DROP TABLE IF EXISTS activation_keys;
DROP TABLE IF EXISTS downloads;

DROP TABLE IF EXISTS ticket_messages;
DROP TABLE IF EXISTS tickets;

DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS user_trials;
DROP TABLE IF EXISTS trial_usage;

DROP TABLE IF EXISTS announcement_badges;
DROP TABLE IF EXISTS countdown_banners;
DROP TABLE IF EXISTS seo_settings;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS dashboard_features;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS auth_settings;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

DROP TABLE IF EXISTS user_location_assignments;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS continents;

  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS customers;

-- Canonical schema (Cloudflare D1 / SQLite) mirroring shared/schema.ts

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  is_premium INTEGER DEFAULT 0,
  extension_activated INTEGER DEFAULT 0,
  premium_activated_at TEXT,
  total_spent TEXT DEFAULT '0',
  total_orders INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  name TEXT NOT NULL,
  activation_key TEXT UNIQUE,
  activation_key_revealed INTEGER DEFAULT 0 NOT NULL,
  activation_key_generated_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  is_activated INTEGER DEFAULT 0 NOT NULL,
  extension_activated INTEGER DEFAULT 0 NOT NULL,
  extension_last_used INTEGER,
  extension_usage_count INTEGER DEFAULT 0 NOT NULL,
  extension_successful_jobs INTEGER DEFAULT 0 NOT NULL,
  extension_trial_jobs_used INTEGER DEFAULT 0 NOT NULL,
  extension_trial_limit INTEGER DEFAULT 3 NOT NULL,
  is_blocked INTEGER DEFAULT 0 NOT NULL,
  blocked_reason TEXT,
  blocked_at INTEGER,
  is_admin INTEGER DEFAULT 0 NOT NULL,
  subscription_status TEXT DEFAULT 'inactive' NOT NULL,
  subscription_expires_at INTEGER,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  paypal_customer_id TEXT,
  total_spent TEXT DEFAULT '0' NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  last_order_date INTEGER,
  google_id TEXT,
  facebook_id TEXT,
  github_id TEXT,
  avatar TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  total_earnings TEXT DEFAULT '0',
  commission_rate TEXT DEFAULT '10.00',
  phone TEXT,
  address TEXT,
  date_of_birth TEXT,
  preferred_language TEXT DEFAULT 'en' NOT NULL,
  marketing_opt_in INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  before_price TEXT,
  currency TEXT DEFAULT 'eur',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  original_amount TEXT NOT NULL,
  final_amount TEXT NOT NULL,
  discount_amount TEXT DEFAULT '0',
  coupon_code TEXT,
  referral_code TEXT,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  payment_intent_id TEXT,
  paypal_order_id TEXT,
  download_token TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  activation_code TEXT,
  invoice_url TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  downloaded_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Dashboard features
CREATE TABLE IF NOT EXISTS dashboard_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled INTEGER DEFAULT 1,
  description TEXT,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Auth settings
CREATE TABLE IF NOT EXISTS auth_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_client_id TEXT,
  google_client_secret TEXT,
  google_redirect_uri TEXT,
  google_enabled INTEGER DEFAULT 0,
  facebook_app_id TEXT,
  facebook_app_secret TEXT,
  facebook_enabled INTEGER DEFAULT 0,
  github_client_id TEXT,
  github_client_secret TEXT,
  github_enabled INTEGER DEFAULT 0,
  recaptcha_site_key TEXT,
  recaptcha_secret_key TEXT,
  recaptcha_enabled INTEGER DEFAULT 0,
  recaptcha_mode TEXT DEFAULT 'v2',
  recaptcha_customer_enabled INTEGER DEFAULT 0,
  recaptcha_admin_enabled INTEGER DEFAULT 1,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  stripe_enabled INTEGER DEFAULT 0,
  paypal_client_id TEXT,
  paypal_client_secret TEXT,
  paypal_enabled INTEGER DEFAULT 0,
  default_payment_method TEXT DEFAULT 'stripe',
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- SEO settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_title TEXT DEFAULT 'OCUS Job Hunter - Premium Chrome Extension' NOT NULL,
  site_description TEXT DEFAULT 'Boost your photography career with OCUS Job Hunter Chrome Extension. Automated mission detection, smart acceptance, and unlimited job opportunities for OCUS photographers.' NOT NULL,
  site_keywords TEXT DEFAULT 'OCUS extension, photography jobs, Chrome extension, job hunter, photographer tools, mission automation',
  site_author TEXT DEFAULT 'OCUS Job Hunter',
  og_title TEXT,
  og_description TEXT,
  og_image TEXT DEFAULT '/og-image.svg',
  og_image_alt TEXT,
  og_site_name TEXT DEFAULT 'OCUS Job Hunter',
  og_type TEXT DEFAULT 'website',
  og_url TEXT DEFAULT 'https://jobhunter.one/',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT DEFAULT '/og-image.svg',
  twitter_site TEXT,
  twitter_creator TEXT,
  meta_robots TEXT DEFAULT 'index, follow',
  canonical_url TEXT,
  theme_color TEXT DEFAULT '#2563eb',
  custom_logo TEXT,
  custom_favicon TEXT,
  custom_og_image TEXT,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- Countdown banners
CREATE TABLE IF NOT EXISTS countdown_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_enabled INTEGER DEFAULT 0,
  title_en TEXT NOT NULL,
  subtitle_en TEXT NOT NULL,
  title_translations TEXT DEFAULT '{}',
  subtitle_translations TEXT DEFAULT '{}',
  target_price TEXT NOT NULL,
  original_price TEXT,
  end_date_time INTEGER NOT NULL,
  background_color TEXT DEFAULT 'gradient-primary',
  text_color TEXT DEFAULT 'white',
  priority INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Announcement badges
CREATE TABLE IF NOT EXISTS announcement_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_enabled INTEGER DEFAULT 1,
  text_en TEXT NOT NULL,
  text_translations TEXT DEFAULT '{}',
  background_color TEXT DEFAULT 'gradient-primary',
  text_color TEXT DEFAULT 'white',
  priority INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  assigned_to_user_id INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  resolved_at INTEGER,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_from_customer INTEGER NOT NULL DEFAULT 1,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  attachments TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Licensing keys and codes
CREATE TABLE IF NOT EXISTS activation_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activation_key TEXT NOT NULL UNIQUE,
  is_active INTEGER DEFAULT 1,
  order_id INTEGER,
  user_id INTEGER,
  installation_id TEXT,
  used_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  order_id INTEGER,
  user_id INTEGER,
  installation_id TEXT,
  version_token TEXT UNIQUE,
  activated_at INTEGER,
  activation_count INTEGER DEFAULT 0 NOT NULL,
  max_activations INTEGER DEFAULT 1 NOT NULL,
  device_id TEXT,
  ip_address TEXT,
  is_active INTEGER DEFAULT 1 NOT NULL,
  daily_validation_count INTEGER DEFAULT 0 NOT NULL,
  last_validation_date INTEGER,
  is_revoked INTEGER DEFAULT 0 NOT NULL,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Extension installations
CREATE TABLE IF NOT EXISTS extension_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_id TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  customer_id INTEGER,
  device_fingerprint TEXT,
  user_agent TEXT,
  ip_address TEXT,
  extension_version TEXT,
  is_active INTEGER DEFAULT 1 NOT NULL,
  last_seen_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Demo users
CREATE TABLE IF NOT EXISTS demo_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  demo_count INTEGER DEFAULT 0,
  max_demo_uses INTEGER DEFAULT 3,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  last_used_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Extension downloads
CREATE TABLE IF NOT EXISTS extension_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  download_token TEXT NOT NULL UNIQUE,
  download_type TEXT DEFAULT 'premium' NOT NULL,
  downloaded_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  download_count INTEGER DEFAULT 1 NOT NULL,
  max_downloads INTEGER DEFAULT 3 NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Extension usage logs
CREATE TABLE IF NOT EXISTS extension_usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  jobs_used INTEGER DEFAULT 1 NOT NULL,
  platform TEXT DEFAULT 'ocus' NOT NULL,
  location TEXT,
  usage_date INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  extension_version TEXT,
  ip_address TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Extension usage stats
CREATE TABLE IF NOT EXISTS extension_usage_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  usage_date INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  jobs_found INTEGER DEFAULT 0 NOT NULL,
  jobs_applied INTEGER DEFAULT 0 NOT NULL,
  successful_jobs INTEGER DEFAULT 0 NOT NULL,
  session_duration_minutes INTEGER DEFAULT 0 NOT NULL,
  platform TEXT DEFAULT 'ocus' NOT NULL,
  location TEXT,
  user_agent TEXT,
  extension_version TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Customer payments
CREATE TABLE IF NOT EXISTS customer_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_intent_id TEXT,
  paypal_order_id TEXT,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  failure_reason TEXT,
  refund_amount TEXT DEFAULT '0',
  refund_reason TEXT,
  processed_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Affiliate transactions
CREATE TABLE IF NOT EXISTS affiliate_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  commission TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  paid_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (affiliate_id) REFERENCES customers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Affiliate programs/settings/payouts
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  reward_type TEXT DEFAULT 'percentage' NOT NULL,
  commission_rate TEXT,
  fixed_amount TEXT,
  min_payout TEXT DEFAULT '50.00',
  cookie_lifetime INTEGER DEFAULT 30,
  auto_approval INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  description TEXT,
  terms_and_conditions TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  default_reward_type TEXT DEFAULT 'percentage' NOT NULL,
  default_commission_rate TEXT DEFAULT '10.00',
  default_fixed_amount TEXT DEFAULT '5.00',
  min_payout_amount TEXT DEFAULT '50.00',
  cookie_lifetime_days INTEGER DEFAULT 30,
  auto_approval_enabled INTEGER DEFAULT 0,
  auto_approval_threshold TEXT DEFAULT '100.00',
  payout_frequency TEXT DEFAULT 'monthly',
  is_active INTEGER DEFAULT 1,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  amount TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_email TEXT,
  bank_details TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  transaction_id TEXT,
  notes TEXT,
  requested_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  processed_at INTEGER,
  paid_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (affiliate_id) REFERENCES customers(id)
);

-- Premium devices
CREATE TABLE IF NOT EXISTS premium_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL UNIQUE,
  extension_id TEXT NOT NULL,
  is_active INTEGER DEFAULT 1 NOT NULL,
  registered_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  last_seen_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  deactivated_at INTEGER,
  deactivation_reason TEXT
);

-- Global usage stats
CREATE TABLE IF NOT EXISTS global_usage_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date TEXT NOT NULL,
  total_users INTEGER DEFAULT 0 NOT NULL,
  active_users INTEGER DEFAULT 0 NOT NULL,
  total_sessions INTEGER DEFAULT 0 NOT NULL,
  total_jobs_found INTEGER DEFAULT 0 NOT NULL,
  total_jobs_applied INTEGER DEFAULT 0 NOT NULL,
  total_successful_jobs INTEGER DEFAULT 0 NOT NULL,
  avg_session_duration TEXT DEFAULT '0' NOT NULL,
  top_platform TEXT,
  top_location TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- Invoice settings
CREATE TABLE IF NOT EXISTS invoice_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT DEFAULT 'OCUS Job Hunter' NOT NULL,
  company_logo TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  tax_number TEXT,
  invoice_prefix TEXT DEFAULT 'INV' NOT NULL,
  receipt_prefix TEXT DEFAULT 'RCP' NOT NULL,
  invoice_notes TEXT,
  terms_and_conditions TEXT,
  footer_text TEXT,
  primary_color TEXT DEFAULT '#007bff',
  secondary_color TEXT DEFAULT '#6c757d',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id INTEGER,
  customer_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  billing_address TEXT,
  invoice_date INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  due_date INTEGER NOT NULL,
  subtotal TEXT NOT NULL,
  tax_amount TEXT DEFAULT '0.00',
  discount_amount TEXT DEFAULT '0.00',
  total_amount TEXT NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'issued' NOT NULL,
  paid_at INTEGER,
  notes TEXT,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  unit_price TEXT NOT NULL,
  total_price TEXT NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Missions and trials
CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  customer_id INTEGER,
  mission_name TEXT NOT NULL,
  compensation_amount TEXT,
  status TEXT NOT NULL DEFAULT 'assignment_accepted',
  assignment_accepted_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  appointment_confirmed_at INTEGER,
  media_uploaded_at INTEGER,
  billing_completed_at INTEGER,
  assignment_completed_at INTEGER,
  trial_used INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS user_trials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  trials_used INTEGER DEFAULT 0,
  max_trials INTEGER DEFAULT 3,
  is_activated INTEGER DEFAULT 0,
  activation_key TEXT,
  activated_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS trial_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trial_key TEXT NOT NULL UNIQUE,
  extension_id TEXT NOT NULL,
  user_fingerprint TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used INTEGER DEFAULT (CURRENT_TIMESTAMP),
  is_expired INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
);

-- Location tables
CREATE TABLE IF NOT EXISTS continents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  continent_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (continent_id) REFERENCES continents(id)
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country_id INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1 NOT NULL,
  assigned_user_id INTEGER,
  assigned_at INTEGER,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (assigned_user_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS user_location_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  continent_id INTEGER NOT NULL,
  country_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  assigned_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  assigned_by INTEGER,
  is_locked INTEGER DEFAULT 1 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES customers(id),
  FOREIGN KEY (continent_id) REFERENCES continents(id),
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (assigned_by) REFERENCES customers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
