import { 
  users, 
  orders, 
  products, 
  downloads, 
  coupons, 
  settings, 
  seoSettings,
  authSettings, 
  activationKeys, 
  activationCodes,
  extensionInstallations,
  demoUsers, 
  customers, 
  affiliateTransactions,
  extensionUsageStats,
  customerPayments,
  globalUsageStats,
  tickets,
  ticketMessages,
  countdownBanners,
  announcementBadges,
  extensionDownloads,
  extensionUsageLogs,
  missions,
  userTrials,
  trialUsage,
  premiumDevices,
  dashboardFeatures,
  invoices,
  invoiceItems,
  invoiceSettings,
  type User, 
  type InsertUser, 
  type Order, 
  type InsertOrder, 
  type Product, 
  type InsertProduct, 
  type Download, 
  type InsertDownload, 
  type Coupon, 
  type InsertCoupon, 
  type Setting, 
  type InsertSetting, 
  type SeoSettings,
  type InsertSeoSettings,
  type AuthSetting, 
  type InsertAuthSetting, 
  type ActivationKey, 
  type InsertActivationKey, 
  type ActivationCode,
  type InsertActivationCode,
  type ExtensionInstallation,
  type InsertExtensionInstallation,
  type DemoUser, 
  type InsertDemoUser, 
  type Customer, 
  type InsertCustomer, 
  type AffiliateTransaction, 
  type InsertAffiliateTransaction,
  type ExtensionUsageStats,
  type InsertExtensionUsageStats,
  type CustomerPayment,
  type InsertCustomerPayment,
  type GlobalUsageStats,
  type InsertGlobalUsageStats,
  type CountdownBanner,
  type InsertCountdownBanner,
  type AnnouncementBadge,
  type InsertAnnouncementBadge,
  type ExtensionDownload,
  type InsertExtensionDownload,
  type ExtensionUsageLog,
  type InsertExtensionUsageLog,
  type Mission,
  type InsertMission,
  type UserTrial,
  type InsertUserTrial,
  type Ticket,
  type TicketMessage,
  type TrialUsage,
  type InsertTrialUsage,
  type PremiumDevice,
  type InsertPremiumDevice,
  type DashboardFeature,
  type InsertDashboardFeature,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type InvoiceSettings,
  type InsertInvoiceSettings
} from "@shared/schema";
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";
import type { DbInstance } from './db';
import crypto from "crypto";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByDownloadToken(token: string): Promise<Order | undefined>;
  getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined>;
  getOrderByPaypalOrderId(paypalOrderId: string): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string, completedAt?: Date): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;
  incrementDownloadCount(id: number): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrdersWithPagination(page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  getUserOrders(userId: number): Promise<Order[]>;

  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getActiveProducts(): Promise<Product[]>;
  getActiveProduct(): Promise<Product | undefined>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;

  // Downloads
  createDownload(download: InsertDownload): Promise<Download>;
  getDownloadsByOrder(orderId: number): Promise<Download[]>;
  getUserDownloads(userId: number): Promise<Download[]>;

  // Analytics
  getTotalRevenue(): Promise<number>;
  getTotalSales(): Promise<number>;
  getRecentOrders(limit: number): Promise<Order[]>;

  // Coupons
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  updateCoupon(id: number, updates: Partial<InsertCoupon>): Promise<Coupon>;
  getAllCoupons(): Promise<Coupon[]>;
  incrementCouponUsage(id: number): Promise<Coupon>;

  // Settings
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;

  // SEO Settings
  getSeoSettings(): Promise<SeoSettings | undefined>;
  updateSeoSettings(settings: Partial<InsertSeoSettings>): Promise<SeoSettings>;
  
  // Auth Settings
  getAuthSettings(): Promise<AuthSetting | undefined>;
  updateAuthSettings(updates: Partial<InsertAuthSetting>): Promise<AuthSetting>;
  createAuthSettings(authSetting: InsertAuthSetting): Promise<AuthSetting>;

  // Activation Keys
  createActivationKey(activationKey: InsertActivationKey): Promise<ActivationKey>;
  getActivationKeyByKey(key: string): Promise<ActivationKey | undefined>;
  updateActivationKeyUsage(key: string): Promise<ActivationKey>;
  getRecentActivationKeys(): Promise<ActivationKey[]>;

  // Extension installations - NEW
  createExtensionInstallation(data: InsertExtensionInstallation): Promise<ExtensionInstallation>;
  getExtensionInstallation(installationId: string): Promise<ExtensionInstallation | null>;
  updateInstallationLastSeen(installationId: string): Promise<void>;
  getUserInstallations(userId: number): Promise<ExtensionInstallation[]>;

  // Enhanced activation codes - NEW
  createActivationCodeForUser(userId: number, installationId: string, orderId?: number): Promise<ActivationCode>;
  validateActivationCodeForInstallation(code: string, installationId: string): Promise<{ valid: boolean; message: string; activationCode?: ActivationCode }>;
  getActivationCodeByInstallation(installationId: string): Promise<ActivationCode | null>;
  revokeActivationCode(codeId: number, reason?: string): Promise<void>;

  // Demo Users
  createDemoUser(demoUser: InsertDemoUser): Promise<DemoUser>;
  getDemoUserById(userId: string): Promise<DemoUser | undefined>;
  incrementDemoUsage(userId: string): Promise<DemoUser>;

  // Customer operations
  getCustomer(id: number | string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerBySocialId(provider: string, socialId: string): Promise<Customer | undefined>;
  createCustomer(customerData: InsertCustomer): Promise<Customer>;
  updateCustomerActivationKey(id: number | string, activationKey: string): Promise<void>;
  updateCustomer(id: number | string, updates: Partial<InsertCustomer>): Promise<Customer>;
  getCustomerOrders(customerId: string): Promise<Order[]>;
  getAllCustomers(): Promise<Customer[]>;
  deleteCustomer(id: number | string): Promise<void>;
  generateActivationKey(customerId: string): Promise<string>;
  activateCustomer(activationKey: string): Promise<Customer | null>;

  // Affiliate operations
  getCustomerByReferralCode(code: string): Promise<Customer | undefined>;
  createAffiliateTransaction(transaction: InsertAffiliateTransaction): Promise<AffiliateTransaction>;
  getAffiliateTransactions(affiliateId: number): Promise<AffiliateTransaction[]>;
  getAffiliateStats(affiliateId: number): Promise<{totalEarnings: number, totalReferrals: number, pendingCommissions: number}>;
  
  // Product Pricing Management
  updateProductPricing(data: { price: number; beforePrice: number | null }): Promise<any>;
  getCurrentProduct(): Promise<any>;
  
  // Extension Usage Statistics
  recordExtensionUsage(stats: InsertExtensionUsageStats): Promise<ExtensionUsageStats>;
  getCustomerUsageStats(customerId: string): Promise<ExtensionUsageStats[]>;
  getGlobalUsageStats(): Promise<GlobalUsageStats[]>;
  updateGlobalStats(date: string): Promise<void>;
  
  // Customer Payments
  recordPayment(payment: InsertCustomerPayment): Promise<CustomerPayment>;
  getCustomerPayments(customerId: number): Promise<CustomerPayment[]>;
  updatePaymentStatus(paymentId: number, status: string, processedAt?: Date): Promise<CustomerPayment>;

  // Invoice Management
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  getCustomerInvoices(customerId: number): Promise<Invoice[]>;
  getAllInvoices(): Promise<Invoice[]>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string, paidAt?: Date): Promise<Invoice>;
  generateInvoiceNumber(): Promise<string>;
  
  // Invoice Items Management
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  // Invoice Settings
  getInvoiceSettings(): Promise<InvoiceSettings | undefined>;
  updateInvoiceSettings(settings: Partial<InsertInvoiceSettings>): Promise<InvoiceSettings>;
  createInvoiceSettings(settings: InsertInvoiceSettings): Promise<InvoiceSettings>;
  
  // Real Ticket Operations (Database)
  createTicketDB(ticket: any): Promise<Ticket>;
  getTicketDB(id: number): Promise<Ticket | undefined>;
  getCustomerTickets(customerEmail: string): Promise<Ticket[]>;
  getAllTicketsDB(): Promise<Ticket[]>;
  updateTicketStatusDB(id: number, status: string): Promise<Ticket>;
  deleteTicketDB(id: number): Promise<void>;
  addTicketMessageDB(message: any): Promise<TicketMessage>;
  getTicketMessagesDB(ticketId: number): Promise<TicketMessage[]>;
  
  // Countdown Banners
  getActiveCountdownBanner(): Promise<CountdownBanner | null>;
  getAllCountdownBanners(): Promise<CountdownBanner[]>;
  createCountdownBanner(data: InsertCountdownBanner): Promise<CountdownBanner>;
  updateCountdownBanner(id: number, data: Partial<InsertCountdownBanner>): Promise<CountdownBanner>;
  deleteCountdownBanner(id: number): Promise<void>;
  
  // Announcement Badges  
  getActiveAnnouncementBadge(): Promise<AnnouncementBadge | null>;
  getAllAnnouncementBadges(): Promise<AnnouncementBadge[]>;
  createAnnouncementBadge(data: InsertAnnouncementBadge): Promise<AnnouncementBadge>;
  updateAnnouncementBadge(id: number, data: Partial<InsertAnnouncementBadge>): Promise<AnnouncementBadge>;
  deleteAnnouncementBadge(id: number): Promise<void>;

  getActivationKeyByOrderId(orderId: number): Promise<ActivationKey | null>;

  // Extension Management
  createExtensionDownload(download: InsertExtensionDownload): Promise<ExtensionDownload>;
  getExtensionDownload(token: string): Promise<ExtensionDownload | undefined>;
  incrementExtensionDownloadCount(id: number): Promise<ExtensionDownload>;
  getCustomerExtensionDownloads(customerId: number | string): Promise<ExtensionDownload[]>;

  // Social Authentication Methods
  getCustomerBySocialId(provider: string, socialId: string): Promise<Customer | undefined>;
  
  // Customer Extension Management
  blockCustomer(customerId: number | string, reason: string): Promise<Customer>;
  
  // Mission Tracking
  createMission(mission: InsertMission): Promise<Mission>;
  getMission(missionId: string): Promise<Mission | undefined>;
  updateMissionStatus(missionId: string, status: string, timestamp?: Date): Promise<Mission>;
  getUserMissions(userId: string): Promise<Mission[]>;
  getCustomerMissions(customerId: number): Promise<Mission[]>;
  
  // User Trial Management
  createUserTrial(trial: InsertUserTrial): Promise<UserTrial>;
  getUserTrial(userId: string): Promise<UserTrial | undefined>;
  updateTrialUsage(userId: string, trialsUsed: number): Promise<UserTrial>;
  activateUser(userId: string, activationKey: string): Promise<UserTrial>;
  unblockCustomer(customerId: number | string): Promise<Customer>;
  generateExtensionActivationKey(customerId: number | string): Promise<Customer>;
  activateExtension(customerId: number | string, activationKey: string): Promise<Customer>;
  recordExtensionUsageLog(usage: InsertExtensionUsageLog): Promise<ExtensionUsageLog>;
  getCustomerTrialUsage(customerId: number | string): Promise<number>;
  canUseExtension(customerId: number | string): Promise<{ canUse: boolean; reason?: string; trialUsed?: number; isBlocked?: boolean }>;

  // Admin Customer Management
  getAllCustomersForAdmin(): Promise<Customer[]>;
  getCustomerActivations(): Promise<{ customer: Customer; downloads: ExtensionDownload[] }[]>;
  
  // Lottery Scratch Activation System
  revealActivationKey(customerId: string): Promise<Customer>;
  generateUniqueActivationKey(): string;
  
  // Activation Code System
  createActivationCode(code: InsertActivationCode): Promise<ActivationCode>;
  getActivationCode(code: string): Promise<ActivationCode | undefined>;
  getActivationCodeByVersionToken(versionToken: string): Promise<ActivationCode | undefined>;
  activateCode(code: string, deviceId: string, ipAddress: string): Promise<ActivationCode>;
  getCustomerActivationCodes(customerId: string): Promise<ActivationCode[]>;
  deactivateCode(code: string): Promise<ActivationCode>;
  generateActivationCode(customerId: string, orderId?: number): Promise<ActivationCode>;
  
  // Trial Usage Tracking
  getTrialUsage(trialKey: string): Promise<TrialUsage | undefined>;
  createTrialUsage(trial: InsertTrialUsage): Promise<TrialUsage>;
  incrementTrialUsage(trialKey: string): Promise<TrialUsage>;
  expireTrialUsage(trialKey: string): Promise<TrialUsage>;
  
  // Premium Device Management
  getPremiumDevice(userId: string, deviceFingerprint: string): Promise<PremiumDevice | undefined>;
  getUserPremiumDevices(userId: string): Promise<PremiumDevice[]>;
  registerPremiumDevice(userId: string, deviceFingerprint: string, extensionId: string): Promise<PremiumDevice>;
  deactivatePremiumDevice(deviceFingerprint: string, reason?: string): Promise<PremiumDevice>;
  updatePremiumDeviceLastSeen(deviceFingerprint: string): Promise<PremiumDevice>;

  // Dashboard Features Management
  getDashboardFeatures(): Promise<DashboardFeature[]>;
  getDashboardFeature(featureName: string): Promise<DashboardFeature | undefined>;
  createDashboardFeature(feature: InsertDashboardFeature): Promise<DashboardFeature>;
  updateDashboardFeature(featureName: string, isEnabled: boolean, description?: string): Promise<DashboardFeature>;
  initializeDashboardFeatures(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private db: DbInstance;

  constructor(db: DbInstance) {
    this.db = db;
  }
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const now = new Date().getTime();
    const [customer] = await this.db
      .insert(customers)
      .values({ ...customerData, createdAt: now, updatedAt: now })
      .returning();
    return customer;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async updateAuthSettings(updates: Partial<InsertAuthSetting>): Promise<AuthSetting> {
    // Get existing auth settings
    const existing = await this.getAuthSettings();
    
    if (existing) {
      // Update existing auth settings
      const [updated] = await this.db
        .update(authSettings)
        .set({ ...updates, updatedAt: new Date().getTime() })
        .where(eq(authSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new auth settings
      return await this.createAuthSettings(updates as InsertAuthSetting);
    }
  }

  async updateSeoSettings(updates: Partial<InsertSeoSettings>): Promise<SeoSettings> {
    // Get existing SEO settings
    const existing = await this.getSeoSettings();
    
    if (existing) {
      // Update existing SEO settings
      const [updated] = await this.db
        .update(seoSettings)
        .set({ ...updates, updatedAt: new Date().getTime() })
        .where(eq(seoSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new SEO settings with defaults
      const [created] = await this.db
        .insert(seoSettings)
        .values(updates as InsertSeoSettings)
        .returning();
      return created;
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await this.db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createActivationKey(insertActivationKey: InsertActivationKey): Promise<ActivationKey> {
    const [activationKey] = await this.db
      .insert(activationKeys)
      .values(insertActivationKey)
      .returning();
    return activationKey;
  }

  async updateTicket(id: number, updateData: any): Promise<any> {
    const [updatedTicket] = await this.db.update(tickets).set({ ...updateData, updatedAt: new Date().getTime() }).where(eq(tickets.id, id)).returning();
    return updatedTicket;
  }

  async addTicketMessage(message: any): Promise<any> {
    const [newMessage] = await this.db.insert(ticketMessages).values({ ...message, createdAt: new Date().getTime() }).returning();
    return newMessage;
  }

  async recordExtensionUsage(stats: InsertExtensionUsageStats): Promise<ExtensionUsageStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStats = await this.db
      .select()
      .from(extensionUsageStats)
      .where(and(eq(extensionUsageStats.customerId, stats.customerId), eq(extensionUsageStats.usageDate, today.getTime())))
      .limit(1);

    if (existingStats.length > 0) {
      const [updatedStats] = await this.db
        .update(extensionUsageStats)
        .set({
          ...stats,
          updatedAt: new Date().getTime()
        })
        .where(eq(extensionUsageStats.id, existingStats[0].id))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await this.db
        .insert(extensionUsageStats)
        .values({
          ...stats,
          usageDate: today.getTime(),
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        })
        .returning();
      return newStats;
    }
  }

  async getCustomerUsageStats(customerId: string): Promise<ExtensionUsageStats[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.db
      .select()
      .from(extensionUsageStats)
      .where(and(eq(extensionUsageStats.customerId, parseInt(customerId)), gte(extensionUsageStats.usageDate, thirtyDaysAgo.getTime())))
      .orderBy(asc(extensionUsageStats.usageDate));
  }

  async getGlobalUsageStats(): Promise<GlobalUsageStats[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.db
      .select()
      .from(globalUsageStats)
      .where(gte(globalUsageStats.statDate, thirtyDaysAgo.getTime()))
      .orderBy(asc(globalUsageStats.statDate));
  }

  async updateGlobalStats(date: string): Promise<void> {
    const statDate = new Date(date).getTime();
    const [existingStats] = await this.db
      .select()
      .from(globalUsageStats)
      .where(eq(globalUsageStats.statDate, date));

    const todayStart = new Date(date + 'T00:00:00Z').getTime();
    const todayEnd = new Date(date + 'T23:59:59Z').getTime();

    const totalUsers = await this.db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.isActivated, true));

    const activeUsers = await this.db
      .select({ count: count() })
      .from(extensionUsageStats)
      .where(and(
        gte(extensionUsageStats.usageDate, todayStart),
        lte(extensionUsageStats.usageDate, todayEnd)
      ));

    const dailyStats = await this.db
      .select({
        totalSessions: count(),
        totalJobsFound: sql<number>`COALESCE(SUM(${extensionUsageStats.jobsFound}), 0)`,
        totalJobsApplied: sql<number>`COALESCE(SUM(${extensionUsageStats.jobsApplied}), 0)`,
        totalSuccessfulJobs: sql<number>`COALESCE(SUM(${extensionUsageStats.successfulJobs}), 0)`,
        avgSessionDuration: sql<number>`COALESCE(AVG(${extensionUsageStats.sessionDuration}), 0)`
      })
      .from(extensionUsageStats)
      .where(and(
        gte(extensionUsageStats.usageDate, todayStart),
        lte(extensionUsageStats.usageDate, todayEnd)
      ));

    const statsData = {
      statDate: date,
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      totalSessions: dailyStats[0]?.totalSessions || 0,
      totalJobsFound: Number(dailyStats[0]?.totalJobsFound) || 0,
      totalJobsApplied: Number(dailyStats[0]?.totalJobsApplied) || 0,
      totalSuccessfulJobs: Number(dailyStats[0]?.totalSuccessfulJobs) || 0,
      avgSessionDuration: dailyStats[0]?.avgSessionDuration?.toString() || "0",
      updatedAt: new Date().getTime()
    };

    if (existingStats) {
      await this.db
        .update(globalUsageStats)
        .set(statsData)
        .where(eq(globalUsageStats.id, existingStats.id));
    } else {
      await this.db
        .insert(globalUsageStats)
        .values(statsData);
    }
  }

  // Customer Payments
  async recordPayment(payment: InsertCustomerPayment): Promise<CustomerPayment> {
    const [newPayment] = await this.db
      .insert(customerPayments)
      .values(payment)
      .returning();

    // Update customer's total spent and order count if payment is completed
    if (payment.status === 'completed') {
      await this.db
        .update(customers)
        .set({ 
          totalSpent: sql`${customers.totalSpent} + ${payment.amount}`,
          totalOrders: sql`${customers.totalOrders} + 1`,
          lastOrderDate: new Date().getTime(),
          updatedAt: new Date().getTime()
        })
        .where(eq(customers.id, payment.customerId));
    }

    return newPayment;
  }

  async getCustomerPayments(customerId: number): Promise<CustomerPayment[]> {
    return await this.db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.customerId, customerId))
      .orderBy(desc(customerPayments.createdAt));
  }

  async updatePaymentStatus(paymentId: number, status: string, processedAt?: Date): Promise<CustomerPayment> {
    const [updatedPayment] = await this.db
      .update(customerPayments)
      .set({ 
        status, 
        processedAt: (processedAt || new Date()).getTime()
      })
      .where(eq(customerPayments.id, paymentId))
      .returning();

    return updatedPayment;
  }

  // Database Ticket Operations (Real Implementation)
  async createTicketDB(ticket: any): Promise<Ticket> {
    const [newTicket] = await this.db
      .insert(tickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async getTicketDB(id: number): Promise<Ticket | undefined> {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
    return ticket;
  }

  async getCustomerTickets(customerEmail: string): Promise<Ticket[]> {
    return await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.customerEmail, customerEmail))
      .orderBy(desc(tickets.createdAt));
  }

  async getAllTicketsDB(): Promise<Ticket[]> {
    return await this.db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt));
  }

  async updateTicketStatusDB(id: number, status: string): Promise<Ticket> {
    const updateData: any = { 
      status, 
      updatedAt: new Date().getTime() 
    };
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date().getTime();
    }

    const [updatedTicket] = await this.db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    
    return updatedTicket;
  }

  async deleteTicketDB(id: number): Promise<void> {
    // First delete associated messages
    await this.db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
    // Then delete the ticket
    await this.db.delete(tickets).where(eq(tickets.id, id));
  }

  async addTicketMessageDB(message: any): Promise<TicketMessage> {
    const [newMessage] = await this.db
      .insert(ticketMessages)
      .values(message)
      .returning();
    
    // Update ticket's updatedAt timestamp
    await this.db
      .update(tickets)
      .set({ updatedAt: new Date().getTime() })
      .where(eq(tickets.id, message.ticketId));
    
    return newMessage;
  }

  async getTicketMessagesDB(ticketId: number): Promise<TicketMessage[]> {
    return await this.db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);
  }
  // Product Pricing Management Implementation
  async updateProductPricing(data: { price: number; beforePrice: number | null }): Promise<any> {
    try {
      // First, check if a product exists
      const existingProducts = await this.db.select().from(products).limit(1);
      
      if (existingProducts.length === 0) {
        // Create new product with default values
        const [newProduct] = await this.db
          .insert(products)
          .values({
            name: "OCUS Job Hunter Chrome Extension",
            description: "Premium Chrome extension for photography job hunting on OCUS (Ubereats/Foodora deliveries)",
            price: data.price.toString(),
            beforePrice: data.beforePrice ? data.beforePrice.toString() : null,
            currency: "eur",
            fileName: "ocus-extension.crx",
            filePath: "/uploads/ocus-extension.crx",
            isActive: true
          })
          .returning();
        return newProduct;
      } else {
        // Update existing product
        const [updatedProduct] = await this.db
          .update(products)
          .set({
            price: data.price.toString(),
            beforePrice: data.beforePrice ? data.beforePrice.toString() : null
          })
          .where(eq(products.id, existingProducts[0].id))
          .returning();
        return updatedProduct;
      }
    } catch (error) {
      console.error("Error updating product pricing:", error);
      throw error;
    }
  }

  async getCurrentProduct(): Promise<any> {
    try {
      const productList = await this.db.select().from(products).where(eq(products.isActive, true)).limit(1);
      
      if (productList.length === 0) {
        // Return default product structure
        return {
          id: 1,
          name: "OCUS Job Hunter Chrome Extension",
          description: "Premium Chrome extension for photography job hunting on OCUS (Ubereats/Foodora deliveries)",
          price: "500.00",
          beforePrice: null,
          currency: "eur"
        };
      }
      
      return productList[0];
    } catch (error) {
      console.error("Error fetching current product:", error);
      throw error;
    }
  }

  // Countdown Banner Management
  async createCountdownBanner(bannerData: any): Promise<any> {
    try {
      const [newBanner] = await this.db
        .insert(countdownBanners)
        .values(bannerData)
        .returning();
      return newBanner;
    } catch (error) {
      console.error("Error creating countdown banner:", error);
      throw error;
    }
  }

  async updateCountdownBanner(id: number, bannerData: any): Promise<any> {
    try {
      const [updatedBanner] = await this.db
        .update(countdownBanners)
        .set({ ...bannerData, updatedAt: new Date().getTime() })
        .where(eq(countdownBanners.id, id))
        .returning();
      return updatedBanner;
    } catch (error) {
      console.error("Error updating countdown banner:", error);
      throw error;
    }
  }

  async getActiveCountdownBanner(): Promise<any> {
    try {
      const [activeBanner] = await this.db
        .select()
        .from(countdownBanners)
        .where(eq(countdownBanners.isEnabled, true))
        .orderBy(countdownBanners.priority, countdownBanners.createdAt)
        .limit(1);
      
      // Check if banner has expired
      if (activeBanner && new Date(activeBanner.endDateTime) <= new Date()) {
        // Disable expired banner
        await this.db
          .update(countdownBanners)
          .set({ isEnabled: false })
          .where(eq(countdownBanners.id, activeBanner.id));
        return null;
      }
      
      return activeBanner || null;
    } catch (error) {
      console.error("Error fetching active countdown banner:", error);
      throw error;
    }
  }

  async getAllCountdownBanners(): Promise<any[]> {
    try {
      return await this.db
        .select()
        .from(countdownBanners)
        .orderBy(countdownBanners.createdAt);
    } catch (error) {
      console.error("Error fetching countdown banners:", error);
      throw error;
    }
  }

  async deleteCountdownBanner(id: number): Promise<void> {
    try {
      await this.db.delete(countdownBanners).where(eq(countdownBanners.id, id));
    } catch (error) {
      console.error("Error deleting countdown banner:", error);
      throw error;
    }
  }

  // Announcement Badge Management
  async getActiveAnnouncementBadge(): Promise<AnnouncementBadge | null> {
    try {
      const [activeBadge] = await this.db
        .select()
        .from(announcementBadges)
        .where(eq(announcementBadges.isEnabled, true))
        .orderBy(desc(announcementBadges.priority), desc(announcementBadges.createdAt))
        .limit(1);
      
      return activeBadge || null;
    } catch (error) {
      console.error("Error fetching active announcement badge:", error);
      throw error;
    }
  }

  async getAllAnnouncementBadges(): Promise<AnnouncementBadge[]> {
    try {
      return await this.db
        .select()
        .from(announcementBadges)
        .orderBy(desc(announcementBadges.createdAt));
    } catch (error) {
      console.error("Error fetching announcement badges:", error);
      throw error;
    }
  }

  async createAnnouncementBadge(data: InsertAnnouncementBadge): Promise<AnnouncementBadge> {
    try {
      const [badge] = await this.db
        .insert(announcementBadges)
        .values(data)
        .returning();
      return badge;
    } catch (error) {
      console.error("Error creating announcement badge:", error);
      throw error;
    }
  }

  async updateAnnouncementBadge(id: number, data: Partial<InsertAnnouncementBadge>): Promise<AnnouncementBadge> {
    try {
      const [badge] = await this.db
        .update(announcementBadges)
        .set({ ...data, updatedAt: new Date().getTime() })
        .where(eq(announcementBadges.id, id))
        .returning();
      return badge;
    } catch (error) {
      console.error("Error updating announcement badge:", error);
      throw error;
    }
  }

  async deleteAnnouncementBadge(id: number): Promise<void> {
    try {
      await this.db.delete(announcementBadges).where(eq(announcementBadges.id, id));
    } catch (error) {
      console.error("Error deleting announcement badge:", error);
      throw error;
    }
  }

  async deleteCustomer(id: number | string): Promise<void> {
    const customerId = typeof id === 'string' ? parseInt(id) : id;
    // also delete related data
    await this.db.delete(tickets).where(eq(tickets.customerEmail, (await this.getCustomer(customerId))?.email || ''));
    await this.db.delete(customers).where(eq(customers.id, customerId));
  }

  // Lottery Scratch Activation System
  generateUniqueActivationKey(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `OCUS-${timestamp}-${random}`;
  }

  async revealActivationKey(customerId: string): Promise<Customer> {
    const [customer] = await this.db
      .update(customers)
      .set({ 
        activationKeyRevealed: true,
        extensionActivated: true, // Activate extension after payment
        updatedAt: new Date().getTime()
      })
      .where(eq(customers.id, parseInt(customerId)))
      .returning();
    return customer;
  }

  // Activation Code System Implementation
  async createActivationCode(codeData: InsertActivationCode): Promise<ActivationCode> {
    const [code] = await this.db
      .insert(activationCodes)
      .values(codeData)
      .returning();
    return code;
  }

  async getActivationCode(code: string): Promise<ActivationCode | undefined> {
    const [activation] = await this.db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.code, code));
    return activation || undefined;
  }

  async getActivationCodeByVersionToken(versionToken: string): Promise<ActivationCode | undefined> {
    const [activation] = await this.db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.versionToken, versionToken));
    return activation || undefined;
  }

  async activateCode(code: string, deviceId: string, ipAddress: string): Promise<ActivationCode> {
    const activation = await this.getActivationCode(code);
    if (!activation) {
      throw new Error('Invalid activation code');
    }

    if (!activation.isActive) {
      throw new Error('Activation code is inactive');
    }

    if (activation.expiresAt && new Date().getTime() > activation.expiresAt) {
      throw new Error('Activation code has expired');
    }

    if (activation.activationCount >= activation.maxActivations) {
      throw new Error('Activation code has reached maximum activations');
    }

    const [updated] = await this.db
      .update(activationCodes)
      .set({
        activatedAt: activation.activatedAt || new Date().getTime(),
        activationCount: activation.activationCount + 1,
        deviceId: deviceId,
        ipAddress: ipAddress
      })
      .where(eq(activationCodes.code, code))
      .returning();

    return updated;
  }

  async getCustomerActivationCodes(customerId: string): Promise<ActivationCode[]> {
    return await this.db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.customerId, parseInt(customerId)))
      .orderBy(desc(activationCodes.createdAt));
  }

  async deactivateCode(code: string): Promise<ActivationCode> {
    const [updated] = await this.db
      .update(activationCodes)
      .set({ isActive: false })
      .where(eq(activationCodes.code, code))
      .returning();
    return updated;
  }

  async generateActivationCode(customerId: string, orderId?: number): Promise<ActivationCode> {
    // Generate unique code
    let code: string;
    let exists = true;
    while (exists) {
      code = this.generateUniqueActivationKey();
      const existing = await this.getActivationCode(code);
      exists = !!existing;
    }

    // Generate version token (UUID)
    const versionToken = crypto.randomUUID();

    const codeData: InsertActivationCode = {
      code: code!,
      customerId: parseInt(customerId),
      orderId,
      versionToken,
      maxActivations: 1,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() // 1 year expiry
    };

    return await this.createActivationCode(codeData);
  }



  async getActivationKeyByOrderId(orderId: number): Promise<ActivationKey | null> {
    const [key] = await this.db.select().from(activationKeys).where(eq(activationKeys.orderId, orderId));
    return key || null;
  }

  // Extension Management
  async createExtensionDownload(download: InsertExtensionDownload): Promise<ExtensionDownload> {
    const [newDownload] = await this.db
      .insert(extensionDownloads)
      .values({
        ...download,
        downloadToken: download.downloadToken || crypto.randomUUID()
      })
      .returning();
    return newDownload;
  }

  async getExtensionDownload(token: string): Promise<ExtensionDownload | undefined> {
    const [download] = await this.db
      .select()
      .from(extensionDownloads)
      .where(eq(extensionDownloads.downloadToken, token));
    return download || undefined;
  }

  async incrementExtensionDownloadCount(id: number): Promise<ExtensionDownload> {
    const [download] = await this.db
      .update(extensionDownloads)
      .set({ 
        downloadCount: sql`${extensionDownloads.downloadCount} + 1`
      })
      .where(eq(extensionDownloads.id, id))
      .returning();
    return download;
  }

  async getExtensionDownloads(customerId: string | number): Promise<ExtensionDownload[]> {
    const id = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    return await this.db
      .select()
      .from(extensionDownloads)
      .where(eq(extensionDownloads.customerId, id))
      .orderBy(desc(extensionDownloads.createdAt));
  }

  async getCustomerExtensionDownloads(customerId: string): Promise<ExtensionDownload[]> {
    return await this.getExtensionDownloads(customerId);
  }

  // Social Authentication Methods

  // Customer Extension Management
  async blockCustomer(customerId: number | string, reason: string): Promise<Customer> {
    const id = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    const [customer] = await this.db
      .update(customers)
      .set({
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async unblockCustomer(customerId: number | string): Promise<Customer> {
    const id = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    const [customer] = await this.db
      .update(customers)
      .set({
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        updatedAt: new Date().getTime()
      })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async generateExtensionActivationKey(customerId: number | string): Promise<Customer> {
    const id = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    const activationKey = crypto.randomUUID().replace(/-/g, '').substring(0, 20).toUpperCase();
    const [customer] = await this.db
      .update(customers)
      .set({
        activationKey,
        isActivated: true,
        updatedAt: new Date().getTime()
      })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async activateExtension(customerId: string, activationKey: string): Promise<Customer> {
    const [customer] = await this.db
      .update(customers)
      .set({
        extensionActivated: true,
        extensionLastUsed: new Date().getTime(),
        updatedAt: new Date().getTime()
      })
      .where(and(
        eq(customers.id, parseInt(customerId)),
        eq(customers.activationKey, activationKey),
        eq(customers.isActivated, true)
      ))
      .returning();
    return customer;
  }

  async recordExtensionUsageLog(usage: InsertExtensionUsageLog): Promise<ExtensionUsageLog> {
    // Update customer trial usage
    await this.db
      .update(customers)
      .set({
        extensionTrialJobsUsed: sql`${customers.extensionTrialJobsUsed} + ${usage.jobsUsed}`,
        extensionLastUsed: new Date().getTime(),
        updatedAt: new Date().getTime()
      })
      .where(eq(customers.id, typeof usage.customerId === 'string' ? parseInt(usage.customerId) : usage.customerId));

    const [usageLog] = await this.db
      .insert(extensionUsageLogs)
      .values(usage)
      .returning();
    return usageLog;
  }

  // Extension installation methods
  async createExtensionInstallation(data: InsertExtensionInstallation): Promise<ExtensionInstallation> {
    const [installation] = await this.db
      .insert(extensionInstallations)
      .values(data)
      .returning();
    return installation;
  }

  async getExtensionInstallation(installationId: string): Promise<ExtensionInstallation | null> {
    const [installation] = await this.db
      .select()
      .from(extensionInstallations)
      .where(eq(extensionInstallations.installationId, installationId));
    return installation || null;
  }

  async updateInstallationLastSeen(installationId: string): Promise<void> {
    await this.db
      .update(extensionInstallations)
      .set({ lastSeenAt: new Date().getTime() })
      .where(eq(extensionInstallations.installationId, installationId));
  }

  async getUserInstallations(userId: number): Promise<ExtensionInstallation[]> {
    return await this.db
      .select()
      .from(extensionInstallations)
      .where(eq(extensionInstallations.userId, userId));
  }

  // Enhanced activation code methods
  async createActivationCodeForUser(userId: number, installationId: string, orderId?: number): Promise<ActivationCode> {
    const code = `OCUS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const versionToken = crypto.randomUUID();
    
    const [activationCode] = await this.db
      .insert(activationCodes)
      .values({
        code,
        userId,
        orderId,
        installationId,
        versionToken,
        maxActivations: 1,
        activationCount: 0,
        isActive: true,
        dailyValidationCount: 0,
        isRevoked: false
      })
      .returning();
    return activationCode;
  }

  async validateActivationCodeForInstallation(code: string, installationId: string): Promise<{ valid: boolean; message: string; activationCode?: ActivationCode }> {
    const [activationCode] = await this.db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.code, code));

    if (!activationCode) {
      return { valid: false, message: "Invalid activation code" };
    }

    if (activationCode.isRevoked) {
      return { valid: false, message: "Activation code has been revoked" };
    }

    if (activationCode.expiresAt && new Date().getTime() > activationCode.expiresAt) {
      return { valid: false, message: "Activation code has expired" };
    }

    if (!activationCode.isActive) {
      return { valid: false, message: "Activation code is inactive" };
    }

    // Check if code is already bound to a different installation
    if (activationCode.installationId && activationCode.installationId !== installationId) {
      return { valid: false, message: "Activation code is already bound to another installation" };
    }

    // Check if we've exceeded max activations
    if (activationCode.activationCount >= activationCode.maxActivations) {
      return { valid: false, message: "Activation code has been used maximum number of times" };
    }

    // Daily validation rate limiting (100 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastValidationDate = activationCode.lastValidationDate ? new Date(activationCode.lastValidationDate) : null;
    if (lastValidationDate) {
        lastValidationDate.setHours(0, 0, 0, 0);
    }
    
    let dailyCount = activationCode.dailyValidationCount;
    if (!lastValidationDate || lastValidationDate.getTime() !== today.getTime()) {
      dailyCount = 0; // Reset daily count
    }

    if (dailyCount >= 100) {
      return { valid: false, message: "Daily validation limit exceeded" };
    }

    // Update validation count and bind to installation if not already bound
    await this.db
      .update(activationCodes)
      .set({
        installationId: activationCode.installationId || installationId,
        activationCount: activationCode.installationId ? activationCode.activationCount : activationCode.activationCount + 1,
        activatedAt: activationCode.activatedAt || new Date().getTime(),
        dailyValidationCount: dailyCount + 1,
        lastValidationDate: new Date().getTime()
      })
      .where(eq(activationCodes.id, activationCode.id));

    return { valid: true, message: "Activation code is valid", activationCode };
  }

  async getActivationCodeByInstallation(installationId: string): Promise<ActivationCode | null> {
    const [activationCode] = await this.db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.installationId, installationId));
    return activationCode || null;
  }

  async revokeActivationCode(codeId: number, reason?: string): Promise<void> {
    await this.db
      .update(activationCodes)
      .set({
        isRevoked: true,
        isActive: false
      })
      .where(eq(activationCodes.id, codeId));
  }

  async getCustomerTrialUsage(customerId: string): Promise<number> {
    const [customer] = await this.db
      .select({ extensionTrialJobsUsed: customers.extensionTrialJobsUsed })
      .from(customers)
      .where(eq(customers.id, parseInt(customerId)));
    return customer?.extensionTrialJobsUsed || 0;
  }

  async canUseExtension(customerId: number | string): Promise<{ canUse: boolean; reason?: string; trialUsed?: number; isBlocked?: boolean }> {
    const id = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer) {
      return { canUse: false, reason: 'Customer not found' };
    }

    if (customer.isBlocked) {
      return { 
        canUse: false, 
        reason: customer.blockedReason || 'Account blocked',
        isBlocked: true 
      };
    }

    // If extension is activated (paid), allow usage
    if (customer.extensionActivated) {
      return { canUse: true };
    }

    // Check trial limits
    if (customer.extensionTrialJobsUsed >= customer.extensionTrialLimit) {
      return { 
        canUse: false, 
        reason: 'Trial limit exceeded. Please purchase activation code.',
        trialUsed: customer.extensionTrialJobsUsed 
      };
    }

    return { 
      canUse: true, 
      trialUsed: customer.extensionTrialJobsUsed 
    };
  }

  // Admin Customer Management
  async getAllCustomersForAdmin(): Promise<Customer[]> {
    return await this.db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt));
  }

  async getCustomerActivations(): Promise<{ customer: Customer; downloads: ExtensionDownload[] }[]> {
    const customersList = await this.getAllCustomersForAdmin();
    const result = [];

    for (const customer of customersList) {
      const downloads = await this.getCustomerExtensionDownloads(customer.id.toString());
      result.push({ customer, downloads });
    }

    return result;
  }

  // Mission Tracking Implementation
  async createMission(mission: InsertMission): Promise<Mission> {
    const [newMission] = await this.db
      .insert(missions)
      .values({
        ...mission,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      })
      .returning();
    return newMission;
  }

  async getMission(missionId: string): Promise<Mission | undefined> {
    const [mission] = await this.db
      .select()
      .from(missions)
      .where(eq(missions.missionId, missionId));
    return mission || undefined;
  }

  async updateMissionStatus(missionId: string, status: string, timestamp?: Date): Promise<Mission> {
    const updateData: any = { 
      status, 
      updatedAt: new Date().getTime() 
    };

    // Set specific timestamp fields based on status
    switch (status) {
      case 'assignment_accepted':
        updateData.assignmentAcceptedAt = (timestamp || new Date()).getTime();
        break;
      case 'appointment_confirmation':
        updateData.appointmentConfirmedAt = (timestamp || new Date()).getTime();
        break;
      case 'media_upload':
        updateData.mediaUploadedAt = (timestamp || new Date()).getTime();
        break;
      case 'billing_payment':
        updateData.billingCompletedAt = (timestamp || new Date()).getTime();
        break;
      case 'assignment_complete':
        updateData.assignmentCompletedAt = (timestamp || new Date()).getTime();
        break;
    }

    const [updatedMission] = await this.db
      .update(missions)
      .set(updateData)
      .where(eq(missions.missionId, missionId))
      .returning();
    return updatedMission;
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return await this.db
      .select()
      .from(missions)
      .where(eq(missions.userId, userId))
      .orderBy(desc(missions.createdAt));
  }

  async getCustomerMissions(customerId: number): Promise<Mission[]> {
    return await this.db
      .select()
      .from(missions)
      .where(eq(missions.customerId, customerId))
      .orderBy(desc(missions.createdAt));
  }

  // User Trial Management Implementation
  async createUserTrial(trial: InsertUserTrial): Promise<UserTrial> {
    const [newTrial] = await this.db
      .insert(userTrials)
      .values({
        ...trial,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      })
      .returning();
    return newTrial;
  }

  async getUserTrial(userId: string): Promise<UserTrial | undefined> {
    const [trial] = await this.db
      .select()
      .from(userTrials)
      .where(eq(userTrials.userId, userId));
    return trial || undefined;
  }





  // Trial usage methods for cross-browser tracking
  async getTrialUsage(trialKey: string): Promise<TrialUsage | undefined> {
    const [usage] = await this.db.select().from(trialUsage).where(eq(trialUsage.trialKey, trialKey));
    return usage || undefined;
  }

  async createTrialUsage(data: InsertTrialUsage): Promise<TrialUsage> {
    const [usage] = await this.db.insert(trialUsage).values(data).returning();
    return usage;
  }

  async incrementTrialUsage(trialKey: string): Promise<TrialUsage> {
    const [usage] = await this.db
      .update(trialUsage)
      .set({ 
        usageCount: sql`${trialUsage.usageCount} + 1`,
        lastUsed: new Date().getTime()
      })
      .where(eq(trialUsage.trialKey, trialKey))
      .returning();
    return usage;
  }

  async expireTrialUsage(trialKey: string): Promise<TrialUsage> {
    const [usage] = await this.db
      .update(trialUsage)
      .set({ isExpired: true })
      .where(eq(trialUsage.trialKey, trialKey))
      .returning();
    return usage;
  }

  // Premium Device Management Implementation
  async getPremiumDevice(userId: string, deviceFingerprint: string): Promise<PremiumDevice | undefined> {
    const [device] = await this.db
      .select()
      .from(premiumDevices)
      .where(
        and(
          eq(premiumDevices.userId, userId),
          eq(premiumDevices.deviceFingerprint, deviceFingerprint),
          eq(premiumDevices.isActive, true)
        )
      );
    return device || undefined;
  }

  async getUserPremiumDevices(userId: string): Promise<PremiumDevice[]> {
    return await this.db
      .select()
      .from(premiumDevices)
      .where(
        and(
          eq(premiumDevices.userId, userId),
          eq(premiumDevices.isActive, true)
        )
      );
  }

  async registerPremiumDevice(userId: string, deviceFingerprint: string, extensionId: string): Promise<PremiumDevice> {
    const [device] = await this.db
      .insert(premiumDevices)
      .values({
        userId,
        deviceFingerprint,
        extensionId,
        isActive: true,
        registeredAt: new Date().getTime(),
        lastSeenAt: new Date().getTime()
      })
      .returning();
    return device;
  }

  async deactivatePremiumDevice(deviceFingerprint: string, reason?: string): Promise<PremiumDevice> {
    const [device] = await this.db
      .update(premiumDevices)
      .set({
        isActive: false,
        deactivatedAt: new Date().getTime(),
        deactivationReason: reason || 'User requested deactivation'
      })
      .where(eq(premiumDevices.deviceFingerprint, deviceFingerprint))
      .returning();
    return device;
  }

  async updatePremiumDeviceLastSeen(deviceFingerprint: string): Promise<PremiumDevice> {
    const [device] = await this.db
      .update(premiumDevices)
      .set({ lastSeenAt: new Date().getTime() })
      .where(eq(premiumDevices.deviceFingerprint, deviceFingerprint))
      .returning();
    return device;
  }

  // Dashboard Features Management Implementation
  async getDashboardFeatures(): Promise<DashboardFeature[]> {
    return await this.db.select().from(dashboardFeatures);
  }

  async getDashboardFeature(featureName: string): Promise<DashboardFeature | undefined> {
    const [feature] = await this.db
      .select()
      .from(dashboardFeatures)
      .where(eq(dashboardFeatures.featureName, featureName));
    return feature || undefined;
  }

  async createDashboardFeature(feature: InsertDashboardFeature): Promise<DashboardFeature> {
    const [newFeature] = await this.db
      .insert(dashboardFeatures)
      .values({
        ...feature,
        updatedAt: new Date().getTime()
      })
      .returning();
    return newFeature;
  }

  async updateDashboardFeature(featureName: string, isEnabled: boolean, description?: string): Promise<DashboardFeature> {
    const [updatedFeature] = await this.db
      .update(dashboardFeatures)
      .set({
        isEnabled,
        description: description || undefined,
        updatedAt: new Date().getTime()
      })
      .where(eq(dashboardFeatures.featureName, featureName))
      .returning();
    return updatedFeature;
  }

  async initializeDashboardFeatures(): Promise<void> {
    const defaultFeatures = [
      { featureName: 'affiliate_program', isEnabled: true, description: 'Enable/disable affiliate program section in user dashboard' },
      { featureName: 'analytics', isEnabled: true, description: 'Enable/disable analytics section in user dashboard' },
      { featureName: 'billing', isEnabled: true, description: 'Enable/disable billing section in user dashboard' }
    ];

    for (const feature of defaultFeatures) {
      const existing = await this.getDashboardFeature(feature.featureName);
      if (!existing) {
        await this.createDashboardFeature(feature);
      }
    }
  }

  // Order Management - Missing method implementation
  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await this.db
      .update(orders)
      .set({ ...updates, updatedAt: new Date().getTime() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

}

// @ts-ignore
export const storage = new DatabaseStorage();
