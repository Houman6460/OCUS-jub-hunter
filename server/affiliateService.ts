import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { customers, affiliateTransactions, affiliatePayouts, orders } from '../shared/schema';
import * as schema from '../shared/schema';
import { eq, desc, sum, count, and, gte, lte, isNotNull } from 'drizzle-orm';
import { nanoid } from "nanoid";
import { affiliateEmailService } from "./emailService/affiliateEmails";

export class AffiliateService {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }
  
  // Generate unique referral code
  async generateReferralCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = nanoid(8).toUpperCase();
      const existing = await this.db
        .select()
        .from(customers)
        .where(eq(customers.referralCode, code))
        .limit(1);
      
      isUnique = existing.length === 0;
      if (isUnique) return code;
    }
    
    throw new Error('Unable to generate unique referral code');
  }

  // Create affiliate account
  async createAffiliate(customerId: number, paymentEmail?: string): Promise<{ referralCode: string }> {
    const referralCode = await this.generateReferralCode();
    
    await this.db
      .update(customers)
      .set({ 
        referralCode,
        commissionRate: "10.00" // Default 10%
      })
      .where(eq(customers.id, customerId));

    return { referralCode };
  }

  // Track referral and create commission
  async trackReferral(referralCode: string, orderId: number): Promise<void> {
    // Find affiliate by referral code
    const affiliate = await this.db
      .select()
      .from(customers)
      .where(eq(customers.referralCode, referralCode))
      .limit(1);

    if (affiliate.length === 0) return;

    // Get order details
    const order = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) return;

    const affiliateData = affiliate[0];
    const orderData = order[0];
    
    // Calculate commission
    const commissionRate = parseFloat(affiliateData.commissionRate || "10.00") / 100;
    const commissionAmount = parseFloat(orderData.finalAmount) * commissionRate;

    // Create affiliate transaction
    await this.db.insert(affiliateTransactions).values({
      affiliateId: affiliateData.id,
      orderId: orderId,
      commission: commissionAmount.toFixed(2),
      status: "pending"
    });

    // Update affiliate total earnings
    const newTotalEarnings = parseFloat(affiliateData.totalEarnings || "0") + commissionAmount;
    await this.db
      .update(customers)
      .set({ 
        totalEarnings: newTotalEarnings.toFixed(2)
      })
      .where(eq(customers.id, affiliateData.id));
  }

  // Get affiliate dashboard stats
  async getAffiliateDashboard(customerId: number) {
    const affiliate = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (affiliate.length === 0) {
      throw new Error('Affiliate not found');
    }

    const affiliateData = affiliate[0];

    // Get commission statistics
    const commissionStats = await this.db
      .select({
        totalCommissions: sum(affiliateTransactions.commission),
        totalReferrals: count(affiliateTransactions.id),
        pendingCommissions: sum(affiliateTransactions.commission)
      })
      .from(affiliateTransactions)
      .where(eq(affiliateTransactions.affiliateId, customerId));

    // Get recent transactions
    const recentTransactions = await this.db
      .select({
        id: affiliateTransactions.id,
        commission: affiliateTransactions.commission,
        status: affiliateTransactions.status,
        createdAt: affiliateTransactions.createdAt,
        orderId: orders.id,
        customerEmail: orders.customerEmail,
        orderAmount: orders.finalAmount
      })
      .from(affiliateTransactions)
      .leftJoin(orders, eq(affiliateTransactions.orderId, orders.id))
      .where(eq(affiliateTransactions.affiliateId, customerId))
      .orderBy(desc(affiliateTransactions.createdAt))
      .limit(10);

    // Get payout history
    const payoutHistory = await this.db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, customerId))
      .orderBy(desc(affiliatePayouts.createdAt))
      .limit(10);

    return {
      affiliate: affiliateData,
      stats: commissionStats[0],
      recentTransactions,
      payoutHistory,
      referralLink: `${process.env.BASE_URL || 'http://localhost:5000'}/?ref=${affiliateData.referralCode}`
    };
  }

  // Get affiliate stats
  async getAffiliateStats(customerId: number): Promise<{
    totalEarnings: string;
    totalReferrals: number;
    totalCommissions: string;
  }> {
    const affiliate = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (affiliate.length === 0) {
      throw new Error('Affiliate not found');
    }

    const affiliateData = affiliate[0];

    // Get commission statistics
    const commissionStats = await this.db
      .select({
        totalCommissions: sum(affiliateTransactions.commission),
        totalReferrals: count(affiliateTransactions.id)
      })
      .from(affiliateTransactions)
      .where(eq(affiliateTransactions.affiliateId, customerId));

    return {
      totalEarnings: affiliateData.totalEarnings,
      totalReferrals: commissionStats[0].totalReferrals,
      totalCommissions: commissionStats[0].totalCommissions
    };
  }

  // Update payment method
  async updatePaymentMethod(customerId: number, paymentMethod: string, paymentDetails: any): Promise<{ success: boolean, message: string }> {
    // Update the customer's payment method
    const updateData: any = {
      paymentMethod: paymentMethod
    };

    if (paymentMethod === 'paypal') {
      updateData.paymentEmail = paymentDetails.email;
    } else if (paymentMethod === 'bank') {
      updateData.bankDetails = paymentDetails;
    } else if (paymentMethod === 'stripe') {
      updateData.stripeAccountId = paymentDetails.account_id;
      updateData.paymentEmail = paymentDetails.email;
    }

    await this.db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId));

    return { success: true, message: 'Payment method updated successfully' };
  }

  // Request payout
  async requestPayout(customerId: number, amount: number, paymentMethod: string, paymentDetails: any) {
    // Check if affiliate has enough pending commission
    const pendingCommission = await this.db
      .select({
        total: sum(affiliateTransactions.commission)
      })
      .from(affiliateTransactions)
      .where(
        and(
          eq(affiliateTransactions.affiliateId, customerId),
          eq(affiliateTransactions.status, "pending")
        )
      );

    const availableAmount = parseFloat(pendingCommission[0]?.total || "0");
    
    if (availableAmount < amount) {
      throw new Error('Insufficient commission balance');
    }

    if (amount < 50) {
      throw new Error('Minimum payout amount is $50');
    }

    // Create payout request
    const payout = await this.db.insert(affiliatePayouts).values({
      affiliateId: customerId,
      amount: amount.toFixed(2),
      paymentMethod,
      paymentEmail: paymentDetails.email,
      bankDetails: paymentMethod === 'bank' ? paymentDetails : null,
      status: 'pending'
    }).returning();

    return payout[0];
  }

  // Admin: Approve payout
  async approvePayout(payoutId: number, transactionId?: string) {
    await this.db
      .update(affiliatePayouts)
      .set({
        status: 'paid',
        transactionId,
        paidAt: new Date(),
        processedAt: new Date()
      })
      .where(eq(affiliatePayouts.id, payoutId));

    // Mark related transactions as paid
    const payout = await this.db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.id, payoutId))
      .limit(1);

    if (payout.length > 0) {
      const payoutAmount = parseFloat(payout[0].amount);
      
      // Find transactions to mark as paid (up to the payout amount)
      let remainingAmount = payoutAmount;
      const transactions = await this.db
        .select()
        .from(affiliateTransactions)
        .where(
          and(
            eq(affiliateTransactions.affiliateId, payout[0].affiliateId),
            eq(affiliateTransactions.status, "pending")
          )
        )
        .orderBy(affiliateTransactions.createdAt);

      for (const transaction of transactions) {
        if (remainingAmount <= 0) break;
        
        const commissionAmount = parseFloat(transaction.commission);
        if (commissionAmount <= remainingAmount) {
          await this.db
            .update(affiliateTransactions)
            .set({ 
              status: 'paid',
              paidAt: new Date()
            })
            .where(eq(affiliateTransactions.id, transaction.id));
          
          remainingAmount -= commissionAmount;
        }
      }
    }
  }

  // Admin: Get all affiliate overview stats
  async getAllAffiliateStats() {
    const totalAffiliates = await this.db
      .select({ count: count() })
      .from(customers)
      .where(isNotNull(customers.referralCode));

    const totalCommissions = await this.db
      .select({
        total: sum(affiliateTransactions.commission)
      })
      .from(affiliateTransactions);

    const pendingPayouts = await this.db
      .select({
        count: count(),
        total: sum(affiliatePayouts.amount)
      })
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.status, "pending"));

    const topAffiliates = await this.db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        referralCode: customers.referralCode,
        totalEarnings: customers.totalEarnings,
        totalReferrals: count(affiliateTransactions.id),
        totalCommissions: sum(affiliateTransactions.commission)
      })
      .from(customers)
      .leftJoin(affiliateTransactions, eq(customers.id, affiliateTransactions.affiliateId))
      .where(isNotNull(customers.referralCode))
      .groupBy(customers.id, customers.name, customers.email, customers.referralCode, customers.totalEarnings)
      .orderBy(desc(sum(affiliateTransactions.commission)))
      .limit(10);

    return {
      totalAffiliates: totalAffiliates[0].count,
      totalCommissions: totalCommissions[0]?.total || "0",
      pendingPayouts: pendingPayouts[0],
      topAffiliates
    };
  }

  // Auto-approve commissions for orders over threshold
  async autoApproveCommissions(threshold: number = 100) {
    const pendingTransactions = await this.db
      .select()
      .from(affiliateTransactions)
      .leftJoin(orders, eq(affiliateTransactions.orderId, orders.id))
      .where(
        and(
          eq(affiliateTransactions.status, "pending"),
          eq(orders.status, "completed")
        )
      );

    for (const transaction of pendingTransactions) {
      const orderAmount = parseFloat(transaction.orders?.finalAmount || "0");
      
      if (orderAmount >= threshold) {
        await this.db
          .update(affiliateTransactions)
          .set({ status: "approved" })
          .where(eq(affiliateTransactions.id, transaction.affiliate_transactions.id));
      }
    }
  }

  // Process automatic payouts
  async processAutomaticPayouts() {
    // This would integrate with PayPal API or other payment processors
    // For now, we'll just mark them as processing
    const approvedTransactions = await this.db
      .select({
        affiliateId: affiliateTransactions.affiliateId,
        totalCommission: sum(affiliateTransactions.commission)
      })
      .from(affiliateTransactions)
      .where(eq(affiliateTransactions.status, "approved"))
      .groupBy(affiliateTransactions.affiliateId)
      .having(({ totalCommission }: { totalCommission: any }) => totalCommission >= 50); // Minimum payout threshold

    for (const affiliate of approvedTransactions) {
      // Get affiliate payment details
      const affiliateData = await this.db
        .select()
        .from(customers)
        .where(eq(customers.id, affiliate.affiliateId))
        .limit(1);

      if (affiliateData.length > 0 && affiliateData[0].email) {
        // Create automatic payout
        await this.requestPayout(
          affiliate.affiliateId,
          parseFloat(affiliate.totalCommission || "0"),
          'paypal',
          { email: affiliateData[0].email }
        );
      }
    }
  }
}
