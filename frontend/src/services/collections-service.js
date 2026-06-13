import { http } from "./http";
export const collectionsService = {
    list: async () => {
        const { data } = await http.get("/collections");
        return data;
    },
    getById: async (id) => {
        const { data } = await http.get(`/collections/${id}`);
        return data;
    },
    create: async (payload) => {
        const { data } = await http.post("/collections", payload);
        return data;
    },
    update: async (id, payload) => {
        const { data } = await http.put(`/collections/${id}`, payload);
        return data;
    },
    deployContract: async (id) => {
        const { data } = await http.post(`/collections/${id}/deploy-contract`);
        return data;
    },
    publish: async (id) => {
        const { data } = await http.post(`/collections/${id}/publish`);
        return data;
    },
    assist: async (payload) => {
        const { data } = await http.post("/collections/assist", payload);
        return data;
    }
};
