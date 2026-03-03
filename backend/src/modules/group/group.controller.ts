import { Request, Response, NextFunction } from 'express';
import { GroupService } from './group.service';
import { createGroupDTO, updateGroupDTO } from './group.dto';

const groupService = new GroupService();

export class GroupController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupService.findAll(req.userId!);
      return res.json(groups);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGroupDTO.parse(req.body);
      const group = await groupService.create(data, req.userId!);
      return res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateGroupDTO.parse(req.body);
      const group = await groupService.update(String(req.params.id), data, req.userId!);
      return res.json(group);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await groupService.delete(String(req.params.id), req.userId!);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
