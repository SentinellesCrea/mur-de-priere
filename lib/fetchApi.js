// /lib/fetchApi.js

export async function fetchApi(url, options = {}) {
  try {
    const { body, headers = {}, ...rest } = options;

    const response = await fetch(url, {
      ...rest,
      credentials: "include", // Toujours inclure les cookies sécurisés
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ fetchApi error [${url}] :`, error.message);
    throw error;
  }
}
