import type { Request, Response } from "express";

import { env } from "../../config/env.js";
import { XService } from "./x.service.js";

export class XController {
  constructor(private readonly xService = new XService()) {}

  startOAuth = async (request: Request, response: Response) => {
    const callbackUrl = `${request.protocol}://${request.get("host")}/api/x/oauth/callback`;
    const siteOrigin = `${request.protocol}://${request.get("host")}`;
    const frontendOrigin = (request.headers.origin as string | undefined) ?? env.FRONTEND_URL ?? siteOrigin;

    const { url } = await this.xService.createAuthLink(request.auth!.userId, callbackUrl, frontendOrigin);

    response.json({ url });
  };

  oauthCallback = async (request: Request, response: Response) => {
    const oauthToken = String(request.query.oauth_token ?? "");
    const oauthVerifier = String(request.query.oauth_verifier ?? "");

    if (request.query.denied || !oauthToken || !oauthVerifier) {
      const fallbackOrigin = env.FRONTEND_URL ?? `${request.protocol}://${request.get("host")}`;
      response.redirect(`${fallbackOrigin}/settings?x=denied`);
      return;
    }

    try {
      const { frontendOrigin } = await this.xService.completeAuth(oauthToken, oauthVerifier);
      response.redirect(`${frontendOrigin}/settings?x=connected`);
    } catch {
      const fallbackOrigin = env.FRONTEND_URL ?? `${request.protocol}://${request.get("host")}`;
      response.redirect(`${fallbackOrigin}/settings?x=error`);
    }
  };
}
