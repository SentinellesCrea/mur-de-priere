import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi"; // adapte si ton fetchApi est ailleurs

const useVolunteer = () => {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const data = await fetchApi("/api/volunteers/me", {
          method: "GET",
          credentials: "include",
        });
        setVolunteer(data);
      } catch (err) {
        console.error("Erreur lors du chargement du bénévole :", err.message);
        setVolunteer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, []);

  return { volunteer, loading };
};

export default useVolunteer;
