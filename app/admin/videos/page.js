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
    return <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Chargement...</p>;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
          Ressources
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Vidéos d&apos;encouragement</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ajoute les vidéos qui seront proposées aux visiteurs.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la vidéo"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            required
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL YouTube"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message d'encouragement"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            rows={5}
            required
          ></textarea>
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Ajouter la vidéo
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">Vidéos publiées</h2>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {videos.length}
          </span>
        </div>
        <ul className="space-y-4">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video) => (
            <li key={video._id} className="rounded-lg border border-slate-200 p-4">
              <p className="font-bold text-slate-950">{video.title}</p>
              <p className="mb-3 mt-1 text-sm leading-6 text-slate-600">{video.message}</p>
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="260"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.url)}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleDelete(video._id)}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            Aucune vidéo pour le moment.
          </p>
        )}
        </ul>
      </div>
    </section>
  );
}
