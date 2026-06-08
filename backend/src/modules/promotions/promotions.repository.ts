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
