import { Router } from 'express';
import { GroupController } from './group.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';

const groupController = new GroupController();

export const groupRoutes = Router();

groupRoutes.use(ensureAuth);

groupRoutes.get('/', (req, res, next) => groupController.findAll(req, res, next));
groupRoutes.post('/', (req, res, next) => groupController.create(req, res, next));
groupRoutes.put('/:id', (req, res, next) => groupController.update(req, res, next));
groupRoutes.delete('/:id', (req, res, next) => groupController.delete(req, res, next));
