import { TwitterApi } from "twitter-api-v2";

import { AppError } from "../../common/errors/app-error.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { CredentialsService } from "../credentials/credentials.service.js";

interface PendingOAuth {
  userId: string;
  oauthTokenSecret: string;
  frontendOrigin: string;
  createdAt: number;
}

const PENDING_OAUTH_TTL_MS = 10 * 60 * 1000;

export class XService {
  private readonly pendingOAuth = new Map<string, PendingOAuth>();

  constructor(private readonly credentialsService = new CredentialsService()) {}

  private async getConsumerCredentials(userId: string) {
    const values = await this.credentialsService.getProviderValues(userId, CredentialProvider.TWITTER);

    if (!values?.apiKey || !values.apiSecret) {
      throw new AppError("Add your X API key and secret in Settings before connecting your account.", 400);
    }

    return { apiKey: values.apiKey, apiSecret: values.apiSecret, bearerToken: values.bearerToken };
  }

  private cleanupPendingOAuth() {
    const now = Date.now();

    for (const [token, pending] of this.pendingOAuth) {
      if (now - pending.createdAt > PENDING_OAUTH_TTL_MS) {
        this.pendingOAuth.delete(token);
      }
    }
  }

  async createAuthLink(userId: string, callbackUrl: string, frontendOrigin: string) {
    const { apiKey, apiSecret } = await this.getConsumerCredentials(userId);
    const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret });

    let authLink: { url: string; oauth_token: string; oauth_token_secret: string };

    try {
      authLink = await client.generateAuthLink(callbackUrl, { linkMode: "authorize" });
    } catch (caughtError) {
      const details = (caughtError as { data?: unknown; message?: string })?.data ??
        (caughtError as Error)?.message;
      throw new AppError("X rejected the authorization request.", 400, details);
    }

    const { url, oauth_token, oauth_token_secret } = authLink;

    this.cleanupPendingOAuth();
    this.pendingOAuth.set(oauth_token, {
      userId,
      oauthTokenSecret: oauth_token_secret,
      frontendOrigin,
      createdAt: Date.now()
    });

    return { url };
  }

  async completeAuth(oauthToken: string, oauthVerifier: string) {
    const pending = this.pendingOAuth.get(oauthToken);

    if (!pending) {
      throw new AppError("X authorization request expired. Please try connecting again.", 400);
    }

    this.pendingOAuth.delete(oauthToken);

    const { apiKey, apiSecret, bearerToken } = await this.getConsumerCredentials(pending.userId);
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: oauthToken,
      accessSecret: pending.oauthTokenSecret
    });

    const { accessToken, accessSecret, screenName } = await client.login(oauthVerifier);

    await this.credentialsService.upsert(
      pending.userId,
      CredentialProvider.TWITTER,
      {
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret: accessSecret,
        ...(bearerToken ? { bearerToken } : {})
      },
      "x credentials"
    );

    return { screenName, frontendOrigin: pending.frontendOrigin };
  }

  private async getClient(userId: string) {
    const values = await this.credentialsService.getProviderValues(userId, CredentialProvider.TWITTER);

    if (!values?.apiKey || !values.apiSecret || !values.accessToken || !values.accessTokenSecret) {
      throw new AppError("Connect your X account in Settings before posting.", 400);
    }

    return new TwitterApi({
      appKey: values.apiKey,
      appSecret: values.apiSecret,
      accessToken: values.accessToken,
      accessSecret: values.accessTokenSecret
    });
  }

  private toAppError(caughtError: unknown) {
    const status = (caughtError as { code?: number })?.code;
    const detail = (caughtError as { data?: { detail?: string; title?: string } })?.data;

    if (status === 402 || detail?.title === "CreditsDepleted") {
      return new AppError(
        "X rejected this request: the connected developer account has no API credits left. Add credits or upgrade the plan on the X Developer Portal.",
        402
      );
    }

    if (status === 403 || status === 401) {
      return new AppError("X rejected this request. Check your X API credentials and access level.", 403);
    }

    return null;
  }

  async postTweet(userId: string, text: string) {
    const client = await this.getClient(userId);

    try {
      const result = await client.v2.tweet(text);

      return {
        id: result.data.id,
        url: `https://x.com/i/web/status/${result.data.id}`
      };
    } catch (caughtError) {
      throw this.toAppError(caughtError) ?? caughtError;
    }
  }

  async retweet(userId: string, tweetId: string) {
    const client = await this.getClient(userId);

    try {
      const me = await client.v2.me();

      await client.v2.retweet(me.data.id, tweetId);

      return { tweetId };
    } catch (caughtError) {
      throw this.toAppError(caughtError) ?? caughtError;
    }
  }

  async getLatestTweetFromHandle(userId: string, handle: string) {
    const client = await this.getClient(userId);

    try {
      const user = await client.v2.userByUsername(handle);

      if (!user.data) {
        return null;
      }

      const timeline = await client.v2.userTimeline(user.data.id, { max_results: 5, exclude: ["replies", "retweets"] });
      const tweet = timeline.data?.data?.[0];

      if (!tweet) {
        return null;
      }

      return { id: tweet.id, text: tweet.text, authorHandle: handle };
    } catch (caughtError) {
      throw this.toAppError(caughtError) ?? caughtError;
    }
  }

  async replyToTweet(userId: string, tweetId: string, text: string) {
    const client = await this.getClient(userId);

    try {
      const result = await client.v2.reply(text, tweetId);

      return {
        id: result.data.id,
        url: `https://x.com/i/web/status/${result.data.id}`
      };
    } catch (caughtError) {
      throw this.toAppError(caughtError) ?? caughtError;
    }
  }

  async searchRecent(userId: string, query: string, maxResults = 10) {
    const client = await this.getClient(userId);

    try {
      const result = await client.v2.search(query, { max_results: maxResults });

      return result.data?.data ?? [];
    } catch (caughtError) {
      throw this.toAppError(caughtError) ?? caughtError;
    }
  }
}
