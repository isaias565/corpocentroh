import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const STREAM_TARGETS: Record<string, { url: string; label: string }> = {
  lacentro: {
    url: 'http://198.204.234.10:6175/lacentro',
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

interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  station: string;
  message: string;
  createdAt: string;
}

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

    if (message.length < 6) {
      res.status(400).json({
        error: 'Cuéntanos brevemente tu consulta o pauta publicitaria.',
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
