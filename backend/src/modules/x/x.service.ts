import { TwitterApi } from "twitter-api-v2";

import { AppError } from "../../common/errors/app-error.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { CredentialsService } from "../credentials/credentials.service.js";

export class XService {
  constructor(private readonly credentialsService = new CredentialsService()) {}

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

  async postTweet(userId: string, text: string) {
    const client = await this.getClient(userId);
    const result = await client.v2.tweet(text);

    return {
      id: result.data.id,
      url: `https://x.com/i/web/status/${result.data.id}`
    };
  }

  async retweet(userId: string, tweetId: string) {
    const client = await this.getClient(userId);
    const me = await client.v2.me();

    await client.v2.retweet(me.data.id, tweetId);

    return { tweetId };
  }

  async searchRecent(userId: string, query: string, maxResults = 10) {
    const client = await this.getClient(userId);

    try {
      const result = await client.v2.search(query, { max_results: maxResults });

      return result.data?.data ?? [];
    } catch (caughtError) {
      const status = (caughtError as { code?: number })?.code;

      if (status === 403 || status === 401) {
        throw new AppError("X API search requires a paid Basic/Pro plan.", 403);
      }

      throw caughtError;
    }
  }
}
