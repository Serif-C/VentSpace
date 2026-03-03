import { Link } from "react-router-dom";
import { useState } from "react";
import type { Post } from "../../types/post";
import { toggleReaction } from "../../services/postsService";

type Props = {
  post: Post;
  onTagClick?: (tag: string) => void;
};

export default function PostCard({ post, onTagClick }: Props) {
  const [reactionCounts, setReactionCounts] = useState(post.reactions);
  const [activeReactions, setActiveReactions] = useState<string[]>(
    post.viewerReactions ?? []
  );

  async function handleReaction(
  e: React.MouseEvent,
  kind: "heart" | "support" | "thoughtful"
  ) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await toggleReaction({
        kind,
        postId: post.id,
      });

      setReactionCounts((prev) => ({
        ...prev,
        [kind]: result.active
          ? prev[kind] + 1
          : Math.max(prev[kind] - 1, 0),
      }));

      setActiveReactions((prev) =>
        result.active
          ? [...prev, kind]
          : prev.filter((k) => k !== kind)
      );
    } catch (err) {
      console.error("Reaction failed", err);
    }
  }

  return (
    <Link
      to={`/post/${post.id}`}
      className="block bg-white rounded-xl border border-stone-200 p-5 
                 shadow-sm hover:shadow-lg hover:-translate-y-1 
                 transition-all duration-200 cursor-pointer"
    >
      <h2 className="text-lg font-semibold mb-2">{post.title}</h2>

      <p className="text-gray-700">
        {post.content.length > 150
          ? post.content.slice(0, 150) + "..."
          : post.content}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag: string) => (
          <span
            key={tag}
            onClick={(e) => {
              e.preventDefault();
              onTagClick?.(tag);
            }}
            className="text-xs bg-indigo-50 text-indigo-600 
                       px-3 py-1 rounded-full 
                       hover:bg-indigo-100 transition"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-6">

          <button
            onClick={(e) => handleReaction(e, "heart")}
            className={`hover:scale-110 transition ${
              activeReactions.includes("heart")
                ? "text-red-500 font-semibold"
                : ""
            }`}
          >
            ❤️ {reactionCounts.heart}
          </button>

          <button
            onClick={(e) => handleReaction(e, "support")}
            className={`hover:scale-110 transition ${
              activeReactions.includes("support")
                ? "text-green-600 font-semibold"
                : ""
            }`}
          >
            🤝 {reactionCounts.support}
          </button>

          <button
            onClick={(e) => handleReaction(e, "thoughtful")}
            className={`hover:scale-110 transition ${
              activeReactions.includes("thoughtful")
                ? "text-indigo-600 font-semibold"
                : ""
            }`}
          >
            💭 {reactionCounts.thoughtful}
          </button>

          <span>💬 {post.commentCount}</span>
        </div>

        <span>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}