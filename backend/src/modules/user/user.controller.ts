import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { createUserDTO, updateUserDTO } from './user.dto';

const userService = new UserService();

export class UserController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserDTO.parse(req.body);
      const user = await userService.create(data);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateUserDTO.parse(req.body);
      const user = await userService.update(String(req.params.id), data);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(String(req.params.id), req.userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
