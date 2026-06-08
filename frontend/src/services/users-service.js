import { http } from "./http";
export const usersService = {
    updateSettings: async (payload) => {
        const { data } = await http.put("/users/settings", payload);
        return data;
    }
};
