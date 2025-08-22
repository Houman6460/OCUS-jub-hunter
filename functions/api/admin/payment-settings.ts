import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

interface PaymentSettings {
  stripeEnabled?: boolean;
  paypalEnabled?: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  defaultPaymentMethod?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Get payment settings from database
    const result = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'payment_%'
    `).all();

    // Convert database results to settings object
    const settings: any = {
      stripeEnabled: false,
      paypalEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalClientSecret: '',
      defaultPaymentMethod: 'stripe'
    };

    // Map database values to settings
    result.results?.forEach((row: any) => {
      const key = row.key.replace('payment_', '');
      let value = row.value;
      
      // Parse boolean values
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      settings[key] = value;
    });

    return new Response(JSON.stringify(settings), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    
    // Return default settings on error
    const defaultSettings = {
      stripeEnabled: false,
      paypalEnabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalClientSecret: '',
      defaultPaymentMethod: 'stripe'
    };

    return new Response(JSON.stringify(defaultSettings), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const settings = await request.json() as PaymentSettings;
    
    // Prepare batch insert/update for all payment settings
    const settingsToSave = [
      { key: 'payment_stripeEnabled', value: String(settings.stripeEnabled || false) },
      { key: 'payment_paypalEnabled', value: String(settings.paypalEnabled || false) },
      { key: 'payment_stripePublicKey', value: settings.stripePublicKey || '' },
      { key: 'payment_stripeSecretKey', value: settings.stripeSecretKey || '' },
      { key: 'payment_paypalClientId', value: settings.paypalClientId || '' },
      { key: 'payment_paypalClientSecret', value: settings.paypalClientSecret || '' },
      { key: 'payment_defaultPaymentMethod', value: settings.defaultPaymentMethod || 'stripe' }
    ];

    // Use transaction to ensure all settings are saved atomically
    await env.DB.batch([
      // First, delete existing payment settings
      env.DB.prepare(`DELETE FROM settings WHERE key LIKE 'payment_%'`),
      // Then insert new settings
      ...settingsToSave.map(setting => 
        env.DB.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`)
          .bind(setting.key, setting.value)
      )
    ]);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment settings saved successfully',
      settings
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error saving payment settings:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to save payment settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
