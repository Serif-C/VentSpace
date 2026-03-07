// export type Post = {
//   _count: any;
//   comments: any;
//   id: string;
//   title: string;
//   content: string;
//   tags: string[];
//   createdAt: string;
//   reactions: {
//     heart: number;
//     support: number;
//     thoughtful: number;
//   };
//   commentCount: number;
//   viewerReactions: string[];
// };

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

  viewerReactions?: string[];

  comments?: any[];
  _count?: any;
};