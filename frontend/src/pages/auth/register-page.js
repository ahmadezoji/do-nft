import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAuth } from "../../store/auth-context";
export const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ fullName: "", email: "", password: "" });
    const [error, setError] = useState("");
    const submit = async (event) => {
        event.preventDefault();
        try {
            const result = await authService.register(form);
            login(result.token, result.user);
            navigate("/");
        }
        catch {
            setError("Registration failed. Use a different email or stronger password.");
        }
    };
    return (_jsxs("form", { className: "stack", onSubmit: submit, children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "New workspace" }), _jsx("h2", { children: "Create account" })] }), _jsx(FormField, { label: "Full name", children: _jsx("input", { value: form.fullName, onChange: (event) => setForm((current) => ({ ...current, fullName: event.target.value })) }) }), _jsx(FormField, { label: "Email", children: _jsx("input", { type: "email", value: form.email, onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })), required: true }) }), _jsx(FormField, { label: "Password", children: _jsx("input", { type: "password", value: form.password, onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })), minLength: 8, required: true }) }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", children: "Create account" }), _jsxs("p", { className: "muted", children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Sign in" })] })] }));
};
