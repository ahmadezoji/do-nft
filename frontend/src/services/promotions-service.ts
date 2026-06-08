import type { PromotionCampaign } from "../types/api";

import { http } from "./http";

export const promotionsService = {
  list: async () => {
    const { data } = await http.get<PromotionCampaign[]>("/promotions");
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await http.post<PromotionCampaign>("/promotions", payload);
    return data;
  }
};
