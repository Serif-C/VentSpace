import { Outlet, Link } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-6 py-3 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/new">New</Link>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}