import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { collectionsService } from "../../services/collections-service";
import { nftsService } from "../../services/nfts-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { Collection, Nft } from "../../types/api";

export const PublishingPage = () => {
  const { t } = useLanguage();
  const { success, error } = useAlerts();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nfts, setNfts] = useState<Nft[]>([]);
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

  const deployCollection = async (collectionId: string) => {
    setDeployingCollectionId(collectionId);

    try {
      await collectionsService.deployContract(collectionId);
      await load();
      success(t("contractDeployed"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setDeployingCollectionId("");
    }
  };

  const publishCollection = async (collectionId: string) => {
    setLoadingCollectionId(collectionId);

    try {
      await collectionsService.publish(collectionId);
      await load();
      success(t("collectionPublished"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setLoadingCollectionId("");
    }
  };

  const publishNft = async (nftId: string) => {
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
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setLoadingNftId("");
    }
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t("publishingFlow")}</p>
          <h1>{t("publishAssets")}</h1>
        </div>
      </header>

      <div className="grid split-grid">
        <Card>
          <h3>{t("collectionPublishing")}</h3>
          <div className="stack compact">
            {collections.length ? (
              collections.map((collection) => {
                const mintedCount =
                  collection.nfts?.filter((nft) => nft.status === "MINTED" || nft.status === "LISTED").length ?? 0;

                return (
                  <div key={collection.id} className="publish-item">
                    <div className="list-row">
                      <div className="publish-meta">
                        <strong>{collection.name}</strong>
                        <span className="muted">{collection.status}</span>
                      </div>
                      <span className="muted">
                        {t("nftCount")}: {collection.nfts?.length ?? 0} · {t("mintedCount")}: {mintedCount}
                      </span>
                    </div>
                    <p className="muted">
                      {collection.contractAddress
                        ? `${t("contractReady")}: ${collection.contractAddress}`
                        : t("contractNotDeployed")}
                    </p>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void deployCollection(collection.id)}
                        disabled={
                          Boolean(collection.contractAddress) ||
                          loadingCollectionId.length > 0 ||
                          loadingNftId.length > 0 ||
                          deployingCollectionId.length > 0
                        }
                      >
                        <span className="button-label">
                          {deployingCollectionId === collection.id ? <LoadingSpinner size="sm" /> : null}
                          {t("deployContract")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void publishCollection(collection.id)}
                        disabled={
                          loadingCollectionId.length > 0 ||
                          loadingNftId.length > 0 ||
                          deployingCollectionId.length > 0
                        }
                      >
                        <span className="button-label">
                          {loadingCollectionId === collection.id ? <LoadingSpinner size="sm" /> : null}
                          {t("publishCollection")}
                        </span>
                      </button>
                      <Link className="secondary-button button-link" to={`/collections/${collection.id}`}>
                        {t("openDetails")}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="muted">{t("noCollectionsToPublish")}</p>
            )}
          </div>
        </Card>

        <Card>
          <h3>{t("nftPublishing")}</h3>
          <div className="stack compact">
            {nfts.length ? (
              nfts.map((nft) => (
                <div key={nft.id} className="publish-item">
                  <div className="list-row">
                    <div className="publish-meta">
                      <strong>{nft.name}</strong>
                      <span className="muted">{nft.collection?.name ?? t("standaloneNft")}</span>
                    </div>
                    <span className="muted">{nft.status}</span>
                  </div>
                  <p className="muted">
                    {nft.collection?.contractAddress
                      ? `${t("contractReady")}: ${nft.collection.contractAddress}`
                      : nft.collectionId
                        ? t("contractWillDeployOnPublish")
                        : t("publishRequiresCollection")}
                  </p>
                  <p className="muted">{nft.ipfsMetadataCid ? t("ipfsReady") : t("ipfsWillUploadOnPublish")}</p>
                  {nft.listingUrl ? (
                    <a href={nft.listingUrl} target="_blank" rel="noreferrer">
                      {t("viewOpenSeaListing")}
                    </a>
                  ) : null}
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={() => void publishNft(nft.id)}
                      disabled={
                        !nft.imageUrl ||
                        loadingNftId.length > 0 ||
                        loadingCollectionId.length > 0 ||
                        deployingCollectionId.length > 0
                      }
                    >
                      <span className="button-label">
                        {loadingNftId === nft.id ? <LoadingSpinner size="sm" /> : null}
                        {t("mintAndPublishNft")}
                      </span>
                    </button>
                    <Link className="secondary-button button-link" to={`/nfts/${nft.id}`}>
                      {t("openDetails")}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">{t("noNftsToPublish")}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
