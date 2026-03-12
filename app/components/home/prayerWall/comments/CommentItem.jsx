import { useState } from "react";
import CommentReplies from "./CommentReplies";
import CommentActions from "./CommentActions";

export default function CommentItem({ comment }) {

  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="bg-gray-100 text-sm text-gray-800 p-2 rounded">

      <p>
        <strong>{comment.authorName || "Anonyme"}</strong>
        {" : "}
        {comment.text}
      </p>

      <CommentActions comment={comment} />

      {comment.replies?.length > 0 && !showReplies && (
        <button
          onClick={() => setShowReplies(true)}
          className="text-xs text-[#d8947c] hover:underline mt-1"
        >
          Voir les réponses ({comment.replies.length})
        </button>
      )}

      {showReplies && (
        <CommentReplies
          replies={comment.replies}
          onClose={() => setShowReplies(false)}
        />
      )}

    </div>
  );
}