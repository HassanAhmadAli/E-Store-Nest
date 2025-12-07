import { createZodDto } from "nestjs-zod";
import { z } from "zod";
export const PaginationQueryZod = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  deletedItems: z.coerce.boolean().default(false),
});
export class PaginationQueryDto extends createZodDto(PaginationQueryZod) {}
