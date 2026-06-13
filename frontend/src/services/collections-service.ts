import type { Collection, CollectionPublishResult } from "../types/api";

import { http } from "./http";

export const collectionsService = {
  list: async () => {
    const { data } = await http.get<Collection[]>("/collections");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await http.get<Collection>(`/collections/${id}`);
    return data;
  },
  create: async (payload: Partial<Collection>) => {
    const { data } = await http.post<Collection>("/collections", payload);
    return data;
  },
  update: async (id: string, payload: Partial<Collection>) => {
    const { data } = await http.put<Collection>(`/collections/${id}`, payload);
    return data;
  },
  deployContract: async (id: string) => {
    const { data } = await http.post<Collection>(`/collections/${id}/deploy-contract`);
    return data;
  },
  publish: async (id: string) => {
    const { data } = await http.post<CollectionPublishResult>(`/collections/${id}/publish`);
    return data;
  },
  assist: async (payload: { name: string; theme?: string; audience?: string; storySeed?: string }) => {
    const { data } = await http.post<Pick<Collection, "description" | "theme" | "story">>(
      "/collections/assist",
      payload
    );
    return data;
  }
};
