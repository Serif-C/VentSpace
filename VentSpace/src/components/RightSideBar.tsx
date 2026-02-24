import type { Post } from "../types/post";
import { Link } from "react-router-dom";

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

  const mostDiscussed = [...posts]
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">

      {/* Reminder */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600">
          Today’s Reminder
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          {reminders[todayIndex]}
        </p>
      </div>

      {/* Most Discussed */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600">
          🔥 Most Discussed
        </h3>

        <div className="mt-3 space-y-3">
          {mostDiscussed.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="block text-xs text-slate-500 hover:text-indigo-500 transition"
            >
              {post.content.slice(0, 45)}...
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}