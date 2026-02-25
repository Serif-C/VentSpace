import { Router } from "express";
import { z } from "zod";
import { signup, signin } from "./auth.service";
import { requireAuth, type AuthedRequest } from "./auth.middleware";
import { prisma } from "../prisma";

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

export default router;