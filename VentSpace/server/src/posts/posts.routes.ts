import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, type AuthedRequest } from "../auth/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  const search = req.query.search as string | undefined;

  const where = search
  ? {
      OR: [
        {
          title: {
            contains: search,
          },
        },
        {
          tags: {
            contains: search,
          },
        },
      ],
    }
  : undefined;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      reactions: true,
      _count: { select: { comments: true, reactions: true } },
    },
  });

  res.json(
    posts.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags) as string[],
    }))
  );
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId: req.userId!,
    },
    orderBy: { createdAt: "desc" },
    include: {
    author: { select: { id: true, nickname: true, avatarUrl: true } },
    reactions: true, // 🔥 MUST EXIST
    _count: { select: { comments: true, reactions: true } },
    },
  });

  res.json(
    posts.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags) as string[],
    }))
  );
});

router.get("/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      comments: {
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
        reactions: true,
      },
    },
    reactions: true, // Reactions for the post itself
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

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(5000),
      tags: z.array(z.string().min(1).max(20)).max(10),
    }).parse(req.body);

    const existing = await prisma.post.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.post.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        title: body.title,
        content: body.content,
        tags: JSON.stringify(body.tags),
      },
    });

    res.json({ ...updated, tags: body.tags });

  } catch (e: any) {
    res.status(400).json({ error: e.message || "Update failed" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const existing = await prisma.post.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.authorId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.post.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });

    res.json({ success: true });

  } catch (e: any) {
    res.status(400).json({ error: e.message || "Delete failed" });
  }
});

export default router;