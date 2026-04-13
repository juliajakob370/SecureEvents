import { authFetch } from "./authFetch";

const BASE_URL = "http://localhost:5000/api/users";

export type SavedCard = {
    id: number;
    cardName: string;
    cardLast4: string;
    expiryDate: string;
    billingAddress: string;
};

async function buildError(response: Response, fallback: string) {
    try {
        const data = await response.json();
        if (data?.message) {
            return new Error(String(data.message));
        }
    } catch {
    }
    return new Error(fallback);
}

export async function listSavedCards(): Promise<SavedCard[]> {
    const response = await authFetch(`${BASE_URL}/me/cards`, { method: "GET" });
    if (!response.ok) {
        throw await buildError(response, "Failed to load saved cards");
    }
    return await response.json();
}

export async function addSavedCard(payload: {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    billingAddress: string;
}): Promise<SavedCard> {
    const response = await authFetch(`${BASE_URL}/me/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw await buildError(response, "Failed to save card");
    }
    return await response.json();
}

export async function removeSavedCard(id: number): Promise<void> {
    const response = await authFetch(`${BASE_URL}/me/cards/${id}`, { method: "DELETE" });
    if (!response.ok) {
        throw await buildError(response, "Failed to remove card");
    }
}
