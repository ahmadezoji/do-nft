import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAlerts } from "../../store/alert-context";
import { useAuth } from "../../store/auth-context";
import { useLanguage } from "../../store/language-context";
export const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();
    const { error: showError } = useAlerts();
    const [form, setForm] = useState({ fullName: "", email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await authService.register(form);
            login(result.token, result.user);
            navigate("/");
        }
        catch {
            showError(t("registerFailed"));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("form", { className: "stack", onSubmit: submit, children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: t("newWorkspace") }), _jsx("h2", { children: t("createAccount") })] }), _jsx(FormField, { label: t("fullName"), children: _jsx("input", { value: form.fullName, onChange: (event) => setForm((current) => ({ ...current, fullName: event.target.value })) }) }), _jsx(FormField, { label: t("email"), children: _jsx("input", { type: "email", value: form.email, onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })), required: true }) }), _jsx(FormField, { label: t("password"), children: _jsx("input", { type: "password", value: form.password, onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })), minLength: 8, required: true }) }), _jsx("button", { type: "submit", disabled: isSubmitting, children: _jsxs("span", { className: "button-label", children: [isSubmitting ? _jsx(LoadingSpinner, { size: "sm" }) : null, t("createAccount")] }) }), _jsxs("p", { className: "muted", children: [t("alreadyHaveAccount"), " ", _jsx(Link, { to: "/login", children: t("signIn") })] })] }));
};
