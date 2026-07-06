"use client";

export default function AccordionBlockForm({ data = {}, onChange }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Titre, ex : Pour aller plus loin"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <textarea
        rows={6}
        value={data.items || ""}
        onChange={(e) => onChange({ ...data, items: e.target.value })}
        placeholder={"Une ligne par élément :\nQuestion 1 :: Réponse affichée quand on ouvre\nQuestion 2 :: Autre réponse\n\nOu bien :\nTitre de section\nContenu de cette section"}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <p className="text-xs leading-5 text-gray-400">
        Format conseillé : titre, deux deux-points, puis contenu. Exemple : “Pourquoi prier ? :: Pour ouvrir son cœur à Dieu.”
      </p>
    </div>
  );
}
