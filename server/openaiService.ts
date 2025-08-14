import OpenAI from 'openai';
import { storage } from './storage';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  async initializeClient(): Promise<boolean> {
    try {
      // Get OpenAI settings from database
      const apiKeySetting = await storage.getSetting('openai_api_key');
      const modelSetting = await storage.getSetting('openai_model');
      const maxTokensSetting = await storage.getSetting('openai_max_tokens');
      const temperatureSetting = await storage.getSetting('openai_temperature');

      if (!apiKeySetting?.value) {
        console.warn('OpenAI API key not configured');
        return false;
      }

      this.config = {
        apiKey: apiKeySetting.value,
        model: modelSetting?.value || 'gpt-3.5-turbo',
        maxTokens: parseInt(maxTokensSetting?.value || '1000'),
        temperature: parseFloat(temperatureSetting?.value || '0.7')
      };

      // Validate API key format
      if (!this.config.apiKey.startsWith('sk-')) {
        console.error('Invalid OpenAI API key format');
        return false;
      }

      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      });

      // Test the connection
      await this.validateApiKey();
      console.info('OpenAI client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      this.client = null;
      this.config = null;
      return false;
    }
  }

  async validateApiKey(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Test with a minimal request
      await this.client.models.list();
      return true;
    } catch (error: any) {
      console.error('OpenAI API key validation failed:', error.message);
      return false;
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.client || !this.config) {
      // Try to reinitialize
      const initialized = await this.initializeClient();
      if (!initialized) {
        return this.getFallbackResponse();
      }
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages: messages,
        max_tokens: this.config!.maxTokens,
        temperature: this.config!.temperature,
      }, {
        timeout: 30000, // 30 second timeout
      });

      const assistantMessage = response.choices[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error('No response content from OpenAI');
      }

      return assistantMessage;
    } catch (error: any) {
      console.error('OpenAI API error:', error.message);
      
      // Handle specific error types
      if (error.code === 'rate_limit_exceeded') {
        return 'I apologize, but we\'re currently experiencing high demand. Please try again in a few moments.';
      } else if (error.code === 'insufficient_quota') {
        return 'Our AI service is temporarily unavailable due to quota limits. Please contact support.';
      } else if (error.code === 'invalid_api_key') {
        return 'There\'s an issue with our AI service configuration. Please contact support.';
      }

      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): string {
    const fallbackResponses = [
      "I apologize, but our AI chat service is temporarily unavailable. Please try again later or contact our support team for assistance.",
      "We're experiencing technical difficulties with our chat service. For immediate help, please reach out to our support team.",
      "Our AI assistant is currently offline. Please try again in a few minutes, or contact support if you need immediate assistance.",
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  async getAvailableModels(): Promise<string[]> {
    const defaultModels = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4',
      'gpt-4-turbo-preview'
    ];

    if (!this.client) {
      return defaultModels;
    }

    try {
      const models = await this.client.models.list();
      const chatModels = models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort();

      return chatModels.length > 0 ? chatModels : defaultModels;
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error);
      return defaultModels;
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }
}

export const openaiService = new OpenAIService();