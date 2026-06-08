import type { Request, Response } from "express";

import { CredentialsService } from "./credentials.service.js";

export class CredentialsController {
  constructor(private readonly credentialsService = new CredentialsService()) {}

  list = async (request: Request, response: Response) => {
    const credentials = await this.credentialsService.list(request.auth!.userId);
    response.json(credentials);
  };

  upsert = async (request: Request, response: Response) => {
    const credential = await this.credentialsService.upsert(
      request.auth!.userId,
      request.params.provider as never,
      request.body.values ?? (request.body.token ? { token: request.body.token } : {}),
      request.body.label
    );

    response.json(credential);
  };
}
