import { useEffect, useState } from "react";
// import { mockPosts } from "../data/mockPosts";
import type { Post } from "../types/post";
import PostCard from "../components/post/PostCard";
import { useOutletContext } from "react-router-dom";
import { getPosts } from "../services/postsService";
import { useLocation } from "react-router-dom";

export default function HomePage() {
  const [sort, setSort] = useState<"new" | "trending" | "discussed">("new");
  // const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { selectedTag } = useOutletContext<{ selectedTag: string | null }>();
  const location = useLocation();
  
  const [posts, setPosts] = useState<Post[]>([]);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const search = params.get("search");

  setPosts([]);
  setNextCursor(null);

  loadInitial(search || undefined);
}, [location.search]);

async function loadInitial(search?: string) {
  setLoading(true);
  try {
    const { posts: newPosts, nextCursor } = await getPosts({
      search,
      take: 10,
    });

    setPosts(newPosts);
    setNextCursor(nextCursor);
  } finally {
    setLoading(false);
  }
}

async function loadMore() {
  if (!nextCursor) return;

  const params = new URLSearchParams(location.search);
  const search = params.get("search");

  const { posts: morePosts, nextCursor: newCursor } = await getPosts({
    search: search || undefined,
    cursor: nextCursor,
    take: 10,
  });

  setPosts(prev => [...prev, ...morePosts]);
  setNextCursor(newCursor);
}
  const sortedPosts = [...posts]
    .filter((post) =>
      selectedTag ? post.tags.includes(selectedTag) : true
    )
    .sort((a, b) => {
      if (sort === "new") {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }

      if (sort === "trending") {
        const totalA =
          a.reactions.heart +
          a.reactions.support +
          a.reactions.thoughtful;

        const totalB =
          b.reactions.heart +
          b.reactions.support +
          b.reactions.thoughtful;

        return totalB - totalA;
      }

      if (sort === "discussed") {
        return b.commentCount - a.commentCount;
      }

      return 0;
    });

  return (
    <div className="home-layout">

      {/* MAIN FEED */}
      <div className="main-feed">
        <h2>Welcome to VentSpace</h2>
        <p className="subtitle">
          A safe anonymous space to vent and reflect.
        </p>

        <div className="sort-tabs">
          <button onClick={() => setSort("new")}>🆕 New</button>
          <button onClick={() => setSort("trending")}>🔥 Trending</button>
          <button onClick={() => setSort("discussed")}>💬 Discussed</button>
        </div>

        {sortedPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {nextCursor && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}