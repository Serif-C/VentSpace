import { mockPosts, postScore } from "../data/mockPosts";
import PostCard from "../components/post/PostCard";
import { useState } from "react";

export default function FeedPage() {

  // ✅ 1. Tag state goes FIRST inside component
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // ✅ 2. Filter posts based on selected tag
  const filteredPosts = selectedTag
    ? mockPosts.filter(post => post.tags.includes(selectedTag))
    : mockPosts;

  // ✅ 3. Now build trending from FILTERED posts
  const trending = [...filteredPosts]
    .sort((a, b) => postScore(b) - postScore(a))
    .slice(0, 3);

  // ✅ 4. And sorted feed from FILTERED posts
  const rest = [...filteredPosts].sort(
    (a, b) => postScore(b) - postScore(a)
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">

      {/* Filter indicator */}
      {selectedTag && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm">
            Filtering by #{selectedTag}
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className="text-xs bg-red-100 px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>
      )}

      <section>
        <h2 className="text-xl font-bold mb-2">🔥 Trending</h2>
        <div className="space-y-3">
          {trending.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onTagClick={setSelectedTag}   // 👈 pass handler
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">📰 Feed</h2>
        <div className="space-y-3">
          {rest.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onTagClick={setSelectedTag}   // 👈 pass handler
            />
          ))}
        </div>
      </section>

    </div>
  );
}