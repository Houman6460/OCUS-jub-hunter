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
    
    // Get SEO settings from database
    const title = await settingsStorage.getSetting('seo_title') || 'OCUS Job Hunter';
    const description = await settingsStorage.getSetting('seo_description') || 'Automated job application Chrome extension';
    const keywords = await settingsStorage.getSetting('seo_keywords') || 'job hunting, automation, chrome extension';
    const coverImage = await settingsStorage.getSetting('seo_cover_image') || '';
    const logo = await settingsStorage.getSetting('seo_logo') || '';
    const favicon = await settingsStorage.getSetting('seo_favicon') || '';

    console.log('GET SEO Settings - Retrieved from DB:', {
      title,
      description,
      keywords,
      coverImage: coverImage ? 'Has image data' : 'No image',
      logo: logo ? 'Has logo data' : 'No logo',
      favicon: favicon ? 'Has favicon data' : 'No favicon'
    });

    return new Response(JSON.stringify({
      success: true,
      title,
      description,
      keywords,
      coverImage,
      logo,
      favicon
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to get SEO settings:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load SEO settings'
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
    
    const settingsStorage = new SettingsStorage(env.DB);
    await settingsStorage.initializeSettings();
    
    console.log('FormData keys:', Array.from(formData.keys()));
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    // Handle text fields
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const keywords = formData.get('keywords')?.toString();
    
    if (title) {
      await settingsStorage.setSetting('seo_title', title);
    }
    if (description) {
      await settingsStorage.setSetting('seo_description', description);
    }
    if (keywords) {
      await settingsStorage.setSetting('seo_keywords', keywords);
    }
    
    // Handle file uploads
    const coverImageFile = formData.get('coverImage') as File;
    const logoFile = formData.get('logo') as File;
    const faviconFile = formData.get('favicon') as File;
    
    console.log('File uploads check:', {
      coverImage: coverImageFile ? `${coverImageFile.name} (${coverImageFile.size} bytes)` : 'null',
      logo: logoFile ? `${logoFile.name} (${logoFile.size} bytes)` : 'null',
      favicon: faviconFile ? `${faviconFile.name} (${faviconFile.size} bytes)` : 'null'
    });
    
    if (coverImageFile && coverImageFile.size > 0) {
      console.log('Processing cover image:', coverImageFile.name, coverImageFile.type, coverImageFile.size);
      const arrayBuffer = await coverImageFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${coverImageFile.type};base64,${base64}`;
      console.log('Saving cover image to DB, data URL length:', dataUrl.length);
      await settingsStorage.setSetting('seo_cover_image', dataUrl);
      console.log('Cover image saved successfully');
    }
    
    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${logoFile.type};base64,${base64}`;
      await settingsStorage.setSetting('seo_logo', dataUrl);
    }
    
    if (faviconFile && faviconFile.size > 0) {
      const arrayBuffer = await faviconFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${faviconFile.type};base64,${base64}`;
      await settingsStorage.setSetting('seo_favicon', dataUrl);
    }

    console.log('SEO settings updated successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'SEO settings updated successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to update SEO settings:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `Failed to update SEO settings: ${error.message || error}`
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestPatch = async ({ request, env }: any) => {
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

    const data = await request.json();
    
    const settingsStorage = new SettingsStorage(env.DB);
    await settingsStorage.initializeSettings();
    
    // Handle text fields only for PATCH
    if (data.title) {
      await settingsStorage.setSetting('seo_title', data.title);
    }
    if (data.description) {
      await settingsStorage.setSetting('seo_description', data.description);
    }
    if (data.keywords) {
      await settingsStorage.setSetting('seo_keywords', data.keywords);
    }

    console.log('SEO text settings updated successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'SEO settings updated successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Failed to update SEO text settings:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `Failed to update SEO settings: ${error.message || error}`
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
      'Access-Control-Allow-Methods': 'GET, PUT, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
