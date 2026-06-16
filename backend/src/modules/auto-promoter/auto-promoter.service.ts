import { AppError } from "../../common/errors/app-error.js";
import { AutoPromoterLogStatus, AutoPromoterLogType, NftStatus } from "../../common/constants/domain-enums.js";
import { prisma } from "../../database/prisma.js";
import { AiService } from "../ai/ai.service.js";
import { XService } from "../x/x.service.js";

import { AutoPromoterRepository } from "./auto-promoter.repository.js";

type SuggestedAction = { type: "retweet"; tweetId: string };

export class AutoPromoterService {
  constructor(
    private readonly autoPromoterRepository = new AutoPromoterRepository(),
    private readonly xService = new XService(),
    private readonly aiService = new AiService()
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
        targetHandles: [] as string[],
        intervalMinutes: 720,
        lastRunAt: null
      }
    );
  }

  async updateSettings(
    userId: string,
    input: { enabled: boolean; collectionId?: string; keywords: string[]; targetHandles: string[]; intervalMinutes: number }
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

  async stop(userId: string) {
    const existing = await this.autoPromoterRepository.getSettings(userId);

    const settings = await this.autoPromoterRepository.upsertSettings(userId, {
      enabled: false,
      collectionId: existing?.collectionId ?? undefined,
      keywords: existing?.keywords ?? [],
      targetHandles: existing?.targetHandles ?? [],
      intervalMinutes: existing?.intervalMinutes ?? 720
    });

    await this.autoPromoterRepository.createLog(userId, {
      type: AutoPromoterLogType.INFO,
      status: AutoPromoterLogStatus.SENT,
      message: "Auto-promoter stopped manually."
    });

    return settings;
  }

  async runNow(userId: string) {
    await this.runForUser(userId);
    return this.autoPromoterRepository.listLogs(userId);
  }

  async aiSuggest(userId: string) {
    const nft = await this.findPromoNft(userId);
    const collection = nft
      ? null
      : await prisma.collection.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });

    const suggestions = await this.aiService.generateCollectorSuggestions(userId, {
      nftName: nft?.name ?? collection?.name ?? "NFT",
      nftDescription: nft?.description ?? collection?.story ?? undefined,
      collectionTheme: collection?.theme ?? undefined
    });

    return suggestions;
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

  private async findPromoNft(userId: string) {
    const listed = await prisma.nft.findFirst({
      where: { userId, status: NftStatus.LISTED },
      orderBy: { updatedAt: "desc" }
    });

    if (listed) return listed;

    return prisma.nft.findFirst({
      where: { userId, listingUrl: { not: null } },
      orderBy: { updatedAt: "desc" }
    });
  }

  private buildMentionText(nft: { name: string; description?: string | null; listingUrl?: string | null; imageUrl?: string | null }, handle: string) {
    const link = nft.listingUrl ?? nft.imageUrl ?? "";
    const suffix = `\n\n${link}\n\n#NFTCommunity #DigitalArt #NFTCollector`;
    const maxIntro = 280 - suffix.length;
    const desc = nft.description ? ` — ${nft.description.slice(0, 60)}` : "";
    const intro = `Hey @${handle}! 👋 Check out my NFT "${nft.name}"${desc}`;

    return intro.slice(0, maxIntro) + suffix;
  }

  private async mentionCollectors(userId: string, targetHandles: string[]) {
    if (targetHandles.length === 0) return;

    const nft = await this.findPromoNft(userId);

    if (!nft) {
      await this.autoPromoterRepository.createLog(userId, {
        type: AutoPromoterLogType.INFO,
        status: AutoPromoterLogStatus.SENT,
        message: "No listed NFT found to promote. List an NFT on OpenSea first."
      });
      return;
    }

    for (const handle of targetHandles.slice(0, 5)) {
      try {
        const alreadyMentioned = await this.autoPromoterRepository.findRecentMentionForHandle(userId, handle);

        if (alreadyMentioned) {
          continue;
        }

        const text = this.buildMentionText(nft, handle);
        const tweet = await this.xService.postTweet(userId, text);

        await this.autoPromoterRepository.createLog(userId, {
          type: AutoPromoterLogType.ACTION,
          status: AutoPromoterLogStatus.SENT,
          message: `Mentioned @${handle} with "${nft.name}" promotion.`,
          targetHandle: handle,
          targetUrl: tweet.url
        });
      } catch (caughtError) {
        const message = caughtError instanceof AppError
          ? caughtError.message
          : `Failed to mention @${handle}.`;

        await this.autoPromoterRepository.createLog(userId, {
          type: AutoPromoterLogType.ERROR,
          status: AutoPromoterLogStatus.SENT,
          message,
          targetHandle: handle
        });
      }
    }
  }

  async runForUser(userId: string) {
    const settings = await this.autoPromoterRepository.getSettings(userId);

    if (!settings?.enabled) {
      return;
    }

    await this.mentionCollectors(userId, settings.targetHandles);

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
