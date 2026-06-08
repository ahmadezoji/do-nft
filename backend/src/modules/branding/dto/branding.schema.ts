import { z } from "zod";

export const upsertBrandingSchema = z.object({
  brandName: z.string().max(120).optional(),
  artistName: z.string().max(120).optional(),
  artStyle: z.string().max(240).optional(),
  personalityNotes: z.string().max(1000).optional(),
  targetAudience: z.string().max(240).optional(),
  nftThemePreferences: z.string().max(500).optional(),
  toneOfVoice: z.string().max(240).optional(),
  socialMediaStyle: z.string().max(240).optional(),
  defaultHashtags: z.array(z.string().max(60)).default([])
});
