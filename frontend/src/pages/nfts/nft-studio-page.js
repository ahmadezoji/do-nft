import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
import { nftsService } from "../../services/nfts-service";
import { useAuth } from "../../store/auth-context";
const providerModels = {
    openai: ["gpt-image-1", "gpt-4.1-mini", "gpt-4o-mini"],
    gemini: ["gemini-2.5-flash-image-preview", "gemini-2.5-pro", "gemini-2.0-flash-preview-image-generation"]
};
export const NftStudioPage = () => {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [generatedImageUrl, setGeneratedImageUrl] = useState("");
    const [savedNftId, setSavedNftId] = useState("");
    const [form, setForm] = useState({
        collectionId: "",
        templateId: "",
        customIdea: "",
        provider: (user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai"),
        model: user?.settings?.preferredAi?.toLowerCase() === "gemini"
            ? user?.promptProfile?.preferredGeminiModel || providerModels.gemini[0]
            : user?.promptProfile?.preferredOpenAiModel || providerModels.openai[0],
        style: "Premium editorial sci-fi",
        referenceUrls: (user?.promptProfile?.sampleReferenceUrls ?? []).join(", "),
        referenceImageUrl: "",
        outputWidth: user?.settings?.defaultImageWidth ?? 1024,
        outputHeight: user?.settings?.defaultImageHeight ?? 1024,
        name: "",
        description: "",
        rarityNotes: "",
        metadata: '{"traits":[]}'
    });
    useEffect(() => {
        setForm((current) => {
            const preferredProvider = user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai";
            const preferredModel = preferredProvider === "gemini"
                ? user?.promptProfile?.preferredGeminiModel || providerModels.gemini[0]
                : user?.promptProfile?.preferredOpenAiModel || providerModels.openai[0];
            return {
                ...current,
                provider: preferredProvider,
                model: preferredModel,
                referenceUrls: current.referenceUrls || (user?.promptProfile?.sampleReferenceUrls ?? []).join(", "),
                outputWidth: current.outputWidth || user?.settings?.defaultImageWidth || 1024,
                outputHeight: current.outputHeight || user?.settings?.defaultImageHeight || 1024
            };
        });
    }, [user]);
    const modelOptions = Array.from(new Set([...providerModels[form.provider], form.model].filter(Boolean)));
    useEffect(() => {
        void Promise.all([collectionsService.list(), nftsService.templates()]).then(([collectionData, templateData]) => {
            setCollections(collectionData);
            setTemplates(templateData);
        });
    }, []);
    const generatePrompt = async () => {
        const referenceImageUrl = form.referenceImageUrl.trim();
        const result = await nftsService.generatePrompt({
            collectionId: form.collectionId,
            templateId: form.templateId,
            customIdea: form.customIdea,
            provider: form.provider,
            model: form.model,
            style: form.style,
            referenceUrls: form.referenceUrls
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ...(referenceImageUrl ? { referenceImageUrl } : {}),
            outputWidth: form.outputWidth,
            outputHeight: form.outputHeight
        });
        setGeneratedPrompt(result.prompt);
    };
    const generateImage = async () => {
        const referenceImageUrl = form.referenceImageUrl.trim();
        const result = await nftsService.generateImage({
            prompt: generatedPrompt,
            provider: form.provider,
            model: form.model,
            style: form.style,
            ...(referenceImageUrl ? { referenceImageUrl } : {}),
            outputWidth: form.outputWidth,
            outputHeight: form.outputHeight
        });
        setGeneratedImageUrl(result.imageUrl);
    };
    const saveDraft = async () => {
        const metadata = JSON.parse(form.metadata);
        const nft = await nftsService.create({
            collectionId: form.collectionId || undefined,
            templateId: form.templateId || undefined,
            name: form.name || "Untitled NFT",
            description: form.description,
            customIdea: form.customIdea,
            prompt: generatedPrompt,
            imageUrl: generatedImageUrl,
            rarityNotes: form.rarityNotes,
            metadata,
            aiProvider: form.provider,
            aiModel: form.model,
            imageStyle: form.style,
            referenceUrls: form.referenceUrls
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            referenceImageUrl: form.referenceImageUrl || undefined,
            outputWidth: form.outputWidth,
            outputHeight: form.outputHeight,
            status: generatedImageUrl ? "IMAGE_GENERATED" : generatedPrompt ? "PROMPT_GENERATED" : "DRAFT"
        });
        setSavedNftId(nft.id);
    };
    return (_jsxs("div", { className: "stack", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Creation flow" }), _jsx("h1", { children: "NFT Studio" })] }), savedNftId ? (_jsx(Link, { to: `/nfts/${savedNftId}`, className: "secondary-button", children: "Open saved NFT" })) : null] }), _jsxs("div", { className: "grid studio-grid", children: [_jsx(Card, { children: _jsxs("div", { className: "stack compact", children: [_jsx(FormField, { label: "Collection", children: _jsxs("select", { value: form.collectionId, onChange: (event) => setForm((current) => ({ ...current, collectionId: event.target.value })), children: [_jsx("option", { value: "", children: "Standalone NFT" }), collections.map((collection) => (_jsx("option", { value: collection.id, children: collection.name }, collection.id)))] }) }), _jsx(FormField, { label: "Prompt template", children: _jsxs("select", { value: form.templateId, onChange: (event) => setForm((current) => ({ ...current, templateId: event.target.value })), children: [_jsx("option", { value: "", children: "No template" }), templates.map((template) => (_jsx("option", { value: template.id, children: template.title }, template.id)))] }) }), _jsx(FormField, { label: "AI provider", children: _jsxs("select", { value: form.provider, onChange: (event) => setForm((current) => {
                                            const provider = event.target.value;
                                            return {
                                                ...current,
                                                provider,
                                                model: provider === "gemini"
                                                    ? user?.promptProfile?.preferredGeminiModel || providerModels.gemini[0]
                                                    : user?.promptProfile?.preferredOpenAiModel || providerModels.openai[0]
                                            };
                                        }), children: [_jsx("option", { value: "openai", children: "OpenAI" }), _jsx("option", { value: "gemini", children: "Gemini" })] }) }), _jsx(FormField, { label: "AI model", children: _jsx("select", { value: form.model, onChange: (event) => setForm((current) => ({ ...current, model: event.target.value })), children: modelOptions.map((model) => (_jsx("option", { value: model, children: model }, model))) }) }), _jsx(FormField, { label: "Image style", children: _jsx("input", { value: form.style, onChange: (event) => setForm((current) => ({ ...current, style: event.target.value })) }) }), _jsx(FormField, { label: "Main concept", children: _jsx("textarea", { value: form.customIdea, onChange: (event) => setForm((current) => ({ ...current, customIdea: event.target.value })) }) }), _jsx(FormField, { label: "Reference URLs", children: _jsx("textarea", { value: form.referenceUrls, onChange: (event) => setForm((current) => ({ ...current, referenceUrls: event.target.value })) }) }), _jsx(FormField, { label: "Sample image URL", children: _jsx("input", { type: "url", value: form.referenceImageUrl, onChange: (event) => setForm((current) => ({ ...current, referenceImageUrl: event.target.value })) }) }), _jsxs("div", { className: "resolution-grid", children: [_jsx(FormField, { label: "Width", children: _jsx("input", { type: "number", min: 256, max: 4096, value: form.outputWidth, onChange: (event) => setForm((current) => ({ ...current, outputWidth: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: "Height", children: _jsx("input", { type: "number", min: 256, max: 4096, value: form.outputHeight, onChange: (event) => setForm((current) => ({ ...current, outputHeight: Number(event.target.value) || 1024 })) }) })] }), _jsx("button", { type: "button", onClick: () => void generatePrompt(), children: "Generate prompt" }), _jsx(FormField, { label: "Enhanced prompt", children: _jsx("textarea", { value: generatedPrompt, onChange: (event) => setGeneratedPrompt(event.target.value) }) }), _jsx("button", { type: "button", className: "secondary-button", onClick: () => void generateImage(), children: "Generate image" })] }) }), _jsxs(Card, { children: [_jsx("div", { className: "preview-panel", children: generatedImageUrl ? _jsx("img", { src: generatedImageUrl, alt: "Generated NFT preview" }) : _jsx("p", { className: "muted", children: "No preview yet." }) }), _jsxs("div", { className: "stack compact", children: [_jsx(FormField, { label: "NFT name", children: _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })) }) }), _jsx(FormField, { label: "Description", children: _jsx("textarea", { value: form.description, onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })) }) }), _jsx(FormField, { label: "Rarity notes", children: _jsx("input", { value: form.rarityNotes, onChange: (event) => setForm((current) => ({ ...current, rarityNotes: event.target.value })) }) }), _jsx(FormField, { label: "Metadata JSON", children: _jsx("textarea", { value: form.metadata, onChange: (event) => setForm((current) => ({ ...current, metadata: event.target.value })) }) }), _jsx("button", { type: "button", onClick: () => void saveDraft(), children: "Save NFT draft" })] })] })] })] }));
};
