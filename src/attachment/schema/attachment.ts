import { z } from "zod/v4";
export const AttachmentSchema = z.object({
  id: z.number().int(),
  fileUrl: z.url(),
  fileType: z.string(),
  fileSize: z.int().nullable(),
  complaintId: z.int(),
});
