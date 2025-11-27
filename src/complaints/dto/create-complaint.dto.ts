import { z } from "zod/v4";
import { createZodDto } from "nestjs-zod";
export const CreateComplaintSchema = z.object({});
export class CreateComplaintDto extends createZodDto(CreateComplaintSchema) {}
