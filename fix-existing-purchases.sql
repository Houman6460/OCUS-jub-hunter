-- SQL script to fix existing purchase records and update premium status
-- Run each query separately in your D1 database console

-- First, update customers table for users with completed orders
UPDATE customers 
SET is_premium = 1, 
    extension_activated = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT DISTINCT customer_id 
    FROM orders 
    WHERE status = 'completed' AND final_amount > 0
);

-- Second, update users table for users with completed orders (by email)
UPDATE users 
SET is_premium = 1, 
    extension_activated = 1,
    premium_activated_at = CURRENT_TIMESTAMP
WHERE email IN (
    SELECT DISTINCT customer_email 
    FROM orders 
    WHERE status = 'completed' AND final_amount > 0
);

-- Update total_spent and total_orders for customers
UPDATE customers 
SET total_spent = (
    SELECT COALESCE(SUM(final_amount), 0) 
    FROM orders 
    WHERE orders.customer_id = customers.id AND status = 'completed'
),
total_orders = (
    SELECT COUNT(*) 
    FROM orders 
    WHERE orders.customer_id = customers.id AND status = 'completed'
)
WHERE id IN (
    SELECT DISTINCT customer_id 
    FROM orders 
    WHERE status = 'completed' AND final_amount > 0
);

-- Update total_spent and total_orders for users
UPDATE users 
SET total_spent = (
    SELECT COALESCE(SUM(final_amount), 0) 
    FROM orders 
    WHERE orders.customer_email = users.email AND status = 'completed'
),
total_orders = (
    SELECT COUNT(*) 
    FROM orders 
    WHERE orders.customer_email = users.email AND status = 'completed'
)
WHERE email IN (
    SELECT DISTINCT customer_email 
    FROM orders 
    WHERE status = 'completed' AND final_amount > 0
);

-- Verify the updates
SELECT 'Customers with premium status:' as info, COUNT(*) as count 
FROM customers 
WHERE is_premium = 1 AND extension_activated = 1;

SELECT 'Users with premium status:' as info, COUNT(*) as count 
FROM users 
WHERE is_premium = 1 AND extension_activated = 1;

SELECT 'Completed orders:' as info, COUNT(*) as count 
FROM orders 
WHERE status = 'completed' AND final_amount > 0;
