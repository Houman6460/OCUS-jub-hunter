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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_active ON countdown_banners(isActive);
CREATE INDEX IF NOT EXISTS idx_countdown_banners_priority ON countdown_banners(priority);
