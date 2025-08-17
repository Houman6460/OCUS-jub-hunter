import { SettingsStorage } from '../../lib/settings-storage';

export const onRequestGet = async ({ env }: any) => {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const settingsStorage = new SettingsStorage(env.DB);
    await settingsStorage.initializeSettings();
    
    const settings = await settingsStorage.getChatSettings();

    return new Response(JSON.stringify({
      success: true,
      ...settings
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to get chat settings:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load chat settings'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestPut = async ({ request, env }: any) => {
  try {
    console.log('Chat settings PUT request received');
    console.log('Environment DB available:', !!env.DB);
    
    if (!env.DB) {
      console.error('Database not available in environment');
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const requestBody = await request.json();
    console.log('Request body received:', requestBody);
    
    const { openaiApiKey, assistantId, chatModel, enabled } = requestBody;
    
    console.log('Initializing settings storage...');
    const settingsStorage = new SettingsStorage(env.DB);
    
    try {
      await settingsStorage.initializeSettings();
      console.log('Settings storage initialized successfully');
    } catch (initError) {
      console.error('Failed to initialize settings storage:', initError);
      throw initError;
    }
    
    // Only update settings that are provided and not empty
    const settingsToUpdate: any = {};
    if (openaiApiKey && openaiApiKey.trim() !== '' && openaiApiKey !== '***hidden***') {
      settingsToUpdate.openaiApiKey = openaiApiKey.trim();
    }
    if (assistantId !== undefined) {
      settingsToUpdate.assistantId = assistantId;
    }
    if (chatModel && chatModel.trim() !== '') {
      settingsToUpdate.chatModel = chatModel.trim();
    }
    if (enabled !== undefined) {
      settingsToUpdate.enabled = enabled;
    }
    
    console.log('Settings to update:', settingsToUpdate);
    
    try {
      await settingsStorage.setChatSettings(settingsToUpdate);
      console.log('Settings updated successfully');
    } catch (updateError) {
      console.error('Failed to update settings:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Chat settings updated successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Chat settings PUT error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({
      success: false,
      message: `Failed to update chat settings: ${error.message || error}`,
      error: error.toString()
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
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
