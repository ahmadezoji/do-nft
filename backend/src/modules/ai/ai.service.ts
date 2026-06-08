import { prisma } from "../../database/prisma.js";

import type { ImageGenerationProvider, TextGenerationProvider } from "./ai.types.js";
import { MockAiProvider } from "./providers/mock.provider.js";

export class AiService {
  private readonly provider: TextGenerationProvider & ImageGenerationProvider;

  constructor() {
    this.provider = new MockAiProvider();
  }

  async generatePrompt(
    userId: string,
    input: {
      collectionId?: string;
      customIdea?: string;
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

    return this.provider.generatePrompt({
      collectionName: collection?.name,
      collectionTheme: collection?.theme,
      collectionStory: collection?.story,
      customIdea: input.customIdea,
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

  async generateImage(input: {
    prompt: string;
    style?: string;
    model?: string;
    outputWidth?: number;
    outputHeight?: number;
    referenceImageUrl?: string;
  }) {
    return this.provider.generateImage(input);
  }

  async generatePromotion(
    userId: string,
    input: { assetName: string; assetDescription?: string; platforms: string[] }
  ) {
    const branding = await prisma.personalBranding.findUnique({ where: { userId } });

    return this.provider.generatePromotion({
      assetName: input.assetName,
      assetDescription: input.assetDescription,
      platforms: input.platforms,
      toneOfVoice: branding?.toneOfVoice,
      socialMediaStyle: branding?.socialMediaStyle,
      defaultHashtags: branding?.defaultHashtags
    });
  }
}
