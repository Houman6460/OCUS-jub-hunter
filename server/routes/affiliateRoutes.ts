import express from 'express';
import { affiliateService } from '../affiliateService';
import { db } from '../db';
import { customers, orders, affiliateTransactions, affiliatePayouts, affiliateSettings } from '@shared/schema';
import { eq, and, desc, sum, count } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for affiliate endpoints
const affiliateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

router.use(affiliateRateLimit);

// Create affiliate account
router.post('/create', async (req, res) => {
  try {
    // Extract customer ID from auth header for demo purposes
    const authHeader = req.headers.authorization;
    let customerId = req.session?.customerId || req.body.customerId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [type, userId] = decoded.split(':');
      if (type === 'customer') {
        customerId = userId;
      }
    }
    
    if (!customerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Handle demo customer differently
    if (customerId === 'demo-customer-123') {
      return res.json({ 
        referralCode: 'DEMO123',
        message: 'Demo affiliate account created successfully'
      });
    }

    const result = await affiliateService.createAffiliate(customerId, req.body.paymentEmail);
    res.json(result);
  } catch (error) {
    console.error('Create affiliate error:', error);
    res.status(500).json({ error: 'Failed to create affiliate account' });
  }
});

// Get affiliate dashboard data
router.get('/dashboard/:customerId', async (req, res) => {
  try {
    // Get customer ID from URL param first, then try other sources
    let customerId = req.params.customerId || req.session?.customerId;
    
    // Extract from auth header if not in params
    if (!customerId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [type, userId] = decoded.split(':');
        if (type === 'customer') {
          customerId = userId;
        }
      }
    }
    
    if (!customerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Handle demo customer differently
    if (customerId === 'demo-customer-123') {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      return res.json({
        affiliate: {
          id: 'demo-customer-123',
          referralCode: 'DEMO123',
          paymentMethod: 'paypal',
          paymentEmail: 'demo@example.com',
          isAffiliate: true
        },
        stats: {
          clicks: 25,
          conversions: 5,
          conversionRate: 20.0,
          pendingCommission: '25.00',
          totalEarnings: '125.00',
          totalReferrals: 5
        },
        referralLink: `${baseUrl}?ref=DEMO123`,
        recentTransactions: [
          {
            id: 1,
            customerEmail: 'john@example.com',
            orderAmount: '49.99',
            commission: '25.00',
            status: 'approved',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            customerEmail: 'jane@example.com',
            orderAmount: '49.99',
            commission: '25.00',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        ],
        payoutHistory: []
      });
    }

    const dashboard = await affiliateService.getAffiliateDashboard(customerId);
    res.json(dashboard);
  } catch (error) {
    console.error('Get affiliate dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate dashboard' });
  }
});

// Update payment method
router.post('/payment-method/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const { method, details } = req.body;

    if (!customerId || !method || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Handle demo customer
    if (customerId === 'demo-customer-123') {
      return res.json({ 
        success: true,
        message: 'Payment method updated successfully (demo)'
      });
    }

    const result = await affiliateService.updatePaymentMethod(customerId, method, details);
    res.json(result);
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Request payout
router.post('/request-payout/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId || req.body.customerId;
    
    if (!customerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payout = await affiliateService.requestPayout(
      customerId,
      amount,
      paymentMethod,
      paymentDetails
    );
    
    res.json(payout);
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ error: error.message || 'Failed to request payout' });
  }
});

// Track referral (webhook endpoint)
router.post('/track-referral', async (req, res) => {
  try {
    const { referralCode, orderId } = req.body;

    if (!referralCode || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await affiliateService.trackReferral(referralCode, orderId);
    res.json({ success: true });
  } catch (error) {
    console.error('Track referral error:', error);
    res.status(500).json({ error: 'Failed to track referral' });
  }
});

// Admin routes
router.get('/admin/stats', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const stats = await affiliateService.getAffiliateStats();
    res.json(stats);
  } catch (error) {
    console.error('Get affiliate stats error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate stats' });
  }
});

router.get('/admin/pending-payouts', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const payouts = await db
      .select({
        id: affiliatePayouts.id,
        affiliateId: affiliatePayouts.affiliateId,
        amount: affiliatePayouts.amount,
        paymentMethod: affiliatePayouts.paymentMethod,
        paymentEmail: affiliatePayouts.paymentEmail,
        status: affiliatePayouts.status,
        requestedAt: affiliatePayouts.requestedAt,
        affiliate: {
          name: customers.name,
          email: customers.email
        }
      })
      .from(affiliatePayouts)
      .leftJoin(customers, eq(affiliatePayouts.affiliateId, customers.id))
      .where(eq(affiliatePayouts.status, 'pending'))
      .orderBy(desc(affiliatePayouts.requestedAt));

    res.json(payouts);
  } catch (error) {
    console.error('Get pending payouts error:', error);
    res.status(500).json({ error: 'Failed to fetch pending payouts' });
  }
});

