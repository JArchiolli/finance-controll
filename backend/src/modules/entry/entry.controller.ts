import { Request, Response, NextFunction } from 'express';
import { EntryService } from './entry.service';
import { createEntryDTO, updateEntryDTO, upsertEntryDTO } from './entry.dto';

const entryService = new EntryService();

export class EntryController {
  async findByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const entries = await entryService.findByYear(year, req.userId!);
      return res.json(entries);
    } catch (error) {
      next(error);
    }
  }

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const data = upsertEntryDTO.parse(req.body);
      const entry = await entryService.upsert(data, req.userId!);
      return res.json(entry);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEntryDTO.parse(req.body);
      const entry = await entryService.create(data, req.userId!);
      return res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateEntryDTO.parse(req.body);
      const entry = await entryService.update(String(req.params.id), data, req.userId!);
      return res.json(entry);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await entryService.delete(String(req.params.id), req.userId!);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
