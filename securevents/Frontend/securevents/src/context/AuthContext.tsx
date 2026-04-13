// Imports for auth context.
import React, { createContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/authApi";

// Type for authenticated user.
type AuthUser = {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    profileImageIndex?: number;
};

// Context type.
type AuthContextType = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
    applyUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
};

// Default context values.
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    refreshUser: async () => { },
    applyUser: () => { },
    logout: async () => { }
});

// Provider props.
type Props = {
    children: React.ReactNode;
};

// Auth provider.
export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Load current user from backend JWT session.
    const refreshUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user || null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Apply a known-good user object without re-fetching.
    // Used after endpoints (e.g. PUT /me) that already return the updated user,
    // so a transient /me failure cannot spuriously log the user out.
    const applyUser = (next: AuthUser | null) => {
        setUser(next);
    };

    // Logout current user.
    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                refreshUser,
                applyUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
