import { z } from "zod";

export const updateAutoPromoterSettingsSchema = z.object({
  enabled: z.boolean(),
  collectionId: z.string().optional(),
  keywords: z.array(z.string().min(1)).default([]),
  targetHandles: z.array(z.string().min(1)).max(5).default([]),
  intervalMinutes: z.number().int().min(15).max(1440).default(720)
});
