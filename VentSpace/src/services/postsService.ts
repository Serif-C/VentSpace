import type { Post } from "../types/post";

const API_URL = "http://localhost:4000";

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");

  const data = await res.json();

  // Map backend shape -> your frontend Post type
  return data.map((p: any): Post => ({
    id: p.id,
    title: p.title,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt,

    reactions: {
      heart: 0,
      support: 0,
      thoughtful: 0,
    },

    commentCount: p._count?.comments ?? 0,
  }));
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