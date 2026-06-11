import type { Request, Response } from "express";

import { CollectionsService } from "./collections.service.js";

export class CollectionsController {
  constructor(private readonly collectionsService = new CollectionsService()) {}

  list = async (request: Request, response: Response) => {
    const collections = await this.collectionsService.list(request.auth!.userId);
    response.json(collections);
  };

  getById = async (request: Request, response: Response) => {
    const collection = await this.collectionsService.getById(request.auth!.userId, String(request.params.id));
    response.json(collection);
  };

  create = async (request: Request, response: Response) => {
    const collection = await this.collectionsService.create(request.auth!.userId, request.body);
    response.status(201).json(collection);
  };

  update = async (request: Request, response: Response) => {
    const collection = await this.collectionsService.update(
      request.auth!.userId,
      String(request.params.id),
      request.body
    );
    response.json(collection);
  };

  assist = async (request: Request, response: Response) => {
    const result = await this.collectionsService.assist(request.auth!.userId, request.body);
    response.json(result);
  };

  publish = async (request: Request, response: Response) => {
    const result = await this.collectionsService.publish(request.auth!.userId, String(request.params.id));
    response.json(result);
  };
}
