import { FaHeart, FaEdit, FaTrash } from "react-icons/fa";

export default function CommentActions({ comment }) {

  return (
    <div className="flex justify-between mt-2">

      <button className="flex items-center gap-1 text-gray-400">
        <FaHeart size={14} />
        {comment.likes || 0}
      </button>

      <div className="flex gap-4">

        <button className="text-blue-600">
          <FaEdit size={14} />
        </button>

        <button className="text-red-600">
          <FaTrash size={14} />
        </button>

      </div>

    </div>
  );
}