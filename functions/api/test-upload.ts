import { SettingsStorage } from '../lib/settings-storage';

export const onRequestPost = async ({ request, env }: any) => {
  try {
    console.log('=== TEST UPLOAD ENDPOINT ===');
    
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

    const formData = await request.formData();
    console.log('Test upload - FormData keys:', Array.from(formData.keys()));
    
    const testFile = formData.get('testImage') as File;
    console.log('Test file received:', testFile ? `${testFile.name} (${testFile.size} bytes, ${testFile.type})` : 'null');
    
    if (testFile && testFile.size > 0) {
      console.log('Converting test file to base64...');
      const arrayBuffer = await testFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${testFile.type};base64,${base64}`;
      console.log('Test file converted, data URL length:', dataUrl.length);
      
      const settingsStorage = new SettingsStorage(env.DB);
      await settingsStorage.initializeSettings();
      
      console.log('Saving test image to database...');
      await settingsStorage.setSetting('test_image', dataUrl);
      console.log('Test image saved successfully');
      
      // Verify it was saved
      console.log('Verifying saved data...');
      const savedData = await settingsStorage.getSetting('test_image');
      console.log('Retrieved data length:', savedData ? savedData.length : 'null');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Test upload successful',
        originalSize: testFile.size,
        dataUrlLength: dataUrl.length,
        savedDataLength: savedData ? savedData.length : 0,
        verified: savedData === dataUrl
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'No file received or file is empty'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error) {
    console.error('Test upload error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      success: false,
      message: `Test upload failed: ${message}`
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
