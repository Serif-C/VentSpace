import type { Comment } from "../../types/comment";
import CommentItem from "./CommentItem";

type Props = {
  comments: Comment[];
};

export default function CommentList({ comments }: Props) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}