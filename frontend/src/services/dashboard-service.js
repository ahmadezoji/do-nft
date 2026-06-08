import { http } from "./http";
export const dashboardService = {
    summary: async () => {
        const { data } = await http.get("/dashboard/summary");
        return data;
    }
};
