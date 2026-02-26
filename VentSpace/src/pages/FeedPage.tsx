import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getPosts } from "../services/postsService";
import PostCard from "../components/post/PostCard";
import type { Post } from "../types/post";

type OutletContext = {
  selectedTag: string | null;
};

export default function FeedPage() {
  const { selectedTag } = useOutletContext<OutletContext>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts();
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
      {filteredPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}