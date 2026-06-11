import { AppError } from "../../common/errors/app-error.js";
import { encrypt } from "../../common/utils/encryption.js";
import { decrypt } from "../../common/utils/encryption.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";

import { CredentialsRepository } from "./credentials.repository.js";

type CredentialProviderValue = (typeof CredentialProvider)[keyof typeof CredentialProvider];
type CredentialValueMap = Record<string, string>;

const providers: CredentialProviderValue[] = [
  CredentialProvider.DISCORD,
  CredentialProvider.GEMINI,
  CredentialProvider.IPFS,
  CredentialProvider.OPENAI,
  CredentialProvider.OPENSEA,
  CredentialProvider.TWITTER
];

const requiredCredentialFields: Record<CredentialProviderValue, string[]> = {
  [CredentialProvider.OPENAI]: ["apiKey"],
  [CredentialProvider.GEMINI]: ["apiKey"],
  [CredentialProvider.OPENSEA]: ["apiKey"],
  [CredentialProvider.IPFS]: ["provider", "jwt"],
  [CredentialProvider.TWITTER]: ["apiKey", "apiSecret", "accessToken", "accessTokenSecret"],
  [CredentialProvider.DISCORD]: ["webhookUrl"]
};

export class CredentialsService {
  constructor(private readonly credentialsRepository = new CredentialsRepository()) {}

  async list(userId: string) {
    const credentials = await this.credentialsRepository.findAll(userId);
    const configuredProviders = new Map(
      credentials.map((item) => [item.provider, { ...item, values: this.parseEncryptedValue(item.encryptedValue) }])
    );

    return providers.map((provider) => {
      const configured = configuredProviders.get(provider);

      return {
        provider,
        configured: Boolean(configured),
        label: configured?.label ?? null,
        updatedAt: configured?.updatedAt ?? null,
        configuredFields: configured ? Object.keys(configured.values) : []
      };
    });
  }

  async upsert(
    userId: string,
    provider: CredentialProviderValue,
    values: CredentialValueMap,
    label?: string
  ) {
    const sanitizedValues = this.sanitizeValues(values);

    if (Object.keys(sanitizedValues).length === 0) {
      throw new AppError("At least one credential field is required", 400);
    }

    const missingFields = requiredCredentialFields[provider].filter((field) => !sanitizedValues[field]);

    if (missingFields.length > 0) {
      throw new AppError(`Missing required credential fields: ${missingFields.join(", ")}`, 400);
    }

    await this.credentialsRepository.upsert(
      userId,
      provider,
      encrypt(JSON.stringify(sanitizedValues)),
      label
    );

    return {
      provider,
      configured: true,
      label: label ?? null,
      configuredFields: Object.keys(sanitizedValues)
    };
  }

  async getProviderValues(userId: string, provider: CredentialProviderValue) {
    const credential = await this.credentialsRepository.findByProvider(userId, provider);

    if (!credential) {
      return null;
    }

    return this.parseEncryptedValue(credential.encryptedValue);
  }

  private sanitizeValues(values: CredentialValueMap) {
    return Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value.length > 0)
    );
  }

  private parseEncryptedValue(encryptedValue: string): CredentialValueMap {
    const decryptedValue = decrypt(encryptedValue);

    try {
      const parsed = JSON.parse(decryptedValue) as unknown;

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { token: decryptedValue };
      }

      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"
        )
      );
    } catch {
      return { token: decryptedValue };
    }
  }
}
