// Event type used by frontend and backend responses.
export type EventItem = {
    id?: number;
    createdByUserId?: number | null;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    organizer: string;
    image: string;
    status: string;
    capacity: number;
    price: string;
};

const BASE_URL = "http://localhost:5000/api/events";
const GATEWAY_ORIGIN = "http://localhost:5000";

function normalizeImageUrl(image?: string) {
    if (!image) {
        return image;
    }

    if (image.startsWith("/uploads/")) {
        return `${GATEWAY_ORIGIN}${image}`;
    }

    return image;
}

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

export async function getEventAvailability(eventId: number) {
    const response = await fetch(`${BASE_URL}/${eventId}/availability`, {
        method: "GET"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to load ticket availability");
    }

    return await response.json();
}

export async function uploadEventImage(file: File) {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`${BASE_URL}/upload-image`, {
        method: "POST",
        credentials: "include",
        body: form
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to upload event image");
    }

    const data = await response.json();
    const imageUrl = typeof data?.imageUrl === "string" ? normalizeImageUrl(data.imageUrl) : "";
    return { imageUrl };
}

// Get all events from backend.
export async function getEvents(): Promise<EventItem[]> {
    const response = await fetch(BASE_URL, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to load events");
    }

    const events = await response.json();
    return Array.isArray(events)
        ? events.map((event) => ({ ...event, image: normalizeImageUrl(event.image) }))
        : [];
}

export async function requestEventCancelCode(eventId: number) {
    const response = await fetch(`${BASE_URL}/${eventId}/request-cancel-code`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to send cancellation code");
    }

    return await response.json();
}

export async function refundCancelEvent(eventId: number, code: string) {
    const response = await fetch(`${BASE_URL}/${eventId}/refund-cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to cancel event and refund");
    }

    const result = await response.json();
    if (result?.eventItem?.image) {
        result.eventItem.image = normalizeImageUrl(result.eventItem.image);
    }

    return result;
}

export async function getMyEvents(): Promise<EventItem[]> {
    const response = await fetch(`${BASE_URL}/my`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to load your events");
    }

    const events = await response.json();
    return Array.isArray(events)
        ? events.map((event) => ({ ...event, image: normalizeImageUrl(event.image) }))
        : [];
}

// Create a new event in backend.
export async function createEvent(eventData: EventItem) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to create event");
    }

    const created = await response.json();
    return { ...created, image: normalizeImageUrl(created?.image) };
}

// Update event.
export async function updateEvent(eventId: string, eventData: EventItem) {
    const response = await fetch(`${BASE_URL}/${eventId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to update event");
    }

    const updated = await response.json();
    return { ...updated, image: normalizeImageUrl(updated?.image) };
}

// Delete event.
export async function deleteEvent(eventId: string) {
    const response = await fetch(`${BASE_URL}/${eventId}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to delete event");
    }

    const deleted = await response.json();
    if (deleted?.eventItem?.image) {
        deleted.eventItem.image = normalizeImageUrl(deleted.eventItem.image);
    }

    return deleted;
}