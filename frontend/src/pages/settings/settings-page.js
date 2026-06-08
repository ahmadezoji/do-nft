import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { credentialsService } from "../../services/credentials-service";
import { usersService } from "../../services/users-service";
import { useAuth } from "../../store/auth-context";
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
    const [credentials, setCredentials] = useState([]);
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
    const [credentialDrafts, setCredentialDrafts] = useState(buildInitialDrafts);
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
    const saveProfile = async (event) => {
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
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Account" }), _jsx("h1", { children: "Settings & Integrations" })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Profile settings" }), _jsxs("form", { className: "stack compact", onSubmit: saveProfile, children: [_jsx(FormField, { label: "Full name", children: _jsx("input", { value: profileForm.fullName, onChange: (event) => setProfileForm((current) => ({ ...current, fullName: event.target.value })) }) }), _jsx(FormField, { label: "Artist name", children: _jsx("input", { value: profileForm.artistName, onChange: (event) => setProfileForm((current) => ({ ...current, artistName: event.target.value })) }) }), _jsx(FormField, { label: "Artist bio", children: _jsx("textarea", { value: profileForm.bio, onChange: (event) => setProfileForm((current) => ({ ...current, bio: event.target.value })) }) }), _jsx(FormField, { label: "Website / portfolio", children: _jsx("input", { type: "url", value: profileForm.websiteUrl, onChange: (event) => setProfileForm((current) => ({ ...current, websiteUrl: event.target.value })) }) }), _jsx(FormField, { label: "Preferred AI", children: _jsx("input", { value: profileForm.preferredAi, onChange: (event) => setProfileForm((current) => ({ ...current, preferredAi: event.target.value })) }) }), _jsx(FormField, { label: "Default chain", children: _jsx("input", { value: profileForm.defaultChain, onChange: (event) => setProfileForm((current) => ({ ...current, defaultChain: event.target.value })) }) }), _jsx(FormField, { label: "Timezone", children: _jsx("input", { value: profileForm.timezone, onChange: (event) => setProfileForm((current) => ({ ...current, timezone: event.target.value })) }) }), _jsx(FormField, { label: "Default image width", children: _jsx("input", { type: "number", min: 256, max: 4096, value: profileForm.defaultImageWidth, onChange: (event) => setProfileForm((current) => ({ ...current, defaultImageWidth: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: "Default image height", children: _jsx("input", { type: "number", min: 256, max: 4096, value: profileForm.defaultImageHeight, onChange: (event) => setProfileForm((current) => ({ ...current, defaultImageHeight: Number(event.target.value) || 1024 })) }) }), _jsx(FormField, { label: "Artwork style", children: _jsx("textarea", { value: profileForm.artworkStyle, onChange: (event) => setProfileForm((current) => ({ ...current, artworkStyle: event.target.value })) }) }), _jsx(FormField, { label: "Art vision", children: _jsx("textarea", { value: profileForm.artVision, onChange: (event) => setProfileForm((current) => ({ ...current, artVision: event.target.value })) }) }), _jsx(FormField, { label: "NFT vision", children: _jsx("textarea", { value: profileForm.nftVision, onChange: (event) => setProfileForm((current) => ({ ...current, nftVision: event.target.value })) }) }), _jsx(FormField, { label: "Inspiration sources", children: _jsx("textarea", { value: profileForm.inspirationSources, onChange: (event) => setProfileForm((current) => ({ ...current, inspirationSources: event.target.value })) }) }), _jsx(FormField, { label: "Signature motifs", children: _jsx("textarea", { value: profileForm.signatureMotifs, onChange: (event) => setProfileForm((current) => ({ ...current, signatureMotifs: event.target.value })) }) }), _jsx(FormField, { label: "Color direction", children: _jsx("textarea", { value: profileForm.colorDirection, onChange: (event) => setProfileForm((current) => ({ ...current, colorDirection: event.target.value })) }) }), _jsx(FormField, { label: "Smart prompt base", children: _jsx("textarea", { value: profileForm.promptBase, onChange: (event) => setProfileForm((current) => ({ ...current, promptBase: event.target.value })) }) }), _jsx(FormField, { label: "Negative prompt base", children: _jsx("textarea", { value: profileForm.negativePromptBase, onChange: (event) => setProfileForm((current) => ({ ...current, negativePromptBase: event.target.value })) }) }), _jsx(FormField, { label: "Creative rules", children: _jsx("textarea", { value: profileForm.creativeRules, onChange: (event) => setProfileForm((current) => ({ ...current, creativeRules: event.target.value })) }) }), _jsx(FormField, { label: "Sample reference URLs", children: _jsx("textarea", { value: profileForm.sampleReferenceUrls, onChange: (event) => setProfileForm((current) => ({ ...current, sampleReferenceUrls: event.target.value })) }) }), _jsx(FormField, { label: "Preferred aspect ratio", children: _jsx("input", { value: profileForm.preferredAspectRatio, onChange: (event) => setProfileForm((current) => ({ ...current, preferredAspectRatio: event.target.value })) }) }), _jsx(FormField, { label: "Preferred resolution", children: _jsx("input", { value: profileForm.preferredResolution, onChange: (event) => setProfileForm((current) => ({ ...current, preferredResolution: event.target.value })) }) }), _jsx(FormField, { label: "Preferred OpenAI model", children: _jsx("input", { value: profileForm.preferredOpenAiModel, onChange: (event) => setProfileForm((current) => ({ ...current, preferredOpenAiModel: event.target.value })) }) }), _jsx(FormField, { label: "Preferred Gemini model", children: _jsx("input", { value: profileForm.preferredGeminiModel, onChange: (event) => setProfileForm((current) => ({ ...current, preferredGeminiModel: event.target.value })) }) }), _jsx("button", { type: "submit", children: "Save settings" })] })] }), _jsxs(Card, { children: [_jsx("h3", { children: "Integrations" }), _jsx("div", { className: "stack compact", children: Object.keys(credentialConfigs).map((provider) => {
                                    const existing = credentials.find((item) => item.provider === provider);
                                    const config = credentialConfigs[provider];
                                    return (_jsxs("div", { className: "provider-credential-card", children: [_jsxs("div", { className: "provider-credential-header", children: [_jsxs("div", { children: [_jsx("strong", { children: config.title }), _jsx("p", { className: "muted", children: config.description })] }), _jsxs("div", { className: "provider-status", children: [_jsx("span", { children: existing?.configured ? "Configured" : "Not configured" }), existing?.configuredFields.length ? (_jsxs("span", { className: "muted", children: [existing.configuredFields.length, " field(s) saved"] })) : null] })] }), _jsx("div", { className: "provider-credential-fields", children: config.fields.map((field) => (_jsx(FormField, { label: field.label, children: _jsx("input", { type: field.type, placeholder: field.placeholder, value: credentialDrafts[provider][field.key] ?? "", onChange: (event) => updateCredentialField(provider, field.key, event.target.value), required: field.required }) }, `${provider}-${field.key}`))) }), _jsx("div", { className: "provider-credential-actions", children: _jsxs("button", { type: "button", className: "secondary-button", onClick: () => void saveCredential(provider), disabled: !hasRequiredFields(provider), children: ["Save ", config.title] }) })] }, provider));
                                }) })] })] })] }));
};
