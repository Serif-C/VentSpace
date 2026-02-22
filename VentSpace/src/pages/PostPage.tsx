import { useParams } from "react-router-dom";
import { useState } from "react";
import { mockPosts } from "../data/mockPosts";
import { mockComments } from "../data/mockComments";
import type { Comment } from "../types/comment";

export default function PostPage() {
  const { id } = useParams();

  const post = mockPosts.find(p => p.id === id);

  const initialComments =
    mockComments.filter(comment => comment.postId === id);

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  if (!post) return <p>Post not found</p>;

  function submitComment() {
    if (!newComment.trim()) return;

    const newEntry: Comment = {
      id: Date.now().toString(),
      postId: id!,
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newEntry]);
    setNewComment("");
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <p className="text-xl mb-2">{post.content}</p>

      <div className="mb-4 flex gap-2">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <h2 className="font-semibold mt-6 mb-2">Comments</h2>

      <div className="space-y-2">
        {comments.map(comment => (
          <div key={comment.id} className="border p-2 rounded">
            {comment.content}
          </div>
        ))}
      </div>

      <textarea
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        className="w-full border rounded p-2 mt-4"
        placeholder="Write a comment..."
      />

      <button
        onClick={submitComment}
        className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded"
      >
        Post Comment
      </button>
    </div>
  );
}