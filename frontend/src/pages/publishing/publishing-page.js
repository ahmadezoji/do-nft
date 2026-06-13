import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { collectionsService } from "../../services/collections-service";
import { nftsService } from "../../services/nfts-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
export const PublishingPage = () => {
    const { t } = useLanguage();
    const { success, error } = useAlerts();
    const [collections, setCollections] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [loadingCollectionId, setLoadingCollectionId] = useState("");
    const [deployingCollectionId, setDeployingCollectionId] = useState("");
    const [loadingNftId, setLoadingNftId] = useState("");
    const load = async () => {
        const [collectionData, nftData] = await Promise.all([collectionsService.list(), nftsService.list()]);
        setCollections(collectionData);
        setNfts(nftData);
    };
    useEffect(() => {
        void load();
    }, []);
    const deployCollection = async (collectionId) => {
        setDeployingCollectionId(collectionId);
        try {
            await collectionsService.deployContract(collectionId);
            await load();
            success(t("contractDeployed"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setDeployingCollectionId("");
        }
    };
    const publishCollection = async (collectionId) => {
        setLoadingCollectionId(collectionId);
        try {
            await collectionsService.publish(collectionId);
            await load();
            success(t("collectionPublished"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setLoadingCollectionId("");
        }
    };
    const publishNft = async (nftId) => {
        setLoadingNftId(nftId);
        try {
            let currentNft = await nftsService.getById(nftId);
            if (!currentNft.collectionId) {
                error(t("publishRequiresCollection"));
                return;
            }
            if (!currentNft.collection?.contractAddress) {
                await collectionsService.deployContract(currentNft.collectionId);
                currentNft = await nftsService.getById(nftId);
            }
            if (!currentNft.ipfsMetadataCid) {
                await nftsService.uploadToIpfs(nftId);
            }
            await nftsService.listOnMarketplace(nftId);
            await load();
            success(t("mintCompleted"));
        }
        catch (caughtError) {
            error(getErrorMessage(caughtError, t("somethingWentWrong")));
        }
        finally {
            setLoadingNftId("");
        }
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t("publishingFlow") }), _jsx("h1", { children: t("publishAssets") })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: t("collectionPublishing") }), _jsx("div", { className: "stack compact", children: collections.length ? (collections.map((collection) => {
                                    const mintedCount = collection.nfts?.filter((nft) => nft.status === "MINTED" || nft.status === "LISTED").length ?? 0;
                                    return (_jsxs("div", { className: "publish-item", children: [_jsxs("div", { className: "list-row", children: [_jsxs("div", { className: "publish-meta", children: [_jsx("strong", { children: collection.name }), _jsx("span", { className: "muted", children: collection.status })] }), _jsxs("span", { className: "muted", children: [t("nftCount"), ": ", collection.nfts?.length ?? 0, " \u00B7 ", t("mintedCount"), ": ", mintedCount] })] }), _jsx("p", { className: "muted", children: collection.contractAddress
                                                    ? `${t("contractReady")}: ${collection.contractAddress}`
                                                    : t("contractNotDeployed") }), _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => void deployCollection(collection.id), disabled: Boolean(collection.contractAddress) ||
                                                            loadingCollectionId.length > 0 ||
                                                            loadingNftId.length > 0 ||
                                                            deployingCollectionId.length > 0, children: _jsxs("span", { className: "button-label", children: [deployingCollectionId === collection.id ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("deployContract")] }) }), _jsx("button", { type: "button", onClick: () => void publishCollection(collection.id), disabled: loadingCollectionId.length > 0 ||
                                                            loadingNftId.length > 0 ||
                                                            deployingCollectionId.length > 0, children: _jsxs("span", { className: "button-label", children: [loadingCollectionId === collection.id ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("publishCollection")] }) }), _jsx(Link, { className: "secondary-button button-link", to: `/collections/${collection.id}`, children: t("openDetails") })] })] }, collection.id));
                                })) : (_jsx("p", { className: "muted", children: t("noCollectionsToPublish") })) })] }), _jsxs(Card, { children: [_jsx("h3", { children: t("nftPublishing") }), _jsx("div", { className: "stack compact", children: nfts.length ? (nfts.map((nft) => (_jsxs("div", { className: "publish-item", children: [_jsxs("div", { className: "list-row", children: [_jsxs("div", { className: "publish-meta", children: [_jsx("strong", { children: nft.name }), _jsx("span", { className: "muted", children: nft.collection?.name ?? t("standaloneNft") })] }), _jsx("span", { className: "muted", children: nft.status })] }), _jsx("p", { className: "muted", children: nft.collection?.contractAddress
                                                ? `${t("contractReady")}: ${nft.collection.contractAddress}`
                                                : nft.collectionId
                                                    ? t("contractWillDeployOnPublish")
                                                    : t("publishRequiresCollection") }), _jsx("p", { className: "muted", children: nft.ipfsMetadataCid ? t("ipfsReady") : t("ipfsWillUploadOnPublish") }), nft.listingUrl ? (_jsx("a", { href: nft.listingUrl, target: "_blank", rel: "noreferrer", children: t("viewOpenSeaListing") })) : null, _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", onClick: () => void publishNft(nft.id), disabled: !nft.imageUrl ||
                                                        loadingNftId.length > 0 ||
                                                        loadingCollectionId.length > 0 ||
                                                        deployingCollectionId.length > 0, children: _jsxs("span", { className: "button-label", children: [loadingNftId === nft.id ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("mintAndPublishNft")] }) }), _jsx(Link, { className: "secondary-button button-link", to: `/nfts/${nft.id}`, children: t("openDetails") })] })] }, nft.id)))) : (_jsx("p", { className: "muted", children: t("noNftsToPublish") })) })] })] })] }));
};
