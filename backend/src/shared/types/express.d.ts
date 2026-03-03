/**
 * Extensão dos tipos do Express para incluir dados do usuário autenticado.
 */
declare namespace Express {
  interface Request {
    userId?: string;
    userRole?: string;
  }
}
