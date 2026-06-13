import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { nftsService } from "../../services/nfts-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { Nft } from "../../types/api";

export const NftDetailPage = () => {
  const { id = "" } = useParams();
  const [nft, setNft] = useState<Nft | null>(null);
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
    setListingUrl(nft?.listingUrl ?? "");
  }, [nft?.imageUrl, nft?.listingUrl]);

  const upload = async () => {
    setIsUploading(true);

    try {
      await nftsService.uploadToIpfs(id);
      await load();
      success(t("uploadCompleted"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsUploading(false);
    }
  };

  const list = async () => {
    setIsListing(true);

    try {
      const result = await nftsService.listOnMarketplace(id);
      setListingUrl(result.listing.listingUrl);
      await load();
      success(t("mintCompleted"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsListing(false);
    }
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
          <div className={`preview-panel detail-preview${isPreviewLoading ? " is-loading" : ""}`}>
            {nft.imageUrl ? (
              <img
                src={nft.imageUrl}
                alt={nft.name}
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => setIsPreviewLoading(false)}
              />
            ) : (
              <p className="muted">No image yet.</p>
            )}
            {isPreviewLoading ? (
              <div className="preview-overlay">
                <div className="preview-loading">
                  <LoadingSpinner size="lg" />
                  <span className="muted">Loading image preview...</span>
                </div>
              </div>
            ) : null}
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
            <p className="muted">Chain: {nft.chain || "Not set"}</p>
            <p className="muted">Contract address: {nft.contractAddress || "Not set"}</p>
            <p className="muted">Token ID: {nft.tokenId || "Not set"}</p>
            <p className="muted">Metadata URI: {nft.metadataUri || "Not uploaded"}</p>
            <p className="muted">Mint tx hash: {nft.mintTxHash || "Not minted"}</p>
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
              <button type="button" className="secondary-button" onClick={() => void upload()} disabled={isUploading || isListing}>
                <span className="button-label">
                  {isUploading ? <LoadingSpinner size="sm" /> : null}
                  Upload to IPFS
                </span>
              </button>
              <button type="button" onClick={() => void list()} disabled={isListing || isUploading}>
                <span className="button-label">
                  {isListing ? <LoadingSpinner size="sm" /> : null}
                  Mint on Polygon
                </span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
