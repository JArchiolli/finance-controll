import { Router } from 'express';
import { AuthController } from './auth.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post('/login', (req, res, next) => authController.login(req, res, next));
authRoutes.get('/me', ensureAuth, (req, res, next) => authController.me(req, res, next));
