import { Outlet, Link, NavLink } from "react-router-dom";
import RightSidebar from "../../components/RightSideBar";
// import { mockPosts } from "../../data/mockPosts";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AppShell() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const tagCounts: Record<string, number> = {};

  posts.forEach(post => {
    post.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);


  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  function handleSearch(e: React.FormEvent) {
  e.preventDefault();
  navigate(`/?search=${encodeURIComponent(search)}`);
  }

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800">

      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center px-6 py-4">

           {/* LEFT LOGO */}
          <Link
            to="/"
            className="text-2xl font-semibold text-indigo-500"
          >
            VentSpace
          </Link>

          {/* CENTER SEARCH */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex justify-center px-6"
          >
            <input
              type="text"
              placeholder="Search by tag or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </form>

          {/* RIGHT NAV */}
          <nav className="flex gap-6 items-center text-sm font-medium"></nav>

          <nav className="flex gap-6 items-center text-sm font-medium">

            <NavLink
              to="/feed"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-500"
                  : "text-slate-600 hover:text-indigo-500 transition"
              }
            >
              My Feed
            </NavLink>

            {user && (
              <NavLink
                to="/new"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-500"
                    : "text-slate-600 hover:text-indigo-500 transition"
                }
              >
                New Post
              </NavLink>
            )}

            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "text-indigo-500"
                      : "text-slate-600 hover:text-indigo-500 transition"
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    isActive
                      ? "text-indigo-500"
                      : "text-slate-600 hover:text-indigo-500 transition"
                  }
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                <span className="text-slate-500">
                  {user.nickname}
                </span>

                <button
                  onClick={logout}
                  className="text-red-500 hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-600">
              Explore
            </h3>

            <button
              onClick={() => setSelectedTag(null)}
              className="block text-sm text-slate-500 hover:text-indigo-500"
            >
              🔥 All
            </button>

            {sortedTags
            .slice(0, showAllTags ? sortedTags.length : 5)
            .map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="block text-sm text-slate-500 hover:text-indigo-500"
              >
                #{tag} ({tagCounts[tag]})
              </button>
            ))}

            {sortedTags.length > 5 && (
              <button
                onClick={() => setShowAllTags(prev => !prev)}
                className="text-xs text-indigo-500 hover:underline mt-2"
              >
                {showAllTags ? "Show Less" : "Show More"}
              </button>
            )}

          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="col-span-12 lg:col-span-7">
          <Outlet context={{ selectedTag }} />
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block col-span-3">
          <RightSidebar posts={posts} />
        </aside>

      </div>

      <footer className="text-center text-xs text-slate-400 py-6">
        VentSpace — a safe place to reflect and breathe
      </footer>

    </div>
  );
}
