import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      nickname: z.string().min(1).max(30).optional(),
      avatarUrl: z.string().url().optional(),
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: body,
      select: { id: true, email: true, nickname: true, avatarUrl: true },
    });

    res.json({ user });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Update failed" });
  }
});

export default router;