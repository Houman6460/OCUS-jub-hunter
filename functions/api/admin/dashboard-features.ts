// Simple persistent storage using D1 database
class FeatureStorage {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getFeatureStates(): Promise<Record<string, boolean>> {
    try {
      const result = await this.db.prepare(`
        SELECT feature_name, is_enabled 
        FROM dashboard_features
      `).all();

      const states: Record<string, boolean> = {
        'affiliate-program': true,
        'analytics': true,
        'billing': true
      };

      if (result.results) {
        result.results.forEach((row: any) => {
          states[row.feature_name] = Boolean(row.is_enabled);
        });
      }

      return states;
    } catch (error) {
      console.error('Failed to get feature states:', error);
      return {
        'affiliate-program': true,
        'analytics': true,
        'billing': true
      };
    }
  }

  async updateFeatureState(featureName: string, isEnabled: boolean): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO dashboard_features (feature_name, is_enabled, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(featureName, isEnabled ? 1 : 0).run();
    } catch (error) {
      console.error('Failed to update feature state:', error);
      throw error;
    }
  }

  async initializeFeatures(): Promise<void> {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS dashboard_features (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          feature_name TEXT NOT NULL UNIQUE,
          is_enabled INTEGER DEFAULT 1,
          description TEXT,
          updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
        )
      `).run();

      const defaultFeatures = ['affiliate-program', 'analytics', 'billing'];
      for (const feature of defaultFeatures) {
        await this.db.prepare(`
          INSERT OR IGNORE INTO dashboard_features (feature_name, is_enabled)
          VALUES (?, 1)
        `).bind(feature).run();
      }
    } catch (error) {
      console.error('Failed to initialize features:', error);
    }
  }
}

export const onRequestGet = async ({ env }: { env: any }) => {
  try {
    const storage = new FeatureStorage(env.DB);
    await storage.initializeFeatures();
    const states = await storage.getFeatureStates();

    const features = [
      {
        id: 'affiliate-program',
        name: 'Affiliate Program',
        description: 'Controls visibility of referral system and commission tracking',
        isEnabled: states['affiliate-program'],
        category: 'monetization'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Controls visibility of usage statistics and performance metrics',
        isEnabled: states['analytics'],
        category: 'insights'
      },
      {
        id: 'billing',
        name: 'Billing',
        description: 'Controls visibility of payment history and subscription management',
        isEnabled: states['billing'],
        category: 'payments'
      }
    ];

    return new Response(JSON.stringify(features), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error getting features:', error);
    return new Response(JSON.stringify([]), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestPut = async ({ request, env }: { request: Request; env: any }) => {
  try {
    const { featureName, isEnabled } = await request.json();

    if (!featureName || typeof isEnabled === 'undefined') {
      return new Response(JSON.stringify({
        success: false,
        message: 'featureName and isEnabled are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const storage = new FeatureStorage(env.DB);
    // Ensure table exists before updating to avoid 500s on fresh DBs
    await storage.initializeFeatures();
    await storage.updateFeatureState(featureName, isEnabled);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Feature ${featureName} updated successfully`,
      feature: {
        id: featureName,
        isEnabled
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('dashboard-features PUT failed:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update feature'
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
