import { apiFetch } from "./api";

export type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  postId?: string | null;
};

export async function getNotifications(): Promise<Notification[]> {
  return apiFetch("/notifications", {
    auth: true,
  });
}

export async function markAllAsRead() {
  return apiFetch("/notifications/read-all", {
    method: "POST",
    auth: true,
  });
}