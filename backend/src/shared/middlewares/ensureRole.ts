import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../errors/AppError';

/**
 * Factory de middleware que garante que o usuário tem a role necessária.
 * Uso: ensureRole('ADMIN') ou ensureRole('ADMIN', 'USER')
 */
export function ensureRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole) {
      throw new AppError('Não autorizado', 403);
    }

    if (!roles.includes(req.userRole as Role)) {
      throw new AppError('Sem permissão para esta ação', 403);
    }

    next();
  };
}
