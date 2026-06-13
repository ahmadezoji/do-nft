import { createRequire } from "node:module";

import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";
import { BlockchainService } from "../blockchain/blockchain.service.js";

const require = createRequire(import.meta.url);
const { OpenSeaSDK, Chain } = require("@opensea/sdk/viem") as any;

export class MarketplaceService {
  private readonly blockchainService = new BlockchainService();

  private getSdk() {
    if (!env.ALCHEMY_RPC_URL || !env.WALLET_PRIVATE_KEY || !env.OPENSEA_API_KEY) {
      throw new AppError(
        "OpenSea publishing is not configured. Add ALCHEMY_RPC_URL, WALLET_PRIVATE_KEY, and OPENSEA_API_KEY to the backend environment.",
        400
      );
    }

    const { account, publicClient, walletClient } = this.blockchainService.getClients();

    return {
      sdk: new OpenSeaSDK({ publicClient, walletClient }, { chain: Chain.Polygon, apiKey: env.OPENSEA_API_KEY }),
      accountAddress: account.address as string
    };
  }

  async createListing(input: { contractAddress: string; tokenId: string; priceEth: string }) {
    const { sdk, accountAddress } = this.getSdk();

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

  async cancelListing(input: { orderHash: string }) {
    const { sdk, accountAddress } = this.getSdk();

    await sdk.cancelOrder({
      orderHash: input.orderHash,
      accountAddress
    });
  }
}
