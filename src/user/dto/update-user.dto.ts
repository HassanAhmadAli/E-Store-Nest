import { createZodDto } from "nestjs-zod";
import { CreateUserSchema } from "../schema/user";
export const UpdateUserSchema = CreateUserSchema.partial();
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
