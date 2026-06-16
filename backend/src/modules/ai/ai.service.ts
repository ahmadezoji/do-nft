import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";
import { prisma } from "../../database/prisma.js";
import { CredentialsService } from "../credentials/credentials.service.js";

import type { CollectorSuggestionsContext, ImageGenerationInput, ImageGenerationProvider, TextGenerationProvider } from "./ai.types.js";
import { MockAiProvider } from "./providers/mock.provider.js";
import { OpenAiImageProvider } from "./providers/openai-image.provider.js";

export class AiService {
  private readonly textProvider: TextGenerationProvider & ImageGenerationProvider;

  constructor(
    private readonly credentialsService = new CredentialsService(),
    textProvider: TextGenerationProvider & ImageGenerationProvider = new MockAiProvider()
  ) {
    this.textProvider = textProvider;
  }

  async generatePrompt(
    userId: string,
    input: {
      collectionId?: string;
      customIdea?: string;
      targetLanguage?: string;
      style?: string;
      templateId?: string;
      model?: string;
      outputWidth?: number;
      outputHeight?: number;
      referenceUrls?: string[];
      referenceImageUrl?: string;
    }
  ) {
    const [branding, promptProfile, collection, template] = await Promise.all([
      prisma.personalBranding.findUnique({ where: { userId } }),
      prisma.userPromptProfile.findUnique({ where: { userId } }),
      input.collectionId
        ? prisma.collection.findFirst({ where: { id: input.collectionId, userId } })
        : Promise.resolve(null),
      input.templateId ? prisma.promptTemplate.findUnique({ where: { id: input.templateId } }) : Promise.resolve(null)
    ]);

    return this.textProvider.generatePrompt({
      collectionName: collection?.name,
      collectionTheme: collection?.theme,
      collectionStory: collection?.story,
      customIdea: input.customIdea,
      targetLanguage: input.targetLanguage,
      referenceUrls: input.referenceUrls,
      referenceImageUrl: input.referenceImageUrl,
      style: input.style,
      model: input.model,
      outputWidth: input.outputWidth,
      outputHeight: input.outputHeight,
      templateTitle: template?.title,
      templatePrompt: template?.promptText,
      artistName: branding?.artistName,
      brandName: branding?.brandName,
      artStyle: branding?.artStyle,
      personalityNotes: branding?.personalityNotes,
      targetAudience: branding?.targetAudience,
      artworkStyle: promptProfile?.artworkStyle,
      artVision: promptProfile?.artVision,
      nftVision: promptProfile?.nftVision,
      inspirationSources: promptProfile?.inspirationSources,
      signatureMotifs: promptProfile?.signatureMotifs,
      colorDirection: promptProfile?.colorDirection,
      promptBase: promptProfile?.promptBase,
      negativePromptBase: promptProfile?.negativePromptBase,
      creativeRules: promptProfile?.creativeRules,
      preferredAspectRatio: promptProfile?.preferredAspectRatio,
      preferredResolution: promptProfile?.preferredResolution
    });
  }

  async generateImage(
    userId: string,
    input: ImageGenerationInput & {
      provider?: string;
    }
  ) {
    const provider = input.provider?.toLowerCase() ?? "openai";

    if (provider !== "openai") {
      return this.textProvider.generateImage(input);
    }

    const configuredCredentials = await this.credentialsService.getProviderValues(userId, CredentialProvider.OPENAI);
    const apiKey = configuredCredentials?.apiKey ?? env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new AppError("OpenAI is not configured. Add your API key in Settings before generating images.", 400);
    }

    return new OpenAiImageProvider(apiKey).generateImage(input);
  }

  async generatePromotion(
    userId: string,
    input: { assetName: string; assetDescription?: string; assetUrl?: string; platforms: string[] }
  ) {
    const branding = await prisma.personalBranding.findUnique({ where: { userId } });

    return this.textProvider.generatePromotion({
      assetName: input.assetName,
      assetDescription: input.assetDescription,
      assetUrl: input.assetUrl,
      platforms: input.platforms,
      toneOfVoice: branding?.toneOfVoice,
      socialMediaStyle: branding?.socialMediaStyle,
      defaultHashtags: branding?.defaultHashtags
    });
  }

  async generateCollectorSuggestions(userId: string, context: CollectorSuggestionsContext) {
    return this.textProvider.generateCollectorSuggestions(context);
  }
}
