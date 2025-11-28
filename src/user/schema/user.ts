import { z } from "zod/v4";
import { Role } from "@/prisma";

export const CreateUserSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  password: z.string(),
  nationalId: z.string(),
  role: z.enum(Role),
});
