import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import FeedPage from "./pages/FeedPage"; // if you have one
import PostPage from "./pages/PostPage";

function App() {
  return (
    <Routes>

    <Route path="/" element={<AppShell />}>

      <Route index element={<HomePage />} />
      <Route path="feed" element={<HomePage />} />

      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="new"
        element={
          <ProtectedRoute>
            <div>Create Post Page</div>
          </ProtectedRoute>
        }
      />

      <Route path="post/:id" element={<PostPage />} />

    </Route>

    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

  </Routes>
  );
}

export default App;