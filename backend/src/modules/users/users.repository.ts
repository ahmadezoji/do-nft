import { prisma } from "../../database/prisma.js";

const asOptionalString = (value: string | number | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

const asNullableString = (value: string | number | string[] | undefined) =>
  typeof value === "string" ? value : null;

export class UsersRepository {
  getCurrentUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: true,
        settings: true,
        promptProfile: true
      }
    });
  }

  async updateSettings(userId: string, input: Record<string, string | number | string[] | undefined>) {
    const {
      fullName,
      artistName,
      avatarUrl,
      bio,
      websiteUrl,
      preferredAi,
      defaultChain,
      timezone,
      defaultImageWidth,
      defaultImageHeight,
      artworkStyle,
      artVision,
      nftVision,
      inspirationSources,
      signatureMotifs,
      colorDirection,
      promptBase,
      negativePromptBase,
      creativeRules,
      sampleReferenceUrls,
      preferredAspectRatio,
      preferredResolution,
      preferredOpenAiModel,
      preferredGeminiModel
    } = input;

    return prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: {
              fullName: asOptionalString(fullName),
              artistName: asOptionalString(artistName),
              avatarUrl: asOptionalString(avatarUrl) || undefined,
              bio: asOptionalString(bio),
              websiteUrl: asOptionalString(websiteUrl) || undefined
            },
            update: {
              fullName: asNullableString(fullName),
              artistName: asNullableString(artistName),
              avatarUrl: asOptionalString(avatarUrl) || null,
              bio: asNullableString(bio),
              websiteUrl: asOptionalString(websiteUrl) || null
            }
          }
        },
        settings: {
          upsert: {
            create: {
              preferredAi: asOptionalString(preferredAi),
              defaultChain: asOptionalString(defaultChain),
              timezone: asOptionalString(timezone),
              defaultImageWidth: typeof defaultImageWidth === "number" ? defaultImageWidth : undefined,
              defaultImageHeight: typeof defaultImageHeight === "number" ? defaultImageHeight : undefined
            },
            update: {
              preferredAi: asNullableString(preferredAi),
              defaultChain: asNullableString(defaultChain),
              timezone: asNullableString(timezone),
              defaultImageWidth: typeof defaultImageWidth === "number" ? defaultImageWidth : null,
              defaultImageHeight: typeof defaultImageHeight === "number" ? defaultImageHeight : null
            }
          }
        },
        promptProfile: {
          upsert: {
            create: {
              artworkStyle: typeof artworkStyle === "string" ? artworkStyle : undefined,
              artVision: typeof artVision === "string" ? artVision : undefined,
              nftVision: typeof nftVision === "string" ? nftVision : undefined,
              inspirationSources: typeof inspirationSources === "string" ? inspirationSources : undefined,
              signatureMotifs: typeof signatureMotifs === "string" ? signatureMotifs : undefined,
              colorDirection: typeof colorDirection === "string" ? colorDirection : undefined,
              promptBase: typeof promptBase === "string" ? promptBase : undefined,
              negativePromptBase: typeof negativePromptBase === "string" ? negativePromptBase : undefined,
              creativeRules: typeof creativeRules === "string" ? creativeRules : undefined,
              sampleReferenceUrls: Array.isArray(sampleReferenceUrls) ? sampleReferenceUrls : [],
              preferredAspectRatio:
                typeof preferredAspectRatio === "string" ? preferredAspectRatio : undefined,
              preferredResolution:
                typeof preferredResolution === "string" ? preferredResolution : undefined,
              preferredOpenAiModel:
                typeof preferredOpenAiModel === "string" ? preferredOpenAiModel : undefined,
              preferredGeminiModel:
                typeof preferredGeminiModel === "string" ? preferredGeminiModel : undefined
            },
            update: {
              artworkStyle: typeof artworkStyle === "string" ? artworkStyle : null,
              artVision: typeof artVision === "string" ? artVision : null,
              nftVision: typeof nftVision === "string" ? nftVision : null,
              inspirationSources: typeof inspirationSources === "string" ? inspirationSources : null,
              signatureMotifs: typeof signatureMotifs === "string" ? signatureMotifs : null,
              colorDirection: typeof colorDirection === "string" ? colorDirection : null,
              promptBase: typeof promptBase === "string" ? promptBase : null,
              negativePromptBase: typeof negativePromptBase === "string" ? negativePromptBase : null,
              creativeRules: typeof creativeRules === "string" ? creativeRules : null,
              sampleReferenceUrls: Array.isArray(sampleReferenceUrls) ? sampleReferenceUrls : [],
              preferredAspectRatio:
                typeof preferredAspectRatio === "string" ? preferredAspectRatio : null,
              preferredResolution: typeof preferredResolution === "string" ? preferredResolution : null,
              preferredOpenAiModel:
                typeof preferredOpenAiModel === "string" ? preferredOpenAiModel : null,
              preferredGeminiModel:
                typeof preferredGeminiModel === "string" ? preferredGeminiModel : null
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        profile: true,
        settings: true,
        promptProfile: true
      }
    });
  }
}
