import { mockPosts, postScore } from "../data/mockPosts";
import PostCard from "../components/post/PostCard";

export default function FeedPage() {
  const trending = [...mockPosts]
    .sort((a, b) => postScore(b) - postScore(a))
    .slice(0, 3);

  const rest = [...mockPosts].sort(
    (a, b) => postScore(b) - postScore(a)
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-2">🔥 Trending</h2>
        <div className="space-y-3">
          {trending.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">📰 Feed</h2>
        <div className="space-y-3">
          {rest.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}