import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
import { nftsService } from "../../services/nfts-service";
import { useAuth } from "../../store/auth-context";
import type { Collection, PromptTemplate } from "../../types/api";

const providerModels = {
  openai: ["gpt-image-1", "gpt-4.1-mini", "gpt-4o-mini"],
  gemini: ["gemini-2.5-flash-image-preview", "gemini-2.5-pro", "gemini-2.0-flash-preview-image-generation"]
} as const;

export const NftStudioPage = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [savedNftId, setSavedNftId] = useState("");
  const [form, setForm] = useState({
    collectionId: "",
    templateId: "",
    customIdea: "",
    provider: (user?.settings?.preferredAi?.toLowerCase() === "gemini" ? "gemini" : "openai") as "openai" | "gemini",
    model:
      user?.settings?.preferredAi?.toLowerCase() === "gemini"
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
      const preferredModel =
        preferredProvider === "gemini"
          ? user?.promptProfile?.preferredGeminiModel || providerModels.gemini[0]
          : user?.promptProfile?.preferredOpenAiModel || providerModels.openai[0];

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

  const modelOptions = Array.from(
    new Set([...(providerModels[form.provider] as readonly string[]), form.model].filter(Boolean))
  );

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

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Creation flow</p>
          <h1>NFT Studio</h1>
        </div>
        {savedNftId ? (
          <Link to={`/nfts/${savedNftId}`} className="secondary-button">
            Open saved NFT
          </Link>
        ) : null}
      </header>

      <div className="grid studio-grid">
        <Card>
          <div className="stack compact">
            <FormField label="Collection">
              <select
                value={form.collectionId}
                onChange={(event) => setForm((current) => ({ ...current, collectionId: event.target.value }))}
              >
                <option value="">Standalone NFT</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Prompt template">
              <select
                value={form.templateId}
                onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="AI provider">
              <select
                value={form.provider}
                onChange={(event) =>
                  setForm((current) => {
                    const provider = event.target.value as "openai" | "gemini";

                    return {
                      ...current,
                      provider,
                      model:
                        provider === "gemini"
                          ? user?.promptProfile?.preferredGeminiModel || providerModels.gemini[0]
                          : user?.promptProfile?.preferredOpenAiModel || providerModels.openai[0]
                    };
                  })
                }
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </FormField>
            <FormField label="AI model">
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
            <FormField label="Image style">
              <input
                value={form.style}
                onChange={(event) => setForm((current) => ({ ...current, style: event.target.value }))}
              />
            </FormField>
            <FormField label="Main concept">
              <textarea
                value={form.customIdea}
                onChange={(event) => setForm((current) => ({ ...current, customIdea: event.target.value }))}
              />
            </FormField>
            <FormField label="Reference URLs">
              <textarea
                value={form.referenceUrls}
                onChange={(event) => setForm((current) => ({ ...current, referenceUrls: event.target.value }))}
              />
            </FormField>
            <FormField label="Sample image URL">
              <input
                type="url"
                value={form.referenceImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, referenceImageUrl: event.target.value }))}
              />
            </FormField>
            <div className="resolution-grid">
              <FormField label="Width">
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
              <FormField label="Height">
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
            <button type="button" onClick={() => void generatePrompt()}>
              Generate prompt
            </button>
            <FormField label="Enhanced prompt">
              <textarea value={generatedPrompt} onChange={(event) => setGeneratedPrompt(event.target.value)} />
            </FormField>
            <button type="button" className="secondary-button" onClick={() => void generateImage()}>
              Generate image
            </button>
          </div>
        </Card>

        <Card>
          <div className="preview-panel">
            {generatedImageUrl ? <img src={generatedImageUrl} alt="Generated NFT preview" /> : <p className="muted">No preview yet.</p>}
          </div>
          <div className="stack compact">
            <FormField label="NFT name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>
            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </FormField>
            <FormField label="Rarity notes">
              <input
                value={form.rarityNotes}
                onChange={(event) => setForm((current) => ({ ...current, rarityNotes: event.target.value }))}
              />
            </FormField>
            <FormField label="Metadata JSON">
              <textarea value={form.metadata} onChange={(event) => setForm((current) => ({ ...current, metadata: event.target.value }))} />
            </FormField>
            <button type="button" onClick={() => void saveDraft()}>
              Save NFT draft
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
