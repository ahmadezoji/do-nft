import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { nftsService } from "../../services/nfts-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
export const NftDetailPage = () => {
    const { id = "" } = useParams();
    const [nft, setNft] = useState(null);
    const [listingUrl, setListingUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isListing, setIsListing] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const { success, error } = useAlerts();
    const { t } = useLanguage();
    const load = async () => setNft(await nftsService.getById(id));
    useEffect(() => {
        void load();
    }, [id]);
    useEffect(() => {
        setIsPreviewLoading(Boolean(nft?.imageUrl));
    }, [nft?.imageUrl]);
    const upload = async () => {
        setIsUploading(true);
        try {
            await nftsService.uploadToIpfs(id);
            await load();
            success(t("uploadCompleted"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsUploading(false);
        }
    };
    const list = async () => {
        setIsListing(true);
        try {
            const result = await nftsService.listOnMarketplace(id);
            setListingUrl(result.listing.listingUrl);
            await load();
            success(t("listingCompleted"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setIsListing(false);
        }
    };
    if (!nft) {
        return _jsx("div", { className: "centered-page", children: "Loading NFT..." });
    }
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: nft.status }), _jsx("h1", { children: nft.name })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsx(Card, { children: _jsxs("div", { className: `preview-panel detail-preview${isPreviewLoading ? " is-loading" : ""}`, children: [nft.imageUrl ? (_jsx("img", { src: nft.imageUrl, alt: nft.name, onLoad: () => setIsPreviewLoading(false), onError: () => setIsPreviewLoading(false) })) : (_jsx("p", { className: "muted", children: "No image yet." })), isPreviewLoading ? (_jsx("div", { className: "preview-overlay", children: _jsxs("div", { className: "preview-loading", children: [_jsx(LoadingSpinner, { size: "lg" }), _jsx("span", { className: "muted", children: "Loading image preview..." })] }) })) : null] }) }), _jsx(Card, { children: _jsxs("div", { className: "stack compact", children: [_jsx("p", { children: nft.description || "No description yet." }), _jsxs("p", { className: "muted", children: ["Prompt: ", nft.prompt || "Not generated yet."] }), _jsxs("p", { className: "muted", children: ["Model: ", nft.aiModel || "Not selected"] }), _jsxs("p", { className: "muted", children: ["Resolution: ", nft.outputWidth || 1024, " x ", nft.outputHeight || 1024] }), _jsxs("p", { className: "muted", children: ["References: ", nft.referenceUrls?.length ? nft.referenceUrls.join(", ") : "No reference URLs"] }), _jsxs("p", { className: "muted", children: ["Sample image URL: ", nft.referenceImageUrl || "No sample image URL"] }), _jsxs("p", { className: "muted", children: ["IPFS image CID: ", nft.ipfsImageCid || "Not uploaded"] }), _jsxs("p", { className: "muted", children: ["IPFS metadata CID: ", nft.ipfsMetadataCid || "Not uploaded"] }), listingUrl ? (_jsx("a", { href: listingUrl, target: "_blank", rel: "noreferrer", children: "View listing" })) : null, _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => void upload(), disabled: isUploading || isListing, children: _jsxs("span", { className: "button-label", children: [isUploading ? _jsx(LoadingSpinner, { size: "sm" }) : null, "Upload to IPFS"] }) }), _jsx("button", { type: "button", onClick: () => void list(), disabled: isListing || isUploading, children: _jsxs("span", { className: "button-label", children: [isListing ? _jsx(LoadingSpinner, { size: "sm" }) : null, "List on marketplace"] }) })] })] }) })] })] }));
};
