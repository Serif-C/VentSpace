import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      kind: z.string(),
      postId: z.string().optional(),
      commentId: z.string().optional(),
    })
      .refine(b => !!b.postId || !!b.commentId, "Must target post or comment")
      .parse(req.body);

    let existing;

    if (body.postId) {
      existing = await prisma.reaction.findUnique({
        where: {
          userId_postId_kind: {
            userId: req.userId!,
            postId: body.postId,
            kind: body.kind,
          },
        },
      });
    } else {
      existing = await prisma.reaction.findUnique({
        where: {
          userId_commentId_kind: {
            userId: req.userId!,
            commentId: body.commentId!,
            kind: body.kind,
          },
        },
      });
    }

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id },
      });

      return res.json({ active: false });
    }

    const newReaction = await prisma.reaction.create({
  data: {
    userId: req.userId!,
    kind: body.kind,
    postId: body.postId,
    commentId: body.commentId,
  },
});

// 🔔 Create notification (only if reacting to someone else's content)

if (body.postId) {
  const post = await prisma.post.findUnique({
    where: { id: body.postId },
    select: { authorId: true },
  });

  if (post && post.authorId !== req.userId) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
    select: { notifyOnReactions: true },
  });

  if (author?.notifyOnReactions) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "reaction",
        message: `Someone reacted ${body.kind} to your post`,
        postId: body.postId,
      },
    });
    }
  }
}

if (body.commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: body.commentId },
    select: { authorId: true, postId: true },
  });

  if (comment && comment.authorId !== req.userId) {
  const author = await prisma.user.findUnique({
    where: { id: comment.authorId },
    select: { notifyOnReactions: true },
  });

  if (author?.notifyOnReactions) {
    await prisma.notification.create({
      data: {
        userId: comment.authorId,
        type: "reaction",
        message: `Someone reacted ${body.kind} to your comment`,
        postId: comment.postId,
      },
    });
  }
}
}

return res.json({ active: true });

  } catch (e: any) {
    res.status(400).json({ error: e.message || "React failed" });
  }
});

export default router;