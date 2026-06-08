import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/card";
import { FormField } from "../../components/forms/form-field";
import { collectionsService } from "../../services/collections-service";
const emptyForm = {
    name: "",
    description: "",
    theme: "",
    story: "",
    blockchain: "Ethereum",
    marketplaceTarget: "OpenSea"
};
export const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);
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
    const submit = async (event) => {
        event.preventDefault();
        await collectionsService.create(form);
        setForm(emptyForm);
        await loadCollections();
    };
    return (_jsxs("div", { className: "stack", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Catalog" }), _jsx("h1", { children: "Collections" })] }) }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Create collection" }), _jsxs("form", { className: "stack compact", onSubmit: submit, children: [_jsx(FormField, { label: "Name", children: _jsx("input", { value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })), required: true }) }), _jsx(FormField, { label: "Theme", children: _jsx("input", { value: form.theme, onChange: (event) => setForm((current) => ({ ...current, theme: event.target.value })) }) }), _jsx(FormField, { label: "Story seed", children: _jsx("textarea", { value: form.story, onChange: (event) => setForm((current) => ({ ...current, story: event.target.value })) }) }), _jsx(FormField, { label: "Description", children: _jsx("textarea", { value: form.description, onChange: (event) => setForm((current) => ({ ...current, description: event.target.value })), required: true }) }), _jsxs("div", { className: "button-row", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => void assist(), children: "AI assist" }), _jsx("button", { type: "submit", children: "Save collection" })] })] })] }), _jsxs(Card, { children: [_jsx("h3", { children: "Existing collections" }), _jsx("div", { className: "stack compact", children: collections.length ? (collections.map((collection) => (_jsxs(Link, { className: "list-row", to: `/collections/${collection.id}`, children: [_jsx("span", { children: collection.name }), _jsx("span", { children: collection.status })] }, collection.id)))) : (_jsx("p", { className: "muted", children: "No collections yet." })) })] })] })] }));
};
