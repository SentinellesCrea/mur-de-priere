'use client';
import Swal from "sweetalert2";
import { useEffect, useState } from 'react';

export default function VolunteersValidationPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/volunteers/pending", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await res.json();
      setVolunteers(data);
    } catch (error) {
      console.error("Erreur chargement bénévoles :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    const res = await fetch(`/api/admin/volunteers/validate/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    const data = await res.json();
    setFeedback(data.message);
    fetchVolunteers();
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous ne pourrez pas revenir en arrière !",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, supprimer !',
  });

  if (result.isConfirmed) {
    try {
    const res = await fetch(`/api/admin/volunteers/reject/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    const data = await res.json();
    setFeedback(data.message);
    fetchVolunteers();
      }
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Validation des Bénévoles</h1>

      {feedback && <div className="mb-4 text-green-600">{feedback}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : volunteers.length === 0 ? (
        <p>Aucun bénévole en attente.</p>
      ) : (
        <ul className="space-y-4">
          {volunteers.map((v) => (
            <li key={v._id} className="border p-4 rounded shadow">
              <p><strong>Prénom :</strong> {v.firstName}</p>
              <p><strong>Email :</strong> {v.email}</p>

              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleValidate(v._id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleReject(v._id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
