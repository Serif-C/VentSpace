import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { env } from "../env";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail";

export async function signup(email: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || "Anonymous",
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    select: { id: true, email: true, nickname: true, avatarUrl: true },
  });

  await sendVerificationEmail(user.email, verificationToken);

  return {
    message: "Signup successful. Please check your email to verify your account.",
  };
}

export async function signin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  if (!user.emailVerified) {
  throw new Error("Please verify your email before signing in.");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "7d" });

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname, avatarUrl: user.avatarUrl },
    token,
  };
}