import type { AuthResponse, AuthUser } from "../types/api";

import { http } from "./http";

export const authService = {
  register: async (payload: { email: string; password: string; fullName?: string }) => {
    const { data } = await http.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await http.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await http.get<AuthUser>("/auth/me");
    return data;
  }
};
