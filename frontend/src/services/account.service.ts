import { api } from './api';
import type { Account } from '../types';

export const accountService = {
  async findAll(): Promise<Account[]> {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  async create(payload: { name: string; groupId: string; order?: number }): Promise<Account> {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },

  async update(id: string, payload: { name?: string; groupId?: string; order?: number }): Promise<Account> {
    const { data } = await api.put<Account>(`/accounts/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },
};
