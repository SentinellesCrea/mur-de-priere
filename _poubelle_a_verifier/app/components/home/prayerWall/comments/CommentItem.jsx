import { useState } from "react";
import CommentReplies from "./CommentReplies";
import CommentActions from "./CommentActions";

export default function CommentItem({ comment }) {
  const [showReplies, setShowReplies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_LENGTH = 200;
  const isLong = comment.text?.length > MAX_LENGTH;

  const displayedText = isExpanded
    ? comment.text
    : comment.text?.slice(0, MAX_LENGTH);

  return (
    <div className="bg-gray-100 text-sm text-gray-800 p-2 rounded">

      <p>
        <strong>{comment.authorName || "Anonyme"}</strong>
        {" : "}
        {displayedText}
        {!isExpanded && isLong && "..."}
      </p>

      {/* Bouton lire la suite */}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#d8947c] hover:underline ml-1"
        >
          {isExpanded ? "Réduire" : "Lire la suite"}
        </button>
      )}

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