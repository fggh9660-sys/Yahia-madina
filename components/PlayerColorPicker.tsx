import React, { useState } from 'react';
import { PLAYER_COLORS, PlayerColorId, getSavedPlayerColorId, setSavedPlayerColorId } from '../data/playerColor';

interface Props {
    /** If true, render as full-screen intro overlay; otherwise compact picker (e.g., in pause menu). */
    fullscreen?: boolean;
    /** Called after the player picks (or skips, on intro) so the caller can dismiss + regenerate textures. */
    onPick: (id: PlayerColorId) => void;
    /** Optional dismiss callback for compact mode (cancel button). */
    onClose?: () => void;
}

/**
 * M3A: Player Color picker UI.
 * Simple version: scarf tint only. No aura/particles/Noor reveal in this scope (M4).
 *
 * Intro mode renders as a full-screen overlay shown on first run.
 * Compact mode used inside settings/pause menu.
 */
export const PlayerColorPicker: React.FC<Props> = ({ fullscreen = false, onPick, onClose }) => {
    const [selected, setSelected] = useState<PlayerColorId>(getSavedPlayerColorId());

    const handleConfirm = () => {
        setSavedPlayerColorId(selected);
        onPick(selected);
    };

    const containerClass = fullscreen
        ? 'absolute inset-0 z-[58] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 animate-in fade-in duration-300'
        : 'absolute inset-0 z-[55] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6';

    return (
        <div className={containerClass} dir="rtl">
            <div className="bg-gradient-to-b from-[#2a1d3a] to-[#1a1625] border-2 border-[#ffd700]/60 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_60px_rgba(255,215,0,0.25)] animate-in zoom-in-95 duration-300 text-center">
                <h3 className="text-[#ffd66b] text-xl md:text-2xl font-black mb-2">
                    {fullscreen ? '✨ اختر لونك ✨' : 'اختر لونك'}
                </h3>
                <p className="text-white/70 text-sm md:text-base mb-6">
                    {fullscreen ? 'قبل أن نبدأ رحلتنا، أخبرني… أي لون تحب أكثر؟' : 'سيغير لون وشاحك'}
                </p>

                <div className="grid grid-cols-4 gap-3 mb-6">
                    {PLAYER_COLORS.map(c => {
                        const isSelected = selected === c.id;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelected(c.id)}
                                className={`flex flex-col items-center gap-1 rounded-xl p-2 cursor-pointer touch-manipulation transition-all ${
                                    isSelected
                                        ? 'ring-4 ring-[#ffd700] bg-white/10 scale-105'
                                        : 'ring-2 ring-white/20 hover:bg-white/5'
                                }`}
                            >
                                <div
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/30 shadow-md"
                                    style={{ background: c.hex }}
                                />
                                <span className="text-[10px] md:text-xs text-white/80 font-bold">{c.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-3 justify-center">
                    {!fullscreen && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 font-bold text-sm cursor-pointer touch-manipulation"
                        >
                            إلغاء
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-full bg-[#ffd700]/20 hover:bg-[#ffd700]/30 border border-[#ffd700]/60 text-[#ffd700] font-bold text-sm cursor-pointer touch-manipulation"
                    >
                        تأكيد
                    </button>
                </div>
            </div>
        </div>
    );
};
