// Cloudflare Pages Function: /api/download-extension/trial
// Handles trial extension download

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Trial version is available to everyone
    const mockZipContent = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, // ZIP file signature
      0x14, 0x00, 0x00, 0x00, 0x08, 0x00, // Version, flags, compression
      0x00, 0x00, 0x00, 0x00, // Date/time
      0x00, 0x00, 0x00, 0x00, // CRC-32
      0x00, 0x00, 0x00, 0x00, // Compressed size
      0x00, 0x00, 0x00, 0x00, // Uncompressed size
      0x00, 0x00, // Filename length
      0x00, 0x00, // Extra field length
      0x50, 0x4B, 0x05, 0x06, // End of central directory signature
      0x00, 0x00, 0x00, 0x00, // Number of entries
      0x00, 0x00, 0x00, 0x00, // Size of central directory
      0x00, 0x00, 0x00, 0x00, // Offset of central directory
      0x00, 0x00 // Comment length
    ]);
    
    return new Response(mockZipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="ocus-job-hunter-trial-v2.1.8-STABLE.zip"',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error: any) {
    return new Response('Download failed', { status: 500 });
  }
};
