import type { Post } from "../../types/post";
import { Link } from "react-router-dom";
import { useState } from "react";

type Props = {
  post: Post;
  onTagClick?: (tag: string) => void;
};

export default function PostCard({ post, onTagClick }: Props) {
  const [reactions, setReactions] = useState(post.reactions);

  function addReaction(type: keyof typeof reactions) {
    setReactions({
      ...reactions,
      [type]: reactions[type] + 1
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
        <Link to={`/post/${post.id}`}>
            <p className="text-lg leading-relaxed text-slate-700">{post.content}</p>
        </Link>

        <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(tag => (
                <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="text-xs bg-stone-100 text-slate-600 px-3 py-1 rounded-full hover:bg-stone-200 transition cursor-pointer"
                >
                #{tag}
                </button>
            ))}
        </div>

      <div className="mt-4 flex gap-6 text-sm text-slate-500">
        <button onClick={() => addReaction("heart")}>
          ❤️ {reactions.heart}
        </button>

        <button onClick={() => addReaction("support")}>
          🤝 {reactions.support}
        </button>

        <button onClick={() => addReaction("thoughtful")}>
          💭 {reactions.thoughtful}
        </button>

        <span>💬 {post.commentCount}</span>
      </div>
    </div>
  );
}