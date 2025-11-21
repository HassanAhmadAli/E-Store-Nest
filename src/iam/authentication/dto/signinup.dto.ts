import { Roles } from "@/prisma";
import { createZodDto } from "nestjs-zod";
import { z } from "zod/v4";

export const SingupSchema = z.object({
  email: z.email(),
  password: z.string().min(10, { message: "Password must be at least 10 characters" }),
  role: z.enum(Roles).default(Roles.Regular),
});
export class SignupDto extends createZodDto(SingupSchema) {}
