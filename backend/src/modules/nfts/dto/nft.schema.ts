import { z } from "zod";

import { NftStatus } from "../../../common/constants/domain-enums.js";

export const generatePromptSchema = z.object({
  collectionId: z.string().optional(),
  customIdea: z.string().max(1000).optional(),
  targetLanguage: z.enum(["en", "fa"]).optional(),
  provider: z.enum(["openai", "gemini"]).default("openai"),
  model: z.string().max(120).optional(),
  style: z.string().max(240).optional(),
  templateId: z.string().optional(),
  referenceUrls: z.array(z.string().url()).optional(),
  referenceImageUrl: z.string().url().optional(),
  outputWidth: z.coerce.number().int().min(256).max(4096).optional(),
  outputHeight: z.coerce.number().int().min(256).max(4096).optional()
});

export const generateImageSchema = z.object({
  prompt: z.string().min(10),
  provider: z.enum(["openai", "gemini"]).default("openai"),
  model: z.string().max(120).optional(),
  style: z.string().max(240).optional(),
  referenceImageUrl: z.string().url().optional(),
  outputWidth: z.coerce.number().int().min(256).max(4096).optional(),
  outputHeight: z.coerce.number().int().min(256).max(4096).optional()
});

export const uploadImageSchema = z.object({
  imageDataUrl: z.string().regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "imageDataUrl must be a base64 image data URL"),
  fileName: z.string().max(160).optional()
});

export const createNftSchema = z.object({
  collectionId: z.string().optional(),
  templateId: z.string().optional(),
  name: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  customIdea: z.string().max(1000).optional(),
  prompt: z.string().max(4000).optional(),
  imageUrl: z.string().optional(),
  rarityNotes: z.string().max(500).optional(),
  metadata: z.record(z.any()).optional(),
  aiProvider: z.string().max(80).optional(),
  aiModel: z.string().max(120).optional(),
  imageStyle: z.string().max(240).optional(),
  referenceUrls: z.array(z.string().url()).optional(),
  referenceImageUrl: z.string().url().optional(),
  outputWidth: z.coerce.number().int().min(256).max(4096).optional(),
  outputHeight: z.coerce.number().int().min(256).max(4096).optional(),
  chain: z.string().max(40).optional(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  tokenId: z.string().max(120).optional(),
  listingPriceEth: z.string().max(40).optional(),
  listingUrl: z.string().url().optional(),
  metadataUri: z.string().max(300).optional(),
  ipfsImageCid: z.string().max(160).optional(),
  ipfsMetadataCid: z.string().max(160).optional(),
  mintTxHash: z.string().max(160).optional(),
  status: z.nativeEnum(NftStatus).optional()
});

export const updateNftSchema = createNftSchema.partial();

export const listOnMarketplaceSchema = z.object({
  priceEth: z.string().regex(/^\d*\.?\d+$/, "priceEth must be a positive decimal string")
});
