-- Migration to add the invoices table and update the orders table.

-- Create the invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" text NOT NULL,
	"due_date" text NOT NULL,
	"total_amount" real NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"pdf_url" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Add product_id to orders table
ALTER TABLE "orders" ADD COLUMN "product_id" integer;

-- Add foreign key constraint for product_id
-- Note: This assumes the orders table does not yet have this foreign key.
-- In a real-world scenario, you would check for the existence of the constraint first.
-- For D1, we can't add a foreign key to an existing table with data easily, so this is for schema definition.
-- A data migration might be needed to populate existing orders with product_id.

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_invoices_customer_id" ON "invoices" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_order_id" ON "invoices" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_orders_product_id" ON "orders" ("product_id");
