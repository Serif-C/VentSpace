import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { MessageCircle } from "lucide-react";

type Discussion = {
  id: string;
  title: string;
  _count: {
    comments: number;
  };
};

export default function ActiveDiscussions() {
  const [posts, setPosts] = useState<Discussion[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/posts/active-discussions");
        setPosts(data);
      } catch (err) {
        console.error("Failed to load discussions", err);
      }
    }

    load();
  }, []);

  return (
    <div className="rounded-xl shadow-sm p-4"
    style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)"
    }}>
      <h3 style={{ color: "var(--accent)" }}
                className="text-xs font-semibold uppercase tracking-wide mb-3">
        <div className="flex items-center gap-2">
          {/* <Flame size={16} /> */}
          Active Discussions
        </div>
      </h3>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="block text-sm hover:text-indigo-600"
          >
            <div className="font-medium line-clamp-2">
              {post.title}
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MessageCircle size={14} />
              {post._count.comments} replies
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}