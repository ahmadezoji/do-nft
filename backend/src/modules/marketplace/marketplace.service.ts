export interface MarketplaceProvider {
  listNft(input: { name: string; metadataCid?: string | null }): Promise<{ listingUrl: string; status: string }>;
}

class MockOpenSeaProvider implements MarketplaceProvider {
  async listNft(input: { name: string; metadataCid?: string | null }) {
    return {
      listingUrl: `https://opensea.io/assets/mock/${encodeURIComponent(input.name)}`,
      status: input.metadataCid ? "listed" : "metadata_required"
    };
  }
}

export class MarketplaceService {
  private readonly provider: MarketplaceProvider = new MockOpenSeaProvider();

  listNft(input: { name: string; metadataCid?: string | null }) {
    return this.provider.listNft(input);
  }
}
