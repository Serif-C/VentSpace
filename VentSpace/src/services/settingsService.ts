import { apiFetch } from "./api";

export type UserSettings = {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  notifyOnComments: boolean;
  notifyOnReactions: boolean;
};

export async function getUserSettings(): Promise<UserSettings> {
  return apiFetch("/users/me", { auth: true });
}

export async function updateUserSettings(data: {
  nickname?: string;
  avatarUrl?: string;
  password?: string;
  notifyOnComments?: boolean;
  notifyOnReactions?: boolean;
}) {
  return apiFetch("/users/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(data),
  });
}