router.post('/admin/approve-payout/:payoutId', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const payoutId = parseInt(req.params.payoutId);
    const { transactionId } = req.body;

    await affiliateService.approvePayout(payoutId, transactionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({ error: 'Failed to approve payout' });
  }
});

router.post('/admin/reject-payout/:payoutId', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const payoutId = parseInt(req.params.payoutId);

    await db
      .update(affiliatePayouts)
      .set({ 
        status: 'rejected',
        processedAt: new Date()
      })
      .where(eq(affiliatePayouts.id, payoutId));

    res.json({ success: true });
  } catch (error) {
    console.error('Reject payout error:', error);
    res.status(500).json({ error: 'Failed to reject payout' });
  }
});

router.post('/admin/auto-approve-commissions', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    await affiliateService.autoApproveCommissions();
    res.json({ success: true });
  } catch (error) {
    console.error('Auto-approve commissions error:', error);
    res.status(500).json({ error: 'Failed to auto-approve commissions' });
  }
});

// Middleware to handle referral tracking on order completion
export const trackReferralMiddleware = async (orderId: number, referralCode?: string) => {
  if (referralCode) {
    try {
      await affiliateService.trackReferral(referralCode, orderId);
      console.log(`Referral tracked for order ${orderId} with code ${referralCode}`);
    } catch (error) {
      console.error('Failed to track referral:', error);
    }
  }
};

// Automated processes (can be called by cron jobs)
router.post('/admin/process-automatic-payouts', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    await affiliateService.processAutomaticPayouts();
    res.json({ success: true });
  } catch (error) {
    console.error('Process automatic payouts error:', error);
    res.status(500).json({ error: 'Failed to process automatic payouts' });
  }
});

// Get affiliate settings (public endpoint for affiliates)
router.get('/settings', async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(affiliateSettings)
      .limit(1);

    if (settings.length === 0) {
      // Return default settings if none exist
      return res.json({
        defaultRewardType: 'fixed',
        defaultCommissionRate: '10.00',
        defaultFixedAmount: '25.00',
        minPayoutAmount: '50.00',
        cookieLifetimeDays: 30
      });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Get affiliate settings error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate settings' });
  }
});

// Get affiliate settings (admin)
router.get('/admin/settings', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const settings = await db
      .select()
      .from(affiliateSettings)
      .limit(1);

    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings = await db
        .insert(affiliateSettings)
        .values({})
        .returning();
      
      return res.json(defaultSettings[0]);
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Get affiliate settings error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate settings' });
  }
});

// Update affiliate settings
router.put('/admin/settings', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const {
      defaultRewardType,
      defaultCommissionRate,
      defaultFixedAmount,
      minPayoutAmount,
      cookieLifetimeDays,
      autoApprovalEnabled,
      autoApprovalThreshold,
      payoutFrequency
    } = req.body;

    // Get existing settings or create if none exist
    const existingSettings = await db
      .select()
      .from(affiliateSettings)
      .limit(1);

    let updatedSettings;

    if (existingSettings.length === 0) {
      // Create new settings
      updatedSettings = await db
        .insert(affiliateSettings)
        .values({
          defaultRewardType,
          defaultCommissionRate,
          defaultFixedAmount,
          minPayoutAmount,
          cookieLifetimeDays,
          autoApprovalEnabled,
          autoApprovalThreshold,
          payoutFrequency,
          updatedAt: new Date()
        })
        .returning();
    } else {
      // Update existing settings
      updatedSettings = await db
        .update(affiliateSettings)
        .set({
          defaultRewardType,
          defaultCommissionRate,
          defaultFixedAmount,
          minPayoutAmount,
          cookieLifetimeDays,
          autoApprovalEnabled,
          autoApprovalThreshold,
          payoutFrequency,
          updatedAt: new Date()
        })
        .where(eq(affiliateSettings.id, existingSettings[0].id))
        .returning();
    }

    res.json(updatedSettings[0]);
  } catch (error) {
    console.error('Update affiliate settings error:', error);
    res.status(500).json({ error: 'Failed to update affiliate settings' });
  }
});

export { router as affiliateRoutes };