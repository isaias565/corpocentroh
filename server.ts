import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const STREAM_TARGETS: Record<string, { url: string; label: string }> = {
  lacentro: {
    url: 'http://198.204.234.10:6175/live',
    label: 'La Centro 96.3 FM',
  },
  pinares: {
    url: 'http://198.204.234.10:6184/live',
    label: 'Radio Pinares 91.5 FM',
  },
  sensa: {
    url: 'http://198.204.234.10:6185/live',
    label: 'Sensa Stereo 99.1 FM',
  },
  sentimientos: {
    url: 'http://198.204.234.10:6186/live',
    label: 'Sentimientos 95.7 FM',
  },
};

type ChatMessageKind = 'chat' | 'saludo' | 'peticion';

interface ChatMessage {
  id: string;
  author: string;
  location: string;
  stationId: string;
  stationLabel: string;
  kind: ChatMessageKind;
  text: string;
  createdAt: string;
  hearts: number;
  isCabin?: boolean;
}

interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  station: string;
  message: string;
  createdAt: string;
}

const MAX_CHAT_HISTORY = 80;
const chatMessages: ChatMessage[] = [
  {
    id: 'cabin-welcome-1',
    author: 'Cabina Central CORPOCENTROH',
    location: 'Siguatepeque, Comayagua',
    stationId: 'lacentro',
    stationLabel: 'La Centro 96.3 FM',
    kind: 'saludo',
    text: '¡Bienvenidos a la nueva señal digital de CORPOCENTROH desde la Ciudad de los Pinares! Deja tu saludo o pide tu canción favorita en vivo.',
    createdAt: new Date().toISOString(),
    hearts: 1,
    isCabin: true,
  },
];

const contactInquiries: ContactInquiry[] = [];

