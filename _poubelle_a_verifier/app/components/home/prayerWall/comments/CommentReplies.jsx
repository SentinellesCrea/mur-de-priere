import CommentItem from "./CommentItem";

export default function CommentReplies({ replies, onClose }) {

  return (
    <div className="ml-6 border-l pl-4 border-gray-300 mt-2 space-y-2">

      {replies.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
        />
      ))}

      <button
        onClick={onClose}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Masquer les réponses
      </button>

    </div>
  );
}