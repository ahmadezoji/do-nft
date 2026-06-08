import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { brandingService } from "../../services/branding-service";
const emptyBranding = {
    brandName: "",
    artistName: "",
    artStyle: "",
    personalityNotes: "",
    targetAudience: "",
    nftThemePreferences: "",
    toneOfVoice: "",
    socialMediaStyle: "",
    defaultHashtags: []
};
export const BrandingPage = () => {
    const [form, setForm] = useState(emptyBranding);
    useEffect(() => {
        void brandingService.get().then((data) => setForm({ ...emptyBranding, ...data }));
    }, []);
    const submit = async (event) => {
        event.preventDefault();
        await brandingService.upsert(form);
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Customization" }), _jsx("h1", { children: "Personal Branding" })] }) }), _jsx(Card, { children: _jsxs("form", { className: "grid form-grid", onSubmit: submit, children: [_jsx(FormField, { label: "Brand name", children: _jsx("input", { value: form.brandName ?? "", onChange: (event) => setForm((current) => ({ ...current, brandName: event.target.value })) }) }), _jsx(FormField, { label: "Artist name", children: _jsx("input", { value: form.artistName ?? "", onChange: (event) => setForm((current) => ({ ...current, artistName: event.target.value })) }) }), _jsx(FormField, { label: "Art style", children: _jsx("input", { value: form.artStyle ?? "", onChange: (event) => setForm((current) => ({ ...current, artStyle: event.target.value })) }) }), _jsx(FormField, { label: "Target audience", children: _jsx("input", { value: form.targetAudience ?? "", onChange: (event) => setForm((current) => ({ ...current, targetAudience: event.target.value })) }) }), _jsx(FormField, { label: "Tone of voice", children: _jsx("input", { value: form.toneOfVoice ?? "", onChange: (event) => setForm((current) => ({ ...current, toneOfVoice: event.target.value })) }) }), _jsx(FormField, { label: "Social media style", children: _jsx("input", { value: form.socialMediaStyle ?? "", onChange: (event) => setForm((current) => ({ ...current, socialMediaStyle: event.target.value })) }) }), _jsx(FormField, { label: "NFT theme preferences", children: _jsx("textarea", { value: form.nftThemePreferences ?? "", onChange: (event) => setForm((current) => ({ ...current, nftThemePreferences: event.target.value })) }) }), _jsx(FormField, { label: "Personality observations", children: _jsx("textarea", { value: form.personalityNotes ?? "", onChange: (event) => setForm((current) => ({ ...current, personalityNotes: event.target.value })) }) }), _jsx(FormField, { label: "Default hashtags", children: _jsx("input", { value: (form.defaultHashtags ?? []).join(", "), onChange: (event) => setForm((current) => ({
                                    ...current,
                                    defaultHashtags: event.target.value
                                        .split(",")
                                        .map((item) => item.trim())
                                        .filter(Boolean)
                                })) }) }), _jsx("button", { type: "submit", children: "Save branding" })] }) })] }));
};
