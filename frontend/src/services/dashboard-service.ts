import type { DashboardSummary } from "../types/api";

import { http } from "./http";

export const dashboardService = {
  summary: async () => {
    const { data } = await http.get<DashboardSummary>("/dashboard/summary");
    return data;
  }
};
