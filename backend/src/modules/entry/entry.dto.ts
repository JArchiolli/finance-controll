import { z } from 'zod';

export const createEntryDTO = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  value: z.number().min(0, 'Valor deve ser positivo'),
  installment: z.number().int().min(1).nullable().optional(),
  totalInstallments: z.number().int().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID_ON_TIME', 'PAID_LATE']).optional(),
});

export const updateEntryDTO = z.object({
  value: z.number().min(0).optional(),
  installment: z.number().int().min(1).nullable().optional(),
  totalInstallments: z.number().int().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID_ON_TIME', 'PAID_LATE']).optional(),
});

export const upsertEntryDTO = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  value: z.number().min(0, 'Valor deve ser positivo'),
  installment: z.number().int().min(1).nullable().optional(),
  totalInstallments: z.number().int().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID_ON_TIME', 'PAID_LATE']).optional(),
});

export type CreateEntryDTO = z.infer<typeof createEntryDTO>;
export type UpdateEntryDTO = z.infer<typeof updateEntryDTO>;
export type UpsertEntryDTO = z.infer<typeof upsertEntryDTO>;
