import type { Post } from "../types/post";

export const mockPosts: Post[] = [
  {
    id: "1",
    content: "I’ve been feeling overwhelmed lately and needed somewhere to express it.",
    tags: ["stress", "life"],
    createdAt: "2026-02-20",
    reactions: {
      heart: 12,
      support: 8,
      thoughtful: 4,
    },
    commentCount: 5,
  },
  {
    id: "2",
    content: "Today was actually a good day. I’m proud of small progress.",
    tags: ["growth", "positivity"],
    createdAt: "2026-02-19",
    reactions: {
      heart: 20,
      support: 15,
      thoughtful: 6,
    },
    commentCount: 12,
  },
  {
    id: "3",
    content: "Does anyone else feel stuck in life sometimes?",
    tags: ["reflection"],
    createdAt: "2026-02-18",
    reactions: {
      heart: 7,
      support: 5,
      thoughtful: 10,
    },
    commentCount: 3,
  },
];

export function postScore(post: any) {
  return (
    post.reactions.heart * 2 +
    post.reactions.support * 1.5 +
    post.reactions.thoughtful +
    post.commentCount
  );
}