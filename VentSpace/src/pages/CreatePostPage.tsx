import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/postsService";
import { useAuth } from "../context/AuthContext";

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createPost(
        title,
        content,
        tags.split(",").map(t => t.trim()),
        token!
      );

      navigate("/feed");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm space-y-4"
    >
      <input
        type="text"
        placeholder="Give your post a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border p-3 rounded-lg"
        required
      />

      <input
        value={tags}
        onChange={e => setTags(e.target.value)}
        placeholder="tags (comma separated)"
        className="w-full border p-2 rounded-lg"
      />

      <button
        type="submit"
        className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
      >
        Post
      </button>
    </form>
  );
}