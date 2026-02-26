export type User = {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};