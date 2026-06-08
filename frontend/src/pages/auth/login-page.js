import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAuth } from "../../store/auth-context";
export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const submit = async (event) => {
        event.preventDefault();
        try {
            const result = await authService.login(form);
            login(result.token, result.user);
            navigate("/");
        }
        catch {
            setError("Login failed. Check your email and password.");
        }
    };
    return (_jsxs("form", { className: "stack", onSubmit: submit, children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Welcome back" }), _jsx("h2", { children: "Sign in" })] }), _jsx(FormField, { label: "Email", children: _jsx("input", { type: "email", value: form.email, onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })), required: true }) }), _jsx(FormField, { label: "Password", children: _jsx("input", { type: "password", value: form.password, onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })), required: true }) }), error ? _jsx("p", { className: "error-text", children: error }) : null, _jsx("button", { type: "submit", children: "Sign in" }), _jsxs("p", { className: "muted", children: ["Need an account? ", _jsx(Link, { to: "/register", children: "Register" })] })] }));
};
