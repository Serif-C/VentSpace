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
  kind: "heart" | "support" | "thoughtful" | "thankful"
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
                 shadow-md hover:shadow-xl hover:-translate-y-[2px]
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

        <div className="relative group">
          <button
            onClick={(e) => handleReaction(e, "heart")}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 active:scale-95"
          >
            ❤️ {reactionCounts.heart || 0}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            opacity-0 group-hover:opacity-100 transition 
            bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            Show encouragement
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={(e) => handleReaction(e, "support")}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-indigo-100"
          >
            🫂 {reactionCounts.support || 0}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            opacity-0 group-hover:opacity-100 transition 
            bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            I feel the same way
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={(e) => handleReaction(e, "thoughtful")}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-purple-100"
          >
            💭 {reactionCounts.thoughtful || 0}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            opacity-0 group-hover:opacity-100 transition 
            bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            This made me think
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={(e) => handleReaction(e, "thankful")}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-100"
          >
            🙏 {reactionCounts.thankful || 0}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            opacity-0 group-hover:opacity-100 transition 
            bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            I appreciate this
          </div>
        </div>

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