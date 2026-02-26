import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.get("/", async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  res.json(posts.map(p => ({
    ...p,
    tags: JSON.parse(p.tags) as string[],
  })));
});

router.get("/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
      },
      reactions: true,
    },
  });

  if (!post) return res.status(404).json({ error: "Not found" });

  res.json({ ...post, tags: JSON.parse(post.tags) as string[] });
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(5000),
      tags: z.array(z.string().min(1).max(20)).max(10).default([]),
    }).parse(req.body);

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        tags: JSON.stringify(body.tags),
        authorId: req.userId!,
      },
    });

    res.json({ ...post, tags: body.tags });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Create post failed" });
  }
});

export default router;