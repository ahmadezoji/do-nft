import { AppError } from "../../common/errors/app-error.js";
import { Platform, PromotionCampaignStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";
import { AiService } from "../ai/ai.service.js";
import { XService } from "../x/x.service.js";

import { PromotionsRepository } from "./promotions.repository.js";

export class PromotionsService {
  constructor(
    private readonly promotionsRepository = new PromotionsRepository(),
    private readonly aiService = new AiService(),
    private readonly xService = new XService()
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

  async publishPost(userId: string, campaignId: string, postId: string) {
    const campaign = await this.promotionsRepository.findCampaignWithPost(userId, campaignId, postId);
    const post = campaign?.posts[0];

    if (!campaign || !post) {
      throw new AppError("Promotion post not found", 404);
    }

    if (post.platform !== Platform.TWITTER) {
      throw new AppError("Only X (Twitter) posts can be published from here.", 400);
    }

    const text = `${post.content}\n\n${post.hashtags.join(" ")}`.trim().slice(0, 280);

    try {
      const tweet = await this.xService.postTweet(userId, text);

      return this.promotionsRepository.updatePostResult(postId, {
        status: PromotionCampaignStatus.POSTED,
        externalPostId: tweet.id,
        externalUrl: tweet.url
      });
    } catch (caughtError) {
      await this.promotionsRepository.updatePostResult(postId, {
        status: PromotionCampaignStatus.FAILED
      });

      throw caughtError;
    }
  }
}
