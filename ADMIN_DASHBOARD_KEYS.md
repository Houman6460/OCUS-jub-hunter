# SET YOUR LIVE STRIPE KEYS IN ADMIN DASHBOARD

## Current Status
✅ System correctly reads database keys  
✅ Stripe API integration working  
❌ Still has dummy test keys in database  

## NEXT STEP: Set Your Real Live Keys

Since you have your live keys in Stripe dashboard, now you need to set them in THIS project's admin dashboard:

### Step 1: Access Admin Dashboard
Go to: **http://localhost:5000/admin**

### Step 2: Navigate to Payment Settings
Click **"Payment Settings"** in the left sidebar

### Step 3: Copy Keys from Stripe Dashboard
Go to your live Stripe dashboard and copy:
- **Secret Key**: starts with `sk_live_...` 
- **Publishable Key**: starts with `pk_live_...`

### Step 4: Paste Into Admin Dashboard
In the admin dashboard here:
- **Stripe Secret Key**: Paste your `sk_live_...` key
- **Stripe Public Key**: Paste your `pk_live_...` key  
- **Enable Stripe**: ✓ Check this box
- **Save Settings**

### Step 5: Verify
After saving, you should see in console:
- `"Database secret key starts with: sk_live_"` (real key, not TEST)
- `"Stripe initialized in LIVE mode"`

## Why This is Needed
The system reads keys from ITS OWN database, not from Stripe's website. You need to copy your live keys FROM Stripe TO this admin dashboard.

Once done, payment forms will show credit card fields and real payments will work!