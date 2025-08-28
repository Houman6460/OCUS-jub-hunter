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
    totalAmount = amount + COALESCE(taxAmount, 0)
WHERE subtotal IS NULL OR totalAmount IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customerEmail);
