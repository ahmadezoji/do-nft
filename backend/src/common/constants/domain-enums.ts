export const CredentialProvider = {
  OPENAI: "OPENAI",
  GEMINI: "GEMINI",
  OPENSEA: "OPENSEA",
  IPFS: "IPFS",
  TWITTER: "TWITTER",
  DISCORD: "DISCORD"
} as const;

export const CollectionStatus = {
  DRAFT: "DRAFT",
  GENERATED: "GENERATED",
  PUBLISHED: "PUBLISHED"
} as const;

export const NftStatus = {
  DRAFT: "DRAFT",
  PROMPT_GENERATED: "PROMPT_GENERATED",
  IMAGE_GENERATED: "IMAGE_GENERATED",
  METADATA_READY: "METADATA_READY",
  UPLOADED_TO_IPFS: "UPLOADED_TO_IPFS",
  MINTED: "MINTED",
  LISTED: "LISTED",
  PROMOTED: "PROMOTED"
} as const;

export const PromotionCampaignStatus = {
  DRAFT: "DRAFT",
  GENERATED: "GENERATED",
  APPROVED: "APPROVED",
  POSTED: "POSTED",
  FAILED: "FAILED"
} as const;

export const Platform = {
  TWITTER: "TWITTER",
  DISCORD: "DISCORD",
  TELEGRAM: "TELEGRAM",
  FARCASTER: "FARCASTER"
} as const;
