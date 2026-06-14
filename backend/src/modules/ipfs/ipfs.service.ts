import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { AppError } from "../../common/errors/app-error.js";
import { CredentialsService } from "../credentials/credentials.service.js";

export interface IpfsProvider {
  uploadImage(
    userId: string,
    imageUrl: string,
    fileName?: string
  ): Promise<{ cid: string; gatewayUrl: string }>;
  uploadMetadata(
    userId: string,
    metadata: Record<string, unknown>,
    fileName?: string
  ): Promise<{ cid: string; gatewayUrl: string }>;
}

type PinataCredentials = {
  provider?: string;
  jwt?: string;
  gatewayUrl?: string;
};

type PinataResponse = {
  IpfsHash?: string;
};

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "asset";

const buildGatewayUrl = (cid: string, gatewayUrl?: string) => {
  if (!gatewayUrl) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  const normalizedGateway = gatewayUrl.replace(/\/+$/, "");

  return normalizedGateway.endsWith("/ipfs")
    ? `${normalizedGateway}/${cid}`
    : `${normalizedGateway}/ipfs/${cid}`;
};

const parseDataUrl = (source: string) => {
  const match = source.match(/^data:(.+?);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
};

class MockIpfsProvider implements IpfsProvider {
  async uploadImage(_userId: string, imageUrl: string, _fileName?: string) {
    return {
      cid: `mock-image-${Date.now()}`,
      gatewayUrl: imageUrl
    };
  }

  async uploadMetadata(_userId: string, metadata: Record<string, unknown>, _fileName?: string) {
    return {
      cid: `mock-meta-${Date.now()}`,
      gatewayUrl: `ipfs://mock/${encodeURIComponent(JSON.stringify(metadata))}`
    };
  }
}

class PinataIpfsProvider implements IpfsProvider {
  constructor(private readonly credentialsService = new CredentialsService()) {}

  async uploadImage(userId: string, imageUrl: string, fileName = "nft-image.png") {
    const credentials = await this.getCredentials(userId);
    const file = await this.resolveImageFile(imageUrl, fileName);
    const form = new FormData();

    form.append("file", file);
    form.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name
      })
    );
    form.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1
      })
    );

    const response = await fetch(PINATA_FILE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.jwt}`
      },
      body: form
    });

    const payload = (await response.json().catch(() => null)) as PinataResponse | null;
    const cid = payload?.IpfsHash;

    if (!response.ok || !cid) {
      throw new AppError("Pinata image upload failed.", 502);
    }

    return {
      cid,
      gatewayUrl: buildGatewayUrl(cid, credentials.gatewayUrl)
    };
  }

  async uploadMetadata(userId: string, metadata: Record<string, unknown>, fileName = "metadata.json") {
    const credentials = await this.getCredentials(userId);

    const response = await fetch(PINATA_JSON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: sanitizeFileName(fileName)
        },
        pinataContent: metadata
      })
    });

    const payload = (await response.json().catch(() => null)) as PinataResponse | null;
    const cid = payload?.IpfsHash;

    if (!response.ok || !cid) {
      throw new AppError("Pinata metadata upload failed.", 502);
    }

    return {
      cid,
      gatewayUrl: buildGatewayUrl(cid, credentials.gatewayUrl)
    };
  }

  async isConfigured(userId: string) {
    const credentials = await this.credentialsService.getProviderValues(userId, CredentialProvider.IPFS);

    return Boolean(credentials?.jwt);
  }

  private async getCredentials(userId: string) {
    const credentials = (await this.credentialsService.getProviderValues(
      userId,
      CredentialProvider.IPFS
    )) as PinataCredentials | null;

    if (!credentials?.jwt) {
      throw new AppError("IPFS is not configured. Add your Pinata JWT in Settings before uploading.", 400);
    }

    return {
      provider: credentials.provider ?? "Pinata",
      jwt: credentials.jwt,
      gatewayUrl: credentials.gatewayUrl
    };
  }

  private async resolveImageFile(imageUrl: string, fileName: string) {
    const parsedDataUrl = parseDataUrl(imageUrl);

    if (parsedDataUrl) {
      const extension = parsedDataUrl.mimeType.includes("jpeg")
        ? "jpg"
        : parsedDataUrl.mimeType.split("/")[1] || "png";

      return new File([new Blob([parsedDataUrl.buffer], { type: parsedDataUrl.mimeType })], `${sanitizeFileName(
        fileName.replace(/\.[a-z0-9]+$/i, "")
      )}.${extension}`, {
        type: parsedDataUrl.mimeType
      });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new AppError("Unable to download generated image for IPFS upload.", 502);
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || "image/png";
    const extension = mimeType.includes("jpeg") ? "jpg" : mimeType.split("/")[1] || "png";

    return new File([new Blob([arrayBuffer], { type: mimeType })], `${sanitizeFileName(
      fileName.replace(/\.[a-z0-9]+$/i, "")
    )}.${extension}`, {
      type: mimeType
    });
  }
}

export class IpfsService {
  private readonly mockProvider = new MockIpfsProvider();
  private readonly pinataProvider = new PinataIpfsProvider();

  async isConfigured(userId: string) {
    return this.pinataProvider.isConfigured(userId);
  }

  async uploadImage(
    userId: string,
    imageUrl: string,
    fileName?: string,
    options: { allowMockFallback?: boolean } = {}
  ) {
    if (await this.isConfigured(userId)) {
      return this.pinataProvider.uploadImage(userId, imageUrl, fileName);
    }

    if (options.allowMockFallback) {
      return this.mockProvider.uploadImage(userId, imageUrl, fileName);
    }

    throw new AppError("IPFS is not configured. Add your Pinata JWT in Settings before uploading.", 400);
  }

  async uploadMetadata(
    userId: string,
    metadata: Record<string, unknown>,
    fileName?: string,
    options: { allowMockFallback?: boolean } = {}
  ) {
    if (await this.isConfigured(userId)) {
      return this.pinataProvider.uploadMetadata(userId, metadata, fileName);
    }

    if (options.allowMockFallback) {
      return this.mockProvider.uploadMetadata(userId, metadata, fileName);
    }

    throw new AppError("IPFS is not configured. Add your Pinata JWT in Settings before uploading.", 400);
  }
}
