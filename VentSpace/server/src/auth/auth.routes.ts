import { Router } from "express";
import { z } from "zod";
import { signup, signin } from "./auth.service";
import { requireAuth, type AuthedRequest } from "./auth.middleware";
import { prisma } from "../prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      nickname: z.string().min(1).max(30).optional(),
    }).parse(req.body);

    const result = await signup(body.email, body.password, body.nickname);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Signup failed" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body);

    const result = await signin(body.email, body.password);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Signin failed" });
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, nickname: true, avatarUrl: true },
  });
  res.json({ user });
});

router.post("/verify-email", async (req, res) => {
  try {
    const body = z.object({
      token: z.string(),
    }).parse(req.body);

    const user = await prisma.user.findFirst({
      where: { verificationToken: body.token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      return res.status(400).json({ error: "Verification token expired" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    res.json({ message: "Email verified successfully" });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Verification failed" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.json({ message: "Email already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed to resend email" });
  }
});

export default router;