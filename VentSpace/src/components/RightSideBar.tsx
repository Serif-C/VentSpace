import type { Post } from "../types/post";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type RecentPost = {
  id: string;
  title: string;
};

type Props = {
  posts: Post[];
};

export default function RightSidebar({ posts }: Props) {

  const reminders = [
    "You are allowed to take space.",
    "Small progress still counts.",
    "Your feelings are valid.",
    "Healing isn't linear.",
  ];

  const todayIndex = new Date().getDate() % reminders.length;

  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentPosts") || "[]");
    setRecentPosts(stored);
  }, []);

  return (
    <div className="space-y-4">

      {/* REMINDER */}
      <div className="rounded-xl shadow-sm p-4"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)"
      }}>
        <h3 style={{ color: "var(--accent)" }}
                className="text-xs font-semibold uppercase tracking-wide">
          Today’s Reminder
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          {reminders[todayIndex]}
        </p>
      </div>

      {/* RECENTLY VIEWED */}
      <div className="rounded-xl shadow-sm p-4"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)"
      }}>
        <h3 style={{ color: "var(--accent)" }}
                className="text-xs font-semibold uppercase tracking-wide">
          Recently Viewed
        </h3>

        <div className="mt-3 space-y-3">
          {recentPosts.length === 0 ? (
            <p className="text-xs text-slate-400">
              No recently viewed posts
            </p>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className="block text-sm hover:text-indigo-600"
              >
                <div className="line-clamp-2 font-medium">
                  {post.title}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}