import { http } from "./http";
export const nftsService = {
    list: async () => {
        const { data } = await http.get("/nfts");
        return data;
    },
    getById: async (id) => {
        const { data } = await http.get(`/nfts/${id}`);
        return data;
    },
    templates: async () => {
        const { data } = await http.get("/nfts/templates");
        return data;
    },
    generatePrompt: async (payload) => {
        const { data } = await http.post("/nfts/studio/prompt", payload);
        return data;
    },
    generateImage: async (payload) => {
        const { data } = await http.post("/nfts/studio/image", payload);
        return data;
    },
    create: async (payload) => {
        const { data } = await http.post("/nfts", payload);
        return data;
    },
    update: async (id, payload) => {
        const { data } = await http.put(`/nfts/${id}`, payload);
        return data;
    },
    uploadToIpfs: async (id) => {
        const { data } = await http.post(`/nfts/${id}/ipfs`);
        return data;
    },
    listOnMarketplace: async (id) => {
        const { data } = await http.post(`/nfts/${id}/list`);
        return data;
    }
};
