import { Roles } from "@/prisma";
import { z } from "zod/v4";
export const ActiveUserSchema = z.object({
  sub: z.number(),
  email: z.email(),
  role: z.enum(Roles),
});
export const RefreshTokenPayloadSchema = ActiveUserSchema.extend({
  tokenType: z.literal("refresh").default("refresh"),
  refreshTokenId: z.string(),
});

export const AccessTokenPayloadSchema = ActiveUserSchema.extend({
  tokenType: z.literal("access").default("access"),
});

export type ActiveUser = z.infer<typeof ActiveUserSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;
export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;
