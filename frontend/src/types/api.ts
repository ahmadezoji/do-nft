export type AuthUser = {
  id: string;
  email: string;
  profile?: {
    fullName?: string | null;
    artistName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    websiteUrl?: string | null;
  } | null;
  settings?: {
    preferredAi?: string | null;
    preferredLanguage?: "en" | "fa" | null;
    defaultChain?: string | null;
    timezone?: string | null;
    defaultImageWidth?: number | null;
    defaultImageHeight?: number | null;
  } | null;
  promptProfile?: {
    artworkStyle?: string | null;
    artVision?: string | null;
    nftVision?: string | null;
    inspirationSources?: string | null;
    signatureMotifs?: string | null;
    colorDirection?: string | null;
    promptBase?: string | null;
    negativePromptBase?: string | null;
    creativeRules?: string | null;
    sampleReferenceUrls?: string[];
    preferredAspectRatio?: string | null;
    preferredResolution?: string | null;
    preferredOpenAiModel?: string | null;
    preferredGeminiModel?: string | null;
  } | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type CredentialStatus = {
  provider: string;
  configured: boolean;
  label: string | null;
  updatedAt: string | null;
  configuredFields: string[];
};

export type BrandingProfile = {
  brandName?: string;
  artistName?: string;
  artStyle?: string;
  personalityNotes?: string;
  targetAudience?: string;
  nftThemePreferences?: string;
  toneOfVoice?: string;
  socialMediaStyle?: string;
  defaultHashtags: string[];
};

export type Collection = {
  id: string;
  name: string;
  contractSymbol?: string | null;
  contractAddress?: string | null;
  deployTxHash?: string | null;
  description: string;
  theme?: string | null;
  story?: string | null;
  blockchain?: string | null;
  marketplaceTarget?: string | null;
  coverImageUrl?: string | null;
  status: string;
  nfts?: Nft[];
  deployedAt?: string | null;
  updatedAt: string;
};

export type CollectionPublishResult = {
  collection: Collection;
  publishedNfts: Nft[];
};

export type PromptTemplate = {
  id: string;
  title: string;
  category: string;
  style: string;
  promptText: string;
  aspectRatio?: string | null;
};

export type Nft = {
  id: string;
  collectionId?: string | null;
  name: string;
  description?: string | null;
  customIdea?: string | null;
  prompt?: string | null;
  imageUrl?: string | null;
  rarityNotes?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  aiProvider?: string | null;
  aiModel?: string | null;
  imageStyle?: string | null;
  referenceUrls?: string[];
  referenceImageUrl?: string | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
  chain?: string | null;
  contractAddress?: string | null;
  tokenId?: string | null;
  listingPriceEth?: string | null;
  listingOrderHash?: string | null;
  listingUrl?: string | null;
  metadataUri?: string | null;
  collection?: Collection | null;
  template?: PromptTemplate | null;
  ipfsImageCid?: string | null;
  ipfsMetadataCid?: string | null;
  mintTxHash?: string | null;
  updatedAt: string;
};

export type NftListingResult = {
  nft: Nft;
  listing: {
    listingUrl: string;
    status: string;
    orderHash?: string | null;
  };
};

export type PromotionPost = {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  status: string;
};

export type PromotionCampaign = {
  id: string;
  name: string;
  status: string;
  platforms: string[];
  nft?: Nft | null;
  posts: PromotionPost[];
  updatedAt: string;
};

export type DashboardSummary = {
  totals: {
    collections: number;
    nfts: number;
    draftNfts: number;
    listedNfts: number;
    campaigns: number;
  };
  recentImages: Nft[];
  integrations: Array<{
    provider: string;
    updatedAt: string;
  }>;
};

export type TrendingCollection = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  openseaUrl: string;
  floorPriceEth?: number | null;
  sevenDayVolumeEth?: number | null;
};

export type TrendingCollectionsResult = {
  items: TrendingCollection[];
  error?: string;
};
