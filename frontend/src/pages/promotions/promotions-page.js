import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { nftsService } from "../../services/nfts-service";
import { promotionsService } from "../../services/promotions-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
export const PromotionsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error } = useAlerts();
    const { t } = useLanguage();
    const [form, setForm] = useState({
        name: "",
        nftId: "",
        platforms: {
            TWITTER: true,
            DISCORD: true,
            TELEGRAM: false,
            FARCASTER: false
        }
    });
    const load = async () => {
        const [campaignData, nftData] = await Promise.all([promotionsService.list(), nftsService.list()]);
        setCampaigns(campaignData);
        setNfts(nftData);
    };
    useEffect(() => {
        void load();
    }, []);
    const submit = async (event) => {
        event.preventDefault();
        const platforms = Object.entries(form.platforms)
            .filter(([, enabled]) => enabled)
            .map(([platform]) => platform);
        setIsSubmitting(true);
        try {
            await promotionsService.create({
                name: form.name,
                nftId: form.nftId || undefined,
                platforms
            });
            await load();
            success(t("campaignSaved"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Amplification" }), _jsx("h1", { children: "Promotions" })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Create campaign" }), _jsxs("form", { className: "stack compact", onSubmit: submit, children: [_jsx(FormField, { label: "Campaign name", children: _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), required: true }) }), _jsx(FormField, { label: "NFT", children: _jsxs("select", { value: form.nftId, onChange: (event) => setForm((current) => ({ ...current, nftId: event.target.value })), children: [_jsx("option", { value: "", children: "Collection-level or general campaign" }), nfts.map((nft) => (_jsx("option", { value: nft.id, children: nft.name }, nft.id)))] }) }), _jsx("div", { className: "checkbox-grid", children: Object.entries(form.platforms).map(([platform, enabled]) => (_jsxs("label", { className: "checkbox-row", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: (event) => setForm((current) => ({
                                                        ...current,
                                                        platforms: {
                                                            ...current.platforms,
                                                            [platform]: event.target.checked
                                                        }
                                                    })) }), _jsx("span", { children: platform })] }, platform))) }), _jsx("button", { type: "submit", disabled: isSubmitting, children: _jsxs("span", { className: "button-label", children: [isSubmitting ? _jsx(LoadingSpinner, { size: "sm" }) : null, "Generate campaign posts"] }) })] })] }), _jsxs(Card, { children: [_jsx("h3", { children: "Campaign drafts" }), _jsx("div", { className: "stack compact", children: campaigns.length ? (campaigns.map((campaign) => (_jsxs("div", { className: "campaign-card", children: [_jsxs("div", { className: "list-row", children: [_jsx("strong", { children: campaign.name }), _jsx("span", { children: campaign.status })] }), campaign.posts.map((post) => (_jsxs("div", { className: "post-preview", children: [_jsx("span", { className: "eyebrow", children: post.platform }), _jsx("p", { children: post.content }), _jsx("p", { className: "muted", children: post.hashtags.join(" ") })] }, post.id)))] }, campaign.id)))) : (_jsx("p", { className: "muted", children: "No campaigns yet." })) })] })] })] }));
};
