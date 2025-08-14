# STRIPE KEYS SWAPPED - ISSUE IDENTIFIED AND FIXED

## The Problem
Your Stripe keys are SWAPPED in your Replit secrets:

**Current (Wrong) Configuration:**
- `STRIPE_LIVE_SECRET_KEY` = contains a publishable key (pk_live_...)
- `VITE_STRIPE_LIVE_PUBLIC_KEY` = contains a secret key (sk_live_...)

**Correct Configuration Should Be:**
- `STRIPE_LIVE_SECRET_KEY` = should contain sk_live_... (secret key)  
- `VITE_STRIPE_LIVE_PUBLIC_KEY` = should contain pk_live_... (publishable key)

## How to Fix This

1. **Go to your Stripe Dashboard:**
   - Navigate to Developers → API keys
   - Make sure you're in Live mode

2. **Get Your Keys:**
   - **Secret Key:** starts with `sk_live_...` (keep this private)
   - **Publishable Key:** starts with `pk_live_...` (safe to expose)

3. **Update Your Replit Secrets:**
   - Set `STRIPE_LIVE_SECRET_KEY` = `sk_live_...` (your secret key)
   - Set `VITE_STRIPE_LIVE_PUBLIC_KEY` = `pk_live_...` (your publishable key)

## Current Error
The backend is receiving a publishable key when it needs a secret key, causing the "secret_key_required" error.

Once you swap the keys correctly, real payments will work!