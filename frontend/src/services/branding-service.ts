import type { BrandingProfile } from "../types/api";

import { http } from "./http";

export const brandingService = {
  get: async () => {
    const { data } = await http.get<BrandingProfile>("/branding");
    return data;
  },
  upsert: async (payload: BrandingProfile) => {
    const { data } = await http.put<BrandingProfile>("/branding", payload);
    return data;
  }
};
