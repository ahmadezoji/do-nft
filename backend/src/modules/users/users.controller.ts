import type { Request, Response } from "express";

import { UsersService } from "./users.service.js";

export class UsersController {
  constructor(private readonly usersService = new UsersService()) {}

  me = async (request: Request, response: Response) => {
    const user = await this.usersService.getMe(request.auth!.userId);
    response.json(user);
  };

  updateSettings = async (request: Request, response: Response) => {
    const user = await this.usersService.updateSettings(request.auth!.userId, request.body);
    response.json(user);
  };
}
