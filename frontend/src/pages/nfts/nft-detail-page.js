import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/common/card";
import { nftsService } from "../../services/nfts-service";
export const NftDetailPage = () => {
    const { id = "" } = useParams();
    const [nft, setNft] = useState(null);
    const [listingUrl, setListingUrl] = useState("");
    const load = async () => setNft(await nftsService.getById(id));
    useEffect(() => {
        void load();
    }, [id]);
    const upload = async () => {
        await nftsService.uploadToIpfs(id);
        await load();
    };
    const list = async () => {
        const result = await nftsService.listOnMarketplace(id);
        setListingUrl(result.listing.listingUrl);
        await load();
    };
    if (!nft) {
        return _jsx("div", { className: "centered-page", children: "Loading NFT..." });
    }
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: nft.status }), _jsx("h1", { children: nft.name })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsx(Card, { children: _jsx("div", { className: "preview-panel detail-preview", children: nft.imageUrl ? _jsx("img", { src: nft.imageUrl, alt: nft.name }) : _jsx("p", { className: "muted", children: "No image yet." }) }) }), _jsx(Card, { children: _jsxs("div", { className: "stack compact", children: [_jsx("p", { children: nft.description || "No description yet." }), _jsxs("p", { className: "muted", children: ["Prompt: ", nft.prompt || "Not generated yet."] }), _jsxs("p", { className: "muted", children: ["Model: ", nft.aiModel || "Not selected"] }), _jsxs("p", { className: "muted", children: ["Resolution: ", nft.outputWidth || 1024, " x ", nft.outputHeight || 1024] }), _jsxs("p", { className: "muted", children: ["References: ", nft.referenceUrls?.length ? nft.referenceUrls.join(", ") : "No reference URLs"] }), _jsxs("p", { className: "muted", children: ["Sample image URL: ", nft.referenceImageUrl || "No sample image URL"] }), _jsxs("p", { className: "muted", children: ["IPFS image CID: ", nft.ipfsImageCid || "Not uploaded"] }), _jsxs("p", { className: "muted", children: ["IPFS metadata CID: ", nft.ipfsMetadataCid || "Not uploaded"] }), listingUrl ? (_jsx("a", { href: listingUrl, target: "_blank", rel: "noreferrer", children: "View listing" })) : null, _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => void upload(), children: "Upload to IPFS" }), _jsx("button", { type: "button", onClick: () => void list(), children: "List on marketplace" })] })] }) })] })] }));
};
