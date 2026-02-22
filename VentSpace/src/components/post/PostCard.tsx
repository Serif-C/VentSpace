import type { Post } from "../../types/post";
import { Link } from "react-router-dom";
import { useState } from "react";

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  const [reactions, setReactions] = useState(post.reactions);

  function addReaction(type: keyof typeof reactions) {
    setReactions({
      ...reactions,
      [type]: reactions[type] + 1
    });
  }

  return (
    <div className="border rounded-xl p-4 hover:shadow transition">
      <Link to={`/post/${post.id}`}>
        <p className="text-lg">{post.content}</p>
      </Link>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map(tag => (
          <span
            key={tag}
            className="text-xs bg-gray-100 px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-sm">
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