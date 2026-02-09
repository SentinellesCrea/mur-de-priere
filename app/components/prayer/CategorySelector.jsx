"use client";

import { prayerCategories } from "../../config/prayerCategories";

export default function CategorySelector({
  category,
  setCategory,
  subcategory,
  setSubcategory,
}) {
  const subcats = prayerCategories[category] || [];
  const hasOtherSub = subcats.includes("__OTHER__");

  return (
    <>
      {/* ================= CATÉGORIE ================= */}
      <select
        className="w-full p-3 border rounded-md"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSubcategory("");
        }}
        required
      >
        <option value="">-- Sélectionnez une catégorie --</option>
        {Object.keys(prayerCategories).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* ================= CAS 1 : CATÉGORIE = AUTRES ================= */}
      {category === "Autres" && (
        <input
          type="text"
          className="w-full p-3 border rounded-md"
          placeholder="Précisez votre sujet"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          required
        />
      )}

      {/* ================= CAS 2 : AUTRES CATÉGORIES ================= */}
      {category && category !== "Autres" && (
        <>
          <select
            className="w-full p-3 border rounded-md"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="">-- Sous-catégorie (optionnel) --</option>

            {subcats
              .filter((sub) => sub !== "__OTHER__")
              .map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}

            {hasOtherSub && (
              <option value="__OTHER__">Autre</option>
            )}
          </select>

          {/* Champ libre si "Autre" en sous-catégorie */}
          {subcategory === "__OTHER__" && (
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              placeholder="Précisez la sous-catégorie"
              onChange={(e) => setSubcategory(e.target.value)}
              required
            />
          )}
        </>
      )}
    </>
  );
}
