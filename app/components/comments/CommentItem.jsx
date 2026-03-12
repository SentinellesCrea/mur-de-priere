export default function CommentItem({ comment, depth = 0 }) {
  return (
    <div className={`mt-2 ${depth > 0 ? "ml-6 border-l pl-4" : ""}`}>

      <p className="text-sm">
        <strong>{comment.authorName}</strong> : {comment.text}
      </p>

      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

    </div>
  );
}