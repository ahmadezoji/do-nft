import type { AuthUser } from "../types/api";

import { http } from "./http";

export const usersService = {
  updateSettings: async (payload: Record<string, string | number | string[]>) => {
    const { data } = await http.put<AuthUser>("/users/settings", payload);
    return data;
  }
};
