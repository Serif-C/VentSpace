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

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      content: z.string().min(1).max(2000),
    }).parse(req.body);

    const existing = await prisma.comment.findUnique({
      where: {
        id: Array.isArray(req.params.id)
          ? req.params.id[0]
          : req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.comment.update({
      where: {
        id: Array.isArray(req.params.id)
          ? req.params.id[0]
          : req.params.id,
      },
      data: { content: body.content },
    });

    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Update comment failed" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const commentId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Delete comment failed" });
  }
});

export default router;