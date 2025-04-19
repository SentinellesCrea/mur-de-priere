'use client';

import { useEffect, useState } from 'react';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();

      if (!res.ok) {
        console.error('Erreur API vidéos:', data.message);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Résultat inattendu:', data);
        return;
      }

      setVideos(data);
    } catch (error) {
      console.error('Erreur chargement vidéos :', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback('✅ Vidéo ajoutée avec succès !');
        setTitle('');
        setUrl('');
        setMessage('');
        fetchVideos();
      } else {
        setFeedback(data.message || 'Erreur lors de l’ajout');
      }
    } catch (error) {
      console.error('Erreur ajout vidéo :', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Erreur suppression vidéo :', error);
    }
  };

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">🎥 Gérer les Vidéos d'encouragement</h1>

      {feedback && <div className="mb-4 text-green-600 font-semibold">{feedback}</div>}

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