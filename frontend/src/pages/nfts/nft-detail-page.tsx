import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card } from "../../components/common/card";
import { nftsService } from "../../services/nfts-service";
import type { Nft } from "../../types/api";

export const NftDetailPage = () => {
  const { id = "" } = useParams();
  const [nft, setNft] = useState<Nft | null>(null);
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
    return <div className="centered-page">Loading NFT...</div>;
  }

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{nft.status}</p>
          <h1>{nft.name}</h1>
        </div>
      </header>
      <div className="grid split-grid">
        <Card>
          <div className="preview-panel detail-preview">
            {nft.imageUrl ? <img src={nft.imageUrl} alt={nft.name} /> : <p className="muted">No image yet.</p>}
          </div>
        </Card>
        <Card>
          <div className="stack compact">
            <p>{nft.description || "No description yet."}</p>
            <p className="muted">Prompt: {nft.prompt || "Not generated yet."}</p>
            <p className="muted">Model: {nft.aiModel || "Not selected"}</p>
            <p className="muted">
              Resolution: {nft.outputWidth || 1024} x {nft.outputHeight || 1024}
            </p>
            <p className="muted">
              References: {nft.referenceUrls?.length ? nft.referenceUrls.join(", ") : "No reference URLs"}
            </p>
            <p className="muted">Sample image URL: {nft.referenceImageUrl || "No sample image URL"}</p>
            <p className="muted">IPFS image CID: {nft.ipfsImageCid || "Not uploaded"}</p>
            <p className="muted">IPFS metadata CID: {nft.ipfsMetadataCid || "Not uploaded"}</p>
            {listingUrl ? (
              <a href={listingUrl} target="_blank" rel="noreferrer">
                View listing
              </a>
            ) : null}
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => void upload()}>
                Upload to IPFS
              </button>
              <button type="button" onClick={() => void list()}>
                List on marketplace
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
