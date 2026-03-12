import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_BASE_URL: z.string().url().optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
    TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),
    TELEGRAM_INIT_DATA_VALIDATION_SECRET: z.string().min(1).optional(),
    TELEGRAM_WEBAPP_URL: z.string().url().optional()
  },
  client: {
    NEXT_PUBLIC_MOCK_TELEGRAM: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional()
  },
  runtimeEnv: {
    APP_BASE_URL: process.env.APP_BASE_URL,
    NEXT_PUBLIC_MOCK_TELEGRAM: process.env.NEXT_PUBLIC_MOCK_TELEGRAM,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    TELEGRAM_INIT_DATA_VALIDATION_SECRET:
      process.env.TELEGRAM_INIT_DATA_VALIDATION_SECRET,
    TELEGRAM_WEBAPP_URL: process.env.TELEGRAM_WEBAPP_URL
  },
  emptyStringAsUndefined: true
});
