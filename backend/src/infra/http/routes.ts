import { Express } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes';
import { userRoutes } from '../../modules/user/user.routes';
import { groupRoutes } from '../../modules/group/group.routes';
import { accountRoutes } from '../../modules/account/account.routes';
import { entryRoutes } from '../../modules/entry/entry.routes';
import { dashboardRoutes } from '../../modules/dashboard/dashboard.routes';

/**
 * Registra todas as rotas da aplicação.
 * Cada módulo expõe seu próprio Router.
 */
export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/entries', entryRoutes);
  app.use('/api/dashboard', dashboardRoutes);
}
