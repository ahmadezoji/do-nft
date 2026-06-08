import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { nftsService } from "../../services/nfts-service";
import { promotionsService } from "../../services/promotions-service";
import type { Nft, PromotionCampaign } from "../../types/api";

export const PromotionsPage = () => {
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [nfts, setNfts] = useState<Nft[]>([]);
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const platforms = Object.entries(form.platforms)
      .filter(([, enabled]) => enabled)
      .map(([platform]) => platform);

    await promotionsService.create({
      name: form.name,
      nftId: form.nftId || undefined,
      platforms
    });
    await load();
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
            <button type="submit">Generate campaign posts</button>
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
                  {campaign.posts.map((post) => (
                    <div key={post.id} className="post-preview">
                      <span className="eyebrow">{post.platform}</span>
                      <p>{post.content}</p>
                      <p className="muted">{post.hashtags.join(" ")}</p>
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
