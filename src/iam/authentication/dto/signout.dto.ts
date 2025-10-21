import { createZodDto } from "nestjs-zod";
import { z } from "zod/v4";
export const SignoutSchema = z.object({
  password: z.string(),
  refreshToken: z.string(),
});
export class SignoutDto extends createZodDto(SignoutSchema) {}
