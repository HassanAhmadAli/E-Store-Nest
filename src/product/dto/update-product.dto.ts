import { CreateProductZodSchema } from "./create-product.dto";
import { createZodDto } from "nestjs-zod";
export const UpdateProductZodSchema = CreateProductZodSchema.partial().strict();
export class UpdateProductDto extends createZodDto(UpdateProductZodSchema) {}
