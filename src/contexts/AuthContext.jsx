import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
                localStorage.setItem('token', token);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const res = await axios.get('https://ai-backend-637t.onrender.com/api/auth/me', {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    setUser(res.data.user);
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = () => {
        window.location.href = 'http://ai-backend-637t.onrender.com/api/auth/google';
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        try {
            // Optional: Notify backend (fire and forget)
            axios.get('https://ai-backend-637t.onrender.com/api/auth/logout').catch(err => console.error('Backend logout error', err));
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
