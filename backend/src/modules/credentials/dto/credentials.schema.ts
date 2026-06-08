import { z } from "zod";

import { CredentialProvider } from "../../../common/constants/domain-enums.js";

export const upsertCredentialSchema = z.object({
  token: z.string().trim().min(1).optional(),
  values: z.record(z.string().trim()).optional(),
  label: z.string().max(120).optional()
}).superRefine((value, context) => {
  const tokenProvided = Boolean(value.token?.trim());
  const fieldsProvided = Object.values(value.values ?? {}).some((entry) => entry.trim().length > 0);

  if (!tokenProvided && !fieldsProvided) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one credential field is required"
    });
  }
});

export const credentialProviderSchema = z.nativeEnum(CredentialProvider);
