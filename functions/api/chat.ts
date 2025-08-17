import { SettingsStorage } from '../lib/settings-storage';

export const onRequestPost = async ({ request, env }: any) => {
  try {
    const { message, history } = await request.json();
    
    // Get OpenAI API key from database settings
    let openaiApiKey: string | null = null;
    if (env.DB) {
      try {
        const settingsStorage = new SettingsStorage(env.DB);
        await settingsStorage.initializeSettings();
        openaiApiKey = await settingsStorage.getOpenAIApiKey();
      } catch (error) {
        console.error('Failed to get API key from settings:', error);
      }
    }
    
    // Fallback to environment variable
    if (!openaiApiKey) {
      openaiApiKey = env.OPENAI_API_KEY;
    }
    
    // Check if OpenAI API key is configured
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        success: false,
        response: "I'm currently not configured to respond. Please contact our support team for assistance."
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Prepare conversation context
    const conversationHistory = history?.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })) || [];

    // System prompt for OCUS Job Hunter assistant
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful AI assistant for the OCUS Job Hunter Chrome Extension. You help users with:
      
      - Understanding how to use the job hunting extension
      - Troubleshooting extension issues
      - Explaining features and benefits
      - Providing job search tips and strategies
      - Answering questions about pricing and subscriptions
      
      Keep responses helpful, concise, and focused on job hunting and the extension. If asked about unrelated topics, politely redirect to job hunting assistance.`
    };

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          systemPrompt,
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const assistantResponse = openaiData.choices[0]?.message?.content || 
      "I'm having trouble processing your request. Please try again or contact our support team.";

    return new Response(JSON.stringify({
      success: true,
      response: assistantResponse
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      response: "I'm experiencing technical difficulties. Please contact our support team for immediate assistance."
    }), {
      status: 200,
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
