import { NftStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";

export class DashboardService {
  async summary(userId: string) {
    const [collectionsCount, nftsCount, draftNftsCount, listedNftsCount, campaignsCount, recentNfts, credentials] =
      await Promise.all([
        prisma.collection.count({ where: { userId } }),
        prisma.nft.count({ where: { userId } }),
        prisma.nft.count({ where: { userId, status: NftStatus.DRAFT } }),
        prisma.nft.count({ where: { userId, status: NftStatus.LISTED } }),
        prisma.promotionCampaign.count({ where: { userId } }),
        prisma.nft.findMany({
          where: { userId },
          take: 5,
          orderBy: { updatedAt: "desc" }
        }),
        prisma.credential.findMany({
          where: { userId },
          select: {
            provider: true,
            updatedAt: true
          }
        })
      ]);

    return {
      totals: {
        collections: collectionsCount,
        nfts: nftsCount,
        draftNfts: draftNftsCount,
        listedNfts: listedNftsCount,
        campaigns: campaignsCount
      },
      recentImages: recentNfts.filter((item) => Boolean(item.imageUrl)),
      integrations: credentials
    };
  }
}
