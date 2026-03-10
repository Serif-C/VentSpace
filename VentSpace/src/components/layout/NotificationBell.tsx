import { useEffect, useRef, useState } from "react";
import { getNotifications, markAllAsRead, type Notification } from "../../services/notificationsService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [previousUnread, setPreviousUnread] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function loadNotifications() {
    if (!user) return;

    const data = await getNotifications();

    const newUnread = data.filter(n => !n.read).length;

    // Detect new notifications
    if (newUnread > previousUnread) {
      setAnimate(true);

       // Find newest unread notification
      const newest = data.find(n => !n.read);

      if (newest) {
        setToast(newest);

        setTimeout(() => {
          setToast(null);
        }, 5000);
      }

      setTimeout(() => {
        setAnimate(false);
      }, 600);
    }

    setPreviousUnread(newUnread);
    setNotifications(data);
  }

  async function handleOpen() {
  const newOpen = !open;
  setOpen(newOpen);

  if (!open) {
    await loadNotifications();
    await markAllAsRead();

    // Optimistically mark as read locally
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }
}

  useEffect(() => {
  if (!user) return;

  loadNotifications(); // initial fetch

  const interval = setInterval(() => {
    loadNotifications(); // poll every 30 seconds
  }, 30000);

  return () => clearInterval(interval);
}, [user]);

    useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
        if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
        ) {
        setOpen(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className={`relative text-slate-600 hover:text-indigo-500 transition ${
          animate ? "animate-bounce" : ""
        }`}
      >
        <Bell size={18} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-xl border border-stone-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b text-sm font-semibold">
            Notifications
          </div>

          {notifications.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              You're all caught up 🎉
            </div>
          )}

          {notifications.map(note => (
            <Link
              key={note.id}
              to={note.postId ? `/post/${note.postId}` : "#"}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm hover:bg-stone-50 transition ${
                !note.read ? "bg-indigo-50" : ""
              }`}
            >
              <div>{note.message}</div>
              <div className="text-xs text-slate-400 mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      {toast && (
        <Link
          to={toast.postId ? `/post/${toast.postId}` : "#"}
          onClick={() => setToast(null)}
          className="fixed top-20 right-6 w-80 bg-white shadow-xl border border-stone-200 rounded-xl p-4 z-[9999] animate-slide-in"
        >
          <div className="text-sm font-medium">
            <Bell size={16} />
            {toast.message}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {new Date(toast.createdAt).toLocaleString()}
          </div>
        </Link>
      )}
    </div>
  );
}