# STRIPE KEYS ARE SWAPPED - IMMEDIATE FIX NEEDED

## Problem Confirmed
Your system logs show: `Environment secret key starts with: pk_live_...`

This means your **secret key environment variable** contains a **publishable key**, which is backwards.

## STEP-BY-STEP FIX

### Step 1: Go to Replit Secrets
1. In your Replit workspace, click **"Secrets"** in the left panel
2. You'll see all your environment variables

### Step 2: Find These Two Keys
Look for:
- `STRIPE_LIVE_SECRET_KEY` (currently has pk_live_... - WRONG)
- `VITE_STRIPE_LIVE_PUBLIC_KEY` (currently has sk_live_... - WRONG)

### Step 3: Write Down Current Values
- Copy the value from `STRIPE_LIVE_SECRET_KEY` → this is your publishable key
- Copy the value from `VITE_STRIPE_LIVE_PUBLIC_KEY` → this is your secret key

### Step 4: Swap Them
- Delete both entries
- Create `STRIPE_LIVE_SECRET_KEY` = the value that starts with `sk_live_...`
- Create `VITE_STRIPE_LIVE_PUBLIC_KEY` = the value that starts with `pk_live_...`

### Step 5: Verify Fix
After saving, the system will restart and you should see:
`Stripe initialized in LIVE mode`

Then payments will work immediately.

## Why This Matters
Stripe requires the secret key (sk_live_...) on the server to create payments. You currently have the publishable key (pk_live_...) there instead, causing all payments to fail.