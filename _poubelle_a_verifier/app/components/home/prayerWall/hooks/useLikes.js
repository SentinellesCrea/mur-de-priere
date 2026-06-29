import { useState } from "react";
import { fetchApi } from "@/lib/fetchApi";

export default function useLikes() {

  const [likedIds, setLikedIds] = useState([]);

  const toggleLike = async (commentId) => {

    const alreadyLiked = likedIds.includes(commentId);

    const data = await fetchApi(`/api/comments/likes/${commentId}`, {
      method: "PUT",
      body: { remove: alreadyLiked }
    });

    if (alreadyLiked) {
      setLikedIds((prev) => prev.filter((id) => id !== commentId));
    } else {
      setLikedIds((prev) => [...prev, commentId]);
    }

    return data.likes;
  };

  return {
    likedIds,
    toggleLike
  };
}