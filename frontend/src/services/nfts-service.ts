import type { Nft, NftListingResult, PromptTemplate } from "../types/api";

import { http } from "./http";

export const nftsService = {
  list: async () => {
    const { data } = await http.get<Nft[]>("/nfts");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await http.get<Nft>(`/nfts/${id}`);
    return data;
  },
  templates: async () => {
    const { data } = await http.get<PromptTemplate[]>("/nfts/templates");
    return data;
  },
  generatePrompt: async (payload: Record<string, string | number | string[]>) => {
    const { data } = await http.post<{ prompt: string; provider: string; model?: string | null; status: string }>(
      "/nfts/studio/prompt",
      payload
    );
    return data;
  },
  generateImage: async (payload: Record<string, string | number>) => {
    const { data } = await http.post<{
      imageUrl: string;
      provider: string;
      model?: string | null;
      status: string;
      ipfsImageCid?: string | null;
      storedOnIpfs?: boolean;
    }>("/nfts/studio/image", payload);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await http.post<Nft>("/nfts", payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await http.put<Nft>(`/nfts/${id}`, payload);
    return data;
  },
  uploadToIpfs: async (id: string) => {
    const { data } = await http.post<Nft>(`/nfts/${id}/ipfs`);
    return data;
  },
  mintNft: async (id: string) => {
    const { data } = await http.post<Nft>(`/nfts/${id}/mint`);
    return data;
  },
  listOnMarketplace: async (id: string, priceEth: string) => {
    const { data } = await http.post<NftListingResult>(`/nfts/${id}/list`, { priceEth });
    return data;
  },
  unlistFromMarketplace: async (id: string) => {
    const { data } = await http.post<{ nft: Nft }>(`/nfts/${id}/unlist`);
    return data;
  }
};
