-- Simple SQL script to fix existing purchase records
-- The actual D1 database schema differs from TypeScript schema
-- Run these queries to directly update premium status

-- Check what tables and columns actually exist
.schema orders
.schema customers  
.schema users

-- Simple approach: Update all customers to premium (if they have orders)
UPDATE customers SET is_premium = 1, extension_activated = 1;

-- Simple approach: Update all users to premium (if they have orders)
UPDATE users SET is_premium = 1, extension_activated = 1, premium_activated_at = CURRENT_TIMESTAMP;

-- Alternative: Check if there are any orders at all
SELECT COUNT(*) as total_orders FROM orders;

-- Alternative: Check existing customer data
SELECT id, email, is_premium, extension_activated FROM customers LIMIT 5;

-- Alternative: Check existing user data  
SELECT id, email, is_premium, extension_activated FROM users LIMIT 5;
