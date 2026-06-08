import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { credentialsService } from "../../services/credentials-service";
import { usersService } from "../../services/users-service";
import { useAuth } from "../../store/auth-context";
import type { CredentialStatus } from "../../types/api";

const credentialConfigs = {
  OPENAI: {
    title: "OpenAI",
    description: "Used for prompt and image generation with your OpenAI account.",
    label: "openai credentials",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "sk-...",
        type: "password",
        required: true
      }
    ]
  },
  GEMINI: {
    title: "Gemini",
    description: "Use your Google Gemini API key for text and image generation flows.",
    label: "gemini credentials",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "AIza...",
        type: "password",
        required: true
      }
    ]
  },
  OPENSEA: {
    title: "OpenSea",
    description: "Use your OpenSea developer API key for marketplace data and future listing actions.",
    label: "opensea credentials",
    fields: [
      {
        key: "apiKey",
        label: "API key",
        placeholder: "OpenSea API key",
        type: "password",
        required: true
      }
    ]
  },
  IPFS: {
    title: "IPFS",
    description: "Configured for a Pinata-style flow: provider name, JWT, and optional dedicated gateway.",
    label: "ipfs credentials",
    fields: [
      {
        key: "provider",
        label: "Provider",
        placeholder: "Pinata",
        type: "text",
        required: true
      },
      {
        key: "jwt",
        label: "JWT / API token",
        placeholder: "Pinata JWT",
        type: "password",
        required: true
      },
      {
        key: "gatewayUrl",
        label: "Gateway URL",
        placeholder: "https://your-gateway.mypinata.cloud",
        type: "url",
        required: false
      }
    ]
  },
  TWITTER: {
    title: "X / Twitter",
    description:
      "For real posting flows, use OAuth 1.0a user credentials. Bearer token alone is not enough for write actions.",
    label: "x credentials",
    fields: [
      {
        key: "apiKey",
        label: "API key / Consumer key",
        placeholder: "Consumer key",
        type: "password",
        required: true
      },
      {
        key: "apiSecret",
        label: "API secret / Consumer secret",
        placeholder: "Consumer secret",
        type: "password",
        required: true
      },
      {
        key: "accessToken",
        label: "Access token",
        placeholder: "User access token",
        type: "password",
        required: true
      },
      {
        key: "accessTokenSecret",
        label: "Access token secret",
        placeholder: "User access token secret",
        type: "password",
        required: true
      },
      {
        key: "bearerToken",
        label: "Bearer token",
        placeholder: "Optional app bearer token",
        type: "password",
        required: false
      }
    ]
  },
  DISCORD: {
    title: "Discord",
    description: "Webhook URL is the simplest way to send promotion posts to a Discord channel.",
    label: "discord credentials",
    fields: [
      {
        key: "webhookUrl",
        label: "Webhook URL",
        placeholder: "https://discord.com/api/webhooks/...",
        type: "password",
        required: true
      }
    ]
  }
} as const;

type ProviderKey = keyof typeof credentialConfigs;
type ProviderDrafts = Record<ProviderKey, Record<string, string>>;

const buildInitialDrafts = (): ProviderDrafts =>
  Object.fromEntries(
    Object.entries(credentialConfigs).map(([provider, config]) => [
      provider,
      Object.fromEntries(config.fields.map((field) => [field.key, provider === "IPFS" && field.key === "provider" ? "Pinata" : ""]))
    ])
  ) as ProviderDrafts;

