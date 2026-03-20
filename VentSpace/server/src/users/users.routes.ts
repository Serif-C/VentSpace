import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware.js";

const router = Router();

/**
 * GET CURRENT USER SETTINGS
 */
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      notifyOnComments: true,
      notifyOnReactions: true,
    },
  });

  res.json(user);
});

/**
 * UPDATE USER SETTINGS
 */
router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      nickname: z.string().min(1).max(30).optional(),
      avatarUrl: z.string().url().optional(),
      password: z.string().min(6).optional(),
      notifyOnComments: z.boolean().optional(),
      notifyOnReactions: z.boolean().optional(),
    }).parse(req.body);

    const data: any = {};

    if (body.nickname !== undefined) data.nickname = body.nickname;
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
    if (body.notifyOnComments !== undefined)
      data.notifyOnComments = body.notifyOnComments;
    if (body.notifyOnReactions !== undefined)
      data.notifyOnReactions = body.notifyOnReactions;

    if (body.password) {
      data.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.userId! },
      data,
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        notifyOnComments: true,
        notifyOnReactions: true,
      },
    });

    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Update failed" });
  }
});

export default router;