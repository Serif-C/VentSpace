import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import HomePage from "../pages/HomePage";
import FeedPage from "../pages/FeedPage";
import CreatePostPage from "../pages/CreatePostPage";
import PostPage from "../pages/PostPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import SettingsPage from "../pages/SettingsPage";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "feed", element: <FeedPage /> },

      {
        path: "new",
        element: (
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },

      { path: "post/:id", element: <PostPage /> },
    ],
  },

  // Auth pages OUTSIDE layout
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
]);