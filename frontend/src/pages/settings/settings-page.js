import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { credentialsService } from "../../services/credentials-service";
import { usersService } from "../../services/users-service";
import { useAlerts } from "../../store/alert-context";
import { useAuth } from "../../store/auth-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
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
        description: "Not required for Polygon publishing. OpenSea automatically indexes NFTs after on-chain minting.",
        label: "opensea credentials",
        fields: [
            {
                key: "apiKey",
                label: "API key",
                placeholder: "OpenSea API key",
                type: "password",
                required: true
            },
            {
                key: "chain",
                label: "Default chain",
                placeholder: "ethereum",
                type: "text",
                required: false
            },
            {
                key: "rpcUrl",
                label: "RPC URL",
                placeholder: "https://mainnet.infura.io/v3/...",
                type: "url",
                required: false
            },
            {
                key: "walletPrivateKey",
                label: "Seller wallet private key",
                placeholder: "0x...",
                type: "password",
                required: false
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
        description: "For real posting flows, use OAuth 1.0a user credentials. Bearer token alone is not enough for write actions.",
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
};
const buildInitialDrafts = () => Object.fromEntries(Object.entries(credentialConfigs).map(([provider, config]) => [
    provider,
    Object.fromEntries(config.fields.map((field) => [field.key, provider === "IPFS" && field.key === "provider" ? "Pinata" : ""]))
]));
export const SettingsPage = () => {
    const { user, refreshUser } = useAuth();
    const { t, language } = useLanguage();
    const { success, error } = useAlerts();
    const [credentials, setCredentials] = useState([]);
    const [profileForm, setProfileForm] = useState({
        fullName: user?.profile?.fullName ?? "",
        artistName: user?.profile?.artistName ?? "",
        bio: user?.profile?.bio ?? "",
        websiteUrl: user?.profile?.websiteUrl ?? "",
        preferredAi: user?.settings?.preferredAi ?? "",
        preferredLanguage: user?.settings?.preferredLanguage ?? language,
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
        preferredOpenAiModel: user?.promptProfile?.preferredOpenAiModel ?? "gpt-image-2",
        preferredGeminiModel: user?.promptProfile?.preferredGeminiModel ?? "gemini-2.5-flash-image-preview"
    });
    const [credentialDrafts, setCredentialDrafts] = useState(buildInitialDrafts);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [savingCredentialProvider, setSavingCredentialProvider] = useState(null);
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
            preferredLanguage: user?.settings?.preferredLanguage ?? language,
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
            preferredOpenAiModel: user?.promptProfile?.preferredOpenAiModel ?? "gpt-image-2",
            preferredGeminiModel: user?.promptProfile?.preferredGeminiModel ?? "gemini-2.5-flash-image-preview"
        });
    }, [user]);
    const saveProfile = async (event) => {
        event.preventDefault();
        setIsSavingProfile(true);
        try {
            await usersService.updateSettings({
                ...profileForm,
                sampleReferenceUrls: profileForm.sampleReferenceUrls
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            });
            await refreshUser();
            success(t("settingsSaved"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsSavingProfile(false);
        }
    };
    const updateCredentialField = (provider, fieldKey, value) => {
        setCredentialDrafts((current) => ({
            ...current,
            [provider]: {
                ...current[provider],
                [fieldKey]: value
            }
        }));
    };
    const hasRequiredFields = (provider) => credentialConfigs[provider].fields
        .filter((field) => field.required)
        .every((field) => (credentialDrafts[provider][field.key] ?? "").trim().length > 0);
    const saveCredential = async (provider) => {
        const values = credentialDrafts[provider];
        const hasAtLeastOneValue = Object.values(values).some((value) => value.trim().length > 0);
        if (!hasAtLeastOneValue) {
            return;
        }
        setSavingCredentialProvider(provider);
        try {
            await credentialsService.upsert(provider, {
                values,
                label: credentialConfigs[provider].label
            });
            setCredentialDrafts((current) => ({
                ...current,
                [provider]: Object.fromEntries(credentialConfigs[provider].fields.map((field) => [
                    field.key,
                    provider === "IPFS" && field.key === "provider" ? current[provider][field.key] || "Pinata" : ""
                ]))
            }));
            await loadCredentials();
            success(t("credentialSaved"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setSavingCredentialProvider(null);
        }
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t("account") }), _jsx("h1", { children: t("settingsAndIntegrations") })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: t("profileSettings") }), _jsxs("form", { className: "stack compact", onSubmit: saveProfile, children: [_jsx(FormField, { label: t("fullName"), children: _jsx("input", { value: profileForm.fullName, onChange: (event) => setProfileForm((current) => ({ ...current, fullName: event.target.value })) }) }), _jsx(FormField, { label: t("artistName"), children: _jsx("input", { value: profileForm.artistName, onChange: (event) => setProfileForm((current) => ({ ...current, artistName: event.target.value })) }) }), _jsx(FormField, { label: t("artistBio"), children: _jsx("textarea", { value: profileForm.bio, onChange: (event) => setProfileForm((current) => ({ ...current, bio: event.target.value })) }) }), _jsx(FormField, { label: t("websitePortfolio"), children: _jsx("input", { type: "url", value: profileForm.websiteUrl, onChange: (event) => setProfileForm((current) => ({ ...current, websiteUrl: event.target.value })) }) }), _jsx(FormField, { label: t("preferredAi"), children: _jsx("input", { value: profileForm.preferredAi, onChange: (event) => setProfileForm((current) => ({ ...current, preferredAi: event.target.value })) }) }), _jsx(FormField, { label: t("preferredLanguage"), children: _jsxs("select", { value: profileForm.preferredLanguage, onChange: (event) => setProfileForm((current) => ({ ...current, preferredLanguage: event.target.value })), children: [_jsx("option", { value: "en", children: t("english") }), _jsx("option", { value: "fa", children: t("persian") })] }) }), _jsx(FormField, { label: t("defaultChain"), children: _jsx("input", { value: profileForm.defaultChain, onChange: (event) => setProfileForm((current) => ({ ...current, defaultChain: event.target.value })) }) }), _jsx(FormField, { label: t("timezone"), children: _jsx("input", { value: profileForm.timezone, onChange: (event) => setProfileForm((current) => ({ ...current, timezone: event.target.value })) }) }), _jsx(FormField, { label: t("defaultImageWidth"), children: _jsx("input", { type: "number", min: 256, max: 4096, value: profileForm.defaultImageWidth, onChange: (event) => setProfileForm((current) => ({ ...current, defaultImageWidth: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: t("defaultImageHeight"), children: _jsx("input", { type: "number", min: 256, max: 4096, value: profileForm.defaultImageHeight, onChange: (event) => setProfileForm((current) => ({ ...current, defaultImageHeight: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: t("artworkStyle"), children: _jsx("textarea", { value: profileForm.artworkStyle, onChange: (event) => setProfileForm((current) => ({ ...current, artworkStyle: event.target.value })) }) }), _jsx(FormField, { label: t("artVision"), children: _jsx("textarea", { value: profileForm.artVision, onChange: (event) => setProfileForm((current) => ({ ...current, artVision: event.target.value })) }) }), _jsx(FormField, { label: t("nftVision"), children: _jsx("textarea", { value: profileForm.nftVision, onChange: (event) => setProfileForm((current) => ({ ...current, nftVision: event.target.value })) }) }), _jsx(FormField, { label: t("inspirationSources"), children: _jsx("textarea", { value: profileForm.inspirationSources, onChange: (event) => setProfileForm((current) => ({ ...current, inspirationSources: event.target.value })) }) }), _jsx(FormField, { label: t("signatureMotifs"), children: _jsx("textarea", { value: profileForm.signatureMotifs, onChange: (event) => setProfileForm((current) => ({ ...current, signatureMotifs: event.target.value })) }) }), _jsx(FormField, { label: t("colorDirection"), children: _jsx("textarea", { value: profileForm.colorDirection, onChange: (event) => setProfileForm((current) => ({ ...current, colorDirection: event.target.value })) }) }), _jsx(FormField, { label: t("smartPromptBase"), children: _jsx("textarea", { value: profileForm.promptBase, onChange: (event) => setProfileForm((current) => ({ ...current, promptBase: event.target.value })) }) }), _jsx(FormField, { label: t("negativePromptBase"), children: _jsx("textarea", { value: profileForm.negativePromptBase, onChange: (event) => setProfileForm((current) => ({ ...current, negativePromptBase: event.target.value })) }) }), _jsx(FormField, { label: t("creativeRules"), children: _jsx("textarea", { value: profileForm.creativeRules, onChange: (event) => setProfileForm((current) => ({ ...current, creativeRules: event.target.value })) }) }), _jsx(FormField, { label: t("sampleReferenceUrls"), children: _jsx("textarea", { value: profileForm.sampleReferenceUrls, onChange: (event) => setProfileForm((current) => ({ ...current, sampleReferenceUrls: event.target.value })) }) }), _jsx(FormField, { label: t("preferredAspectRatio"), children: _jsx("input", { value: profileForm.preferredAspectRatio, onChange: (event) => setProfileForm((current) => ({ ...current, preferredAspectRatio: event.target.value })) }) }), _jsx(FormField, { label: t("preferredResolution"), children: _jsx("input", { value: profileForm.preferredResolution, onChange: (event) => setProfileForm((current) => ({ ...current, preferredResolution: event.target.value })) }) }), _jsx(FormField, { label: t("preferredOpenAiModel"), children: _jsx("input", { value: profileForm.preferredOpenAiModel, onChange: (event) => setProfileForm((current) => ({ ...current, preferredOpenAiModel: event.target.value })) }) }), _jsx(FormField, { label: t("preferredGeminiModel"), children: _jsx("input", { value: profileForm.preferredGeminiModel, onChange: (event) => setProfileForm((current) => ({ ...current, preferredGeminiModel: event.target.value })) }) }), _jsx("button", { type: "submit", disabled: isSavingProfile, children: _jsxs("span", { className: "button-label", children: [isSavingProfile ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("saveSettings")] }) })] })] }), _jsxs(Card, { children: [_jsx("h3", { children: t("integrations") }), _jsx("div", { className: "stack compact", children: Object.keys(credentialConfigs).map((provider) => {
                                    const existing = credentials.find((item) => item.provider === provider);
                                    const config = credentialConfigs[provider];
                                    return (_jsxs("div", { className: "provider-credential-card", children: [_jsxs("div", { className: "provider-credential-header", children: [_jsxs("div", { children: [_jsx("strong", { children: config.title }), _jsx("p", { className: "muted", children: config.description })] }), _jsxs("div", { className: "provider-status", children: [_jsx("span", { children: existing?.configured ? t("configured") : t("notConfigured") }), existing?.configuredFields.length ? (_jsxs("span", { className: "muted", children: [existing.configuredFields.length, " ", t("fieldsSaved")] })) : null] })] }), _jsx("div", { className: "provider-credential-fields", children: config.fields.map((field) => (_jsx(FormField, { label: field.label, children: _jsx("input", { type: field.type, placeholder: field.placeholder, value: credentialDrafts[provider][field.key] ?? "", onChange: (event) => updateCredentialField(provider, field.key, event.target.value), required: field.required }) }, `${provider}-${field.key}`))) }), _jsx("div", { className: "provider-credential-actions", children: _jsx("button", { type: "button", className: "secondary-button", onClick: () => void saveCredential(provider), disabled: !hasRequiredFields(provider) || savingCredentialProvider !== null, children: _jsxs("span", { className: "button-label", children: [savingCredentialProvider === provider ? _jsx(LoadingSpinner, { size: "sm" }) : null, "Save ", config.title] }) }) })] }, provider));
                                }) })] })] })] }));
};
