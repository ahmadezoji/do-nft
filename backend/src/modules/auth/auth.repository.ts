import { prisma } from "../../database/prisma.js";

export class AuthRepository {
  createUser(email: string, passwordHash: string, fullName?: string) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: fullName
          ? {
              create: {
                fullName
              }
            }
          : undefined,
        settings: {
          create: {}
        },
        promptProfile: {
          create: {
            sampleReferenceUrls: []
          }
        },
        branding: {
          create: {
            defaultHashtags: []
          }
        }
      },
      include: {
        profile: true,
        settings: true,
        promptProfile: true,
        branding: true
      }
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        settings: true,
        promptProfile: true,
        branding: true
      }
    });
  }

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        settings: true,
        promptProfile: true,
        branding: true
      }
    });
  }
}
