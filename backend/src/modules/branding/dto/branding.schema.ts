import { z } from "zod";

const normalizeHashtags = (values: string[]) => {
  const normalizedValues = values.flatMap((value) => {
    const compactValue = value.trim();

    if (!compactValue) {
      return [];
    }

    const rawTokens =
      /[,\n;]+/.test(compactValue)
        ? compactValue.split(/[,\n;]+/)
        : compactValue.includes(" ")
          ? compactValue.split(/\s+/)
          : [compactValue];

    return rawTokens
      .map((token) =>
        token
          .trim()
          .replace(/^#+/, "")
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}_-]/gu, "")
      )
      .filter(Boolean)
      .map((token) => `#${token}`);
  });

  return Array.from(new Set(normalizedValues));
};

export const upsertBrandingSchema = z.object({
  brandName: z.string().max(120).optional(),
  artistName: z.string().max(120).optional(),
  artStyle: z.string().max(240).optional(),
  personalityNotes: z.string().max(1000).optional(),
  targetAudience: z.string().max(240).optional(),
  nftThemePreferences: z.string().max(500).optional(),
  toneOfVoice: z.string().max(240).optional(),
  socialMediaStyle: z.string().max(240).optional(),
  defaultHashtags: z
    .array(z.string().max(500))
    .default([])
    .transform(normalizeHashtags)
    .pipe(z.array(z.string().min(2).max(80)).max(30))
});
