import { Outlet, Link, NavLink } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-amber-50 text-slate-800">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-semibold text-indigo-500"
          >
            VentSpace
          </Link>

          <nav className="flex gap-6 text-sm font-medium">
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        VentSpace — a safe place to reflect and breathe
      </footer>
    </div>
  );
}