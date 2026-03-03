import { Router } from 'express';
import { EntryController } from './entry.controller';
import { ensureAuth } from '../../shared/middlewares/ensureAuth';

const entryController = new EntryController();

export const entryRoutes = Router();

entryRoutes.use(ensureAuth);

entryRoutes.get('/', (req, res, next) => entryController.findByYear(req, res, next));

// Upsert — salvar célula da planilha (cria ou atualiza)
entryRoutes.put('/upsert', (req, res, next) => entryController.upsert(req, res, next));

entryRoutes.post('/', (req, res, next) => entryController.create(req, res, next));
entryRoutes.put('/:id', (req, res, next) => entryController.update(req, res, next));
entryRoutes.delete('/:id', (req, res, next) => entryController.delete(req, res, next));
