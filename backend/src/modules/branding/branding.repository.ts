import { prisma } from "../../database/prisma.js";

export class BrandingRepository {
  findByUserId(userId: string) {
    return prisma.personalBranding.findUnique({
      where: { userId }
    });
  }

  upsert(userId: string, input: Record<string, unknown>) {
    return prisma.personalBranding.upsert({
      where: { userId },
      update: input,
      create: {
        userId,
        ...input
      }
    });
  }
}
