import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';

const dashboardController = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.use(ensureAuth);

dashboardRoutes.get('/', (req, res, next) => dashboardController.getSummary(req, res, next));
