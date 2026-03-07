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

      <div className="flex flex-wrap gap-2 mt-2">
        {post.tags.map(tag => (
          <span
            key={tag}
            className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3 mt-3">

          <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-red-100">
            ❤️ {post.reactions?.heart || 0}
          </button>

          <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-indigo-100">
            🤝 {post.reactions?.support || 0}
          </button>

          <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-purple-100">
            💭 {post.reactions?.thoughtful || 0}
          </button>

          <div className="ml-auto text-sm text-slate-500">
            💬 {post.commentCount || 0}
          </div>

        </div>

        <span>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}