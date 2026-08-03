import type { Env } from './types';

/**
 * RealtimeRoom - Durable Object único ("global") que mantém as conexões
 * SSE abertas pelo painel da TV e retransmite eventos (novo check-in,
 * nova gratidão no mosaico, atualização de contadores, modo intercessão).
 */
export class RealtimeRoom {
  state: DurableObjectState;
  env: Env;
  sockets: Set<ReadableStreamDefaultController>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sockets = new Set();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/stream')) {
      return this.handleStream();
    }

    if (url.pathname.endsWith('/broadcast') && request.method === 'POST') {
      const payload = await request.json();
      this.broadcast(payload.event, payload.data);
      return new Response('ok');
    }

    return new Response('not found', { status: 404 });
  }

  handleStream(): Response {
    let controllerRef: ReadableStreamDefaultController;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start: (controller) => {
        controllerRef = controller;
        this.sockets.add(controller);
        controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`));
      },
      cancel: () => {
        this.sockets.delete(controllerRef);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': this.env.CORS_ORIGIN || '*',
      },
    });
  }

  broadcast(event: string, data: unknown) {
    const encoder = new TextEncoder();
    const message = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    for (const controller of this.sockets) {
      try {
        controller.enqueue(message);
      } catch {
        this.sockets.delete(controller);
      }
    }
  }
}
