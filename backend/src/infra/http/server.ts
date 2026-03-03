import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import { errorHandler } from '../../shared/errors/errorHandler';

/**
 * Cria e configura a instância do Express.
 * Separado do listen para facilitar testes.
 */
export function createServer() {
  const app = express();

  // ── Middlewares globais ───────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ── Rotas ─────────────────────────────────────────────
  registerRoutes(app);

  // ── Health check ──────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Error handler (deve ser o último middleware) ──────
  app.use(errorHandler);

  return app;
}
