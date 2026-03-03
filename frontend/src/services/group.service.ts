import { api } from './api';
import type { Group } from '../types';

export const groupService = {
  async findAll(): Promise<Group[]> {
    const { data } = await api.get<Group[]>('/groups');
    return data;
  },

  async create(payload: { name: string; order?: number }): Promise<Group> {
    const { data } = await api.post<Group>('/groups', payload);
    return data;
  },

  async update(id: string, payload: { name?: string; order?: number }): Promise<Group> {
    const { data } = await api.put<Group>(`/groups/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  },
};
