import { createZodDto } from "nestjs-zod";
import { z } from "zod/v4";
export const refreshTokenSchema = z.object({
  refreshToken: z.string().nonempty(),
});
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
