import type { Comment } from "../../types/comment";

type Props = {
  comment: Comment;
};

export default function CommentItem({ comment }: Props) {
  return (
    <div className="border rounded-lg p-3">
      <p>{comment.content}</p>

      <div className="mt-2 flex gap-4 text-sm text-gray-500">
        👍 {comment.upvotes}
        👎 {comment.downvotes}
      </div>
    </div>
  );
}