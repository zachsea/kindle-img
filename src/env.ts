import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NIGHTSCOUT_URL: z.url(),
    NIGHTSCOUT_API_SECRET: z.string(),
    PORT: z.string().optional().default("3000"),
    REFRESH_RATE_SECONDS: z.string().optional().default("360"),
  },
  emptyStringAsUndefined: true,
  runtimeEnvStrict: {
    NIGHTSCOUT_URL: process.env.NIGHTSCOUT_URL,
    NIGHTSCOUT_API_SECRET: process.env.NIGHTSCOUT_API_SECRET,
    PORT: process.env.PORT,
    REFRESH_RATE_SECONDS: process.env.REFRESH_RATE_SECONDS,
  },
});
