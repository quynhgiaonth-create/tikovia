import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
    onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState('');

    // Check for existing key on mount
    useEffect(() => {
        const storedKey = localStorage.getItem('GEMINI_API_KEY');
        if (!storedKey) {
            setIsOpen(true);
        } else {
            // Optional: Validate stored key?? For now just assume if it's there it's ok until it fails
        }
    }, []);

    // Listen for custom event to open modal from anywhere (e.g. 403 error)
    useEffect(() => {
        const handleOpenRequest = () => setIsOpen(true);
        window.addEventListener('OPEN_API_KEY_MODAL', handleOpenRequest);
        return () => window.removeEventListener('OPEN_API_KEY_MODAL', handleOpenRequest);
    }, []);

    const handleSave = () => {
        if (!apiKey.trim() || !apiKey.startsWith('AIza')) {
            setError('API Key không hợp lệ. Key thường bắt đầu bằng "AIza".');
            return;
        }

        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
        setIsOpen(false);
        setError('');
        onSave(apiKey.trim());
        window.location.reload(); // Reload to refresh services if needed, or we can just update state
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Key className="w-6 h-6" />
                        <h2 className="text-xl font-bold text-white">Cấu hình API Key</h2>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Ứng dụng cần Gemini API Key của bạn để hoạt động. Key được lưu an toàn trong trình duyệt của bạn.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type={isVisible ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setError('');
                                }}
                                placeholder="Dán key của bạn vào đây (AIza...)"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono text-sm"
                            />
                            <button
                                onClick={() => setIsVisible(!isVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        <p className="text-xs text-zinc-500">
                            Chưa có key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Lấy key miễn phí tại Google AI Studio</a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
                    >
                        <Save size={18} />
                        Lưu & Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};
