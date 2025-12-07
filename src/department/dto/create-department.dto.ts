import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import {} from "@/../generated/prisma/zod/schemas/models/Department.schema";
export const CreateDepartmentSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});
export class CreateDepartmentDto extends createZodDto(CreateDepartmentSchema) {}
