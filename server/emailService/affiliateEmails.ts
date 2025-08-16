import { emailService } from '../emailService';

export interface ReferralNotificationData {
  affiliateName: string;
  affiliateEmail: string;
  referralCode: string;
  customerEmail: string;
  orderAmount: string;
  commissionAmount: string;
}

export interface CommissionApprovalData {
  affiliateName: string;
  affiliateEmail: string;
  commissionAmount: string;
  orderId: number;
  totalEarnings: string;
}

export interface PayoutProcessedData {
  affiliateName: string;
  affiliateEmail: string;
  payoutAmount: string;
  paymentMethod: string;
  transactionId?: string;
}

export class AffiliateEmailService {
  
  // Send notification when a new referral is made
  async sendReferralNotification(data: ReferralNotificationData): Promise<boolean> {
    const subject = 'New Referral Commission Earned!';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">🎉 New Commission Earned!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${data.affiliateName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Great news! Someone just purchased OCUS Job Hunter using your referral code <strong>${data.referralCode}</strong>.
          </p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #2e7d32; margin: 0 0 15px 0;">Commission Details:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0; color: #333;"><strong>Order Amount:</strong> $${data.orderAmount}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Your Commission:</strong> $${data.commissionAmount}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Customer:</strong> ${data.customerEmail}</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your commission will be automatically approved once the customer completes their purchase. 
            You can request a payout once your total earnings reach $50.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}/affiliate" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Affiliate Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5; margin-top: 20px;">
            Keep sharing your referral link to earn more commissions!<br>
            Your referral link: ${process.env.BASE_URL || 'http://localhost:5000'}/?ref=${data.referralCode}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from OCUS Job Hunter Affiliate Program.<br>
            If you have questions, contact us at support@ocusjobhunter.com
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(
      data.affiliateEmail,
      subject,
      htmlContent,
      'support@ocusjobhunter.com'
    );
    return true;
  }

  // Send notification when commission is approved
  async sendCommissionApproval(data: CommissionApprovalData): Promise<boolean> {
    const subject = 'Commission Approved - Ready for Payout!';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">✅ Commission Approved!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${data.affiliateName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your commission for order #${data.orderId} has been approved and is now ready for payout!
          </p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0;">Payout Details:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0; color: #333;"><strong>Approved Commission:</strong> $${data.commissionAmount}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Total Earnings:</strong> $${data.totalEarnings}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Minimum Payout:</strong> $50</li>
            </ul>
          </div>
          
          ${parseFloat(data.totalEarnings) >= 50 ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}/affiliate" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Request Payout Now
            </a>
          </div>
          ` : `
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            You'll be able to request a payout once your total approved earnings reach $50.
          </p>
          `}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from OCUS Job Hunter Affiliate Program.<br>
            If you have questions, contact us at support@ocusjobhunter.com
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(
      data.affiliateEmail,
      subject,
      htmlContent,
      'support@ocusjobhunter.com'
    );
    return true;
  }

  // Send notification when payout is processed
  async sendPayoutProcessed(data: PayoutProcessedData): Promise<boolean> {
    const subject = 'Payout Processed Successfully!';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">💰 Payout Processed!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${data.affiliateName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Great news! Your payout request has been processed successfully.
          </p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #2e7d32; margin: 0 0 15px 0;">Payout Information:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0; color: #333;"><strong>Amount:</strong> $${data.payoutAmount}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Payment Method:</strong> ${data.paymentMethod}</li>
              ${data.transactionId ? `<li style="padding: 5px 0; color: #333;"><strong>Transaction ID:</strong> ${data.transactionId}</li>` : ''}
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            ${data.paymentMethod === 'paypal' ? 
              'The funds should appear in your PayPal account within 24-48 hours.' : 
              'The funds should appear in your bank account within 3-5 business days.'
            }
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}/affiliate" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Affiliate Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5; margin-top: 20px;">
            Thank you for being a valued affiliate partner! Keep promoting OCUS Job Hunter to earn more commissions.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from OCUS Job Hunter Affiliate Program.<br>
            If you have questions about your payout, contact us at support@ocusjobhunter.com
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(
      data.affiliateEmail,
      subject,
      htmlContent,
      'support@ocusjobhunter.com'
    );
    return true;
  }

  // Send welcome email to new affiliates
  async sendWelcomeEmail(affiliateName: string, affiliateEmail: string, referralCode: string): Promise<boolean> {
    const subject = 'Welcome to OCUS Job Hunter Affiliate Program!';
    
    const referralLink = `${process.env.BASE_URL || 'http://localhost:5000'}/?ref=${referralCode}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0; font-size: 28px;">🚀 Welcome to Our Affiliate Program!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${affiliateName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Congratulations! You're now part of the OCUS Job Hunter Affiliate Program. Start earning 10% commission on every sale!
          </p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0;">Your Affiliate Details:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0; color: #333;"><strong>Referral Code:</strong> ${referralCode}</li>
              <li style="padding: 5px 0; color: #333;"><strong>Commission Rate:</strong> 10%</li>
              <li style="padding: 5px 0; color: #333;"><strong>Minimum Payout:</strong> $50</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Your Referral Link:</h3>
            <p style="background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; margin: 0; font-family: monospace; word-break: break-all; color: #007bff;">
              ${referralLink}
            </p>
          </div>
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">How It Works:</h3>
          <ol style="color: #333; line-height: 1.6;">
            <li>Share your referral link with potential customers</li>
            <li>When someone purchases using your link, you earn 10% commission</li>
            <li>Track your earnings in real-time on your dashboard</li>
            <li>Request payouts when you reach $50</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}/affiliate" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 10px;">
              View Dashboard
            </a>
            <a href="${referralLink}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 10px;">
              Test Your Link
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5; margin-top: 20px;">
            Need marketing materials or have questions? Visit your affiliate dashboard or contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from OCUS Job Hunter Affiliate Program.<br>
            If you have questions, contact us at support@ocusjobhunter.com
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(
      affiliateEmail,
      subject,
      htmlContent,
      'support@ocusjobhunter.com'
    );
    return true;
  }
}

export const affiliateEmailService = new AffiliateEmailService();