import type { CredentialProvider } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export class CredentialsRepository {
  findAll(userId: string) {
    return prisma.credential.findMany({
      where: { userId },
      orderBy: {
        provider: "asc"
      }
    });
  }

  upsert(userId: string, provider: CredentialProvider, encryptedValue: string, label?: string) {
    return prisma.credential.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        encryptedValue,
        label
      },
      create: {
        userId,
        provider,
        encryptedValue,
        label
      }
    });
  }
}
