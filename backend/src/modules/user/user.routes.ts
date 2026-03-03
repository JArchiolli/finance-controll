import { Router } from 'express';
import { UserController } from './user.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';
import { ensureRole } from '../../shared/middlewares/ensureRole';

const userController = new UserController();

export const userRoutes = Router();

// Todas as rotas de usuário requerem autenticação + role ADMIN
userRoutes.use(ensureAuth, ensureRole('ADMIN'));

userRoutes.get('/', (req, res, next) => userController.findAll(req, res, next));
userRoutes.post('/', (req, res, next) => userController.create(req, res, next));
userRoutes.put('/:id', (req, res, next) => userController.update(req, res, next));
userRoutes.delete('/:id', (req, res, next) => userController.delete(req, res, next));
