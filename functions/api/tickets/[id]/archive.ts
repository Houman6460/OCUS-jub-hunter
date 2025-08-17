// Archive ticket endpoint for Cloudflare Pages Functions
import { TicketStorage } from '../../../lib/db';

interface Env {
  DB: any;
  EXPRESS_API_BASE?: string;
}

export const onRequestPost = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  const ticketId = Number(params.id);

  if (!ticketId || isNaN(ticketId)) {
    return Response.json({ success: false, message: 'Invalid ticket ID' }, { status: 400 });
  }

  // Check if we should proxy to Express backend
  if (env.EXPRESS_API_BASE) {
    try {
      const proxyUrl = `${env.EXPRESS_API_BASE}/api/tickets/${ticketId}/archive`;
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
      });
      
      const data = await proxyResponse.json();
      return Response.json(data, { status: proxyResponse.status });
    } catch (error) {
      console.error('Express proxy error:', error);
      // Fall through to D1 implementation
    }
  }

  // Check if database is available
  if (!env.DB) {
    return Response.json({ success: false, message: 'Database not available' }, { status: 500 });
  }

  try {
    const storage = new TicketStorage(env.DB);
    
    // Check if ticket exists
    const existingTicket = await storage.getTicketById(ticketId);
    if (!existingTicket) {
      return Response.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    // Archive the ticket
    const archivedTicket = await storage.archiveTicket(ticketId);
    
    if (!archivedTicket) {
      return Response.json({ success: false, message: 'Failed to archive ticket' }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Ticket archived successfully',
      ticket: archivedTicket 
    });

  } catch (error: any) {
    console.error('Archive ticket error:', error);
    return Response.json({ 
      success: false, 
      message: 'Failed to archive ticket',
      error: error.message 
    }, { status: 500 });
  }
};
