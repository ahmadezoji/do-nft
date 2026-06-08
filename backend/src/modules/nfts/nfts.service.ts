import { Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { NftStatus } from "../../common/constants/domain-enums.js";
import { AiService } from "../ai/ai.service.js";
import { IpfsService } from "../ipfs/ipfs.service.js";
import { MarketplaceService } from "../marketplace/marketplace.service.js";

import { defaultTemplates } from "./default-templates.js";
import { NftsRepository } from "./nfts.repository.js";

export class NftsService {
  constructor(
    private readonly nftsRepository = new NftsRepository(),
    private readonly aiService = new AiService(),
    private readonly ipfsService = new IpfsService(),
    private readonly marketplaceService = new MarketplaceService()
  ) {}

  list(userId: string) {
    return this.nftsRepository.list(userId);
  }

  async getById(userId: string, nftId: string) {
    const nft = await this.nftsRepository.findById(userId, nftId);

    if (!nft) {
      throw new AppError("NFT not found", 404);
    }

    return nft;
  }

  create(userId: string, input: Omit<Prisma.NftUncheckedCreateInput, "userId">) {
    return this.nftsRepository.create(userId, input);
  }

  async update(userId: string, nftId: string, input: Prisma.NftUncheckedUpdateInput) {
    const nft = await this.nftsRepository.update(userId, nftId, input);

    if (!nft) {
      throw new AppError("NFT not found", 404);
    }

    return nft;
  }

  async getTemplates() {
    const templates = await this.nftsRepository.getTemplates();

    if (templates.length > 0) {
      return templates;
    }

    return this.nftsRepository.createTemplates(defaultTemplates);
  }

  async generatePrompt(
    userId: string,
    input: {
      collectionId?: string;
      customIdea?: string;
      provider?: string;
      style?: string;
      templateId?: string;
      model?: string;
      outputWidth?: number;
      outputHeight?: number;
      referenceUrls?: string[];
      referenceImageUrl?: string;
    }
  ) {
    const prompt = await this.aiService.generatePrompt(userId, input);

    return {
      provider: input.provider ?? "openai",
      model: input.model ?? null,
      prompt,
      status: NftStatus.PROMPT_GENERATED
    };
  }

  async generateImage(input: {
    prompt: string;
    provider?: string;
    style?: string;
    model?: string;
    outputWidth?: number;
    outputHeight?: number;
    referenceImageUrl?: string;
  }) {
    const image = await this.aiService.generateImage(input);

    return {
      ...image,
      provider: input.provider ?? "openai",
      model: input.model ?? null,
      status: NftStatus.IMAGE_GENERATED
    };
  }

  async uploadToIpfs(userId: string, nftId: string) {
    const nft = await this.getById(userId, nftId);

    if (!nft.imageUrl) {
      throw new AppError("NFT image is required before IPFS upload", 400);
    }

    const image = await this.ipfsService.uploadImage(nft.imageUrl);
    const metadata = await this.ipfsService.uploadMetadata({
      name: nft.name,
      description: nft.description,
      image: image.gatewayUrl,
      attributes: nft.metadata
    });

    return this.nftsRepository.update(userId, nftId, {
      ipfsImageCid: image.cid,
      ipfsMetadataCid: metadata.cid,
      status: NftStatus.UPLOADED_TO_IPFS
    });
  }

  async listOnMarketplace(userId: string, nftId: string) {
    const nft = await this.getById(userId, nftId);
    const listing = await this.marketplaceService.listNft({
      name: nft.name,
      metadataCid: nft.ipfsMetadataCid
    });

    return {
      nft: await this.nftsRepository.update(userId, nftId, {
        status: NftStatus.LISTED,
        listedAt: new Date()
      }),
      listing
    };
  }
}
