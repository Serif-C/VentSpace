import { Outlet, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function MinimalLayout() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* TOP BAR */}
      <header
        className="border-b backdrop-blur sticky top-0 z-30"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* LOGO */}
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.location.reload();
              }
            }}
            className="text-2xl font-semibold text-indigo-500 hover:text-indigo-600 transition"
          >
            VentSpace
          </Link>

          {/* RIGHT SIDE */}
          <Link
            to="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* CENTERED CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-[var(--muted)] py-6">
        VentSpace — a safe place to reflect and breathe
      </footer>
    </div>
  );
}