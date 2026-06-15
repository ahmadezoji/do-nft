import type { Request, Response } from "express";

import { PromotionsService } from "./promotions.service.js";

export class PromotionsController {
  constructor(private readonly promotionsService = new PromotionsService()) {}

  list = async (request: Request, response: Response) => {
    response.json(await this.promotionsService.list(request.auth!.userId));
  };

  create = async (request: Request, response: Response) => {
    response.status(201).json(await this.promotionsService.create(request.auth!.userId, request.body));
  };

  delete = async (request: Request, response: Response) => {
    await this.promotionsService.delete(request.auth!.userId, String(request.params.campaignId));
    response.status(204).send();
  };

  regenerate = async (request: Request, response: Response) => {
    response.json(await this.promotionsService.regenerate(request.auth!.userId, String(request.params.campaignId)));
  };

  publishPost = async (request: Request, response: Response) => {
    response.json(
      await this.promotionsService.publishPost(
        request.auth!.userId,
        String(request.params.campaignId),
        String(request.params.postId)
      )
    );
  };
}
