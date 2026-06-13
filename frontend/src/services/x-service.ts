import { http } from "./http";

export const xService = {
  startOAuth: async () => {
    const { data } = await http.get<{ url: string }>("/x/oauth/start");
    return data;
  }
};
