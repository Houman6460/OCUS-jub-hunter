import express from 'express';
import { invoiceService } from '../invoiceService';
import { db } from '../db';
import { invoices, invoiceSettings, orders } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for invoice endpoints
const invoiceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.'
});

router.use(invoiceRateLimit);

// Get invoice settings (admin only)
router.get('/admin/settings', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const settings = await invoiceService.getInvoiceSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get invoice settings error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice settings' });
  }
});

// Update invoice settings (admin only)
router.put('/admin/settings', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const updatedSettings = await invoiceService.updateInvoiceSettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Update invoice settings error:', error);
    res.status(500).json({ error: 'Failed to update invoice settings' });
  }
});

// Create invoice from order (admin only)
router.post('/admin/create-from-order/:orderId', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const orderId = parseInt(req.params.orderId);
    const invoice = await invoiceService.createInvoiceFromOrder(orderId);
    res.json(invoice);
  } catch (error) {
    console.error('Create invoice from order error:', error);
    res.status(500).json({ error: 'Failed to create invoice from order' });
  }
});

// Get all invoices (admin only)
router.get('/admin/list', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const invoices = await db
      .select()
      .from(invoiceSettings)
      .orderBy(desc(invoiceSettings.createdAt));
    
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices list error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices list' });
  }
});

// Get invoice by ID
router.get('/:invoiceId', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const invoice = await invoiceService.getInvoiceWithItems(invoiceId);
    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Get invoice HTML for viewing/printing
router.get('/:invoiceId/html', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const html = await invoiceService.generateInvoiceHTML(invoiceId);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Generate invoice HTML error:', error);
    res.status(500).json({ error: 'Failed to generate invoice HTML' });
  }
});

// Get receipt HTML for viewing/printing
router.get('/:invoiceId/receipt', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const html = await invoiceService.generateReceiptHTML(invoiceId);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Generate receipt HTML error:', error);
    res.status(500).json({ error: 'Failed to generate receipt HTML' });
  }
});

// Get customer invoices
router.get('/customer/:customerId', async (req, res) => {
  try {
    // Extract customer ID from auth header for demo purposes
    const authHeader = req.headers.authorization;
    let customerId = req.params.customerId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [type, userId] = decoded.split(':');
      if (type === 'customer') {
        customerId = userId;
      }
    }
    
    const invoices = await invoiceService.getCustomerInvoices(parseInt(customerId));
    res.json(invoices);
  } catch (error) {
    console.error('Get customer invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch customer invoices' });
  }
});

// Mark invoice as paid (admin only)
router.post('/:invoiceId/mark-paid', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    const invoiceId = parseInt(req.params.invoiceId);
    const updatedInvoice = await invoiceService.markInvoiceAsPaid(invoiceId);
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

// Download invoice as PDF (placeholder - would need PDF generation library)
router.get('/:invoiceId/download', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const html = await invoiceService.generateInvoiceHTML(invoiceId);
    
    // For now, return HTML - in production, convert to PDF using puppeteer or similar
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

// Download receipt as PDF (placeholder - would need PDF generation library)
router.get('/:invoiceId/download-receipt', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    const html = await invoiceService.generateReceiptHTML(invoiceId);
    
    // For now, return HTML - in production, convert to PDF using puppeteer or similar
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${invoiceId}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({ error: 'Failed to download receipt' });
  }
});

export { router as invoiceRoutes };