import type { TrendingCollectionsResult } from "../types/api";

import { http } from "./http";

export const marketplaceService = {
  getTrendingCollections: async () => {
    const { data } = await http.get<TrendingCollectionsResult>("/marketplace/trending-collections");
    return data;
  }
};
