import { z } from "zod";

export const updateUserSettingsSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  artistName: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(2000).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  preferredAi: z.string().max(80).optional(),
  preferredLanguage: z.enum(["en", "fa"]).optional(),
  defaultChain: z.string().max(80).optional(),
  timezone: z.string().max(80).optional(),
  defaultImageWidth: z.coerce.number().int().min(256).max(4096).optional(),
  defaultImageHeight: z.coerce.number().int().min(256).max(4096).optional(),
  artworkStyle: z.string().max(1000).optional(),
  artVision: z.string().max(3000).optional(),
  nftVision: z.string().max(3000).optional(),
  inspirationSources: z.string().max(2000).optional(),
  signatureMotifs: z.string().max(2000).optional(),
  colorDirection: z.string().max(1000).optional(),
  promptBase: z.string().max(4000).optional(),
  negativePromptBase: z.string().max(2000).optional(),
  creativeRules: z.string().max(3000).optional(),
  sampleReferenceUrls: z.array(z.string().url()).optional(),
  preferredAspectRatio: z.string().max(40).optional(),
  preferredResolution: z.string().max(40).optional(),
  preferredOpenAiModel: z.string().max(120).optional(),
  preferredGeminiModel: z.string().max(120).optional()
});
