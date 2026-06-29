// /lib/fetchApi.js

export async function fetchApi(url, options = {}) {
  try {
    const { body, headers = {}, ...rest } = options;
    const method = String(rest.method || "GET").toUpperCase();

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
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const notifySupervisorRefresh = () => {
      if (
        typeof window !== "undefined" &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        typeof url === "string" &&
        url.startsWith("/api/supervisor")
      ) {
        window.dispatchEvent(
          new CustomEvent("supervisor:data-refresh", {
            detail: { url, method },
          })
        );
      }

      if (
        typeof window !== "undefined" &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
        typeof url === "string" &&
        url.startsWith("/api/volunteers")
      ) {
        window.dispatchEvent(
          new CustomEvent("volunteer:data-refresh", {
            detail: { url, method },
          })
        );
      }
    };

    // Vérifie que la réponse est bien du JSON avant de parser
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      notifySupervisorRefresh();
      return data;
    }

    notifySupervisorRefresh();
    return {}; // fallback si ce n’est pas du JSON
  } catch (error) {
    if (![401, 403].includes(error.status)) {
      console.error(`❌ fetchApi error [${url}] :`, error.message);
    }
    throw error;
  }
}
