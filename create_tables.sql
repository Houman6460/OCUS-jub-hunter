CREATE TABLE IF NOT EXISTS dashboard_features (
  id SERIAL PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  order_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  notes TEXT
);

INSERT INTO dashboard_features (feature_name, is_enabled, description) VALUES 
('affiliate_program', true, 'Enable/disable affiliate program section in user dashboard'),
('analytics', true, 'Enable/disable analytics section in user dashboard'),
('billing', true, 'Enable/disable billing section in user dashboard')
ON CONFLICT (feature_name) DO NOTHING;
