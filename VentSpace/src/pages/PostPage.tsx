import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CommentItem from "../components/post/CommentItem";
import { useLocation } from "react-router-dom";

const API_URL = "http://localhost:4000";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  async function fetchPost() {
    const res = await fetch(`${API_URL}/posts/${id}`);
    if (!res.ok) {
      setPost(null);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setPost(data);
    setEditTitle(data.title);
    setEditContent(data.content);
    setEditTags(data.tags.join(", "));
    setLoading(false);
  }

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
  if (!post) return;

  const params = new URLSearchParams(location.search);
  const targetId = params.get("comment");
  if (!targetId) return;

  setHighlightedId(targetId);

  setTimeout(() => {
    const el = document.getElementById(`comment-${targetId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 50);

  const timer = setTimeout(() => {
    setHighlightedId(null);
  }, 2500);

  return () => clearTimeout(timer);
}, [post, location.search]);

  async function handleDelete() {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    navigate("/feed");
  }

  async function handleSave() {
    if (!token) return;

    const parsedTags = editTags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    await fetch(`${API_URL}/posts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
        tags: parsedTags,
      }),
    });

    setEditing(false);
    fetchPost();
  }

  async function submitComment() {
    if (!newComment.trim()) return;
    if (!token) return alert("Login required");

    await fetch(`${API_URL}/comments`, {
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

    setNewComment("");
    fetchPost();
  }

  async function reactToPost(kind: string) {
    if (!token) return;

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

    fetchPost();
  }

  async function reactToComment(kind: string, commentId: string) {
    if (!token) return;

    await fetch(`${API_URL}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kind,
        commentId,
      }),
    });

    fetchPost();
  }

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  const isAuthor = user && post.author && user.id === post.author.id;

  const reactionCounts = {
    heart: post.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
    support: post.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
    thoughtful:
      post.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
  };

function buildCommentTree(comments: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  map.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) parent.replies.push(c);
      else roots.push(c); // orphan fallback
    } else {
      roots.push(c);
    }
  });

  // sort replies by createdAt at every level
  function sortNode(node: any) {
    node.replies.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    node.replies.forEach(sortNode);
  }

  roots.sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  roots.forEach(sortNode);

  return roots;
}

const commentTree = buildCommentTree(post.comments || []);


  return (
    <div className="max-w-2xl mx-auto p-4">

      {editing ? (
        <>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full border p-2 mb-3"
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full border p-2 mb-3"
          />
          <input
            value={editTags}
            onChange={e => setEditTags(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>

          <button
            onClick={() => setEditing(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-3">
            {post.title}
          </h1>

          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

          <div className="mb-4 flex gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>

          {isAuthor && (
            <div className="flex gap-4 mb-4">
              <button onClick={() => setEditing(true)} className="text-blue-600 text-sm">
                Edit
              </button>
              <button onClick={handleDelete} className="text-red-600 text-sm">
                Delete
              </button>
            </div>
          )}

          <div className="flex gap-6 mb-6 text-sm">
            <button onClick={() => reactToPost("heart")}>
              ❤️ {reactionCounts.heart}
            </button>
            <button onClick={() => reactToPost("support")}>
              🤝 {reactionCounts.support}
            </button>
            <button onClick={() => reactToPost("thoughtful")}>
              💭 {reactionCounts.thoughtful}
            </button>
          </div>

          <h2 className="font-semibold mb-2">
            Comments ({post.comments?.length ?? 0})
          </h2>

          <div className="space-y-2 mb-4">
            {commentTree.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                refresh={fetchPost}
                opId={post.author.id}
                highlightedId={highlightedId}
              />
            ))}
          </div>

          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Write a comment..."
          />

          <button
            onClick={submitComment}
            className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded"
          >
            Post Comment
          </button>
        </>
      )}

    </div>
  );
}