import type { Request, Response } from "express";

import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(private readonly dashboardService = new DashboardService()) {}

  summary = async (request: Request, response: Response) => {
    response.json(await this.dashboardService.summary(request.auth!.userId));
  };
}
