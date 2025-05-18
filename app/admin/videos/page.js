"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import Swal from "sweetalert2";

export default function AdminVideosPage() {
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const data = await fetchApi("/api/admin/videos");
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        console.error('Résultat inattendu:', data);
        Swal.fire("Erreur", "Erreur lors du chargement des vidéos.", "error");
      }
    } catch (error) {
      console.error('Erreur chargement vidéos :', error.message);
      Swal.fire("Erreur", "Erreur serveur lors du chargement.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const admin = await fetchApi("/api/admin/me");

        if (!admin || !admin.firstName) {
          router.push("/admin/login");
          return;
        }
        await fetchVideos();
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    init();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !url.trim() || !message.trim()) {
      Swal.fire("Attention", "Tous les champs doivent être remplis.", "warning");
      return;
    }

    try {
      await fetchApi("/api/admin/videos", {
        method: "POST",
        body:{ title, url, message },
      });

      Swal.fire("Succès", "Vidéo ajoutée avec succès ✅", "success");

      setTitle('');
      setUrl('');
      setMessage('');
      fetchVideos(); // 🔄 Recharge après ajout
    } catch (error) {
      console.error('Erreur ajout vidéo :', error.message);
      Swal.fire("Erreur", error.message || "Erreur lors de l'ajout.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/api/admin/videos/${id}`, {
          method: "DELETE",
        });

        Swal.fire('Supprimé!', 'La vidéo a été supprimée.', 'success');
        fetchVideos();
      } catch (error) {
        console.error('Erreur suppression vidéo :', error.message);
        Swal.fire('Erreur', error.message || 'Erreur lors de la suppression.', 'error');
      }
    }
  };

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">🎥 Gérer les Vidéos d'encouragement</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la vidéo"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL YouTube"
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message d'encouragement"
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Ajouter la vidéo
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">📋 Liste des vidéos</h2>
      <ul className="space-y-4">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video) => (
            <li key={video._id} className="border p-4 rounded shadow">
              <p className="font-semibold">🎞️ {video.title}</p>
              <p className="text-sm text-gray-600 italic mb-2">{video.message}</p>
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="350"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.url)}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded"
                ></iframe>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleDelete(video._id)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>Aucune vidéo pour le moment.</p>
        )}
      </ul>
    </div>
  );
}
