import { AppError } from "../../common/errors/app-error.js";
import { PromotionCampaignStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";
import { AiService } from "../ai/ai.service.js";

import { PromotionsRepository } from "./promotions.repository.js";

export class PromotionsService {
  constructor(
    private readonly promotionsRepository = new PromotionsRepository(),
    private readonly aiService = new AiService()
  ) {}

  list(userId: string) {
    return this.promotionsRepository.list(userId);
  }

  async create(userId: string, input: { name: string; nftId?: string; collectionId?: string; platforms: string[] }) {
    const nft = input.nftId
      ? await prisma.nft.findFirst({
          where: {
            id: input.nftId,
            userId
          }
        })
      : null;

    if (input.nftId && !nft) {
      throw new AppError("NFT not found for promotion campaign", 404);
    }

    const generatedPosts = await this.aiService.generatePromotion(userId, {
      assetName: nft?.name ?? input.name,
      assetDescription: nft?.description ?? undefined,
      platforms: input.platforms
    });

    return this.promotionsRepository.createCampaign(userId, {
      ...input,
      status: PromotionCampaignStatus.GENERATED,
      posts: input.platforms.map((platform) => ({
        platform,
        content: generatedPosts[platform]?.content ?? "",
        hashtags: generatedPosts[platform]?.hashtags ?? [],
        status: PromotionCampaignStatus.GENERATED
      }))
    });
  }
}
