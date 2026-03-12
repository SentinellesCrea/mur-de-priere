import { useEffect, useMemo, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";

export default function usePrayers(pageSize) {

  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi("/api/prayerRequests");
        setPrayers(data || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalPages = Math.ceil(prayers.length / pageSize);

  const pagedPrayers = useMemo(() => {
    const start = page * pageSize;
    return prayers.slice(start, start + pageSize);
  }, [prayers, page, pageSize]);

  return {
    prayers,
    pagedPrayers,
    loading,
    page,
    setPage,
    totalPages,
  };
}