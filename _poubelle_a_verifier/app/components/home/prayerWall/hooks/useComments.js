import { useState, useMemo } from "react";
import { fetchApi } from "@/lib/fetchApi";

export default function useComments() {

  const [commentsByPrayer, setCommentsByPrayer] = useState({});

  const loadComments = async (prayerId) => {
    const data = await fetchApi(`/api/comments/${prayerId}`);

    setCommentsByPrayer((prev) => ({
      ...prev,
      [prayerId]: data
    }));
  };

  const addComment = async (body) => {
    await fetchApi("/api/comments", {
      method: "POST",
      body
    });
  };

  const deleteComment = async (id) => {
    await fetchApi(`/api/comments/delete/${id}`, {
      method: "DELETE"
    });
  };

  const editComment = async (id, text) => {
    return fetchApi(`/api/comments/${id}`, {
      method: "PUT",
      body: { text }
    });
  };

  return {
    commentsByPrayer,
    loadComments,
    addComment,
    deleteComment,
    editComment
  };
}