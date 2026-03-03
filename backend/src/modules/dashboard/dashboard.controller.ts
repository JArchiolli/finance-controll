import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const summary = await dashboardService.getSummary(year, req.userId!);
      return res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}
