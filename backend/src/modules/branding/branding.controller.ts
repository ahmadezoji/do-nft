import type { Request, Response } from "express";

import { BrandingService } from "./branding.service.js";

export class BrandingController {
  constructor(private readonly brandingService = new BrandingService()) {}

  get = async (request: Request, response: Response) => {
    const branding = await this.brandingService.get(request.auth!.userId);
    response.json(branding);
  };

  upsert = async (request: Request, response: Response) => {
    const branding = await this.brandingService.upsert(request.auth!.userId, request.body);
    response.json(branding);
  };
}
