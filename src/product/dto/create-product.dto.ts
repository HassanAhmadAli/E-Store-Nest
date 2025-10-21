import { createZodDto } from "nestjs-zod";
import { z } from "zod/v4";
export const CreateProductZodSchema = z
  .object({
    name: z.string(),
    brand: z.string(),
  })
  .strict();
export class CreateProductDto extends createZodDto(CreateProductZodSchema) {}
