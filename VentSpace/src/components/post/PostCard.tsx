import { Link } from "react-router-dom";
import type { Post } from "../../types/post";

type Props = {
  post: Post;
  onTagClick?: (tag: string) => void;
};

export default function PostCard({ post, onTagClick }: Props) {

  return (
    <Link
      to={`/post/${post.id}`}
      className="block bg-white rounded-xl border border-stone-200 p-5 
                 shadow-sm hover:shadow-lg hover:-translate-y-1 
                 transition-all duration-200 cursor-pointer"
    >
      {/* Content */}
      <p className="text-slate-800 leading-relaxed mb-4">
        {post.content}
      </p>

      {/* Tags */}
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

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">

        <div className="flex items-center gap-6">
          <span>❤️ {post.reactions.heart}</span>
          <span>🤝 {post.reactions.support}</span>
          <span>💭 {post.reactions.thoughtful}</span>
          <span>💬 {post.commentCount}</span>
        </div>

        <span>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>

      </div>
    </Link>
  );
}