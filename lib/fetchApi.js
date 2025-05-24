// /lib/fetchApi.js

export async function fetchApi(url, options = {}) {
  try {
    const { body, headers = {}, ...rest } = options;

    // Détecter si c’est un objet à transformer en JSON
    const isJson = body && typeof body === "object" && !(body instanceof FormData);

    const finalHeaders = {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...headers,
    };

    const response = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
      body: isJson ? JSON.stringify(body) : body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    // Vérifie que la réponse est bien du JSON avant de parser
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return {}; // fallback si ce n’est pas du JSON
  } catch (error) {
    console.error(`❌ fetchApi error [${url}] :`, error.message);
    throw error;
  }
}
