export class SettingsStorage {
  private db: any;

  constructor(database: any) {
    this.db = database;
  }

  async initializeSettings() {
    try {
      const result = await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('Settings table initialized:', result);
    } catch (error) {
      console.error('Failed to initialize settings table:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const result = await this.db.prepare(
        'SELECT value FROM settings WHERE key = ?'
      ).bind(key).first();
      
      return result ? result.value : null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      console.log(`Setting ${key} with value length:`, value.length);
      const result = await this.db.prepare(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      ).bind(key, value).run();
      console.log(`Successfully set ${key}, result:`, result);
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }

  async getChatSettings(): Promise<any> {
    try {
      const openaiApiKey = await this.getSetting('openai_api_key');
      const assistantId = await this.getSetting('openai_assistant_id');
      const chatModel = await this.getSetting('chat_model') || 'gpt-4o-mini';
      const enabled = await this.getSetting('chat_enabled') || 'true';

      return {
        openaiApiKey: openaiApiKey ? '***hidden***' : '',
        assistantId: assistantId || '',
        chatModel,
        enabled: enabled === 'true'
      };
    } catch (error) {
      console.error('Failed to get chat settings:', error);
      return {
        openaiApiKey: '',
        assistantId: '',
        chatModel: 'gpt-4o-mini',
        enabled: true
      };
    }
  }

  async setChatSettings(settings: any): Promise<void> {
    try {
      if (settings.openaiApiKey && settings.openaiApiKey !== '***hidden***') {
        await this.setSetting('openai_api_key', settings.openaiApiKey);
      }
      
      if (settings.assistantId !== undefined) {
        await this.setSetting('openai_assistant_id', settings.assistantId || '');
      }
      
      if (settings.chatModel) {
        await this.setSetting('chat_model', settings.chatModel);
      }
      
      if (settings.enabled !== undefined) {
        await this.setSetting('chat_enabled', settings.enabled.toString());
      }
    } catch (error) {
      console.error('Failed to set chat settings:', error);
      console.error('Settings object:', settings);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Settings storage error: ${message}`);
    }
  }

  async getOpenAIApiKey(): Promise<string | null> {
    return await this.getSetting('openai_api_key');
  }
}
