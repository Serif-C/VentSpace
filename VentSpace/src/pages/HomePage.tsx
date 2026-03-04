import { useEffect, useRef, useState } from "react";
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const search = params.get("search");

  setPosts([]);
  setNextCursor(null);

  loadInitial(search || undefined);
  }, [location.search]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [nextCursor, loading]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  <div className="space-y-8">

    {/* Page Header */}
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm">
  
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-slate-800">
      Welcome to VentSpace
    </h1>

    <p className="text-sm text-slate-500 mt-1">
      A safe anonymous space to vent and reflect.
    </p>
  </div>

  {/* Sticky Tabs */}
  <div className="sticky top-[73px] bg-white border-t border-stone-200 z-20">
    <div className="flex gap-8 px-6 py-4 text-sm font-medium">
      <button
        onClick={() => setSort("new")}
        className={`transition ${
          sort === "new"
            ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
            : "text-slate-500 hover:text-indigo-500"
        }`}
      >
        🆕 New
      </button>

      <button
        onClick={() => setSort("trending")}
        className={`transition ${
          sort === "trending"
            ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
            : "text-slate-500 hover:text-indigo-500"
        }`}
      >
        🔥 Trending
      </button>

      <button
        onClick={() => setSort("discussed")}
        className={`transition ${
          sort === "discussed"
            ? "text-indigo-600 border-b-2 border-indigo-600 pb-2"
            : "text-slate-500 hover:text-indigo-500"
        }`}
      >
        💬 Discussed
      </button>
    </div>
  </div>
</div>

    {/* Posts */}
    <div className="space-y-6">
      {sortedPosts.map((post: Post, index) => (
        <div
          key={post.id}
          className="fade-in-post"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <PostCard post={post} />
        </div>
      ))}
    </div>

    <div ref={loadMoreRef} className="h-10" />


    {showScrollTop && (
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="fixed bottom-8 right-8 bg-indigo-500 text-white 
                  w-12 h-12 rounded-full shadow-lg 
                  hover:bg-indigo-600 transition 
                  flex items-center justify-center text-xl"
      >
        ↑
      </button>
    )}
  </div>
);  
}