import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginDTO } from './auth.dto';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginDTO.parse(req.body);
      const result = await authService.login(data);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.userId!);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
