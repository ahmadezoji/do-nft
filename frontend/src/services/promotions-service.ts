import type { PromotionCampaign, PromotionPost } from "../types/api";

import { http } from "./http";

export const promotionsService = {
  list: async () => {
    const { data } = await http.get<PromotionCampaign[]>("/promotions");
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await http.post<PromotionCampaign>("/promotions", payload);
    return data;
  },
  publishPost: async (campaignId: string, postId: string) => {
    const { data } = await http.post<PromotionPost>(`/promotions/${campaignId}/posts/${postId}/publish`);
    return data;
  },
  regenerate: async (campaignId: string) => {
    const { data } = await http.post<PromotionCampaign>(`/promotions/${campaignId}/regenerate`);
    return data;
  },
  remove: async (campaignId: string) => {
    await http.delete(`/promotions/${campaignId}`);
  }
};
