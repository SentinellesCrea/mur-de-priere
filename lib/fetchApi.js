export async function fetchApi(url, options = {}) {
  try {
    const { body, headers = {}, ...rest } = options;

    const isJson = body && typeof body === "object" && !(body instanceof FormData);

    const finalHeaders = {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...headers,
    };

    const response = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
      body: isJson ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ fetchApi error [${url}] :`, error.message);
    throw error;
  }
}
