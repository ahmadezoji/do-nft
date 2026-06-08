import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../components/common/card";
import { collectionsService } from "../../services/collections-service";
export const CollectionDetailPage = () => {
    const { id = "" } = useParams();
    const [collection, setCollection] = useState(null);
    useEffect(() => {
        void collectionsService.getById(id).then(setCollection);
    }, [id]);
    if (!collection) {
        return _jsx("div", { className: "centered-page", children: "Loading collection..." });
    }
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: collection.status }), _jsx("h1", { children: collection.name }), _jsx("p", { className: "muted", children: collection.description })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Narrative" }), _jsx("p", { children: collection.story || "No story yet." })] }), _jsxs(Card, { children: [_jsx("h3", { children: "NFTs in collection" }), _jsx("div", { className: "stack compact", children: collection.nfts?.length ? (collection.nfts.map((nft) => (_jsxs(Link, { className: "list-row", to: `/nfts/${nft.id}`, children: [_jsx("span", { children: nft.name }), _jsx("span", { children: nft.status })] }, nft.id)))) : (_jsx("p", { className: "muted", children: "No NFTs attached yet." })) })] })] })] }));
};
