import type { Post } from "../types/post";
import { apiFetch } from "./api";

export async function getPosts(params?: {
  search?: string;
  cursor?: string | null;
  take?: number;
}): Promise<{ posts: Post[]; nextCursor: string | null }> {
  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);
  if (params?.cursor) query.append("cursor", params.cursor);
  if (params?.take) query.append("take", String(params.take));

  const data = await apiFetch(`/posts?${query.toString()}`, {
    auth: true,
  });

  const mappedPosts: Post[] = data.items.map((p: any) => {
    const reactionCounts = {
      heart: p.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
      support: p.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
      thoughtful:
        p.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
      thankful:
        p.reactions?.filter((r: any) => r.kind === "thankful").length ?? 0,
    };

    return {
      id: p.id,
      title: p.title,
      content: p.content,
      tags: p.tags,
      createdAt: p.createdAt,
      reactions: reactionCounts,
      commentCount: p._count?.comments ?? 0,
    };
  });

  return {
    posts: mappedPosts,
    nextCursor: data.nextCursor ?? null,
  };
}

export async function createPost(
  title: string,
  content: string,
  tags: string[]
) {
  const data = await apiFetch("/posts", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ title, content, tags }),
  });

  const p = data as any;

  return {
    id: p.id,
    title: p.title,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt,
    reactions: { heart: 0, support: 0, thoughtful: 0 },
    commentCount: 0,
  };
}

export async function getMyPosts(): Promise<Post[]> {
  const data = await apiFetch("/posts/me", {
    auth: true,
  });

  return data.map((p: any): Post => {
    const reactionCounts = {
      heart: p.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
      support: p.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
      thoughtful:
        p.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
      thankful:
        p.reactions?.filter((r: any) => r.kind === "thankful").length ?? 0,
    };

    return {
      id: p.id,
      title: p.title,
      content: p.content,
      tags: p.tags,
      createdAt: p.createdAt,
      reactions: reactionCounts,
      commentCount: p._count?.comments ?? 0,
      viewerReactions: p.viewerReactions ?? [],
      
    };
  });
}

export async function toggleReaction(params: {
  kind: "heart" | "support" | "thoughtful" | "thankful";
  postId?: string;
  commentId?: string;
}) {
  return apiFetch("/reactions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(params),
  });
}