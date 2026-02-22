import type { Comment } from "../types/comment";

export const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    content: "You’re not alone. I’ve been feeling the same.",
    createdAt: "2026-02-20",
    upvotes: 5,
    downvotes: 0,
  },
  {
    id: "2",
    postId: "1",
    content: "Take things one step at a time. It helps.",
    createdAt: "2026-02-20",
    upvotes: 3,
    downvotes: 0,
  },
  {
    id: "3",
    postId: "2",
    content: "Proud of you! Small wins matter.",
    createdAt: "2026-02-19",
    upvotes: 8,
    downvotes: 1,
  },
];