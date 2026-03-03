import { z } from 'zod';

export const createAccountDTO = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  groupId: z.string().uuid('ID do grupo inválido'),
  order: z.number().int().min(0).default(0),
});

export const updateAccountDTO = z.object({
  name: z.string().min(2).optional(),
  groupId: z.string().uuid().optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateAccountDTO = z.infer<typeof createAccountDTO>;
export type UpdateAccountDTO = z.infer<typeof updateAccountDTO>;
