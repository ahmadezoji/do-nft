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
}
