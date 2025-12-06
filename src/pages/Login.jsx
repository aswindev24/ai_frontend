import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Github } from 'lucide-react';

import { Navigate } from 'react-router-dom';

const Login = () => {
    const { login, user } = useAuth();

    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
            <div className="glass p-8 rounded-2xl w-full max-w-md text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Code2 size={48} className="text-blue-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    CodeReview AI
                </h1>
                <p className="text-gray-400 mb-8">AI-powered code analysis and optimization</p>

                <button
                    onClick={login}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>

                <div className="mt-8 text-sm text-gray-500">
                    <p>By signing in, you agree to our Terms of Service</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
