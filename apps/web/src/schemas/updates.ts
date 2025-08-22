import { z } from "zod";

export const UpdateSchema = z.object({
  update_id: z.string().uuid(),
  username: z.string(),
  description: z.string().nullable(),
  blocked: z.boolean().default(false),
  created_at: z.string().datetime().nullable(),
});

export type Update = z.infer<typeof UpdateSchema>;

export const CreateUpdateSchema = z.object({
  update_id: z.string().uuid().optional(),
  username: z.string(),
  description: z.string().nullable().optional(),
  blocked: z.boolean().default(false).optional(),
});

export type CreateUpdate = z.infer<typeof CreateUpdateSchema>;