import { authFetch } from "./authFetch";

// Auth API functions for login, signup, verification, and current user.
const BASE_URL = "http://localhost:5000/api/users";

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

// Update logged-in user profile.
export async function updateCurrentUser(
    firstName: string,
    lastName: string,
    email: string,
    oldEmailCode?: string,
    newEmailCode?: string
) {
    const response = await authFetch(`${BASE_URL}/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstName, lastName, email, oldEmailCode, newEmailCode })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to update profile");
    }

    return await response.json();
}

// Update just the profile picture index (0-7) for the logged-in user.
export async function updateProfileImage(profileImageIndex: number) {
    const response = await authFetch(`${BASE_URL}/me/profile-image`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ profileImageIndex })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to update profile picture");
    }

    return await response.json();
}

export async function requestEmailChangeCodes(newEmail: string) {
    const response = await authFetch(`${BASE_URL}/email-change/request-codes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ newEmail })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to send email-change codes");
    }

    return await response.json();
}

// Send dedicated payment verification code for logged-in user.
export async function requestPaymentCode() {
    const response = await authFetch(`${BASE_URL}/payment/send-code`, {
        method: "POST"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to send payment verification code");
    }

    return await response.json();
}

// Verify dedicated payment verification code for logged-in user.
export async function verifyPaymentCode(code: string) {
    const response = await authFetch(`${BASE_URL}/payment/verify-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to verify payment code");
    }

    return await response.json();
}

// Send login code to email.
export async function requestLoginCode(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to send login code");
    }

    return await response.json();
}

// Verify login code.
export async function verifyLoginCode(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${BASE_URL}/verify-login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail, code })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to verify login code");
    }

    return await response.json();
}

// Send signup code.
export async function requestSignupCode(firstName: string, lastName: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstName, lastName, email: normalizedEmail })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to send signup code");
    }

    return await response.json();
}

// Verify signup code.
export async function verifySignupCode(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${BASE_URL}/verify-signup`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail, code })
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to verify signup code");
    }

    return await response.json();
}

// Get currently logged-in user from backend session cookie.
export async function getCurrentUser() {
    const response = await authFetch(`${BASE_URL}/me`, { method: "GET" });

    if (!response.ok) {
        throw await buildError(response, "Failed to get current user");
    }

    return await response.json();
}

// Log out current user.
export async function logoutUser() {
    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw await buildError(response, "Failed to log out");
    }

    return await response.json();
}
