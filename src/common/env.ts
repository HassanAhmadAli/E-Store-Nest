import { prettifyError, z } from "zod";
import { envSchema, NODE_ENV_Schema } from "./schema/env";
const { success, error } = NODE_ENV_Schema.safeParse(process.env.NODE_ENV);
if (!success) {
  throw new Error(prettifyError(error));
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.input<typeof envSchema> {
      NODE_ENV: z.infer<typeof NODE_ENV_Schema>;
    }
  }
}
