import { PromotionCampaignStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";

export class PromotionsRepository {
  list(userId: string) {
    return prisma.promotionCampaign.findMany({
      where: { userId },
      include: {
        nft: true,
        posts: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  findCampaign(userId: string, campaignId: string) {
    return prisma.promotionCampaign.findFirst({
      where: { id: campaignId, userId },
      include: {
        nft: true,
        posts: true
      }
    });
  }

  async delete(userId: string, campaignId: string) {
    const campaign = await prisma.promotionCampaign.findFirst({
      where: { id: campaignId, userId }
    });

    if (!campaign) {
      return null;
    }

    await prisma.promotionCampaign.delete({ where: { id: campaignId } });

    return campaign;
  }

  async replacePosts(
    campaignId: string,
    posts: Array<{ platform: string; content: string; hashtags: string[]; status: string }>
  ) {
    await prisma.promotionPost.deleteMany({ where: { campaignId } });

    return prisma.promotionCampaign.update({
      where: { id: campaignId },
      data: {
        status: PromotionCampaignStatus.GENERATED as never,
        posts: {
          create: posts.map((post) => ({
            platform: post.platform as never,
            content: post.content,
            hashtags: post.hashtags,
            status: post.status as never
          }))
        }
      },
      include: {
        nft: true,
        posts: true
      }
    });
  }

  findCampaignWithPost(userId: string, campaignId: string, postId: string) {
    return prisma.promotionCampaign.findFirst({
      where: { id: campaignId, userId },
      include: {
        nft: true,
        posts: {
          where: { id: postId }
        }
      }
    });
  }

  updatePostResult(
    postId: string,
    data: { status: string; externalPostId?: string | null; externalUrl?: string | null }
  ) {
    return prisma.promotionPost.update({
      where: { id: postId },
      data: {
        status: data.status as never,
        externalPostId: data.externalPostId,
        externalUrl: data.externalUrl
      }
    });
  }

  createCampaign(
    userId: string,
    input: {
      name: string;
      nftId?: string;
      collectionId?: string;
      platforms: string[];
      status?: string;
      posts: Array<{ platform: string; content: string; hashtags: string[]; status: string }>;
    }
  ) {
    return prisma.promotionCampaign.create({
      data: {
        userId,
        name: input.name,
        nftId: input.nftId,
        collectionId: input.collectionId,
        platforms: input.platforms as never,
        status: input.status as never,
        posts: {
          create: input.posts.map((post) => ({
            platform: post.platform as never,
            content: post.content,
            hashtags: post.hashtags,
            status: post.status as never
          }))
        }
      },
      include: {
        nft: true,
        posts: true
      }
    });
  }
}
