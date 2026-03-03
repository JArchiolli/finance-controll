import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';

/**
 * Middleware que garante que o usuário está autenticado.
 * Extrai o token do header Authorization (Bearer) e decodifica.
 */
export function ensureAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
