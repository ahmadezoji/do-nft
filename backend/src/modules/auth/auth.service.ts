import { AppError } from "../../common/errors/app-error.js";
import { comparePassword, hashPassword } from "../../common/utils/password.js";
import { signAccessToken } from "../../common/utils/jwt.js";

import type { LoginInput, RegisterInput } from "./dto/auth.schema.js";
import { AuthRepository } from "./auth.repository.js";

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async register(input: RegisterInput) {
    const existingUser = await this.authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.authRepository.createUser(input.email, passwordHash, input.fullName);
    const token = signAccessToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: this.toAuthUser(user)
    };
  }

  async login(input: LoginInput) {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const matches = await comparePassword(input.password, user.passwordHash);

    if (!matches) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signAccessToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: this.toAuthUser(user)
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.toAuthUser(user);
  }

  private toAuthUser(user: Awaited<ReturnType<AuthRepository["findById"]>>) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      profile: user.profile,
      settings: user.settings,
      promptProfile: user.promptProfile,
      branding: user.branding
    };
  }
}
