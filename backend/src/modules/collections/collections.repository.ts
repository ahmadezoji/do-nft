import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export class CollectionsRepository {
  list(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      include: {
        nfts: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  findById(userId: string, collectionId: string) {
    return prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId
      },
      include: {
        nfts: {
          orderBy: {
            updatedAt: "desc"
          }
        }
      }
    });
  }

  create(userId: string, input: Omit<Prisma.CollectionUncheckedCreateInput, "userId">) {
    return prisma.collection.create({
      data: {
        userId,
        ...input
      }
    });
  }

  async update(
    userId: string,
    collectionId: string,
    input: Prisma.CollectionUncheckedUpdateInput
  ) {
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!collection) {
      return null;
    }

    return prisma.collection.update({
      where: { id: collectionId },
      data: input
    });
  }
}
