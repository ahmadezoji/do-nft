import type { Request, Response } from "express";

import { MarketplaceTrendsService } from "./trends.service.js";

export class MarketplaceController {
  constructor(private readonly trendsService = new MarketplaceTrendsService()) {}

  trendingCollections = async (_request: Request, response: Response) => {
    response.json(await this.trendsService.getTrendingCollections());
  };
}
