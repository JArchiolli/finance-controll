import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';

/**
 * Middleware centralizado de tratamento de erros.
 * Trata erros conhecidos (AppError, ZodError) e erros inesperados.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // ── Erro da aplicação (lançado intencionalmente) ──────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // ── Erro de validação do Zod ──────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(422).json({
      status: 'validation_error',
      message: 'Dados inválidos',
      errors,
    });
  }

  // ── Erro inesperado ───────────────────────────────────
  console.error('❌ Erro inesperado:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