export const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [credentials, setCredentials] = useState<CredentialStatus[]>([]);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.profile?.fullName ?? "",
    artistName: user?.profile?.artistName ?? "",
    bio: user?.profile?.bio ?? "",
    websiteUrl: user?.profile?.websiteUrl ?? "",
    preferredAi: user?.settings?.preferredAi ?? "",
    defaultChain: user?.settings?.defaultChain ?? "",
    timezone: user?.settings?.timezone ?? "",
    defaultImageWidth: user?.settings?.defaultImageWidth ?? 1024,
    defaultImageHeight: user?.settings?.defaultImageHeight ?? 1024,
    artworkStyle: user?.promptProfile?.artworkStyle ?? "",
    artVision: user?.promptProfile?.artVision ?? "",
    nftVision: user?.promptProfile?.nftVision ?? "",
    inspirationSources: user?.promptProfile?.inspirationSources ?? "",
    signatureMotifs: user?.promptProfile?.signatureMotifs ?? "",
    colorDirection: user?.promptProfile?.colorDirection ?? "",
    promptBase: user?.promptProfile?.promptBase ?? "",
    negativePromptBase: user?.promptProfile?.negativePromptBase ?? "",
    creativeRules: user?.promptProfile?.creativeRules ?? "",
    sampleReferenceUrls: (user?.promptProfile?.sampleReferenceUrls ?? []).join(", "),
    preferredAspectRatio: user?.promptProfile?.preferredAspectRatio ?? "1:1",
    preferredResolution: user?.promptProfile?.preferredResolution ?? "1024x1024",
    preferredOpenAiModel: user?.promptProfile?.preferredOpenAiModel ?? "gpt-image-1",
    preferredGeminiModel: user?.promptProfile?.preferredGeminiModel ?? "gemini-2.5-flash-image-preview"
  });
  const [credentialDrafts, setCredentialDrafts] = useState<ProviderDrafts>(buildInitialDrafts);

  const loadCredentials = async () => setCredentials(await credentialsService.list());

  useEffect(() => {
    void loadCredentials();
  }, []);

  useEffect(() => {
    setProfileForm({
      fullName: user?.profile?.fullName ?? "",
      artistName: user?.profile?.artistName ?? "",
      bio: user?.profile?.bio ?? "",
      websiteUrl: user?.profile?.websiteUrl ?? "",
      preferredAi: user?.settings?.preferredAi ?? "",
      defaultChain: user?.settings?.defaultChain ?? "",
      timezone: user?.settings?.timezone ?? "",
      defaultImageWidth: user?.settings?.defaultImageWidth ?? 1024,
      defaultImageHeight: user?.settings?.defaultImageHeight ?? 1024,
      artworkStyle: user?.promptProfile?.artworkStyle ?? "",
      artVision: user?.promptProfile?.artVision ?? "",
      nftVision: user?.promptProfile?.nftVision ?? "",
      inspirationSources: user?.promptProfile?.inspirationSources ?? "",
      signatureMotifs: user?.promptProfile?.signatureMotifs ?? "",
      colorDirection: user?.promptProfile?.colorDirection ?? "",
      promptBase: user?.promptProfile?.promptBase ?? "",
      negativePromptBase: user?.promptProfile?.negativePromptBase ?? "",
      creativeRules: user?.promptProfile?.creativeRules ?? "",
      sampleReferenceUrls: (user?.promptProfile?.sampleReferenceUrls ?? []).join(", "),
      preferredAspectRatio: user?.promptProfile?.preferredAspectRatio ?? "1:1",
      preferredResolution: user?.promptProfile?.preferredResolution ?? "1024x1024",
      preferredOpenAiModel: user?.promptProfile?.preferredOpenAiModel ?? "gpt-image-1",
      preferredGeminiModel: user?.promptProfile?.preferredGeminiModel ?? "gemini-2.5-flash-image-preview"
    });
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await usersService.updateSettings({
      ...profileForm,
      sampleReferenceUrls: profileForm.sampleReferenceUrls
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    });
    await refreshUser();
  };

  const updateCredentialField = (provider: ProviderKey, fieldKey: string, value: string) => {
    setCredentialDrafts((current) => ({
      ...current,
      [provider]: {
        ...current[provider],
        [fieldKey]: value
      }
    }));
  };

  const hasRequiredFields = (provider: ProviderKey) =>
    credentialConfigs[provider].fields
      .filter((field) => field.required)
      .every((field) => (credentialDrafts[provider][field.key] ?? "").trim().length > 0);

  const saveCredential = async (provider: ProviderKey) => {
    const values = credentialDrafts[provider];
    const hasAtLeastOneValue = Object.values(values).some((value) => value.trim().length > 0);

    if (!hasAtLeastOneValue) {
      return;
    }

    await credentialsService.upsert(provider, {
      values,
      label: credentialConfigs[provider].label
    });
    setCredentialDrafts((current) => ({
      ...current,
      [provider]: Object.fromEntries(
        credentialConfigs[provider].fields.map((field) => [
          field.key,
          provider === "IPFS" && field.key === "provider" ? current[provider][field.key] || "Pinata" : ""
        ])
      )
    }));
    await loadCredentials();
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Settings & Integrations</h1>
        </div>
      </header>

      <div className="grid split-grid">
        <Card>
          <h3>Profile settings</h3>
          <form className="stack compact" onSubmit={saveProfile}>
            <FormField label="Full name">
              <input
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </FormField>
            <FormField label="Artist name">
              <input
                value={profileForm.artistName}
                onChange={(event) => setProfileForm((current) => ({ ...current, artistName: event.target.value }))}
              />
            </FormField>
            <FormField label="Artist bio">
              <textarea
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </FormField>
            <FormField label="Website / portfolio">
              <input
                type="url"
                value={profileForm.websiteUrl}
                onChange={(event) => setProfileForm((current) => ({ ...current, websiteUrl: event.target.value }))}
              />
            </FormField>
            <FormField label="Preferred AI">
              <input
                value={profileForm.preferredAi}
                onChange={(event) => setProfileForm((current) => ({ ...current, preferredAi: event.target.value }))}
              />
            </FormField>
            <FormField label="Default chain">
              <input
                value={profileForm.defaultChain}
                onChange={(event) => setProfileForm((current) => ({ ...current, defaultChain: event.target.value }))}
              />
            </FormField>
            <FormField label="Timezone">
              <input
                value={profileForm.timezone}
                onChange={(event) => setProfileForm((current) => ({ ...current, timezone: event.target.value }))}
              />
            </FormField>
            <FormField label="Default image width">
              <input
                type="number"
                min={256}
                max={4096}
                value={profileForm.defaultImageWidth}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, defaultImageWidth: Number(event.target.value) || 1024 }))
                }
              />
            </FormField>
            <FormField label="Default image height">
              <input
                type="number"
                min={256}
                max={4096}
                value={profileForm.defaultImageHeight}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, defaultImageHeight: Number(event.target.value) || 1024 }))
                }
              />
            </FormField>
            <FormField label="Artwork style">
              <textarea
                value={profileForm.artworkStyle}
                onChange={(event) => setProfileForm((current) => ({ ...current, artworkStyle: event.target.value }))}
              />
            </FormField>
            <FormField label="Art vision">
              <textarea
                value={profileForm.artVision}
                onChange={(event) => setProfileForm((current) => ({ ...current, artVision: event.target.value }))}
              />
            </FormField>
            <FormField label="NFT vision">
              <textarea
                value={profileForm.nftVision}
                onChange={(event) => setProfileForm((current) => ({ ...current, nftVision: event.target.value }))}
              />
            </FormField>
            <FormField label="Inspiration sources">
              <textarea
                value={profileForm.inspirationSources}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, inspirationSources: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Signature motifs">
              <textarea
                value={profileForm.signatureMotifs}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, signatureMotifs: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Color direction">
              <textarea
                value={profileForm.colorDirection}
                onChange={(event) => setProfileForm((current) => ({ ...current, colorDirection: event.target.value }))}
              />
            </FormField>
            <FormField label="Smart prompt base">
              <textarea
                value={profileForm.promptBase}
                onChange={(event) => setProfileForm((current) => ({ ...current, promptBase: event.target.value }))}
              />
            </FormField>
            <FormField label="Negative prompt base">
              <textarea
                value={profileForm.negativePromptBase}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, negativePromptBase: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Creative rules">
              <textarea
                value={profileForm.creativeRules}
                onChange={(event) => setProfileForm((current) => ({ ...current, creativeRules: event.target.value }))}
              />
            </FormField>
            <FormField label="Sample reference URLs">
              <textarea
                value={profileForm.sampleReferenceUrls}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, sampleReferenceUrls: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Preferred aspect ratio">
              <input
                value={profileForm.preferredAspectRatio}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, preferredAspectRatio: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Preferred resolution">
              <input
                value={profileForm.preferredResolution}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, preferredResolution: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Preferred OpenAI model">
              <input
                value={profileForm.preferredOpenAiModel}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, preferredOpenAiModel: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Preferred Gemini model">
              <input
                value={profileForm.preferredGeminiModel}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, preferredGeminiModel: event.target.value }))
                }
              />
            </FormField>
            <button type="submit">Save settings</button>
          </form>
        </Card>

        <Card>
          <h3>Integrations</h3>
          <div className="stack compact">
            {(Object.keys(credentialConfigs) as ProviderKey[]).map((provider) => {
              const existing = credentials.find((item) => item.provider === provider);
              const config = credentialConfigs[provider];

              return (
                <div key={provider} className="provider-credential-card">
                  <div className="provider-credential-header">
                    <div>
                      <strong>{config.title}</strong>
                      <p className="muted">{config.description}</p>
                    </div>
                    <div className="provider-status">
                      <span>{existing?.configured ? "Configured" : "Not configured"}</span>
                      {existing?.configuredFields.length ? (
                        <span className="muted">{existing.configuredFields.length} field(s) saved</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="provider-credential-fields">
                    {config.fields.map((field) => (
                      <FormField key={`${provider}-${field.key}`} label={field.label}>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={credentialDrafts[provider][field.key] ?? ""}
                          onChange={(event) => updateCredentialField(provider, field.key, event.target.value)}
                          required={field.required}
                        />
                      </FormField>
                    ))}
                  </div>
                  <div className="provider-credential-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void saveCredential(provider)}
                      disabled={!hasRequiredFields(provider)}
                    >
                      Save {config.title}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
