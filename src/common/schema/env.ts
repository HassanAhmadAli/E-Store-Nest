import { prettifyError, z } from "zod/v4";
import { durationSchema } from "@/common/schema/duration-schema";
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  // identifies the audiance jwt is use for, like localhost:3000
  JWT_AUDIENCE: z.string().default("localhost:3000"),
  // identifies the issuer of the jwt
  JWT_ISSUER: z.string().default("localhost:3000"),
  // identifies the time to live of the issued jwt
  JWT_TTL: durationSchema.default("1y"),
  // identifies the time to live of the refresh token
  JWT_REFRESH_TTL: durationSchema.default("1y"),
  REDIS_DATABASE_URL: z.string().nonempty(),
  APP_EMAIL_HOST: z.string(),
  APP_EMAIL_User: z.email(),
  APP_EMAIL_Password: z.string(),
});
export const validateEnv = (input: Record<string, any>) => {
  const { data, error, success } = envSchema.safeParse(input);
  if (success) {
    return data;
  } else {
    throw new Error(prettifyError(error));
  }
};

export type EnvVariables = z.infer<typeof envSchema>;
