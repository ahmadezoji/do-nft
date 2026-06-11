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
import type { Collection, Nft, PromptTemplate } from "../../types/api";

const providerModels = {
  openai: ["gpt-image-2", "gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini"],
  gemini: ["gemini-2.5-flash-image-preview", "gemini-2.5-pro", "gemini-2.0-flash-preview-image-generation"]
} as const;

const resolveModel = (provider: keyof typeof providerModels, preferredModel?: string | null) => {
  const models = providerModels[provider] as readonly string[];

  return preferredModel && models.includes(preferredModel) ? preferredModel : models[0];
};

export const NftStudioPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [historyNfts, setHistoryNfts] = useState<Nft[]>([]);
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { success, error, warning } = useAlerts();
  const [form, setForm] = useState({
    collectionId: "",
    templateId: "",
    customIdea: "",
    provider: (user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai") as "openai" | "gemini",
    model: resolveModel(
      user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai",
      user?.settings?.preferredAi?.toLowerCase() === "gemini"
        ? user?.promptProfile?.preferredGeminiModel
        : user?.promptProfile?.preferredOpenAiModel
    ),
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
      const preferredModel = resolveModel(
        preferredProvider,
        preferredProvider === "gemini"
          ? user?.promptProfile?.preferredGeminiModel
          : user?.promptProfile?.preferredOpenAiModel
      );

      return {
        ...current,
        provider: preferredProvider,
        model: preferredModel,
        referenceUrls:
          current.referenceUrls || (user?.promptProfile?.sampleReferenceUrls ?? []).join(", "),
        outputWidth: current.outputWidth || user?.settings?.defaultImageWidth || 1024,
        outputHeight: current.outputHeight || user?.settings?.defaultImageHeight || 1024
      };
    });
  }, [user]);

  const modelOptions = providerModels[form.provider] as readonly string[];

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

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
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    void Promise.all([collectionsService.list(), nftsService.templates(), loadHistory()]).then(
      ([collectionData, templateData]) => {
        setCollections(collectionData);
        setTemplates(templateData);
      }
    );
  }, []);

  const loadNftToStudio = (nft: Nft) => {
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
    } catch {
      return { traits: [] };
    }
  };

  const persistStudioDraft = async (overrides?: Partial<Nft>) => {
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
      status:
        overrides?.status ??
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
      } catch (persistError) {
        warning(getErrorMessage(persistError, t("somethingWentWrong")));
      }
      success(t("promptReady"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
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
          aiModel: result.model ?? form.model,
          status: "IMAGE_GENERATED"
        });
      } catch (persistError) {
        warning(getErrorMessage(persistError, t("somethingWentWrong")));
      }
      success(t("imageReady"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);

    try {
      await persistStudioDraft();
      success(t("draftSaved"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
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

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t("creationFlow")}</p>
          <h1>{t("nftStudio")}</h1>
        </div>
        {savedNftId ? (
          <Link to={`/nfts/${savedNftId}`} className="secondary-button">
            {t("openSavedNft")}
          </Link>
        ) : null}
      </header>

      <div className="grid studio-grid">
        <Card>
          <div className="stack compact">
            <FormField label={t("collection")}>
              <select
                value={form.collectionId}
                onChange={(event) => setForm((current) => ({ ...current, collectionId: event.target.value }))}
              >
                <option value="">{t("standaloneNft")}</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("promptTemplate")}>
              <select
                value={form.templateId}
                onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}
              >
                <option value="">{t("noTemplate")}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("aiProvider")}>
              <select
                value={form.provider}
                onChange={(event) =>
                  setForm((current) => {
                    const provider = event.target.value as "openai" | "gemini";

                    return {
                      ...current,
                      provider,
                      model: resolveModel(
                        provider,
                        provider === "gemini"
                          ? user?.promptProfile?.preferredGeminiModel
                          : user?.promptProfile?.preferredOpenAiModel
                      )
                    };
                  })
                }
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </FormField>
            <FormField label={t("aiModel")}>
              <select
                value={form.model}
                onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("imageStyle")}>
              <input
                value={form.style}
                onChange={(event) => setForm((current) => ({ ...current, style: event.target.value }))}
              />
            </FormField>
            <FormField label={t("mainConcept")}>
              <div className="speech-field">
                <textarea
                  value={form.customIdea}
                  onChange={(event) => setForm((current) => ({ ...current, customIdea: event.target.value }))}
                />
                <div className="speech-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={toggleSpeechInput}
                    disabled={!speechSupported}
                  >
                    {isListening ? t("stopRecording") : t("voiceInput")}
                  </button>
                  <span className="muted">
                    {!speechSupported ? t("speechUnsupported") : isListening ? t("listening") : ""}
                  </span>
                </div>
              </div>
            </FormField>
            <FormField label={t("referenceUrls")}>
              <textarea
                value={form.referenceUrls}
                onChange={(event) => setForm((current) => ({ ...current, referenceUrls: event.target.value }))}
              />
            </FormField>
            <FormField label={t("sampleImageUrl")}>
              <input
                type="url"
                value={form.referenceImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, referenceImageUrl: event.target.value }))}
              />
            </FormField>
            <div className="resolution-grid">
              <FormField label={t("width")}>
                <input
                  type="number"
                  min={256}
                  max={4096}
                  value={form.outputWidth}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, outputWidth: Number(event.target.value) || 1024 }))
                  }
                />
              </FormField>
              <FormField label={t("height")}>
                <input
                  type="number"
                  min={256}
                  max={4096}
                  value={form.outputHeight}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, outputHeight: Number(event.target.value) || 1024 }))
                  }
                />
              </FormField>
            </div>
            <button type="button" onClick={() => void generatePrompt()} disabled={isGeneratingPrompt || isGeneratingImage || isSavingDraft}>
              <span className="button-label">
                {isGeneratingPrompt ? <LoadingSpinner size="sm" /> : null}
                {isGeneratingPrompt ? t("generatingPrompt") : t("generatePrompt")}
              </span>
            </button>
            <FormField label={t("enhancedPrompt")}>
              <textarea value={generatedPrompt} onChange={(event) => setGeneratedPrompt(event.target.value)} />
            </FormField>
            <button
              type="button"
              className="secondary-button"
              onClick={() => void generateImage()}
              disabled={isGeneratingPrompt || isGeneratingImage || isSavingDraft}
            >
              <span className="button-label">
                {isGeneratingImage ? <LoadingSpinner size="sm" /> : null}
                {isGeneratingImage ? t("generatingImage") : t("generateImage")}
              </span>
            </button>
          </div>
        </Card>

        <Card>
          <div className={`preview-panel${isGeneratingImage || isPreviewLoading ? " is-loading" : ""}`}>
            {generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated NFT preview"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => setIsPreviewLoading(false)}
              />
            ) : (
              <p className="muted">{t("noPreviewYet")}</p>
            )}
            {isGeneratingImage || isPreviewLoading ? (
              <div className="preview-overlay">
                <div className="preview-loading">
                  <LoadingSpinner size="lg" />
                  <span className="muted">{isGeneratingImage ? t("generatingImage") : t("loading")}</span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="stack compact">
            <FormField label={t("nftName")}>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>
            <FormField label={t("description")}>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </FormField>
            <FormField label={t("rarityNotes")}>
              <input
                value={form.rarityNotes}
                onChange={(event) => setForm((current) => ({ ...current, rarityNotes: event.target.value }))}
              />
            </FormField>
            <FormField label={t("metadataJson")}>
              <textarea value={form.metadata} onChange={(event) => setForm((current) => ({ ...current, metadata: event.target.value }))} />
            </FormField>
            <button type="button" onClick={() => void saveDraft()} disabled={isSavingDraft || isGeneratingPrompt || isGeneratingImage}>
              <span className="button-label">
                {isSavingDraft ? <LoadingSpinner size="sm" /> : null}
                {t("saveNftDraft")}
              </span>
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("history")}</p>
            <h3>{t("previousNfts")}</h3>
          </div>
        </div>
        <div className="stack compact">
          {isLoadingHistory ? (
            <div className="centered-inline">
              <LoadingSpinner />
            </div>
          ) : historyNfts.length ? (
            historyNfts.slice(0, 8).map((nft) => (
              <div key={nft.id} className="history-item">
                <div className="history-item-media">
                  {nft.imageUrl ? <img src={nft.imageUrl} alt={nft.name} /> : <span className="muted">{nft.status}</span>}
                </div>
                <div className="history-item-copy">
                  <strong>{nft.name}</strong>
                  <span className="muted">{nft.collection?.name ?? t("standaloneNft")}</span>
                  <span className="muted">{nft.status}</span>
                </div>
                <div className="button-row">
                  <button type="button" className="secondary-button" onClick={() => loadNftToStudio(nft)}>
                    {t("loadToStudio")}
                  </button>
                  <Link to={`/nfts/${nft.id}`} className="secondary-button button-link">
                    {t("openDetails")}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">{t("noHistoryYet")}</p>
          )}
        </div>
      </Card>
    </div>
  );
};
