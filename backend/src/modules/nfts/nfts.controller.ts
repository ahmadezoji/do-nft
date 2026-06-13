import type { Request, Response } from "express";

import { NftsService } from "./nfts.service.js";

export class NftsController {
  constructor(private readonly nftsService = new NftsService()) {}

  list = async (request: Request, response: Response) => {
    response.json(await this.nftsService.list(request.auth!.userId));
  };

  getById = async (request: Request, response: Response) => {
    response.json(await this.nftsService.getById(request.auth!.userId, String(request.params.id)));
  };

  create = async (request: Request, response: Response) => {
    response.status(201).json(await this.nftsService.create(request.auth!.userId, request.body));
  };

  update = async (request: Request, response: Response) => {
    response.json(await this.nftsService.update(request.auth!.userId, String(request.params.id), request.body));
  };

  templates = async (_request: Request, response: Response) => {
    response.json(await this.nftsService.getTemplates());
  };

  generatePrompt = async (request: Request, response: Response) => {
    response.json(await this.nftsService.generatePrompt(request.auth!.userId, request.body));
  };

  generateImage = async (request: Request, response: Response) => {
    response.json(await this.nftsService.generateImage(request.auth!.userId, request.body));
  };

  uploadToIpfs = async (request: Request, response: Response) => {
    response.json(await this.nftsService.uploadToIpfs(request.auth!.userId, String(request.params.id)));
  };

  listOnMarketplace = async (request: Request, response: Response) => {
    response.json(
      await this.nftsService.listOnMarketplace(
        request.auth!.userId,
        String(request.params.id),
        String(request.body.priceEth)
      )
    );
  };

  unlistFromMarketplace = async (request: Request, response: Response) => {
    response.json(await this.nftsService.unlistFromMarketplace(request.auth!.userId, String(request.params.id)));
  };
}
