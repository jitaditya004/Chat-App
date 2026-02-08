import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18)
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
