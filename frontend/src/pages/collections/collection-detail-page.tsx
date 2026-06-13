import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { collectionsService } from "../../services/collections-service";
import { useAlerts } from "../../store/alert-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { Collection } from "../../types/api";

export const CollectionDetailPage = () => {
  const { id = "" } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
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
    } catch (caughtError) {
      error(getErrorMessage(caughtError, "Something went wrong. Try again."));
    } finally {
      setIsDeploying(false);
    }
  };

  if (!collection) {
    return <div className="centered-page">Loading collection...</div>;
  }

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{collection.status}</p>
          <h1>{collection.name}</h1>
          <p className="muted">{collection.description}</p>
          <p className="muted">Blockchain: {collection.blockchain || "polygon"}</p>
          <p className="muted">Contract symbol: {collection.contractSymbol || "Not set"}</p>
          <p className="muted">Contract address: {collection.contractAddress || "Not deployed yet"}</p>
        </div>
      </header>
      <div className="grid split-grid">
        <Card>
          <h3>Narrative</h3>
          <p>{collection.story || "No story yet."}</p>
          <div className="button-row">
            <button
              type="button"
              onClick={() => void deployContract()}
              disabled={isDeploying || Boolean(collection.contractAddress)}
            >
              <span className="button-label">
                {isDeploying ? <LoadingSpinner size="sm" /> : null}
                Deploy contract
              </span>
            </button>
          </div>
        </Card>
        <Card>
          <h3>NFTs in collection</h3>
          <div className="stack compact">
            {collection.nfts?.length ? (
              collection.nfts.map((nft) => (
                <Link key={nft.id} className="list-row" to={`/nfts/${nft.id}`}>
                  <span>{nft.name}</span>
                  <span>{nft.status}</span>
                </Link>
              ))
            ) : (
              <p className="muted">No NFTs attached yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
