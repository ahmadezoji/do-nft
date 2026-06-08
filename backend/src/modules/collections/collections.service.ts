import { Prisma } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { AiService } from "../ai/ai.service.js";

import { CollectionsRepository } from "./collections.repository.js";

export class CollectionsService {
  constructor(
    private readonly collectionsRepository = new CollectionsRepository(),
    private readonly aiService = new AiService()
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
}
