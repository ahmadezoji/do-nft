import { Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { CollectionStatus, NftStatus } from "../../common/constants/domain-enums.js";
import { AiService } from "../ai/ai.service.js";
import { BlockchainService } from "../blockchain/blockchain.service.js";
import { NftsService } from "../nfts/nfts.service.js";

import { CollectionsRepository } from "./collections.repository.js";

const buildContractSymbol = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10) || "DONFT";

type PublishableNft = {
  name: string;
  imageUrl?: string | null;
  ipfsMetadataCid?: string | null;
  status: string;
  id: string;
};

type OnChainCollection = {
  contractAddress?: string | null;
  contractSymbol?: string | null;
  coverImageUrl?: string | null;
  nfts?: PublishableNft[];
};

export class CollectionsService {
  constructor(
    private readonly collectionsRepository = new CollectionsRepository(),
    private readonly aiService = new AiService(),
    private readonly nftsService = new NftsService(),
    private readonly blockchainService = new BlockchainService()
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
    return this.collectionsRepository.create(userId, {
      ...input,
      blockchain: input.blockchain || "polygon",
      contractSymbol:
        (input as Omit<Prisma.CollectionUncheckedCreateInput, "userId"> & { contractSymbol?: string | null })
          .contractSymbol || buildContractSymbol(input.name)
    } as Omit<Prisma.CollectionUncheckedCreateInput, "userId">);
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

  async deployContract(userId: string, collectionId: string) {
    const collection = (await this.getById(userId, collectionId)) as OnChainCollection & {
      id: string;
      name: string;
    };

    if (collection.contractAddress) {
      return collection;
    }

    const deployment = await this.blockchainService.deployCollectionContract(userId, {
      name: collection.name,
      symbol: collection.contractSymbol || buildContractSymbol(collection.name)
    });

    const updatedCollection = await this.collectionsRepository.update(userId, collectionId, {
      blockchain: "polygon",
      contractSymbol: collection.contractSymbol || buildContractSymbol(collection.name),
      contractAddress: deployment.contractAddress,
      deployTxHash: deployment.txHash,
      deployedAt: new Date()
    } as Prisma.CollectionUncheckedUpdateInput);

    if (!updatedCollection) {
      throw new AppError("Collection not found", 404);
    }

    return updatedCollection;
  }

  async publish(userId: string, collectionId: string) {
    let collection = (await this.getById(userId, collectionId)) as OnChainCollection & {
      coverImageUrl?: string | null;
      nfts?: PublishableNft[];
    };

    if (!collection.nfts?.length) {
      throw new AppError("Collection has no NFTs to publish.", 400);
    }

    const collectionNfts = collection.nfts as PublishableNft[];
    const missingImages = collectionNfts.filter((nft) => !nft.imageUrl);

    if (missingImages.length > 0) {
      throw new AppError(
        `Every NFT in the collection must have an image before publishing. Missing: ${missingImages
          .map((nft) => nft.name)
          .join(", ")}`,
        400
      );
    }

    if (!collection.contractAddress) {
      collection = (await this.deployContract(userId, collectionId)) as typeof collection;
    }

    const publishedNfts = [];

    for (const nft of collectionNfts) {
      let currentNft = nft;

      if (!currentNft.ipfsMetadataCid) {
        currentNft = (await this.nftsService.uploadToIpfs(userId, currentNft.id)) as PublishableNft;
      }

      if (currentNft.status !== NftStatus.MINTED && currentNft.status !== NftStatus.LISTED) {
        currentNft = (await this.nftsService.mintNft(userId, currentNft.id)) as PublishableNft;
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
