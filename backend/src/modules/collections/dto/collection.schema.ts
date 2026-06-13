import { z } from "zod";

import { CollectionStatus } from "../../../common/constants/domain-enums.js";

export const createCollectionSchema = z.object({
  name: z.string().min(2).max(120),
  contractSymbol: z.string().min(2).max(12).optional().or(z.literal("")).transform((value) => value || undefined),
  description: z.string().min(10).max(2000),
  theme: z.string().max(240).optional(),
  story: z.string().max(2000).optional(),
  blockchain: z.string().max(80).optional(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  marketplaceTarget: z.string().max(80).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(CollectionStatus).optional()
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const assistCollectionSchema = z.object({
  name: z.string().min(2).max(120),
  theme: z.string().max(240).optional(),
  audience: z.string().max(240).optional(),
  storySeed: z.string().max(500).optional()
});
