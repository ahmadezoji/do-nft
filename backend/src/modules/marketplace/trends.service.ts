import { CredentialProvider } from "../../common/constants/domain-enums.js";
import { CredentialsService } from "../credentials/credentials.service.js";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";
const CACHE_TTL_MS = 15 * 60 * 1000;

export type TrendingCollection = {
  slug: string;
  name: string;
  imageUrl: string | null;
  openseaUrl: string;
  floorPriceEth: number | null;
  sevenDayVolumeEth: number | null;
};

type CachedTrends = {
  fetchedAt: number;
  items: TrendingCollection[];
};

const cache = new Map<string, CachedTrends>();

type OpenSeaCollectionSummary = {
  collection?: string;
  name?: string;
  image_url?: string | null;
};

type OpenSeaCollectionStats = {
  total?: {
    floor_price?: number | null;
    volume?: number | null;
  };
};

export class MarketplaceTrendsService {
  constructor(private readonly credentialsService = new CredentialsService()) {}

  async getTrendingCollections(userId: string): Promise<{ items: TrendingCollection[]; error?: string }> {
    const credentials = await this.credentialsService.getProviderValues(userId, CredentialProvider.OPENSEA);

    if (!credentials?.apiKey) {
      return { items: [], error: "OpenSea API key not configured" };
    }

    const cached = cache.get(userId);

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return { items: cached.items };
    }

    try {
      const items = await this.fetchTrendingCollections(credentials.apiKey);
      cache.set(userId, { fetchedAt: Date.now(), items });
      return { items };
    } catch (error) {
      if (cached) {
        return { items: cached.items };
      }

      return { items: [], error: error instanceof Error ? error.message : "Failed to load trending collections" };
    }
  }

  private async fetchTrendingCollections(apiKey: string): Promise<TrendingCollection[]> {
    const headers = { "x-api-key": apiKey, accept: "application/json" };

    const listResponse = await fetch(`${OPENSEA_API_BASE}/collections?chain=matic&order_by=seven_day_volume&limit=10`, {
      headers
    });

    if (!listResponse.ok) {
      throw new Error(`OpenSea collections request failed with status ${listResponse.status}`);
    }

    const listData = (await listResponse.json()) as { collections?: OpenSeaCollectionSummary[] };
    const collections = listData.collections ?? [];

    const items = await Promise.all(
      collections.map(async (collection) => {
        const slug = collection.collection ?? "";
        let floorPriceEth: number | null = null;
        let sevenDayVolumeEth: number | null = null;

        try {
          const statsResponse = await fetch(`${OPENSEA_API_BASE}/collections/${slug}/stats`, { headers });

          if (statsResponse.ok) {
            const stats = (await statsResponse.json()) as OpenSeaCollectionStats;
            floorPriceEth = stats.total?.floor_price ?? null;
            sevenDayVolumeEth = stats.total?.volume ?? null;
          }
        } catch {
          // Ignore per-collection stats failures and fall back to nulls
        }

        return {
          slug,
          name: collection.name ?? slug,
          imageUrl: collection.image_url ?? null,
          openseaUrl: `https://opensea.io/collection/${slug}`,
          floorPriceEth,
          sevenDayVolumeEth
        };
      })
    );

    return items;
  }
}
