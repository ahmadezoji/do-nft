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
  const [loadingNftId, setLoadingNftId] = useState("");

  const load = async () => {
    const [collectionData, nftData] = await Promise.all([collectionsService.list(), nftsService.list()]);
    setCollections(collectionData);
    setNfts(nftData);
  };

  useEffect(() => {
    void load();
  }, []);

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
      const currentNft = await nftsService.getById(nftId);

      if (!currentNft.ipfsMetadataCid) {
        await nftsService.uploadToIpfs(nftId);
      }

      await nftsService.listOnMarketplace(nftId);
      await load();
      success(t("listingCompleted"));
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
                const listedCount = collection.nfts?.filter((nft) => nft.status === "LISTED").length ?? 0;

                return (
                  <div key={collection.id} className="publish-item">
                    <div className="list-row">
                      <div className="publish-meta">
                        <strong>{collection.name}</strong>
                        <span className="muted">{collection.status}</span>
                      </div>
                      <span className="muted">
                        {t("nftCount")}: {collection.nfts?.length ?? 0} · {t("listedCount")}: {listedCount}
                      </span>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        onClick={() => void publishCollection(collection.id)}
                        disabled={loadingCollectionId.length > 0 || loadingNftId.length > 0}
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
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={() => void publishNft(nft.id)}
                      disabled={!nft.imageUrl || loadingNftId.length > 0 || loadingCollectionId.length > 0}
                    >
                      <span className="button-label">
                        {loadingNftId === nft.id ? <LoadingSpinner size="sm" /> : null}
                        {t("publishNft")}
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
