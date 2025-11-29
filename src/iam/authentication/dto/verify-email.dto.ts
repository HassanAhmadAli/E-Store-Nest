import { z } from "zod/v4";
import { createZodDto } from "nestjs-zod";
export const VerifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().length(8),
});
export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
