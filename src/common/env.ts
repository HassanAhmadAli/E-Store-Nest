import { prettifyError, z } from "zod";
import { envSchema, EnvVariables } from "./schema/env";
const { success, error, data: env } = envSchema.safeParse(process.env);

if (!success || env == undefined) {
  throw new Error(prettifyError(error));
}
export { env };
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.input<typeof envSchema> {
      NODE_ENV: EnvVariables["NODE_ENV"];
    }
  }
}
