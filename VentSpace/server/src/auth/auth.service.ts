import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { env } from "../env";

export async function signup(email: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || "Anonymous",
    },
    select: { id: true, email: true, nickname: true, avatarUrl: true },
  });

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

export async function signin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname, avatarUrl: user.avatarUrl },
    token,
  };
}