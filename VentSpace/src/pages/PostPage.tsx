import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:4000";

export default function PostPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function submitComment() {
    if (!newComment.trim()) return;
    if (!token) return alert("You must be logged in.");

    try {
      setSubmitting(true);

      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: id,
          content: newComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to comment");
      }

      setNewComment("");
      await fetchPost(); // refresh comments
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function react(kind: string) {
    if (!token) return alert("You must be logged in.");

    try {
      await fetch(`${API_URL}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind,
          postId: id,
        }),
      });

      await fetchPost(); // refresh reaction counts
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  // Compute reaction counts
  const reactionCounts = {
    heart: post.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
    support: post.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
    thoughtful: post.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
  };

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

      {/* Reactions */}
      <div className="flex gap-6 mb-6 text-sm">
        <button onClick={() => react("heart")}>
          ❤️ {reactionCounts.heart}
        </button>

        <button onClick={() => react("support")}>
          🤝 {reactionCounts.support}
        </button>

        <button onClick={() => react("thoughtful")}>
          💭 {reactionCounts.thoughtful}
        </button>
      </div>

      {/* Comments */}
      <h2 className="font-semibold mb-3">
        Comments ({post.comments?.length ?? 0})
      </h2>

      <div className="space-y-3 mb-4">
        {post.comments?.map((comment: any) => {

        const commentReactionCounts = {
          heart: comment.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
          support: comment.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
          thoughtful: comment.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
        };

        return (
          <div key={comment.id} className="border p-3 rounded">

            <p className="text-sm text-slate-700">
              {comment.content}
            </p>

            <p className="text-xs text-slate-400 mt-1 mb-2">
              {comment.author.nickname}
            </p>

            <div className="flex gap-4 text-xs">

              <button
                onClick={async () => {
                  if (!token) return alert("Login required");
                  await fetch("http://localhost:4000/reactions", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      kind: "heart",
                      commentId: comment.id,
                    }),
                  });
                  await fetchPost();
                }}
              >
                ❤️ {commentReactionCounts.heart}
              </button>

              <button
                onClick={async () => {
                  if (!token) return alert("Login required");
                  await fetch("http://localhost:4000/reactions", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      kind: "support",
                      commentId: comment.id,
                    }),
                  });
                  await fetchPost();
                }}
              >
                🤝 {commentReactionCounts.support}
              </button>

              <button
                onClick={async () => {
                  if (!token) return alert("Login required");
                  await fetch("http://localhost:4000/reactions", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      kind: "thoughtful",
                      commentId: comment.id,
                    }),
                  });
                  await fetchPost();
                }}
              >
                💭 {commentReactionCounts.thoughtful}
              </button>

            </div>

          </div>
        );
      })}
      </div>

      {/* Add Comment */}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="Write a comment..."
      />

      <button
        onClick={submitComment}
        disabled={submitting}
        className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
      >
        {submitting ? "Posting..." : "Post Comment"}
      </button>

    </div>
  );
}