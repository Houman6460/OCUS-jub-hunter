// Simple persistent storage for dashboard features using D1 database
import { TicketStorage } from './db';

export class FeatureStorage {
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
      // Return defaults if DB fails
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
      // Create table if it doesn't exist
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS dashboard_features (
          feature_name TEXT PRIMARY KEY,
          is_enabled INTEGER DEFAULT 1,
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `).run();

      // Initialize default features if they don't exist
      const defaultFeatures = [
        'affiliate-program',
        'analytics', 
        'billing'
      ];

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
