import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FormField } from "../../components/forms/form-field";
import { authService } from "../../services/auth-service";
import { useAuth } from "../../store/auth-context";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await authService.login(form);
      login(result.token, result.user);
      navigate("/");
    } catch {
      setError("Login failed. Check your email and password.");
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <div>
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in</h2>
      </div>
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
          required
        />
      </FormField>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit">Sign in</button>
      <p className="muted">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
};
