import type { CredentialStatus } from "../types/api";

import { http } from "./http";

export const credentialsService = {
  list: async () => {
    const { data } = await http.get<CredentialStatus[]>("/credentials");
    return data;
  },
  upsert: async (provider: string, payload: { values: Record<string, string>; label?: string }) => {
    const { data } = await http.put(`/credentials/${provider}`, payload);
    return data;
  }
};
