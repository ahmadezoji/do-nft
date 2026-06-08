import { http } from "./http";
export const promotionsService = {
    list: async () => {
        const { data } = await http.get("/promotions");
        return data;
    },
    create: async (payload) => {
        const { data } = await http.post("/promotions", payload);
        return data;
    }
};
