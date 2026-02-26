import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function PostPage() {
  const { id } = useParams();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${API_URL}/posts/${id}`);
        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-3">
        {post.title}
      </h1>

      {/* Content */}
      <p className="text-slate-700 mb-4">
        {post.content}
      </p>

      {/* Tags */}
      <div className="mb-6 flex gap-2">
        {post.tags.map((tag: string) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Comments (from backend) */}
      <h2 className="font-semibold mb-3">Comments</h2>

      <div className="space-y-3">
        {post.comments?.map((comment: any) => (
          <div key={comment.id} className="border p-3 rounded">
            <p className="text-sm text-slate-700">
              {comment.content}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {comment.author.nickname}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}