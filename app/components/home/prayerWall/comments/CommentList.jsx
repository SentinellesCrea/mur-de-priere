import { buildCommentTree } from "../utils/buildCommentTree";
import CommentItem from "./CommentItem";

export default function CommentList({ comments }) {

  if (!comments || comments.length === 0) {
    return (
      <p className="text-sm italic text-gray-500 mt-2">
        Aucun commentaire pour le moment.
      </p>
    );
  }

  const tree = buildCommentTree(comments);

  return (
    <div className="mt-4 space-y-2">

      <h4 className="text-sm font-semibold text-gray-700">
        Commentaires d’encouragement
      </h4>

      {tree.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}

    </div>
  );
}