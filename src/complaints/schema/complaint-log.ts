import { AuditAction } from "@/prisma";
import { z } from "zod";
export const ComplaintLogSchema = z.object({
  id: z.int(),
  complaintId: z.int(),
  changedById: z.int(),
  action: z.enum(Object.keys(AuditAction)),
  changes: z.object().loose(),
  notes: z.string(),
});
