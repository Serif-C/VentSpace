import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:4000";
const MAX_VISUAL_DEPTH = 6;

type Props = {
  comment: any;
  refresh: () => void;
  depth?: number;
  opId?: string;
  highlightedId?: string | null;
};

function countDescendants(node: any): number {
  const replies = node.replies || [];
  return replies.reduce((sum: number, r: any) => sum + 1 + countDescendants(r), 0);
}

export default function CommentItem({
  comment,
  refresh,
  depth = 0,
  opId,
  highlightedId,
}: Props) {
  const { token, user } = useAuth();

  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);

  const isOP = !!opId && comment.author?.id === opId;
  const isMine = !!user?.id && comment.author?.id === user.id;
  const isHighlighted = highlightedId === comment.id;

  const counts = {
    heart: comment.reactions?.filter((r: any) => r.kind === "heart").length ?? 0,
    support: comment.reactions?.filter((r: any) => r.kind === "support").length ?? 0,
    thoughtful: comment.reactions?.filter((r: any) => r.kind === "thoughtful").length ?? 0,
  };

  const directReplies = comment.replies?.length ?? 0;

  const totalDescendants = useMemo(() => countDescendants(comment), [comment]);

  async function react(kind: string) {
    if (!token) return;

    await fetch(`${API_URL}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ kind, commentId: comment.id }),
    });

    refresh();
  }

  async function submitReply() {
    if (!replyText.trim()) return;
    if (!token) return;

    await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        postId: comment.postId,
        content: replyText,
        parentId: comment.id,
      }),
    });

    setReplyText("");
    setReplying(false);
    refresh();
  }

  async function saveEdit() {
    if (!editText.trim()) return;
    if (!token) return;

    const res = await fetch(`${API_URL}/comments/${comment.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editText }),
    });

    if (!res.ok) {
      alert("Failed to edit comment");
      return;
    }

    setEditing(false);
    refresh();
  }

  async function handleDelete() {
  if (!token) return;
  if (!confirm("Delete this comment?")) return;

  await fetch(`${API_URL}/comments/${comment.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  refresh();
}

  return (
    <div
      id={`comment-${comment.id}`}
      className="relative mt-3"
      style={{ marginLeft: visualDepth * 20 }}
    >
      {/* vertical thread line */}
      {depth > 0 && (
        <div className="absolute left-[-10px] top-0 bottom-0 w-px bg-gray-300" />
      )}

      <div
        className={[
          "border rounded bg-white shadow-sm p-3",
          isHighlighted ? "ring-2 ring-indigo-400" : "",
          isOP ? "border-indigo-300" : "border-stone-200",
        ].join(" ")}
      >
        {/* header row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">{comment.author.nickname}</span>
          {isOP && (
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-indigo-50 text-indigo-600">
              OP
            </span>
          )}
          <span className="text-[10px] text-gray-400">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        {/* content / edit */}
        {!editing ? (
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.content}</p>
        ) : (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={saveEdit}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.content);
                }}
                className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* actions */}
        <div className="flex flex-wrap gap-4 text-xs mt-2 items-center">
          <button onClick={() => react("heart")}>❤️ {counts.heart}</button>
          <button onClick={() => react("support")}>🤝 {counts.support}</button>
          <button onClick={() => react("thoughtful")}>💭 {counts.thoughtful}</button>

          <button onClick={() => setReplying(!replying)} className="text-blue-600">
            Reply
          </button>

          {isMine && (
            <button
              onClick={() => setEditing(!editing)}
              className="text-slate-600"
            >
              {editing ? "Stop editing" : "Edit"}
            </button>
          )}

          {/* permalink */}
          <Link
            to={`/post/${comment.postId}?comment=${comment.id}`}
            className="text-slate-500 hover:underline"
          >
            Permalink
          </Link>

          {/* collapse/expand with total descendant preview */}

          {/* Delete */}
          {user?.id === comment.authorId && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          )}

          {totalDescendants > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500"
            >
              {collapsed
                ? `Expand (${totalDescendants} replies)`
                : `Collapse (${directReplies}/${totalDescendants})`}
            </button>
          )}
        </div>

        {/* reply box */}
        {replying && (
          <div className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Write a reply..."
            />
            <button
              onClick={submitReply}
              className="mt-2 bg-indigo-500 text-white px-3 py-1 rounded text-sm"
            >
              Reply
            </button>
          </div>
        )}
      </div>

      {/* replies container: smooth collapse/expand */}
      <div
        className={[
          "transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "max-h-0 opacity-0" : "max-h-[4000px] opacity-100",
        ].join(" ")}
      >
        {/* “Continue thread” when too deep */}
        {!collapsed && depth >= MAX_VISUAL_DEPTH && (comment.replies?.length ?? 0) > 0 && (
          <div className="mt-2 ml-4 text-sm text-blue-600">
            <Link to={`/post/${comment.postId}?comment=${comment.id}`} className="hover:underline">
              Continue thread →
            </Link>
          </div>
        )}

        {/* recursive children only if under depth */}
        {!collapsed &&
          depth < MAX_VISUAL_DEPTH &&
          comment.replies?.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              refresh={refresh}
              depth={depth + 1}
              opId={opId}
              highlightedId={highlightedId}
            />
          ))}
      </div>
    </div>
  );
}