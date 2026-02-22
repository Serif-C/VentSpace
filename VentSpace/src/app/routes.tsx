import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import HomePage from "../pages/HomePage";
import FeedPage from "../pages/FeedPage";
import CreatePostPage from "../pages/CreatePostPage";
import PostPage from "../pages/PostPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/feed", element: <FeedPage /> },
      { path: "/new", element: <CreatePostPage /> },
      { path: "/post/:id", element: <PostPage /> },
    ],
  },
]);