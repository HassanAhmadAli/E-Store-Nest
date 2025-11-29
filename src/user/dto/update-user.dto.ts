import { createZodDto } from "nestjs-zod";
import { CreateUserSchema } from "../schema/user";
export const UpdateUserSchema = CreateUserSchema.omit({
  password: true,
})
  .partial()
  .strict();
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
