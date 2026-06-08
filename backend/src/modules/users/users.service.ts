import { AppError } from "../../common/errors/app-error.js";

import { UsersRepository } from "./users.repository.js";

export class UsersService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.getCurrentUser(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateSettings(userId: string, input: Record<string, string | number | string[] | undefined>) {
    return this.usersRepository.updateSettings(userId, input);
  }
}
