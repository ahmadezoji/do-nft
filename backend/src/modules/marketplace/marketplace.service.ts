import { createRequire } from "node:module";

import { AppError } from "../../common/errors/app-error.js";
import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { BlockchainService } from "../blockchain/blockchain.service.js";
import { CredentialsService } from "../credentials/credentials.service.js";

const require = createRequire(import.meta.url);
const { OpenSeaSDK, Chain } = require("@opensea/sdk/viem") as any;

export class MarketplaceService {
  constructor(
    private readonly blockchainService = new BlockchainService(),
    private readonly credentialsService = new CredentialsService()
  ) {}

  private async getSdk(userId: string) {
    const credentials = await this.credentialsService.getProviderValues(userId, CredentialProvider.OPENSEA);

    if (!credentials?.apiKey) {
      throw new AppError("OpenSea publishing is not configured. Add your OpenSea API key in Settings.", 400);
    }

    const { account, publicClient, walletClient } = await this.blockchainService.getClients(userId);

    return {
      sdk: new OpenSeaSDK({ publicClient, walletClient }, { chain: Chain.Polygon, apiKey: credentials.apiKey }),
      accountAddress: account.address as string
    };
  }

  async createListing(userId: string, input: { contractAddress: string; tokenId: string; priceEth: string }) {
    const { sdk, accountAddress } = await this.getSdk(userId);

    const listing = await sdk.createListing({
      asset: { tokenId: input.tokenId, tokenAddress: input.contractAddress },
      accountAddress,
      amount: input.priceEth
    });

    return {
      orderHash: listing.orderHash as string,
      listingUrl: this.blockchainService.buildOpenSeaUrl(input.contractAddress, input.tokenId),
      expirationTime: listing.expirationTime ?? null
    };
  }

  async cancelListing(userId: string, input: { orderHash: string }) {
    const { sdk, accountAddress } = await this.getSdk(userId);

    await sdk.cancelOrder({
      orderHash: input.orderHash,
      accountAddress
    });
  }
}
