import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import {
  requireAuth,
  optionalAuth,
  type AuthedRequest,
} from "../auth/auth.middleware";
import { generateEmotionTags } from "../ai/tagGenerator";

const router = Router();

router.get("/", optionalAuth, async (req: AuthedRequest, res) => {
  const search = req.query.search as string | undefined;
  const cursor = req.query.cursor as string | undefined;
  const take = parseInt(req.query.take as string) || 10;

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
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      reactions: true,
      _count: { select: { comments: true, reactions: true } },
    },
  });

  let nextCursor: string | null = null;

  if (posts.length > take) {
    const nextItem = posts.pop();
    nextCursor = nextItem!.id;
  }

  res.json({
  items: posts.map((p) => {
    const viewerReactions = req.userId
      ? p.reactions
          .filter((r) => r.userId === req.userId)
          .map((r) => r.kind)
      : [];

    return {
      ...p,
      tags: JSON.parse(p.tags) as string[],
      viewerReactions,
    };
  }),
  nextCursor,
  });
});

router.get("/active-discussions", async (req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      comments: {
        _count: "desc",
      },
    },
    take: 5,
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  res.json(posts);
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

router.get("/:id", optionalAuth, async (req: AuthedRequest, res) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    },
    include: {
      author: { select: { id: true, nickname: true, avatarUrl: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
          reactions: true,
        },
      },
      reactions: true,
    },
  });

  if (!post) {
    return res.status(404).json({ error: "Not found" });
  }

  const viewerReactions = req.userId
    ? post.reactions
        .filter((r: { userId: string }) => r.userId === req.userId)
        .map((r: { kind: string }) => r.kind)
    : [];

  res.json({
    ...post,
    tags: JSON.parse(post.tags) as string[],
    viewerReactions,
  });
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(5000),
      tags: z.array(z.string().min(1).max(20)).max(10).default([]),
    }).parse(req.body);

    const aiTags = await generateEmotionTags(body.content);

    const mergedTags = Array.from(
      new Set([...(body.tags ?? []), ...aiTags])
    ).slice(0, 6);

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        tags: JSON.stringify(mergedTags),
        authorId: req.userId!,
      },
    });

    res.json({ ...post, tags: mergedTags  });
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