import { z } from 'zod';

export const createGroupDTO = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  order: z.number().int().min(0).default(0),
});

export const updateGroupDTO = z.object({
  name: z.string().min(2).optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateGroupDTO = z.infer<typeof createGroupDTO>;
export type UpdateGroupDTO = z.infer<typeof updateGroupDTO>;
