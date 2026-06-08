import type { Request, Response } from "express";

import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = async (request: Request, response: Response) => {
    const result = await this.authService.register(request.body);
    response.status(201).json(result);
  };

  login = async (request: Request, response: Response) => {
    const result = await this.authService.login(request.body);
    response.json(result);
  };

  me = async (request: Request, response: Response) => {
    const user = await this.authService.getCurrentUser(request.auth!.userId);
    response.json(user);
  };
}
