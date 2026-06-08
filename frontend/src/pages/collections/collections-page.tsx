import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
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

  const loadCollections = async () => setCollections(await collectionsService.list());

  useEffect(() => {
    void loadCollections();
  }, []);

  const assist = async () => {
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
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await collectionsService.create(form);
    setForm(emptyForm);
    await loadCollections();
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
              <button type="button" className="secondary-button" onClick={() => void assist()}>
                AI assist
              </button>
              <button type="submit">Save collection</button>
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
