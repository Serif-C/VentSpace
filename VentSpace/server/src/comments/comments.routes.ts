import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      postId: z.string(),
      content: z.string().min(1).max(2000),
      parentId: z.string().optional(),
    }).parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        postId: body.postId,
        content: body.content,
        parentId: body.parentId,
        authorId: req.userId!,
      },
    });

    // Notification to post owner (basic)
    const post = await prisma.post.findUnique({ where: { id: body.postId } });
    if (post && post.authorId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: "comment",
          message: "Someone commented on your post",
          postId: post.id,
          commentId: comment.id,
        },
      });
    }

    res.json(comment);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Comment failed" });
  }
});

export default router;