import { prettifyError, z } from "zod/v4";
import { durationSchema } from "@/common/schema/duration-schema";
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_AUDIENCE: z
    .string()
    .default("localhost:3000")
    .meta({ description: "identifies the audiance jwt is use for, like localhost:3000" }),
  JWT_ISSUER: z
    .string()
    .default("localhost:3000")
    .meta({ description: "identifies the issuer of the jwt , like localhost:3000" }),
  JWT_TTL: durationSchema.default("1y").meta({ description: "identifies the time to live of the issued jwt" }),
  JWT_REFRESH_TTL: durationSchema
    .default("1y")
    .meta({ description: " identifies the time to live of the refresh token" }),
  REDIS_DATABASE_URL: z.string().nonempty().default("redis://localhost:6379"),
  EMAIL_HOST: z.string(),
  EMAIL_User: z.email(),
  EMAIL_Password: z.string(),
});
export const validateEnv = (input: Record<string, any>) => {
  const { data: env, error, success } = envSchema.safeParse(input);
  if (success) {
    return env;
  } else {
    throw new Error(prettifyError(error));
  }
};
export type EnvVariables = z.infer<typeof envSchema>;
