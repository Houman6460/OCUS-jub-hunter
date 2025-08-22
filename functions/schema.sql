-- D1 Database Schema for OCUS Ticket System
-- Run: wrangler d1 execute ocus-tickets --file=./functions/schema.sql

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  assigned_to_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_from_customer BOOLEAN NOT NULL DEFAULT 1,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Countdown Banners Table
CREATE TABLE IF NOT EXISTS countdown_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  titleTranslations TEXT,
  subtitleTranslations TEXT,
  targetPrice REAL NOT NULL,
  originalPrice REAL,
  endDate TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  backgroundColor TEXT NOT NULL DEFAULT '#000000',
  textColor TEXT NOT NULL DEFAULT '#ffffff',
  isActive BOOLEAN NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'OCUS Job Hunter Extension',
  price REAL NOT NULL,
  beforePrice REAL,
  description TEXT,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default product if not exists
INSERT OR IGNORE INTO products (id, name, price, beforePrice) 
VALUES (1, 'OCUS Job Hunter Extension', 250.00, NULL);

-- Auth Settings Table
CREATE TABLE IF NOT EXISTS auth_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_enabled BOOLEAN DEFAULT 0,
  google_client_id TEXT,
  google_client_secret TEXT,
  facebook_enabled BOOLEAN DEFAULT 0,
  facebook_app_id TEXT,
  facebook_app_secret TEXT,
  github_enabled BOOLEAN DEFAULT 0,
  github_client_id TEXT,
  github_client_secret TEXT,
  recaptcha_enabled BOOLEAN DEFAULT 0,
  recaptcha_site_key TEXT,
  recaptcha_secret_key TEXT,
  recaptcha_mode TEXT DEFAULT 'v2',
  recaptcha_customer_enabled BOOLEAN DEFAULT 0,
  recaptcha_admin_enabled BOOLEAN DEFAULT 0,
  jwt_secret TEXT DEFAULT 'demo-jwt-secret',
  session_timeout INTEGER DEFAULT 3600,
  stripe_enabled BOOLEAN DEFAULT 0,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default auth settings if not exists
INSERT OR IGNORE INTO auth_settings (id) VALUES (1);

-- Generic Settings Table for flexible key-value storage
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orders/Purchases Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerEmail TEXT NOT NULL,
  customerName TEXT NOT NULL,
  productId INTEGER NOT NULL,
  productName TEXT NOT NULL,
  originalAmount REAL NOT NULL,
  finalAmount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  paymentMethod TEXT NOT NULL DEFAULT 'stripe',
  paymentIntentId TEXT,
  downloadToken TEXT UNIQUE,
  downloadCount INTEGER DEFAULT 0,
  maxDownloads INTEGER DEFAULT 5,
  activationCode TEXT,
  invoiceNumber TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  completedAt TEXT,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hashedPassword TEXT,
  isActive BOOLEAN DEFAULT 1,
  isPremium BOOLEAN DEFAULT 0,
  registrationDate TEXT NOT NULL DEFAULT (datetime('now')),
  lastLoginAt TEXT,
  activationToken TEXT,
  passwordResetToken TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for settings lookup
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_active ON countdown_banners(isActive);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_priority ON countdown_banners(priority);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customerEmail);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);
