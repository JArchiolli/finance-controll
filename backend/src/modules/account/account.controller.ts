import { Request, Response, NextFunction } from 'express';
import { AccountService } from './account.service';
import { createAccountDTO, updateAccountDTO } from './account.dto';

const accountService = new AccountService();

export class AccountController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.findAll(req.userId!);
      return res.json(accounts);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAccountDTO.parse(req.body);
      const account = await accountService.create(data, req.userId!);
      return res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateAccountDTO.parse(req.body);
      const account = await accountService.update(String(req.params.id), data, req.userId!);
      return res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await accountService.delete(String(req.params.id), req.userId!);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
