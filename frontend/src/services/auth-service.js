import { http } from "./http";
export const authService = {
    register: async (payload) => {
        const { data } = await http.post("/auth/register", payload);
        return data;
    },
    login: async (payload) => {
        const { data } = await http.post("/auth/login", payload);
        return data;
    },
    me: async () => {
        const { data } = await http.get("/auth/me");
        return data;
    }
};
