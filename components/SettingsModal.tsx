import React, { useState } from 'react';
import { X, Key, Save } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    language: string;
    t: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey, language, t }) => {
    const [localKey, setLocalKey] = useState(apiKey);
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setApiKey(localKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl border border-mac-border w-96 p-6 transform transition-all scale-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-mac-text">{t.apiKeyConfig}</h3>
                    <button onClick={onClose} className="text-mac-subtext hover:text-mac-text transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                            <strong>{t.hrNote}</strong> {t.hrNoteText}
                            <br /><br />
                            <strong>{t.userNote}</strong> {t.userNoteText} <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{t.googleAIStudio}</a>{t.getFreeApiKey}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-mac-subtext mb-1.5 block">{t.geminiApiKey}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={14} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={localKey}
                                onChange={(e) => setLocalKey(e.target.value)}
                                placeholder={t.enterApiKey}
                                className="w-full pl-9 pr-3 py-2 text-xs border border-mac-border rounded-lg focus:outline-none focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/10 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                            {t.keyStoredLocally}
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'}`}
                    >
                        {saved ? (
                            <>{t.savedSuccessfully}</>
                        ) : (
                            <>
                                <Save size={14} />
                                {t.saveChanges}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
