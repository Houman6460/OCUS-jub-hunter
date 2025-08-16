import nodemailer from 'nodemailer';
import { type Order } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(to: string, subject: string, html: string, from?: string): Promise<void> {
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'noreply@ocusjobhunter.com',
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendPurchaseConfirmation(order: Order, activationKey?: string): Promise<void> {
    const downloadUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/download/${order.downloadToken}`;
    const activationDownloadUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/download-activation/${order.downloadToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ocusjobhunter.com',
      to: order.customerEmail,
      subject: '🎉 Your OCUS Job Hunter Extension is Ready - **START FREE**!',
      html: this.getPurchaseConfirmationTemplate(order, downloadUrl, activationKey, activationDownloadUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Purchase confirmation email sent to ${order.customerEmail}`);
    } catch (error) {
      console.error('Failed to send purchase confirmation email:', error);
      throw error;
    }
  }

  private getPurchaseConfirmationTemplate(order: Order, downloadUrl: string, activationKey?: string, activationDownloadUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OCUS Job Hunter Extension</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #334155; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px 20px; border: 1px solid #e2e8f0; border-top: none; }
          .download-button { display: inline-block; background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .steps { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin-bottom: 15px; padding-left: 30px; position: relative; }
          .step::before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; top: 0; background: #2563EB; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
          .steps { counter-reset: step-counter; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎉 Your Extension is Ready!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for purchasing OCUS Job Hunter</p>
          </div>
          
          <div class="content">
            <h2 style="color: #2563EB; margin-top: 0;">Hi ${order.customerName}, **START FREE** Now!</h2>
            
            <p>🎉 Thank you for purchasing the OCUS Job Hunter Extension! Your payment has been processed successfully.</p>
            
            <p><strong>📦 Two important downloads for you:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" class="download-button" style="margin-right: 10px; background: #2563EB;">📁 Download Extension Files</a>
              ${activationKey && activationDownloadUrl ? `<a href="${activationDownloadUrl}" class="download-button" style="background: #10B981;">🔑 Download Activation Key</a>` : ''}
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0; color: #1e293b;">**START FREE** Instructions:</h3>
              <div class="step">
                <strong>**START FREE**:</strong> Install the extension and use 3 jobs for FREE
              </div>
              <div class="step">
                <strong>Extract Files:</strong> Unzip the extension files to a folder
              </div>
              <div class="step">
                <strong>Open Chrome:</strong> Go to chrome://extensions/
              </div>
              <div class="step">
                <strong>Enable Developer Mode:</strong> Toggle the switch in the top-right corner
              </div>
              <div class="step">
                <strong>Load Extension:</strong> Click "Load unpacked" and select your folder
              </div>
              <div class="step">
                <strong>**3 FREE USES**:</strong> Try the extension on OCUS jobs immediately!
              </div>
              <div class="step">
                <strong>Unlimited Access:</strong> Use your activation key when ready for more
              </div>
            </div>
            
            ${activationKey ? `
            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="margin-top: 0; color: #10B981;">🔑 Your Activation Key</h3>
              <p style="font-family: monospace; background: #E5E7EB; padding: 10px; border-radius: 4px; font-size: 16px;"><strong>${activationKey}</strong></p>
              <p><strong>After your 3 FREE uses:</strong></p>
              <ul>
                <li>Open the extension popup</li>
                <li>Find the "License Activation" section</li>
                <li>Enter your activation key above</li>
                <li>Click "Activate Extension"</li>
                <li>Enjoy unlimited job hunting!</li>
              </ul>
            </div>
            ` : ''}
            
            <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563EB;">
              <h3 style="margin-top: 0; color: #2563EB;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Customer:</strong> ${order.customerName}</p>
              <p><strong>Amount:</strong> $${parseFloat(order.finalAmount).toFixed(2)} ${(order.currency || 'USD').toUpperCase()}</p>
              <p><strong>**START FREE**:</strong> 3 jobs included, then unlimited with activation</p>
            </div>
            
            <p><strong>Important:</strong> Save both files after downloading. Your extension includes <strong>3 FREE job searches</strong> to start immediately!</p>
            
            <p>If you have any questions or need support, please contact us at <a href="mailto:support@ocusjobhunter.com">support@ocusjobhunter.com</a></p>
            
            <p>Happy job hunting with your <strong>**FREE START**</strong>!<br>The OCUS Job Hunter Team</p>
          </div>
          
          <div class="footer">
            <p>This download link is valid for ${order.maxDownloads} downloads. Please save the extension file after downloading.</p>
            <p>© 2024 OCUS Job Hunter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
