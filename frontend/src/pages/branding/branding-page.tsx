import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { brandingService } from "../../services/branding-service";
import type { BrandingProfile } from "../../types/api";

const emptyBranding: BrandingProfile = {
  brandName: "",
  artistName: "",
  artStyle: "",
  personalityNotes: "",
  targetAudience: "",
  nftThemePreferences: "",
  toneOfVoice: "",
  socialMediaStyle: "",
  defaultHashtags: []
};

export const BrandingPage = () => {
  const [form, setForm] = useState<BrandingProfile>(emptyBranding);

  useEffect(() => {
    void brandingService.get().then((data) => setForm({ ...emptyBranding, ...data }));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await brandingService.upsert(form);
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Customization</p>
          <h1>Personal Branding</h1>
        </div>
      </header>

      <Card>
        <form className="grid form-grid" onSubmit={submit}>
          <FormField label="Brand name">
            <input
              value={form.brandName ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))}
            />
          </FormField>
          <FormField label="Artist name">
            <input
              value={form.artistName ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, artistName: event.target.value }))}
            />
          </FormField>
          <FormField label="Art style">
            <input
              value={form.artStyle ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, artStyle: event.target.value }))}
            />
          </FormField>
          <FormField label="Target audience">
            <input
              value={form.targetAudience ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, targetAudience: event.target.value }))}
            />
          </FormField>
          <FormField label="Tone of voice">
            <input
              value={form.toneOfVoice ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, toneOfVoice: event.target.value }))}
            />
          </FormField>
          <FormField label="Social media style">
            <input
              value={form.socialMediaStyle ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, socialMediaStyle: event.target.value }))}
            />
          </FormField>
          <FormField label="NFT theme preferences">
            <textarea
              value={form.nftThemePreferences ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, nftThemePreferences: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Personality observations">
            <textarea
              value={form.personalityNotes ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, personalityNotes: event.target.value }))}
            />
          </FormField>
          <FormField label="Default hashtags">
            <input
              value={(form.defaultHashtags ?? []).join(", ")}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  defaultHashtags: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                }))
              }
            />
          </FormField>
          <button type="submit">Save branding</button>
        </form>
      </Card>
    </div>
  );
};
