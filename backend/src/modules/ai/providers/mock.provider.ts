import { buildPlaceholderImage } from "../../../common/utils/image-placeholder.js";

import type {
  ImageGenerationInput,
  ImageGenerationResult,
  ImageGenerationProvider,
  PromotionGenerationContext,
  PromptGenerationContext,
  TextGenerationProvider
} from "../ai.types.js";

export class MockAiProvider implements TextGenerationProvider, ImageGenerationProvider {
  readonly name = "mock";

  async generatePrompt(context: PromptGenerationContext) {
    return [
      `Create an NFT artwork for "${context.collectionName ?? "Untitled Collection"}".`,
      context.collectionTheme ? `Theme: ${context.collectionTheme}.` : null,
      context.collectionStory ? `Narrative: ${context.collectionStory}.` : null,
      context.targetLanguage
        ? `Translate all guidance and produce the final prompt in ${context.targetLanguage}.`
        : null,
      context.customIdea ? `Custom idea: ${context.customIdea}.` : null,
      context.referenceUrls?.length ? `Reference urls: ${context.referenceUrls.join(", ")}.` : null,
      context.referenceImageUrl ? `Reference image: ${context.referenceImageUrl}.` : null,
      context.style ? `Visual style: ${context.style}.` : null,
      context.model ? `Preferred model: ${context.model}.` : null,
      context.outputWidth && context.outputHeight
        ? `Target resolution: ${context.outputWidth}x${context.outputHeight}.`
        : null,
      context.artStyle ? `Artist style guidance: ${context.artStyle}.` : null,
      context.personalityNotes ? `Brand personality: ${context.personalityNotes}.` : null,
      context.targetAudience ? `Audience: ${context.targetAudience}.` : null,
      context.artworkStyle ? `Personal artwork style: ${context.artworkStyle}.` : null,
      context.artVision ? `Art vision: ${context.artVision}.` : null,
      context.nftVision ? `NFT vision: ${context.nftVision}.` : null,
      context.inspirationSources ? `Inspiration: ${context.inspirationSources}.` : null,
      context.signatureMotifs ? `Signature motifs: ${context.signatureMotifs}.` : null,
      context.colorDirection ? `Color direction: ${context.colorDirection}.` : null,
      context.promptBase ? `Base prompt DNA: ${context.promptBase}.` : null,
      context.negativePromptBase ? `Avoid: ${context.negativePromptBase}.` : null,
      context.creativeRules ? `Creative rules: ${context.creativeRules}.` : null,
      context.preferredAspectRatio ? `Preferred aspect ratio: ${context.preferredAspectRatio}.` : null,
      context.preferredResolution ? `Preferred resolution preset: ${context.preferredResolution}.` : null,
      context.templatePrompt ? `Template base: ${context.templatePrompt}.` : null,
      "High detail, collectible composition, clean lighting, marketplace-ready presentation."
    ]
      .filter(Boolean)
      .join(" ");
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    return {
      model: input.model ?? null,
      imageUrl: buildPlaceholderImage(
        `${input.model ?? "AI"} NFT Preview`,
        `${input.outputWidth ?? 1024}x${input.outputHeight ?? 1024} ${input.style ?? input.prompt.slice(0, 24)}`
      )
    };
  }

  async generatePromotion(context: PromotionGenerationContext) {
    const link = context.assetUrl ? `\n\n${context.assetUrl}` : "";

    return Object.fromEntries(
      context.platforms.map((platform) => [
        platform,
        {
          content: `Discover ${context.assetName}. ${context.assetDescription ?? ""} Crafted for collectors who value ${context.toneOfVoice ?? "distinctive digital art"}.${link}`,
          hashtags: [...(context.defaultHashtags ?? []), "#NFT", "#DigitalArt", `#${platform}`]
        }
      ])
    );
  }
}
