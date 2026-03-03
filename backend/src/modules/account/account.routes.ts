import { Router } from 'express';
import { AccountController } from './account.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';

const accountController = new AccountController();

export const accountRoutes = Router();

accountRoutes.use(ensureAuth);

accountRoutes.get('/', (req, res, next) => accountController.findAll(req, res, next));
accountRoutes.post('/', (req, res, next) => accountController.create(req, res, next));
accountRoutes.put('/:id', (req, res, next) => accountController.update(req, res, next));
accountRoutes.delete('/:id', (req, res, next) => accountController.delete(req, res, next));