function sanitizeText(raw: unknown, maxLen: number): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Live audio proxy over HTTPS to avoid Mixed Content blocks on mobile & desktop browsers
  app.get('/api/stream/:stationId', (req: Request, res: Response) => {
    const stationId = String(req.params.stationId || '').toLowerCase();
    const target = STREAM_TARGETS[stationId];

    if (!target) {
      res.status(404).json({ error: 'Emisora no encontrada' });
      return;
    }

    let closedByClient = false;

    const upstreamReq = http.get(
      target.url,
      {
        headers: {
          'User-Agent': 'CORPOCENTROH-WebPlayer/2.0',
          Accept: 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
        },
        timeout: 12000,
      },
      (upstreamRes) => {
        if (closedByClient) {
          upstreamRes.destroy();
          return;
        }

        const statusCode = upstreamRes.statusCode || 200;
        if (statusCode >= 400) {
          res.status(502).json({ error: 'La señal de audio no está disponible temporalmente' });
          upstreamRes.resume();
          return;
        }

        const contentType = upstreamRes.headers['content-type'] || 'audio/mpeg';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          Pragma: 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Accept-Ranges': 'none',
          'X-Content-Type-Options': 'nosniff',
        });

        upstreamRes.pipe(res);

        upstreamRes.on('error', () => {
          if (!res.writableEnded) {
            res.end();
          }
        });
      }
    );

    upstreamReq.on('timeout', () => {
      upstreamReq.destroy(new Error('Upstream timeout'));
    });

    upstreamReq.on('error', () => {
      if (!res.headersSent && !closedByClient) {
        res.status(502).json({ error: 'No se pudo conectar con la cabina en vivo' });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    req.on('close', () => {
      closedByClient = true;
      upstreamReq.destroy();
    });
  });

  // Advertising / Cabin contact submission endpoint
  app.post('/api/contact', (req: Request, res: Response) => {
    const name = sanitizeText(req.body?.name, 80);
    const phone = sanitizeText(req.body?.phone, 32);
    const email = sanitizeText(req.body?.email, 120);
    const station = sanitizeText(req.body?.station, 60) || 'Todas las emisoras';
    const message = sanitizeText(req.body?.message, 600);

    if (name.length < 2) {
      res.status(400).json({ error: 'Por favor escribe tu nombre o el de tu negocio.' });
      return;
    }

    if (phone.length < 7 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        error: 'Ingresa un número de teléfono/WhatsApp válido o un correo electrónico.',
      });
      return;
    }

    if (message.length < 8) {
      res.status(400).json({
        error: 'Cuéntanos brevemente tu consulta o pauta publicitaria (mínimo 8 caracteres).',
      });
      return;
    }

    const inquiry: ContactInquiry = {
      id: crypto.randomUUID(),
      name,
      phone,
      email,
      station,
      message,
      createdAt: new Date().toISOString(),
    };

    contactInquiries.push(inquiry);
    if (contactInquiries.length > 100) {
      contactInquiries.shift();
    }

    res.status(201).json({
      ok: true,
      id: inquiry.id,
      message: 'Solicitud recibida por el equipo comercial de CORPOCENTROH en Siguatepeque.',
    });
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, stations: Object.keys(STREAM_TARGETS) });
  });

  const server = http.createServer(app);

  // Real-time WebSocket server for listener chat
  const wss = new WebSocketServer({ server, path: '/ws' });
  const lastMessageAt = new WeakMap<WebSocket, number>();
  const aliveMap = new WeakMap<WebSocket, boolean>();

  function broadcast(payload: unknown) {
    const encoded = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(encoded);
      }
    }
  }

  function broadcastPresence() {
    broadcast({
      type: 'presence:update',
      onlineCount: wss.clients.size,
    });
  }

  wss.on('connection', (ws) => {
    aliveMap.set(ws, true);

    ws.on('pong', () => {
      aliveMap.set(ws, true);
    });

    ws.send(
      JSON.stringify({
        type: 'init',
        messages: chatMessages,
        onlineCount: wss.clients.size,
      })
    );

    broadcastPresence();

    ws.on('message', (rawBuffer) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(rawBuffer.toString('utf8'));
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Formato de mensaje inválido' }));
        return;
      }

      if (data.type === 'chat:send') {
        const now = Date.now();
        const prev = lastMessageAt.get(ws) || 0;
        if (now - prev < 1200) {
          ws.send(
            JSON.stringify({
              type: 'error',
              error: 'Espera un momento antes de enviar otro mensaje.',
            })
          );
          return;
        }

        const author = sanitizeText(data.author, 26);
        const location = sanitizeText(data.location, 34) || 'Siguatepeque';
        const stationId = sanitizeText(data.stationId, 24);
        const targetStation = STREAM_TARGETS[stationId];
        const kindRaw = sanitizeText(data.kind, 16);
        const kind: ChatMessageKind =
          kindRaw === 'saludo' || kindRaw === 'peticion' ? kindRaw : 'chat';
        const text = sanitizeText(data.text, 280);

        if (author.length < 2) {
          ws.send(
            JSON.stringify({
              type: 'error',
              error: 'Tu nombre debe tener al menos 2 caracteres.',
            })
          );
          return;
        }

        if (text.length < 1) {
          ws.send(
            JSON.stringify({
              type: 'error',
              error: 'Escribe un mensaje antes de enviarlo.',
            })
          );
          return;
        }

        lastMessageAt.set(ws, now);

        const message: ChatMessage = {
          id: crypto.randomUUID(),
          author,
          location,
          stationId: targetStation ? stationId : 'lacentro',
          stationLabel: targetStation ? targetStation.label : 'La Centro 96.3 FM',
          kind,
          text,
          createdAt: new Date().toISOString(),
          hearts: 0,
        };

        chatMessages.push(message);
        if (chatMessages.length > MAX_CHAT_HISTORY) {
          chatMessages.shift();
        }

        broadcast({
          type: 'chat:message',
          message,
        });
      } else if (data.type === 'chat:react') {
        const messageId = sanitizeText(data.messageId, 64);
        const msg = chatMessages.find((m) => m.id === messageId);
        if (msg) {
          msg.hearts += 1;
          broadcast({
            type: 'chat:reaction',
            messageId: msg.id,
            hearts: msg.hearts,
          });
        }
      }
    });

    ws.on('close', () => {
      broadcastPresence();
    });
  });

  // Keep mobile WebSocket connections healthy and reap stale ones
  const heartbeatInterval = setInterval(() => {
    for (const client of wss.clients) {
      if (aliveMap.get(client) === false) {
        client.terminate();
        continue;
      }
      aliveMap.set(client, false);
      client.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CORPOCENTROH server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
