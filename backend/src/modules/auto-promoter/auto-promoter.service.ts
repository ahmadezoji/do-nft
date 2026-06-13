import { AppError } from "../../common/errors/app-error.js";
import { AutoPromoterLogStatus, AutoPromoterLogType } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";
import { XService } from "../x/x.service.js";

import { AutoPromoterRepository } from "./auto-promoter.repository.js";

type SuggestedAction = { type: "retweet"; tweetId: string };

export class AutoPromoterService {
  constructor(
    private readonly autoPromoterRepository = new AutoPromoterRepository(),
    private readonly xService = new XService()
  ) {}

  async getSettings(userId: string) {
    const settings = await this.autoPromoterRepository.getSettings(userId);

    return (
      settings ?? {
        id: null,
        userId,
        enabled: false,
        collectionId: null,
        keywords: [] as string[],
        intervalMinutes: 60,
        lastRunAt: null
      }
    );
  }

  async updateSettings(
    userId: string,
    input: { enabled: boolean; collectionId?: string; keywords: string[]; intervalMinutes: number }
  ) {
    const existing = await this.autoPromoterRepository.getSettings(userId);
    const settings = await this.autoPromoterRepository.upsertSettings(userId, input);

    if (input.enabled && !existing?.enabled) {
      await this.autoPromoterRepository.createLog(userId, {
        type: AutoPromoterLogType.INFO,
        status: AutoPromoterLogStatus.SENT,
        message: "Auto-promoter enabled."
      });
    }

    if (!input.enabled && existing?.enabled) {
      await this.autoPromoterRepository.createLog(userId, {
        type: AutoPromoterLogType.INFO,
        status: AutoPromoterLogStatus.SENT,
        message: "Auto-promoter disabled."
      });
    }

    return settings;
  }

  listLogs(userId: string) {
    return this.autoPromoterRepository.listLogs(userId);
  }

  private async buildSearchQuery(settings: { collectionId?: string | null; keywords: string[] }) {
    if (settings.keywords.length > 0) {
      return settings.keywords.join(" OR ");
    }

    if (settings.collectionId) {
      const collection = await prisma.collection.findUnique({ where: { id: settings.collectionId } });
      const subject = collection?.theme || collection?.name;

      if (subject) {
        return `${subject} (collector OR buyer OR NFT)`;
      }
    }

    return "NFT collector OR NFT buyer";
  }

  async runForUser(userId: string) {
    const settings = await this.autoPromoterRepository.getSettings(userId);

    if (!settings?.enabled) {
      return;
    }

    const query = await this.buildSearchQuery(settings);

    try {
      const tweets = await this.xService.searchRecent(userId, query, 10);

      for (const tweet of tweets) {
        const existing = await this.autoPromoterRepository.findExistingSuggestion(userId, tweet.id);

        if (existing) {
          continue;
        }

        const suggestedAction: SuggestedAction = { type: "retweet", tweetId: tweet.id };

        await this.autoPromoterRepository.createLog(userId, {
          type: AutoPromoterLogType.SUGGESTION,
          status: AutoPromoterLogStatus.PENDING,
          message: `Found a relevant post: "${tweet.text.slice(0, 120)}"`,
          targetTweetId: tweet.id,
          targetUrl: `https://x.com/i/web/status/${tweet.id}`,
          suggestedAction
        });
      }
    } catch (caughtError) {
      const message = caughtError instanceof AppError ? caughtError.message : "Auto-promoter discovery run failed.";
      const lastLog = await this.autoPromoterRepository.findLatestLogByMessage(userId, message);

      if (!lastLog) {
        await this.autoPromoterRepository.createLog(userId, {
          type: AutoPromoterLogType.ERROR,
          status: AutoPromoterLogStatus.SENT,
          message
        });
      }
    }

    await this.autoPromoterRepository.touchLastRun(userId);
  }

  async actOnLog(userId: string, logId: string, action: "approve" | "dismiss") {
    const log = await this.autoPromoterRepository.findLog(userId, logId);

    if (!log) {
      throw new AppError("Activity log entry not found", 404);
    }

    if (log.status !== AutoPromoterLogStatus.PENDING) {
      throw new AppError("This suggestion has already been handled.", 400);
    }

    if (action === "dismiss") {
      return this.autoPromoterRepository.updateLogStatus(logId, AutoPromoterLogStatus.DISMISSED);
    }

    const suggestedAction = log.suggestedAction as SuggestedAction | null;

    if (!suggestedAction?.type) {
      throw new AppError("This suggestion has no action to perform.", 400);
    }

    try {
      if (suggestedAction.type === "retweet") {
        await this.xService.retweet(userId, suggestedAction.tweetId);
      }

      await this.autoPromoterRepository.createLog(userId, {
        type: AutoPromoterLogType.ACTION,
        status: AutoPromoterLogStatus.SENT,
        message: `Retweeted ${log.targetUrl ?? suggestedAction.tweetId}.`,
        targetTweetId: log.targetTweetId,
        targetUrl: log.targetUrl
      });

      return this.autoPromoterRepository.updateLogStatus(logId, AutoPromoterLogStatus.SENT);
    } catch (caughtError) {
      await this.autoPromoterRepository.createLog(userId, {
        type: AutoPromoterLogType.ERROR,
        status: AutoPromoterLogStatus.SENT,
        message: caughtError instanceof AppError ? caughtError.message : "Failed to perform the approved action."
      });

      return this.autoPromoterRepository.updateLogStatus(logId, AutoPromoterLogStatus.FAILED);
    }
  }
}
