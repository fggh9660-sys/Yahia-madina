import React from 'react';
import { LANGUAGES } from '../i18n';
import { useLanguage } from '../i18n/useLanguage';

interface LanguageSwitcherProps {
    className?: string;
    /** Called after the language changes (e.g. to play the UI click sound). */
    onChange?: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', onChange }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div
            role="group"
            aria-label={t('language.label')}
            className={`pointer-events-auto inline-flex items-center gap-1 p-1 rounded-full bg-black/50 backdrop-blur-md border border-[#ffd700]/30 font-['Cairo'] ${className}`}
        >
            {LANGUAGES.map(({ code, label }) => {
                const isActive = code === language;
                return (
                    <button
                        key={code}
                        type="button"
                        lang={code}
                        aria-pressed={isActive}
                        onClick={() => {
                            if (isActive) return;
                            setLanguage(code);
                            onChange?.();
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
                            isActive
                                ? 'bg-[#ffd700] text-[#1a1625]'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};
