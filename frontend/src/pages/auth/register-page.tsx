import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAuth } from "../../store/auth-context";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await authService.register(form);
      login(result.token, result.user);
      navigate("/");
    } catch {
      setError("Registration failed. Use a different email or stronger password.");
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <p className="eyebrow">New workspace</p>
        <h2>Create account</h2>
      </div>
      <FormField label="Full name">
        <input
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        />
      </FormField>
      <FormField label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
      </FormField>
      <FormField label="Password">
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          minLength={8}
          required
        />
      </FormField>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit">Create account</button>
      <p className="muted">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
};
