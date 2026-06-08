import { z } from "zod";

import { Platform, PromotionCampaignStatus } from "../../../common/constants/domain-enums.js";

export const createPromotionSchema = z.object({
  name: z.string().min(2).max(120),
  nftId: z.string().optional(),
  collectionId: z.string().optional(),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
  status: z.nativeEnum(PromotionCampaignStatus).optional()
});
