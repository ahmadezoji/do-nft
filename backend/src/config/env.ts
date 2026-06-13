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
  ALCHEMY_RPC_URL: z.string().optional(),
  WALLET_PRIVATE_KEY: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  PINATA_GATEWAY_URL: z.string().optional(),
  OPENSEA_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
