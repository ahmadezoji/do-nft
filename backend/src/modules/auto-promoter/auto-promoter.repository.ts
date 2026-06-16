import { prisma } from "../../database/prisma.js";

export class AutoPromoterRepository {
  getSettings(userId: string) {
    return prisma.autoPromoterSettings.findUnique({ where: { userId } });
  }

  upsertSettings(
    userId: string,
    data: { enabled: boolean; collectionId?: string; keywords: string[]; targetHandles: string[]; intervalMinutes: number }
  ) {
    return prisma.autoPromoterSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }

  touchLastRun(userId: string) {
    return prisma.autoPromoterSettings.update({
      where: { userId },
      data: { lastRunAt: new Date() }
    });
  }

  listLogs(userId: string, limit = 50) {
    return prisma.autoPromoterLogEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  findLog(userId: string, logId: string) {
    return prisma.autoPromoterLogEntry.findFirst({ where: { id: logId, userId } });
  }

  createLog(
    userId: string,
    data: {
      type: string;
      status?: string;
      message: string;
      targetHandle?: string | null;
      targetTweetId?: string | null;
      targetUrl?: string | null;
      suggestedAction?: unknown;
    }
  ) {
    return prisma.autoPromoterLogEntry.create({
      data: {
        userId,
        type: data.type as never,
        status: (data.status ?? "PENDING") as never,
        message: data.message,
        targetHandle: data.targetHandle,
        targetTweetId: data.targetTweetId,
        targetUrl: data.targetUrl,
        suggestedAction: data.suggestedAction as never
      }
    });
  }

  updateLogStatus(logId: string, status: string) {
    return prisma.autoPromoterLogEntry.update({
      where: { id: logId },
      data: { status: status as never }
    });
  }

  findLatestLogByMessage(userId: string, message: string) {
    return prisma.autoPromoterLogEntry.findFirst({
      where: { userId, message },
      orderBy: { createdAt: "desc" }
    });
  }

  findExistingSuggestion(userId: string, targetTweetId: string) {
    return prisma.autoPromoterLogEntry.findFirst({
      where: { userId, targetTweetId }
    });
  }

  findRecentMentionForHandle(userId: string, handle: string, daysBack = 7) {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    return prisma.autoPromoterLogEntry.findFirst({
      where: {
        userId,
        targetHandle: handle,
        type: "ACTION",
        status: "SENT",
        createdAt: { gte: since }
      }
    });
  }

  async listEnabledUsersDueForRun() {
    const settings = await prisma.autoPromoterSettings.findMany({ where: { enabled: true } });
    const now = Date.now();

    return settings.filter((setting) => {
      if (!setting.lastRunAt) {
        return true;
      }

      const dueAt = setting.lastRunAt.getTime() + setting.intervalMinutes * 60 * 1000;

      return now >= dueAt;
    });
  }
}
