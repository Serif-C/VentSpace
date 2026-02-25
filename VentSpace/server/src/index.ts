import express from "express";
import cors from "cors";
import { env } from "./env";

import authRoutes from "./auth/auth.routes";
import usersRoutes from "./users/users.routes";
import postsRoutes from "./posts/posts.routes";
import commentsRoutes from "./comments/comments.routes";
import reactionsRoutes from "./reactions/reactions.routes";
import notificationsRoutes from "./notifications/notifications.routes";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/reactions", reactionsRoutes);
app.use("/notifications", notificationsRoutes);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});