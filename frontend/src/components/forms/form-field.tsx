import type { PropsWithChildren } from "react";

export const FormField = ({
  label,
  children
}: PropsWithChildren<{
  label: string;
}>) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
