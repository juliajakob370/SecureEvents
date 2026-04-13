const REFRESH_URL = "http://localhost:5000/api/users/refresh-token";

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        try {
            const response = await fetch(REFRESH_URL, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            return response.ok;
        } catch {
            return false;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}

// Wrapper for authenticated API calls. Guarantees:
//   - Cookie credentials are sent (JWT cookie reaches the backend).
//   - A single 401 triggers one refresh-token attempt and one retry, so
//     short-lived access tokens don't surface as spurious user-facing errors.
export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const merged: RequestInit = { ...init, credentials: "include" };

    let response = await fetch(input, merged);
    if (response.status !== 401) {
        return response;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
        return response;
    }

    return fetch(input, merged);
}
