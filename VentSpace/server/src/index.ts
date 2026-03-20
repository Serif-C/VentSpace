import express from "express";
import cors from "cors";
import { env } from "./env.js";

import authRoutes from "./auth/auth.routes.js";
import usersRoutes from "./users/users.routes.js";
import postsRoutes from "./posts/posts.routes.js";
import commentsRoutes from "./comments/comments.routes.js";
import reactionsRoutes from "./reactions/reactions.routes.js";
import notificationsRoutes from "./notifications/notifications.routes.js";
import chatRoutes from "./chat/chat.routes.js";

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
app.use("/chat", chatRoutes);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});