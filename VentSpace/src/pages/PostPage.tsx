import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CommentItem from "../components/post/CommentItem";
import { useLocation } from "react-router-dom";
import { toggleReaction } from "../services/postsService";
import { HeartHandshake, Users, Brain, HandHeart } from "lucide-react";

const API_URL = "http://localhost:4000";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();

  const [post, setPost] = useState<any>(null);

  const [reactionCounts, setReactionCounts] = useState<{
  heart: number;
  support: number;
  thoughtful: number;
  thankful: number;
  }>({
    heart: 0,
    support: 0,
    thoughtful: 0,
    thankful: 0,
  });

  const [activeReactions, setActiveReactions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  async function fetchPost() {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    if (!res.ok) {
      setPost(null);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setPost(data);

    const counts = {
      heart: data.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
      support: data.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
      thoughtful:
        data.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
      thankful:
        data.reactions?.filter((r: any) => r.kind === "thankful").length ?? 0,
    };

    setReactionCounts(counts);
    setActiveReactions(data.viewerReactions ?? []);
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

    const viewed = JSON.parse(localStorage.getItem("recentPosts") || "[]");

    const updated = [
      { id: post.id, title: post.title },
      ...viewed.filter((p: any) => p.id !== post.id),
    ].slice(0, 5);

    localStorage.setItem("recentPosts", JSON.stringify(updated));
  }, [post]);

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

  async function reactToPost(
  kind: "heart" | "support" | "thoughtful" | "thankful"
  ) {
    if (!token) return;

    try {
      const result = await toggleReaction({
        kind,
        postId: id,
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
    <div className="max-w-3xl mx-auto px-4">

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
        <div
          className="rounded-2xl shadow-sm p-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)"
          }}
        >
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            {post.title}
          </h1>

          <p className="text-xs text-[var(--muted)] mb-4">
            Posted anonymously • {new Date(post.createdAt).toLocaleDateString()}
          </p>

          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

          <div className="mb-4 flex gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} 
              style={{
                      backgroundColor: "var(--tag-bg)",
                      color: "var(--tag-text)"
                    }}
              className="text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex gap-6 text-sm">

            <button
              onClick={() => reactToPost("heart")}
              // style={{ backgroundColor: "var(--reaction-bg)"}}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-full active:scale-95  hover:bg-indigo-100"
            >
              <HeartHandshake size={18} />
              {reactionCounts.heart}
            </button>

            <button
              onClick={() => reactToPost("support")}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-full active:scale-95  hover:bg-indigo-100"
            >
              <Users size={18} />
              {reactionCounts.support}
            </button>

            <button
              onClick={() => reactToPost("thoughtful")}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-full active:scale-95  hover:bg-indigo-100"
            >
              <Brain size={18} />
              {reactionCounts.thoughtful}
            </button>
            
            <button
              onClick={() => reactToPost("thankful")}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-full active:scale-95  hover:bg-indigo-100"
            >
              <HandHeart size={18} />
              {reactionCounts.thankful}
            </button>
          </div>
        </div>
        
        

          <h2 className="font-semibold mb-2 mt-2 text-[var(--text)]">
            Comments ({post.comments?.length ?? 0})
          </h2>

          {isAuthor && (
            <div className="flex gap-4 mb-4">
              <button onClick={() => setEditing(true)} className="text-blue-600 text-xs">
                Edit
              </button>
              <button onClick={handleDelete} className="text-red-600 text-xs">
                Delete
              </button>
            </div>
          )}

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