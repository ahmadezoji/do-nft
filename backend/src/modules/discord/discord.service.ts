import { AppError } from "../../common/errors/app-error.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { CredentialsService } from "../credentials/credentials.service.js";

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  image?: { url: string };
  footer?: { text: string };
}

export class DiscordService {
  constructor(private readonly credentialsService = new CredentialsService()) {}

  async postMessage(userId: string, content: string, embeds?: DiscordEmbed[]) {
    const values = await this.credentialsService.getProviderValues(userId, CredentialProvider.DISCORD);

    if (!values?.webhookUrl) {
      throw new AppError("Add your Discord webhook URL in Settings before posting.", 400);
    }

    const response = await fetch(values.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, embeds })
    });

    if (!response.ok) {
      throw new AppError(`Discord rejected this request (${response.status}). Check your webhook URL.`, 400);
    }
  }
}
