-- Fix database schema without dropping existing data
-- This will add missing columns and fix schema mismatches

-- First, ensure users table has correct columns
ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN premium_activated_at TEXT;

-- Ensure customers table has correct columns  
ALTER TABLE customers ADD COLUMN is_premium BOOLEAN DEFAULT 0;

-- Fix invoices table to match API expectations
ALTER TABLE invoices ADD COLUMN customerEmail TEXT;
ALTER TABLE invoices ADD COLUMN subtotal REAL DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN discountAmount REAL DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN totalAmount REAL DEFAULT 0.00;

-- Update existing invoices to have customerEmail from orders
UPDATE invoices 
SET customerEmail = (
  SELECT orders.customerEmail 
  FROM orders 
  WHERE orders.id = invoices.orderId
)
WHERE customerEmail IS NULL;

-- Update existing invoices to have proper amounts
UPDATE invoices 
SET subtotal = amount,
    totalAmount = amount + taxAmount
WHERE subtotal IS NULL OR totalAmount IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customerEmail);
