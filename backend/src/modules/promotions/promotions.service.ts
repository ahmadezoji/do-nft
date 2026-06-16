import { AppError } from "../../common/errors/app-error.js";
import { Platform, PromotionCampaignStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";
import { AiService } from "../ai/ai.service.js";
import { DiscordService } from "../discord/discord.service.js";
import type { DiscordEmbed } from "../discord/discord.service.js";
import { FarcasterService } from "../farcaster/farcaster.service.js";
import { XService } from "../x/x.service.js";

import { PromotionsRepository } from "./promotions.repository.js";

export class PromotionsService {
  constructor(
    private readonly promotionsRepository = new PromotionsRepository(),
    private readonly aiService = new AiService(),
    private readonly xService = new XService(),
    private readonly discordService = new DiscordService(),
    private readonly farcasterService = new FarcasterService()
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
      assetUrl: nft?.listingUrl ?? nft?.imageUrl ?? undefined,
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

  async delete(userId: string, campaignId: string) {
    const deleted = await this.promotionsRepository.delete(userId, campaignId);

    if (!deleted) {
      throw new AppError("Promotion campaign not found", 404);
    }
  }

  async regenerate(userId: string, campaignId: string) {
    const campaign = await this.promotionsRepository.findCampaign(userId, campaignId);

    if (!campaign) {
      throw new AppError("Promotion campaign not found", 404);
    }

    const nft = campaign.nft;

    const generatedPosts = await this.aiService.generatePromotion(userId, {
      assetName: nft?.name ?? campaign.name,
      assetDescription: nft?.description ?? undefined,
      assetUrl: nft?.listingUrl ?? nft?.imageUrl ?? undefined,
      platforms: campaign.platforms
    });

    return this.promotionsRepository.replacePosts(
      campaignId,
      campaign.platforms.map((platform) => ({
        platform,
        content: generatedPosts[platform]?.content ?? "",
        hashtags: generatedPosts[platform]?.hashtags ?? [],
        status: PromotionCampaignStatus.GENERATED
      }))
    );
  }

  async publishPost(userId: string, campaignId: string, postId: string) {
    const campaign = await this.promotionsRepository.findCampaignWithPost(userId, campaignId, postId);
    const post = campaign?.posts[0];

    if (!campaign || !post) {
      throw new AppError("Promotion post not found", 404);
    }

    if (post.platform !== Platform.TWITTER && post.platform !== Platform.DISCORD && post.platform !== Platform.FARCASTER) {
      throw new AppError("Only X (Twitter), Discord, and Farcaster posts can be published from here.", 400);
    }

    try {
      if (post.platform === Platform.DISCORD) {
        const nft = campaign.nft;
        const linkUrl = nft?.listingUrl ?? nft?.imageUrl ?? undefined;
        const hashtags = post.hashtags.join(" ");
        const text = linkUrl ? `${post.content}\n\n${linkUrl}\n\n${hashtags}`.trim() : `${post.content}\n\n${hashtags}`.trim();

        const embed: DiscordEmbed = {
          title: nft?.name ?? campaign.name,
          description: post.content,
          url: nft?.listingUrl ?? undefined,
          color: 0x9b59b6,
          footer: hashtags ? { text: hashtags } : undefined
        };

        if (nft?.imageUrl?.startsWith("http")) {
          embed.image = { url: nft.imageUrl };
        }

        await this.discordService.postMessage(userId, text, [embed]);

        return this.promotionsRepository.updatePostResult(postId, {
          status: PromotionCampaignStatus.POSTED
        });
      }

      if (post.platform === Platform.FARCASTER) {
        const text = `${post.content}\n\n${post.hashtags.join(" ")}`.trim().slice(0, 320);
        const cast = await this.farcasterService.postCast(userId, text);

        return this.promotionsRepository.updatePostResult(postId, {
          status: PromotionCampaignStatus.POSTED,
          externalPostId: cast.hash,
          externalUrl: cast.url
        });
      }

      const nft = campaign.nft;
      const link = nft?.listingUrl ?? nft?.imageUrl ?? "";
      const tags = post.hashtags.join(" ");
      const suffix = [link, tags].filter(Boolean).join("\n\n");
      const maxCaption = Math.max(0, 278 - suffix.length);
      const caption = post.content.slice(0, maxCaption);
      const text = suffix ? `${caption}\n\n${suffix}` : caption;
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
