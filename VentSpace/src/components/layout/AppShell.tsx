import { Outlet, Link, NavLink } from "react-router-dom";
import RightSidebar from "../../components/RightSideBar";
import { mockPosts } from "../../data/mockPosts";
import { useState } from "react";

export default function AppShell() {

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allTags = Array.from(
  new Set(mockPosts.flatMap(post => post.tags))
  );

  return (
    <div className="min-h-screen bg-stone-100 text-slate-800">

      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-semibold text-indigo-500"
          >
            VentSpace
          </Link>

          <nav className="flex gap-8 text-sm font-medium">
            <NavLink
              to="/feed"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-500"
                  : "text-slate-600 hover:text-indigo-500 transition"
              }
            >
              Feed
            </NavLink>

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

            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="block text-sm text-slate-500 hover:text-indigo-500"
              >
                #{tag}
              </button>
            ))}

          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="col-span-12 lg:col-span-7">
          <Outlet context={{ selectedTag }} />
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block col-span-3">
          <RightSidebar posts={mockPosts} />
        </aside>

      </div>

      <footer className="text-center text-xs text-slate-400 py-6">
        VentSpace — a safe place to reflect and breathe
      </footer>

    </div>
  );
}