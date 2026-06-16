import type { Request, Response } from "express";

import { AutoPromoterService } from "./auto-promoter.service.js";

export class AutoPromoterController {
  constructor(private readonly autoPromoterService = new AutoPromoterService()) {}

  getSettings = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.getSettings(request.auth!.userId));
  };

  updateSettings = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.updateSettings(request.auth!.userId, request.body));
  };

  listLogs = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.listLogs(request.auth!.userId));
  };

  approveLog = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.actOnLog(request.auth!.userId, String(request.params.id), "approve"));
  };

  dismissLog = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.actOnLog(request.auth!.userId, String(request.params.id), "dismiss"));
  };

  aiSuggest = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.aiSuggest(request.auth!.userId));
  };

  stop = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.stop(request.auth!.userId));
  };

  runNow = async (request: Request, response: Response) => {
    response.json(await this.autoPromoterService.runNow(request.auth!.userId));
  };
}
