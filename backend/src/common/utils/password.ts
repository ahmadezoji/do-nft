import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);
