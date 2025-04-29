// src/context/AuthProvider.jsx
import React, {
    useState,
    useEffect,
    useCallback,
} from 'react';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;


    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            throw new Error('Login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);

        const profileRes = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
        });

        const profile = await profileRes.json();

        // Store user with role included
        setUser({
            ...profile,
            role: profile.role || 'user', // Default role is 'user' if not set
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const profile = await res.json();

                // Ensure role is included when fetching the profile
                setUser({
                    ...profile,
                    role: profile.role || 'user', // Default role to 'user' if not found
                });
            } else {
                logout();
            }
        } catch (err) {
            console.log(err);
            logout();
        }
    }, [API_URL]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);



    // MODE TOGGLE
    const [darkToggle, setDarkToggle] = useState(false);
    const toggleFunction = () => {
        setDarkToggle((prev) => !prev);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, darkToggle, toggleFunction }}>
            {children}
        </AuthContext.Provider>
    );
};
