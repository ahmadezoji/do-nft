import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "../../components/common/card";
import { collectionsService } from "../../services/collections-service";
import type { Collection } from "../../types/api";

export const CollectionDetailPage = () => {
  const { id = "" } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    void collectionsService.getById(id).then(setCollection);
  }, [id]);

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
        </div>
      </header>
      <div className="grid split-grid">
        <Card>
          <h3>Narrative</h3>
          <p>{collection.story || "No story yet."}</p>
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
