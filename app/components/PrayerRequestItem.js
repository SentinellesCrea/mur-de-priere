import { useState } from "react";

const PrayerRequestItem = ({ request, user, refreshRequests }) => {
  const [isAssigned, setIsAssigned] = useState(request.assignedTo === user?._id);

  const handleAssign = async () => {
    try {
      const res = await fetch("/api/prayerRequests/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request._id, volunteerId: user._id }),
      });

      if (res.ok) {
        setIsAssigned(true);
        refreshRequests(); // Recharge la liste des demandes
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation :", error);
    }
  };

  return (
    <div className="border p-4 rounded shadow">
      <p><strong>Message :</strong> {request.message}</p>
      <p><strong>De :</strong> {request.name} ({request.email})</p>
      {isAssigned ? (
        <p className="text-green-500 font-semibold">✅ Pris en charge</p>
      ) : (
        <button onClick={handleAssign} className="bg-blue-500 text-white px-4 py-2 rounded">
          Je m'en occupe
        </button>
      )}
    </div>
  );
};

export default PrayerRequestItem;
