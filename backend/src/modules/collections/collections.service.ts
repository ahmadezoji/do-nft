import { Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { CollectionStatus, NftStatus } from "../../common/constants/domain-enums.js";
import { AiService } from "../ai/ai.service.js";
import { NftsService } from "../nfts/nfts.service.js";

import { CollectionsRepository } from "./collections.repository.js";

export class CollectionsService {
  constructor(
    private readonly collectionsRepository = new CollectionsRepository(),
    private readonly aiService = new AiService(),
    private readonly nftsService = new NftsService()
  ) {}

  list(userId: string) {
    return this.collectionsRepository.list(userId);
  }

  async getById(userId: string, collectionId: string) {
    const collection = await this.collectionsRepository.findById(userId, collectionId);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    return collection;
  }

  create(userId: string, input: Omit<Prisma.CollectionUncheckedCreateInput, "userId">) {
    return this.collectionsRepository.create(userId, input);
  }

  async update(
    userId: string,
    collectionId: string,
    input: Prisma.CollectionUncheckedUpdateInput
  ) {
    const collection = await this.collectionsRepository.update(userId, collectionId, input);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    return collection;
  }

  async assist(userId: string, input: { name: string; theme?: string; audience?: string; storySeed?: string }) {
    const prompt = await this.aiService.generatePrompt(userId, {
      customIdea: `${input.name}. ${input.storySeed ?? ""} Audience: ${input.audience ?? ""}`,
      style: input.theme
    });

    return {
      description: `${input.name} is a collectible universe built around ${input.theme ?? "a distinct creative concept"}.`,
      theme: input.theme ?? "Futuristic storytelling",
      story: `Narrative foundation: ${prompt}`
    };
  }

  async publish(userId: string, collectionId: string) {
    const collection = await this.getById(userId, collectionId);

    if (!collection.nfts?.length) {
      throw new AppError("Collection has no NFTs to publish.", 400);
    }

    const missingImages = collection.nfts.filter((nft) => !nft.imageUrl);

    if (missingImages.length > 0) {
      throw new AppError(
        `Every NFT in the collection must have an image before publishing. Missing: ${missingImages
          .map((nft) => nft.name)
          .join(", ")}`,
        400
      );
    }

    const publishedNfts = [];

    for (const nft of collection.nfts) {
      let currentNft = nft;

      if (!currentNft.ipfsMetadataCid) {
        currentNft = await this.nftsService.uploadToIpfs(userId, currentNft.id);
      }

      if (currentNft.status !== NftStatus.LISTED) {
        const listing = await this.nftsService.listOnMarketplace(userId, currentNft.id);
        currentNft = listing.nft;
      }

      publishedNfts.push(currentNft);
    }

    const updatedCollection = await this.collectionsRepository.update(userId, collectionId, {
      status: CollectionStatus.PUBLISHED,
      coverImageUrl: collection.coverImageUrl ?? publishedNfts.find((nft) => nft.imageUrl)?.imageUrl ?? undefined
    });

    if (!updatedCollection) {
      throw new AppError("Collection not found", 404);
    }

    return {
      collection: updatedCollection,
      publishedNfts
    };
  }
}
