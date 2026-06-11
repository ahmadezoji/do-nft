import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAlerts } from "../../store/alert-context";
import { useAuth } from "../../store/auth-context";
import { useLanguage } from "../../store/language-context";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const { error: showError } = useAlerts();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await authService.login(form);
      login(result.token, result.user);
      navigate("/");
    } catch {
      showError(t("loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <p className="eyebrow">{t("welcomeBack")}</p>
        <h2>{t("signIn")}</h2>
      </div>
      <FormField label={t("email")}>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
      </FormField>
      <FormField label={t("password")}>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />
      </FormField>
      <button type="submit" disabled={isSubmitting}>
        <span className="button-label">
          {isSubmitting ? <LoadingSpinner size="sm" /> : null}
          {t("signIn")}
        </span>
      </button>
      <p className="muted">
        {t("needAccount")} <Link to="/register">{t("register")}</Link>
      </p>
    </form>
  );
};
