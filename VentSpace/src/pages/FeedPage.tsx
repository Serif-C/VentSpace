import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getMyPosts, getPosts } from "../services/postsService";
import PostCard from "../components/post/PostCard";
import type { Post } from "../types/post";
import { useAuth } from "../context/AuthContext";

type OutletContext = {
  selectedTag: string | null;
};

export default function FeedPage() {
  const { selectedTag } = useOutletContext<OutletContext>();
  const { token } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      if (!token) return;

      try {
        const data = await getMyPosts(token);
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  return (
    <div className="space-y-6">
      {filteredPosts.length === 0 ? (
        <p className="text-slate-500">You haven’t posted anything yet.</p>
      ) : (
        filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
}