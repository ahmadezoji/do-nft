import type { AutoPromoterLogEntry, AutoPromoterSettings } from "../types/api";

import { http } from "./http";

export const autoPromoterService = {
  getSettings: async () => {
    const { data } = await http.get<AutoPromoterSettings>("/auto-promoter/settings");
    return data;
  },
  updateSettings: async (payload: {
    enabled: boolean;
    collectionId?: string;
    keywords: string[];
    targetHandles: string[];
    intervalMinutes: number;
  }) => {
    const { data } = await http.put<AutoPromoterSettings>("/auto-promoter/settings", payload);
    return data;
  },
  listLogs: async () => {
    const { data } = await http.get<AutoPromoterLogEntry[]>("/auto-promoter/logs");
    return data;
  },
  approveLog: async (id: string) => {
    const { data } = await http.post<AutoPromoterLogEntry>(`/auto-promoter/logs/${id}/approve`);
    return data;
  },
  dismissLog: async (id: string) => {
    const { data } = await http.post<AutoPromoterLogEntry>(`/auto-promoter/logs/${id}/dismiss`);
    return data;
  },
  aiSuggest: async () => {
    const { data } = await http.post<{ keywords: string[]; handles: string[] }>("/auto-promoter/ai-suggest");
    return data;
  },
  stop: async () => {
    const { data } = await http.post<AutoPromoterSettings>("/auto-promoter/stop");
    return data;
  },
  runNow: async () => {
    const { data } = await http.post<AutoPromoterLogEntry[]>("/auto-promoter/run-now");
    return data;
  }
};
