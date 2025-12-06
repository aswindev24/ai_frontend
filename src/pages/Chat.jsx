import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, LogOut, Code, History, Plus, User as UserIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Chat = () => {
    const { user, logout } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/chat/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/chat/review', {
                code: input,
                language: 'javascript' // Auto-detect or dropdown later
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiMsg = { role: 'ai', content: res.data.review };
            setMessages(prev => [...prev, aiMsg]);
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('Review failed', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Error: Failed to get review.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <button
                        onClick={() => setMessages([])}
                        className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        <span>New Review</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2">RECENT REVIEWS</div>
                    {history.map((item) => (
                        <div key={item._id} className="p-2 hover:bg-gray-800 rounded cursor-pointer text-sm truncate text-gray-400 hover:text-white">
                            {item.code.substring(0, 30)}...
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold" style={{ display: user?.avatar ? 'none' : 'flex' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user?.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
                        <LogOut size={16} />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <Code size={64} className="mb-4 opacity-20" />
                            <h2 className="text-xl font-semibold mb-2">Ready to review your code</h2>
                            <p>Paste your code snippet below to get started</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'ai' ? 'bg-gray-800/50' : ''} p-4 rounded-xl`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                {msg.role === 'ai' ? <Code size={16} /> : <UserIcon size={16} />}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="prose prose-invert max-w-none">
                                    {msg.role === 'ai' ? (
                                        <SyntaxHighlighter language="markdown" style={vscDarkPlus} wrapLongLines>
                                            {msg.content}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <SyntaxHighlighter language="javascript" style={vscDarkPlus} wrapLongLines>
                                            {msg.content}
                                        </SyntaxHighlighter>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4 p-4 bg-gray-800/50 rounded-xl animate-pulse">
                            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your code here..."
                            className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32 font-mono text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="text-center text-xs text-gray-500 mt-2">
                        AI can make mistakes. Review generated code carefully.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
