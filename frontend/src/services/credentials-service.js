import { http } from "./http";
export const credentialsService = {
    list: async () => {
        const { data } = await http.get("/credentials");
        return data;
    },
    upsert: async (provider, payload) => {
        const { data } = await http.put(`/credentials/${provider}`, payload);
        return data;
    }
};
