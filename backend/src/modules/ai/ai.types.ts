export type PromptGenerationContext = {
  collectionName?: string | null;
  collectionTheme?: string | null;
  collectionStory?: string | null;
  customIdea?: string | null;
  targetLanguage?: string | null;
  referenceUrls?: string[];
  referenceImageUrl?: string | null;
  style?: string | null;
  model?: string | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
  templateTitle?: string | null;
  templatePrompt?: string | null;
  artistName?: string | null;
  brandName?: string | null;
  artStyle?: string | null;
  personalityNotes?: string | null;
  targetAudience?: string | null;
  artworkStyle?: string | null;
  artVision?: string | null;
  nftVision?: string | null;
  inspirationSources?: string | null;
  signatureMotifs?: string | null;
  colorDirection?: string | null;
  promptBase?: string | null;
  negativePromptBase?: string | null;
  creativeRules?: string | null;
  preferredAspectRatio?: string | null;
  preferredResolution?: string | null;
};

export type PromotionGenerationContext = {
  assetName: string;
  assetDescription?: string | null;
  platforms: string[];
  toneOfVoice?: string | null;
  socialMediaStyle?: string | null;
  defaultHashtags?: string[];
};

export type ImageGenerationInput = {
  prompt: string;
  style?: string | null;
  model?: string | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
  referenceImageUrl?: string | null;
};

export type ImageGenerationResult = {
  imageUrl: string;
  model?: string | null;
};

export interface TextGenerationProvider {
  readonly name: string;
  generatePrompt(context: PromptGenerationContext): Promise<string>;
  generatePromotion(context: PromotionGenerationContext): Promise<Record<string, { content: string; hashtags: string[] }>>;
}

export interface ImageGenerationProvider {
  readonly name: string;
  generateImage(input: ImageGenerationInput): Promise<ImageGenerationResult>;
}
