# Stripe Payment Configuration Required

## Issue

Payment initialization is stuck because Stripe is not configured in the database.

## Current Status

- `stripeEnabled: false`
- `stripePublicKey: ""`
- `stripeSecretKey: ""`

## Required Steps

### 1. Get Stripe Keys

1. Go to <https://dashboard.stripe.com/>
2. Navigate to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_`)
4. Copy your **Secret key** (starts with `sk_`)

### 2. Configure Payment Settings

Access the admin panel at: <https://ocus-job-hunter.pages.dev/admin/payment-settings>

Or use the API directly:

```bash
curl -X PUT https://ocus-job-hunter.pages.dev/api/admin/payment-settings \
  -H "Content-Type: application/json" \
  -d '{
    "stripeEnabled": true,
    "stripePublicKey": "pk_test_your_publishable_key_here",
    "stripeSecretKey": "sk_test_your_secret_key_here",
    "defaultPaymentMethod": "stripe"
  }'
```

### 3. Test Payment Flow

After configuration, the payment initialization should work properly.

## Security Note

- Use **test keys** (pk_test_/sk_test_) for development
- Use **live keys** (pk_live_/sk_live_) for production
- Never commit keys to version control
