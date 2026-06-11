import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { Collection } from "../../types/api";

const emptyForm = {
  name: "",
  description: "",
  theme: "",
  story: "",
  blockchain: "Ethereum",
  marketplaceTarget: "OpenSea"
};

export const CollectionsPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isAssisting, setIsAssisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAlerts();
  const { t } = useLanguage();

  const loadCollections = async () => setCollections(await collectionsService.list());

  useEffect(() => {
    void loadCollections();
  }, []);

  const assist = async () => {
    setIsAssisting(true);

    try {
      const result = await collectionsService.assist({
        name: form.name,
        theme: form.theme,
        storySeed: form.story
      });

      setForm((current) => ({
        ...current,
        description: result.description,
        theme: result.theme ?? current.theme,
        story: result.story ?? current.story
      }));
      success(t("collectionAssisted"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsAssisting(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await collectionsService.create(form);
      setForm(emptyForm);
      await loadCollections();
      success(t("collectionSaved"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Collections</h1>
        </div>
      </header>

      <div className="grid split-grid">
        <Card>
          <h3>Create collection</h3>
          <form className="stack compact" onSubmit={submit}>
            <FormField label="Name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </FormField>
            <FormField label="Theme">
              <input value={form.theme} onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))} />
            </FormField>
            <FormField label="Story seed">
              <textarea value={form.story} onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))} />
            </FormField>
            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </FormField>
            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => void assist()}
                disabled={isAssisting || isSaving}
              >
                <span className="button-label">
                  {isAssisting ? <LoadingSpinner size="sm" /> : null}
                  AI assist
                </span>
              </button>
              <button type="submit" disabled={isSaving || isAssisting}>
                <span className="button-label">
                  {isSaving ? <LoadingSpinner size="sm" /> : null}
                  Save collection
                </span>
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <h3>Existing collections</h3>
          <div className="stack compact">
            {collections.length ? (
              collections.map((collection) => (
                <Link key={collection.id} className="list-row" to={`/collections/${collection.id}`}>
                  <span>{collection.name}</span>
                  <span>{collection.status}</span>
                </Link>
              ))
            ) : (
              <p className="muted">No collections yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
