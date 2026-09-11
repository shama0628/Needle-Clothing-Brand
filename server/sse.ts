import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

const clients: SSEClient[] = [];

export function addSSEClient(id: string, res: Response): void {
  clients.push({ id, res });
  console.log(`[SSE] Admin client connected (${id}). Total clients: ${clients.length}`);

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString(), message: 'Connected to NEEDLE Real-Time Event Stream' })}\n\n`);
}

export function removeSSEClient(id: string): void {
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
    console.log(`[SSE] Admin client disconnected (${id}). Total clients: ${clients.length}`);
  }
}

export function broadcastAdminEvent(eventType: string, data: any): void {
  const payload = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  });

  console.log(`[SSE] Broadcasting event: ${eventType} to ${clients.length} client(s)`);

  for (const client of clients) {
    try {
      client.res.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (err) {
      console.error(`[SSE] Error sending event to client ${client.id}:`, err);
    }
  }
}
