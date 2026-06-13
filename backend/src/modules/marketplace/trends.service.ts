import { env } from "../../config/env.js";

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

let cache: CachedTrends | null = null;

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
  async getTrendingCollections(): Promise<{ items: TrendingCollection[]; error?: string }> {
    if (!env.OPENSEA_API_KEY) {
      return { items: [], error: "OpenSea API key not configured" };
    }

    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return { items: cache.items };
    }

    try {
      const items = await this.fetchTrendingCollections();
      cache = { fetchedAt: Date.now(), items };
      return { items };
    } catch (error) {
      if (cache) {
        return { items: cache.items };
      }

      return { items: [], error: error instanceof Error ? error.message : "Failed to load trending collections" };
    }
  }

  private async fetchTrendingCollections(): Promise<TrendingCollection[]> {
    const headers = { "x-api-key": env.OPENSEA_API_KEY as string, accept: "application/json" };

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
