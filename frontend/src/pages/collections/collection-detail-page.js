import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { collectionsService } from "../../services/collections-service";
import { useAlerts } from "../../store/alert-context";
import { getErrorMessage } from "../../utils/get-error-message";
export const CollectionDetailPage = () => {
    const { id = "" } = useParams();
    const [collection, setCollection] = useState(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const { success, error } = useAlerts();
    const load = async () => setCollection(await collectionsService.getById(id));
    useEffect(() => {
        void load();
    }, [id]);
    const deployContract = async () => {
        setIsDeploying(true);
        try {
            await collectionsService.deployContract(id);
            await load();
            success("Collection contract deployed.");
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, "Something went wrong. Try again."));
        }
        finally {
            setIsDeploying(false);
        }
    };
    if (!collection) {
        return _jsx("div", { className: "centered-page", children: "Loading collection..." });
    }
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: collection.status }), _jsx("h1", { children: collection.name }), _jsx("p", { className: "muted", children: collection.description }), _jsxs("p", { className: "muted", children: ["Blockchain: ", collection.blockchain || "polygon"] }), _jsxs("p", { className: "muted", children: ["Contract symbol: ", collection.contractSymbol || "Not set"] }), _jsxs("p", { className: "muted", children: ["Contract address: ", collection.contractAddress || "Not deployed yet"] })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Narrative" }), _jsx("p", { children: collection.story || "No story yet." }), _jsx("div", { className: "button-row", children: _jsx("button", { type: "button", onClick: () => void deployContract(), disabled: isDeploying || Boolean(collection.contractAddress), children: _jsxs("span", { className: "button-label", children: [isDeploying ? _jsx(LoadingSpinner, { size: "sm" }) : null, "Deploy contract"] }) }) })] }), _jsxs(Card, { children: [_jsx("h3", { children: "NFTs in collection" }), _jsx("div", { className: "stack compact", children: collection.nfts?.length ? (collection.nfts.map((nft) => (_jsxs(Link, { className: "list-row", to: `/nfts/${nft.id}`, children: [_jsx("span", { children: nft.name }), _jsx("span", { children: nft.status })] }, nft.id)))) : (_jsx("p", { className: "muted", children: "No NFTs attached yet." })) })] })] })] }));
};
