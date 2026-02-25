import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      kind: z.string(), // validate more later
      postId: z.string().optional(),
      commentId: z.string().optional(),
    }).refine(b => !!b.postId || !!b.commentId, "Must target post or comment")
      .parse(req.body);

    const reaction = await prisma.reaction.upsert({
      where: body.postId
        ? { userId_postId_kind: { userId: req.userId!, postId: body.postId, kind: body.kind } }
        : { userId_commentId_kind: { userId: req.userId!, commentId: body.commentId!, kind: body.kind } },
      update: {},
      create: {
        userId: req.userId!,
        kind: body.kind,
        postId: body.postId,
        commentId: body.commentId,
      },
    });

    res.json(reaction);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "React failed" });
  }
});

export default router;