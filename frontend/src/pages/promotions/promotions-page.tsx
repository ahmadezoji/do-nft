import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { nftsService } from "../../services/nfts-service";
import { promotionsService } from "../../services/promotions-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { Nft, PromotionCampaign } from "../../types/api";

export const PromotionsPage = () => {
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingPostId, setPublishingPostId] = useState("");
  const [regeneratingCampaignId, setRegeneratingCampaignId] = useState("");
  const [deletingCampaignId, setDeletingCampaignId] = useState("");
  const { success, error } = useAlerts();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    nftId: "",
    platforms: {
      TWITTER: true,
      DISCORD: true,
      TELEGRAM: false,
      FARCASTER: false
    }
  });

  const load = async () => {
    const [campaignData, nftData] = await Promise.all([promotionsService.list(), nftsService.list()]);
    setCampaigns(campaignData);
    setNfts(nftData);
  };

  useEffect(() => {
    void load();
  }, []);

  const publishPost = async (campaignId: string, postId: string) => {
    setPublishingPostId(postId);

    try {
      await promotionsService.publishPost(campaignId, postId);
      await load();
      success(t("postPublished"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setPublishingPostId("");
    }
  };

  const regenerateCampaign = async (campaignId: string) => {
    setRegeneratingCampaignId(campaignId);

    try {
      await promotionsService.regenerate(campaignId);
      await load();
      success(t("campaignRegenerated"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setRegeneratingCampaignId("");
    }
  };

  const removeCampaign = async (campaignId: string) => {
    if (!window.confirm(t("confirmDeleteCampaign"))) {
      return;
    }

    setDeletingCampaignId(campaignId);

    try {
      await promotionsService.remove(campaignId);
      await load();
      success(t("campaignDeleted"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setDeletingCampaignId("");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const platforms = Object.entries(form.platforms)
      .filter(([, enabled]) => enabled)
      .map(([platform]) => platform);

    setIsSubmitting(true);

    try {
      await promotionsService.create({
        name: form.name,
        nftId: form.nftId || undefined,
        platforms
      });
      await load();
      success(t("campaignSaved"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Amplification</p>
          <h1>Promotions</h1>
        </div>
      </header>

      <div className="grid split-grid">
        <Card>
          <h3>Create campaign</h3>
          <form className="stack compact" onSubmit={submit}>
            <FormField label="Campaign name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </FormField>
            <FormField label="NFT">
              <select
                value={form.nftId}
                onChange={(event) => setForm((current) => ({ ...current, nftId: event.target.value }))}
              >
                <option value="">Collection-level or general campaign</option>
                {nfts.map((nft) => (
                  <option key={nft.id} value={nft.id}>
                    {nft.name}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="checkbox-grid">
              {Object.entries(form.platforms).map(([platform, enabled]) => (
                <label key={platform} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        platforms: {
                          ...current.platforms,
                          [platform]: event.target.checked
                        }
                      }))
                    }
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={isSubmitting}>
              <span className="button-label">
                {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                Generate campaign posts
              </span>
            </button>
          </form>
        </Card>

        <Card>
          <h3>Campaign drafts</h3>
          <div className="stack compact">
            {campaigns.length ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <div className="list-row">
                    <strong>{campaign.name}</strong>
                    <span>{campaign.status}</span>
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={() => regenerateCampaign(campaign.id)}
                      disabled={regeneratingCampaignId === campaign.id}
                    >
                      <span className="button-label">
                        {regeneratingCampaignId === campaign.id ? <LoadingSpinner size="sm" /> : null}
                        {t("regenerateCampaign")}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => removeCampaign(campaign.id)}
                      disabled={deletingCampaignId === campaign.id}
                    >
                      <span className="button-label">
                        {deletingCampaignId === campaign.id ? <LoadingSpinner size="sm" /> : null}
                        {t("deleteCampaign")}
                      </span>
                    </button>
                  </div>
                  {campaign.posts.map((post) => (
                    <div key={post.id} className="post-preview">
                      <span className="eyebrow">{post.platform}</span>
                      <p>{post.content}</p>
                      <p className="muted">{post.hashtags.join(" ")}</p>
                      {post.platform === "TWITTER" || post.platform === "DISCORD" ? (
                        post.status === "POSTED" ? (
                          post.externalUrl ? (
                            <a href={post.externalUrl} target="_blank" rel="noreferrer">
                              {t("viewOnX")}
                            </a>
                          ) : (
                            <span className="muted">{t("postPublished")}</span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => publishPost(campaign.id, post.id)}
                            disabled={publishingPostId === post.id}
                          >
                            <span className="button-label">
                              {publishingPostId === post.id ? <LoadingSpinner size="sm" /> : null}
                              {post.platform === "DISCORD" ? t("postToDiscord") : t("postToX")}
                            </span>
                          </button>
                        )
                      ) : null}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="muted">No campaigns yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
