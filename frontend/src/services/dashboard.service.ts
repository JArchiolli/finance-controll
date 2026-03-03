import { api } from './api';
import type { DashboardData } from '../types';

export const dashboardService = {
  async getSummary(year: number): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/dashboard', { params: { year } });
    return data;
  },
};
