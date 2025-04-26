// /lib/fetchApi.js

export async function fetchApi(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Toujours inclure les cookies sécurisés
    });

    // Gestion d'erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Cas où la réponse ne serait pas JSON
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    // Retourner la réponse JSON directement
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ fetchApi error [${url}] :`, error.message);
    throw error; // Laisse le composant qui appelle décider quoi faire
  }
}
