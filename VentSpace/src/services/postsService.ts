import type { Post } from "../types/post";

const API_URL = "http://localhost:4000";

export async function getPosts(search?: string): Promise<Post[]> {
  const url = search
    ? `${API_URL}/posts?search=${encodeURIComponent(search)}`
    : `${API_URL}/posts`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");

  const data = await res.json();

  return data.map((p: any): Post => {
    const reactionCounts = {
      heart: p.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
      support: p.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
      thoughtful: p.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
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
}

export async function createPost(
  title: string,
  content: string,
  tags: string[],
  token: string
) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, tags }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Failed to create post");
  }

  // Optional: map the created post to your Post type too
  const p = data as any;

  const mapped: Post = {
    id: p.id,
    title: p.title,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt,
    reactions: { heart: 0, support: 0, thoughtful: 0 },
    commentCount: 0,
  };

  return mapped;
}

export async function getMyPosts(token: string): Promise<Post[]> {
  const res = await fetch("http://localhost:4000/posts/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch my posts");

  const data = await res.json();

  return data.map((p: any): Post => {
    const reactionCounts = {
      heart: p.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
      support: p.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
      thoughtful: p.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
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
}