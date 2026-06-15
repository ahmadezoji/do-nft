import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  ENCRYPTION_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  OPENAI_IMAGE_QUALITY: z.enum(["low", "medium", "high"]).default("medium")
});

export const env = envSchema.parse(process.env);
