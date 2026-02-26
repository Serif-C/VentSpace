export type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  reactions: {
    heart: number;
    support: number;
    thoughtful: number;
  };
  commentCount: number;
};