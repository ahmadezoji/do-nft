import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export class NftsRepository {
  list(userId: string) {
    return prisma.nft.findMany({
      where: { userId },
      include: {
        collection: true,
        template: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  findById(userId: string, nftId: string) {
    return prisma.nft.findFirst({
      where: {
        id: nftId,
        userId
      },
      include: {
        collection: true,
        template: true
      }
    });
  }

  create(userId: string, input: Omit<Prisma.NftUncheckedCreateInput, "userId">) {
    return prisma.nft.create({
      data: {
        userId,
        ...input
      },
      include: {
        collection: true,
        template: true
      }
    });
  }

  async update(userId: string, nftId: string, input: Prisma.NftUncheckedUpdateInput) {
    const nft = await prisma.nft.findFirst({
      where: {
        id: nftId,
        userId
      }
    });

    if (!nft) {
      return null;
    }

    return prisma.nft.update({
      where: { id: nftId },
      data: input,
      include: {
        collection: true,
        template: true
      }
    });
  }

  async delete(userId: string, nftId: string) {
    const nft = await prisma.nft.findFirst({
      where: {
        id: nftId,
        userId
      }
    });

    if (!nft) {
      return null;
    }

    await prisma.nft.delete({ where: { id: nftId } });

    return nft;
  }

  async getTemplates() {
    return prisma.promptTemplate.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  async createTemplates(templates: Prisma.PromptTemplateCreateManyInput[]) {
    await prisma.promptTemplate.createMany({
      data: templates
    });

    return this.getTemplates();
  }
}
