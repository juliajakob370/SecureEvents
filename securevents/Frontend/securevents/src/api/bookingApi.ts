const BASE_URL = "http://localhost:5000/api/bookings";

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

export async function createBooking(payload: {
    eventId: number;
    eventTitle: string;
    quantity: number;
    totalAmount: number;
    buyerEmail: string;
    transactionId: number;
}) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to create booking");
    }

    return await response.json();
}

export async function getBookingsByEmail(email: string) {
    const response = await fetch(`${BASE_URL}?email=${encodeURIComponent(email)}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to load your tickets");
    }

    return await response.json();
}

export async function getBookingsByEvent(eventId: number) {
    const response = await fetch(`${BASE_URL}?eventId=${eventId}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to load guests");
    }

    return await response.json();
}

export async function cancelBooking(bookingId: number) {
    const response = await fetch(`${BASE_URL}/${bookingId}/cancel`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to cancel ticket");
    }

    return await response.json();
}
