-- Generate invoices for completed orders that don't have invoices yet
INSERT INTO invoices (
  invoice_number, 
  order_id, 
  customer_id, 
  amount, 
  currency,
  tax_amount, 
  status, 
  invoice_date, 
  paid_at, 
  created_at
)
SELECT 
  'INV-' || strftime('%s', 'now') || '-' || o.id as invoice_number,
  o.id as order_id,
  o.customer_id,
  o.final_amount as amount,
  o.currency,
  '0.00' as tax_amount,
  'paid' as status,
  COALESCE(o.completed_at, o.created_at) as invoice_date,
  COALESCE(o.completed_at, o.created_at) as paid_at,
  datetime('now') as created_at
FROM orders o
LEFT JOIN invoices i ON o.id = i.order_id
WHERE o.status = 'completed' 
  AND i.id IS NULL;
