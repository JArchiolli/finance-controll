import { api } from './api';
import type { Entry, PaymentStatus } from '../types';

export interface UpsertEntryPayload {
  accountId: string;
  year: number;
  month: number;
  value: number;
  installment?: number | null;
  totalInstallments?: number | null;
  notes?: string | null;
  paymentStatus?: PaymentStatus;
}

export const entryService = {
  async findByYear(year: number): Promise<Entry[]> {
    const { data } = await api.get<Entry[]>('/entries', { params: { year } });
    return data;
  },

  async upsert(payload: UpsertEntryPayload): Promise<Entry> {
    const { data } = await api.put<Entry>('/entries/upsert', payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/entries/${id}`);
  },
};
