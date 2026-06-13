import { Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { NftStatus } from "../../common/constants/domain-enums.js";
import { AiService } from "../ai/ai.service.js";
import { BlockchainService } from "../blockchain/blockchain.service.js";
import { IpfsService } from "../ipfs/ipfs.service.js";

import { defaultTemplates } from "./default-templates.js";
import { NftsRepository } from "./nfts.repository.js";

const sanitizeStorageName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "nft-asset";

type MintableNft = {
  metadataUri?: string | null;
  mintTxHash?: string | null;
  tokenId?: string | null;
  listingUrl?: string | null;
  collection?: {
    contractAddress?: string | null;
  } | null;
};

export class NftsService {
  constructor(
    private readonly nftsRepository = new NftsRepository(),
    private readonly aiService = new AiService(),
    private readonly ipfsService = new IpfsService(),
    private readonly blockchainService = new BlockchainService()
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

  async generateImage(userId: string, input: {
    prompt: string;
    provider?: string;
    style?: string;
    model?: string;
    outputWidth?: number;
    outputHeight?: number;
    referenceImageUrl?: string;
  }) {
    const image = await this.aiService.generateImage(userId, input);
    const isIpfsConfigured = await this.ipfsService.isConfigured(userId);
    const storedImage = isIpfsConfigured
      ? await this.ipfsService.uploadImage(
          userId,
          image.imageUrl,
          `${sanitizeStorageName(`${input.model ?? input.provider ?? "ai"}-${Date.now()}`)}.png`
        )
      : null;

    return {
      ...image,
      imageUrl: storedImage?.gatewayUrl ?? image.imageUrl,
      ipfsImageCid: storedImage?.cid ?? null,
      storedOnIpfs: Boolean(storedImage),
      provider: input.provider ?? "openai",
      model: image.model ?? input.model ?? null,
      status: NftStatus.IMAGE_GENERATED
    };
  }

  async uploadToIpfs(userId: string, nftId: string) {
    const nft = await this.getById(userId, nftId);

    if (!nft.imageUrl) {
      throw new AppError("NFT image is required before IPFS upload", 400);
    }

    const image = nft.ipfsImageCid
      ? {
          cid: nft.ipfsImageCid,
          gatewayUrl: nft.imageUrl
        }
      : await this.ipfsService.uploadImage(userId, nft.imageUrl, `${sanitizeStorageName(nft.name)}.png`);
    const metadata = await this.ipfsService.uploadMetadata(
      userId,
      {
        name: nft.name,
        description: nft.description,
        image: this.blockchainService.buildMetadataUri(image.cid),
        attributes:
          nft.metadata && typeof nft.metadata === "object" && !Array.isArray(nft.metadata)
            ? Array.isArray((nft.metadata as Record<string, unknown>).attributes)
              ? (nft.metadata as Record<string, unknown>).attributes
              : Array.isArray((nft.metadata as Record<string, unknown>).traits)
                ? (nft.metadata as Record<string, unknown>).traits
                : []
            : []
      },
      `${sanitizeStorageName(nft.name)}-metadata.json`
    );

    const updatedNft = await this.nftsRepository.update(userId, nftId, {
      ipfsImageCid: image.cid,
      imageUrl: image.gatewayUrl,
      ipfsMetadataCid: metadata.cid,
      metadataUri: this.blockchainService.buildMetadataUri(metadata.cid),
      status: NftStatus.UPLOADED_TO_IPFS
    } as Prisma.NftUncheckedUpdateInput);

    if (!updatedNft) {
      throw new AppError("NFT not found", 404);
    }

    return updatedNft;
  }

  async listOnMarketplace(userId: string, nftId: string) {
    const nft = (await this.getById(userId, nftId)) as MintableNft & {
      collectionId?: string | null;
      status: string;
      id: string;
      tokenId?: string | null;
      listingUrl?: string | null;
      name: string;
      ipfsMetadataCid?: string | null;
    };

    if ((nft.status === NftStatus.MINTED || nft.status === NftStatus.LISTED) && nft.tokenId && nft.listingUrl) {
      return {
        nft,
        listing: {
          listingUrl: nft.listingUrl,
          status: "minted",
          orderHash: nft.mintTxHash ?? null
        }
      };
    }

    if (!nft.collectionId) {
      throw new AppError("NFT must belong to a collection before it can be published on-chain.", 400);
    }

    if (!nft.collection?.contractAddress) {
      throw new AppError("Deploy the collection contract before minting NFTs.", 400);
    }

    let currentNft = nft;

    if (!currentNft.ipfsMetadataCid || !currentNft.metadataUri) {
      currentNft = (await this.uploadToIpfs(userId, nftId)) as typeof currentNft;
    }

    if (!currentNft.metadataUri) {
      throw new AppError("NFT metadata URI is missing after IPFS upload.", 500);
    }

    const contractAddress = currentNft.collection?.contractAddress;

    if (!contractAddress) {
      throw new AppError("Collection contract address is missing.", 400);
    }

    const mintResult = await this.blockchainService.mintNft({
      contractAddress,
      metadataUri: currentNft.metadataUri
    });

    const updatedNft = await this.nftsRepository.update(userId, nftId, {
      status: NftStatus.MINTED,
      chain: "polygon",
      contractAddress,
      tokenId: mintResult.tokenId,
      mintTxHash: mintResult.txHash,
      listingUrl: mintResult.openseaUrl,
      mintedAt: new Date()
    } as Prisma.NftUncheckedUpdateInput);

    if (!updatedNft) {
      throw new AppError("NFT not found", 404);
    }

    return {
      nft: updatedNft,
      listing: {
        listingUrl: mintResult.openseaUrl,
        status: "minted",
        orderHash: mintResult.txHash
      }
    };
  }
}
