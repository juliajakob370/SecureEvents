// Imports for auth context.
import React, { createContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api/authApi";

// Type for authenticated user.
type AuthUser = {
    id?: string;
    email?: string;
    firstName?: string;
    role?: string;
};

// Context type.
type AuthContextType = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

// Default context values.
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    refreshUser: async () => { },
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

    // Load current user from backend cookie session.
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
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};