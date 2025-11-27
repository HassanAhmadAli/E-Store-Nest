import { CreateComplaintSchema } from "./create-complaint.dto";
import { createZodDto } from "nestjs-zod";
export const UpdateComplaintSchema = CreateComplaintSchema.partial();
export class UpdateComplaintDto extends createZodDto(UpdateComplaintSchema) {}
