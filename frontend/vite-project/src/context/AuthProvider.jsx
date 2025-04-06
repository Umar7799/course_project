// src/context/AuthProvider.jsx
import React, {
    useState,
    useEffect,
    useCallback,
} from 'react';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        const res = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            throw new Error('Login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);

        const profileRes = await fetch('http://localhost:5000/auth/profile', {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
        });

        const profile = await profileRes.json();
        setUser(profile);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5000/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const profile = await res.json();
                setUser(profile);
            } else {
                logout();
            }
        } catch (err) {
            console.log(err)
            logout();
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
