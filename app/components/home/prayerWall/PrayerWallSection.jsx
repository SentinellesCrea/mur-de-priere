"use client";

import PrayerCard from "./cards/PrayerCard";
import usePrayers from "./hooks/usePrayers";
import useComments from "./hooks/useComments";

const PAGE_SIZE = 4;

export default function PrayerWallSection() {

  const {
    pagedPrayers,
    loading,
    page,
    setPage,
    totalPages
  } = usePrayers(PAGE_SIZE);

  const {
    commentsByPrayer,
    loadComments
  } = useComments();

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <section>

      {pagedPrayers.map((prayer) => (

        <PrayerCard
          key={prayer._id}
          prayer={prayer}
          comments={commentsByPrayer[prayer._id]}
          onLoadComments={loadComments}
        />

      ))}

    </section>
  );
}