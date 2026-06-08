import { http } from "./http";
export const brandingService = {
    get: async () => {
        const { data } = await http.get("/branding");
        return data;
    },
    upsert: async (payload) => {
        const { data } = await http.put("/branding", payload);
        return data;
    }
};
