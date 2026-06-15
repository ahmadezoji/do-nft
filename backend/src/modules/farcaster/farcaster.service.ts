import { AppError } from "../../common/errors/app-error.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { CredentialsService } from "../credentials/credentials.service.js";

const NEYNAR_CAST_URL = "https://api.neynar.com/v2/farcaster/cast";

export class FarcasterService {
  constructor(private readonly credentialsService = new CredentialsService()) {}

  async postCast(userId: string, text: string) {
    const values = await this.credentialsService.getProviderValues(userId, CredentialProvider.FARCASTER);

    if (!values?.apiKey || !values.signerUuid) {
      throw new AppError("Add your Neynar API key and signer UUID in Settings before posting.", 400);
    }

    const response = await fetch(NEYNAR_CAST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: values.apiKey
      },
      body: JSON.stringify({ signer_uuid: values.signerUuid, text })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(`Farcaster rejected this request (${response.status}): ${detail}`, 400);
    }

    const result = (await response.json()) as { cast?: { hash?: string } };
    const hash = result.cast?.hash;

    return {
      hash,
      url: hash ? `https://warpcast.com/~/conversations/${hash}` : undefined
    };
  }
}
