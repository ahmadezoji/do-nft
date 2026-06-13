import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
import { nftsService } from "../../services/nfts-service";
import { useAlerts } from "../../store/alert-context";
import { useAuth } from "../../store/auth-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
const providerModels = {
    openai: ["gpt-image-2", "gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini"],
    gemini: ["gemini-2.5-flash-image-preview", "gemini-2.5-pro", "gemini-2.0-flash-preview-image-generation"]
};
const resolveModel = (provider, preferredModel) => {
    const models = providerModels[provider];
    return preferredModel && models.includes(preferredModel) ? preferredModel : models[0];
};
export const NftStudioPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [collections, setCollections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [historyNfts, setHistoryNfts] = useState([]);
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [generatedImageUrl, setGeneratedImageUrl] = useState("");
    const [savedNftId, setSavedNftId] = useState("");
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const recognitionRef = useRef(null);
    const { success, error, warning } = useAlerts();
    const [form, setForm] = useState({
        collectionId: "",
        templateId: "",
        customIdea: "",
        provider: (user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai"),
        model: resolveModel(user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai", user?.settings?.preferredAi?.toLowerCase() === "gemini"
            ? user?.promptProfile?.preferredGeminiModel
            : user?.promptProfile?.preferredOpenAiModel),
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
            const preferredModel = resolveModel(preferredProvider, preferredProvider === "gemini"
                ? user?.promptProfile?.preferredGeminiModel
                : user?.promptProfile?.preferredOpenAiModel);
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
    const modelOptions = providerModels[form.provider];
    useEffect(() => {
        const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionCtor) {
            setSpeechSupported(false);
            return;
        }
        setSpeechSupported(true);
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = language === "fa" ? "fa-IR" : "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript ?? "")
                .join(" ")
                .trim();
            setForm((current) => ({
                ...current,
                customIdea: transcript
            }));
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.onerror = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
        return () => {
            recognition.stop();
            recognitionRef.current = null;
        };
    }, [language]);
    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            setHistoryNfts(await nftsService.list());
        }
        finally {
            setIsLoadingHistory(false);
        }
    };
    useEffect(() => {
        void Promise.all([collectionsService.list(), nftsService.templates(), loadHistory()]).then(([collectionData, templateData]) => {
            setCollections(collectionData);
            setTemplates(templateData);
        });
    }, []);
    const loadNftToStudio = (nft) => {
        const provider = nft.aiProvider === "gemini" ? "gemini" : "openai";
        setSavedNftId(nft.id);
        setGeneratedPrompt(nft.prompt ?? "");
        setGeneratedImageUrl(nft.imageUrl ?? "");
        setIsPreviewLoading(Boolean(nft.imageUrl));
        setForm({
            collectionId: nft.collection?.id ?? "",
            templateId: nft.template?.id ?? "",
            customIdea: nft.customIdea ?? "",
            provider,
            model: resolveModel(provider, nft.aiModel),
            style: nft.imageStyle ?? "Premium editorial sci-fi",
            referenceUrls: (nft.referenceUrls ?? []).join(", "),
            referenceImageUrl: nft.referenceImageUrl ?? "",
            outputWidth: nft.outputWidth ?? user?.settings?.defaultImageWidth ?? 1024,
            outputHeight: nft.outputHeight ?? user?.settings?.defaultImageHeight ?? 1024,
            name: nft.name,
            description: nft.description ?? "",
            rarityNotes: nft.rarityNotes ?? "",
            metadata: JSON.stringify(nft.metadata ?? { traits: [] }, null, 2)
        });
    };
    const parseMetadata = () => {
        try {
            return JSON.parse(form.metadata);
        }
        catch {
            return { traits: [] };
        }
    };
    const persistStudioDraft = async (overrides) => {
        const payload = {
            collectionId: form.collectionId || undefined,
            templateId: form.templateId || undefined,
            name: form.name || "Untitled NFT",
            description: form.description,
            customIdea: form.customIdea,
            prompt: overrides?.prompt ?? generatedPrompt,
            imageUrl: overrides?.imageUrl ?? generatedImageUrl,
            rarityNotes: form.rarityNotes,
            metadata: parseMetadata(),
            aiProvider: form.provider,
            aiModel: overrides?.aiModel ?? form.model,
            imageStyle: form.style,
            referenceUrls: form.referenceUrls
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            referenceImageUrl: form.referenceImageUrl || undefined,
            outputWidth: form.outputWidth,
            outputHeight: form.outputHeight,
            ipfsImageCid: overrides?.ipfsImageCid ?? undefined,
            status: overrides?.status ??
                ((overrides?.imageUrl ?? generatedImageUrl)
                    ? "IMAGE_GENERATED"
                    : (overrides?.prompt ?? generatedPrompt)
                        ? "PROMPT_GENERATED"
                        : "DRAFT")
        };
        const nft = savedNftId
            ? await nftsService.update(savedNftId, payload)
            : await nftsService.create(payload);
        setSavedNftId(nft.id);
        setHistoryNfts((current) => [nft, ...current.filter((item) => item.id !== nft.id)]);
        return nft;
    };
    const generatePrompt = async () => {
        setIsGeneratingPrompt(true);
        try {
            const referenceImageUrl = form.referenceImageUrl.trim();
            const result = await nftsService.generatePrompt({
                collectionId: form.collectionId,
                templateId: form.templateId,
                customIdea: form.customIdea,
                targetLanguage: language,
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
            try {
                await persistStudioDraft({
                    prompt: result.prompt,
                    aiModel: result.model ?? form.model,
                    status: "PROMPT_GENERATED"
                });
            }
            catch (persistError) {
                warning(getErrorMessage(persistError, t("somethingWentWrong")));
            }
            success(t("promptReady"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsGeneratingPrompt(false);
        }
    };
    const generateImage = async () => {
        if (!generatedPrompt.trim()) {
            warning(t("promptRequired"));
            return;
        }
        setIsGeneratingImage(true);
        try {
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
            setIsPreviewLoading(true);
            setGeneratedImageUrl(result.imageUrl);
            setForm((current) => ({
                ...current,
                model: result.model ?? current.model
            }));
            try {
                await persistStudioDraft({
                    prompt: generatedPrompt,
                    imageUrl: result.imageUrl,
                    ipfsImageCid: result.ipfsImageCid ?? undefined,
                    aiModel: result.model ?? form.model,
                    status: "IMAGE_GENERATED"
                });
            }
            catch (persistError) {
                warning(getErrorMessage(persistError, t("somethingWentWrong")));
            }
            if (!result.storedOnIpfs) {
                warning(t("imageStoredLocallyOnly"));
            }
            success(t("imageReady"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsGeneratingImage(false);
        }
    };
    const saveDraft = async () => {
        setIsSavingDraft(true);
        try {
            await persistStudioDraft();
            success(t("draftSaved"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsSavingDraft(false);
        }
    };
    const toggleSpeechInput = () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            return;
        }
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }
        recognition.lang = language === "fa" ? "fa-IR" : "en-US";
        recognition.start();
        setIsListening(true);
    };
    return (_jsxs("div", { className: "stack", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t("creationFlow") }), _jsx("h1", { children: t("nftStudio") })] }), savedNftId ? (_jsx(Link, { to: `/nfts/${savedNftId}`, className: "secondary-button", children: t("openSavedNft") })) : null] }), _jsxs("div", { className: "grid studio-grid", children: [_jsx(Card, { children: _jsxs("div", { className: "stack compact", children: [_jsx(FormField, { label: t("collection"), children: _jsxs("select", { value: form.collectionId, onChange: (event) => setForm((current) => ({ ...current, collectionId: event.target.value })), children: [_jsx("option", { value: "", children: t("standaloneNft") }), collections.map((collection) => (_jsx("option", { value: collection.id, children: collection.name }, collection.id)))] }) }), _jsx(FormField, { label: t("promptTemplate"), children: _jsxs("select", { value: form.templateId, onChange: (event) => setForm((current) => ({ ...current, templateId: event.target.value })), children: [_jsx("option", { value: "", children: t("noTemplate") }), templates.map((template) => (_jsx("option", { value: template.id, children: template.title }, template.id)))] }) }), _jsx(FormField, { label: t("aiProvider"), children: _jsxs("select", { value: form.provider, onChange: (event) => setForm((current) => {
                                            const provider = event.target.value;
                                            return {
                                                ...current,
                                                provider,
                                                model: resolveModel(provider, provider === "gemini"
                                                    ? user?.promptProfile?.preferredGeminiModel
                                                    : user?.promptProfile?.preferredOpenAiModel)
                                            };
                                        }), children: [_jsx("option", { value: "openai", children: "OpenAI" }), _jsx("option", { value: "gemini", children: "Gemini" })] }) }), _jsx(FormField, { label: t("aiModel"), children: _jsx("select", { value: form.model, onChange: (event) => setForm((current) => ({ ...current, model: event.target.value })), children: modelOptions.map((model) => (_jsx("option", { value: model, children: model }, model))) }) }), _jsx(FormField, { label: t("imageStyle"), children: _jsx("input", { value: form.style, onChange: (event) => setForm((current) => ({ ...current, style: event.target.value })) }) }), _jsx(FormField, { label: t("mainConcept"), children: _jsxs("div", { className: "speech-field", children: [_jsx("textarea", { value: form.customIdea, onChange: (event) => setForm((current) => ({ ...current, customIdea: event.target.value })) }), _jsxs("div", { className: "speech-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: toggleSpeechInput, disabled: !speechSupported, children: isListening ? t("stopRecording") : t("voiceInput") }), _jsx("span", { className: "muted", children: !speechSupported ? t("speechUnsupported") : isListening ? t("listening") : "" })] })] }) }), _jsx(FormField, { label: t("referenceUrls"), children: _jsx("textarea", { value: form.referenceUrls, onChange: (event) => setForm((current) => ({ ...current, referenceUrls: event.target.value })) }) }), _jsx(FormField, { label: t("sampleImageUrl"), children: _jsx("input", { type: "url", value: form.referenceImageUrl, onChange: (event) => setForm((current) => ({ ...current, referenceImageUrl: event.target.value })) }) }), _jsxs("div", { className: "resolution-grid", children: [_jsx(FormField, { label: t("width"), children: _jsx("input", { type: "number", min: 256, max: 4096, value: form.outputWidth, onChange: (event) => setForm((current) => ({ ...current, outputWidth: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: t("height"), children: _jsx("input", { type: "number", min: 256, max: 4096, value: form.outputHeight, onChange: (event) => setForm((current) => ({ ...current, outputHeight: Number(event.target.value) || 1024 })) }) })] }), _jsx("button", { type: "button", onClick: () => void generatePrompt(), disabled: isGeneratingPrompt || isGeneratingImage || isSavingDraft, children: _jsxs("span", { className: "button-label", children: [isGeneratingPrompt ? _jsx(LoadingSpinner, { size: "sm" }) : null, isGeneratingPrompt ? t("generatingPrompt") : t("generatePrompt")] }) }), _jsx(FormField, { label: t("enhancedPrompt"), children: _jsx("textarea", { value: generatedPrompt, onChange: (event) => setGeneratedPrompt(event.target.value) }) }), _jsx("button", { type: "button", className: "secondary-button", onClick: () => void generateImage(), disabled: isGeneratingPrompt || isGeneratingImage || isSavingDraft, children: _jsxs("span", { className: "button-label", children: [isGeneratingImage ? _jsx(LoadingSpinner, { size: "sm" }) : null, isGeneratingImage ? t("generatingImage") : t("generateImage")] }) })] }) }), _jsxs(Card, { children: [_jsxs("div", { className: `preview-panel${isGeneratingImage || isPreviewLoading ? " is-loading" : ""}`, children: [generatedImageUrl ? (_jsx("img", { src: generatedImageUrl, alt: "Generated NFT preview", onLoad: () => setIsPreviewLoading(false), onError: () => setIsPreviewLoading(false) })) : (_jsx("p", { className: "muted", children: t("noPreviewYet") })), isGeneratingImage || isPreviewLoading ? (_jsx("div", { className: "preview-overlay", children: _jsxs("div", { className: "preview-loading", children: [_jsx(LoadingSpinner, { size: "lg" }), _jsx("span", { className: "muted", children: isGeneratingImage ? t("generatingImage") : t("loading") })] }) })) : null] }), _jsxs("div", { className: "stack compact", children: [_jsx(FormField, { label: t("nftName"), children: _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })) }) }), _jsx(FormField, { label: t("description"), children: _jsx("textarea", { value: form.description, onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })) }) }), _jsx(FormField, { label: t("rarityNotes"), children: _jsx("input", { value: form.rarityNotes, onChange: (event) => setForm((current) => ({ ...current, rarityNotes: event.target.value })) }) }), _jsx(FormField, { label: t("metadataJson"), children: _jsx("textarea", { value: form.metadata, onChange: (event) => setForm((current) => ({ ...current, metadata: event.target.value })) }) }), _jsx("button", { type: "button", onClick: () => void saveDraft(), disabled: isSavingDraft || isGeneratingPrompt || isGeneratingImage, children: _jsxs("span", { className: "button-label", children: [isSavingDraft ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("saveNftDraft")] }) })] })] })] }), _jsxs(Card, { children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t("history") }), _jsx("h3", { children: t("previousNfts") })] }) }), _jsx("div", { className: "stack compact", children: isLoadingHistory ? (_jsx("div", { className: "centered-inline", children: _jsx(LoadingSpinner, {}) })) : historyNfts.length ? (historyNfts.slice(0, 8).map((nft) => (_jsxs("div", { className: "history-item", children: [_jsx("div", { className: "history-item-media", children: nft.imageUrl ? _jsx("img", { src: nft.imageUrl, alt: nft.name }) : _jsx("span", { className: "muted", children: nft.status }) }), _jsxs("div", { className: "history-item-copy", children: [_jsx("strong", { children: nft.name }), _jsx("span", { className: "muted", children: nft.collection?.name ?? t("standaloneNft") }), _jsx("span", { className: "muted", children: nft.status })] }), _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => loadNftToStudio(nft), children: t("loadToStudio") }), _jsx(Link, { to: `/nfts/${nft.id}`, className: "secondary-button button-link", children: t("openDetails") })] })] }, nft.id)))) : (_jsx("p", { className: "muted", children: t("noHistoryYet") })) })] })] }));
};
