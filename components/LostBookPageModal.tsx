import React, { useState } from 'react';
import { LostBookPageView } from '../types';

interface Props {
    page: LostBookPageView;
    onComplete: () => void;
}

const MYSTERY_BADGE: Record<LostBookPageView['mystery'], { label: string; color: string }> = {
    small: { label: 'سرٌّ صغير', color: '#7fd0ff' },
    medium: { label: 'سرٌّ متوسط', color: '#ffd66b' },
    major: { label: 'سرٌّ كبير', color: '#ff9d5c' },
};

/**
 * M4: Lost Book page discovery modal — the core curiosity→knowledge loop.
 *
 * Flow (full pause; gameplay frozen by MainScene while this is open):
 *   1. CURIOSITY — the question is shown first, creating the urge to discover.
 *   2. REVEAL    — player taps "اكتشف الإجابة" to flip the page.
 *   3. KNOWLEDGE — the answer + a contextual VISUAL (illustration placeholder) + optional extra note
 *                  + Noor's reflection. Then "أضف إلى الكتاب" restores the page.
 *
 * The `visual` is a placeholder (emoji) — the framework reserves the slot; final illustrations are
 * Yahia's deliverable. Swap the emoji render for an <img src=...> once assets land.
 */
export const LostBookPageModal: React.FC<Props> = ({ page, onComplete }) => {
    const [revealed, setRevealed] = useState(false);
    const badge = MYSTERY_BADGE[page.mystery];

    return (
        <div
            className="absolute inset-0 z-[57] flex items-start md:items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-5 overflow-y-auto animate-in fade-in duration-300"
            dir="rtl"
        >
            <div className="bg-gradient-to-b from-[#2a1d3a] to-[#1a1625] border-2 border-[#ffd700]/60 rounded-2xl p-6 md:p-8 max-w-md w-full my-auto max-h-[92vh] overflow-y-auto shadow-[0_0_60px_rgba(255,215,0,0.28)] animate-in zoom-in-95 duration-300 text-center">

                {/* Header — Lost Book + chapter/page + mystery scale */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white/50">
                        الفصل {page.chapter} · صفحة {page.page}
                    </span>
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{ color: badge.color, borderColor: `${badge.color}66`, background: `${badge.color}1a` }}
                    >
                        {badge.label}
                    </span>
                </div>

                <div className="text-3xl mb-3">📖</div>

                {!revealed ? (
                    <>
                        {/* CURIOSITY — question first */}
                        <div className="text-[#ffd66b] text-sm font-bold mb-2 tracking-wide">سؤال فضول</div>
                        <h3 className="text-white text-lg md:text-xl font-black mb-6 leading-snug">
                            {page.curiosity}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setRevealed(true)}
                            className="px-7 py-2.5 rounded-full bg-[#ffd700] hover:bg-[#ffe34d] text-slate-900 font-black text-sm shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer touch-manipulation"
                        >
                            اكتشف الإجابة ✨
                        </button>
                    </>
                ) : (
                    <>
                        {/* KNOWLEDGE — the reward: answer + visual + extra + Noor reflection */}
                        <div className="text-[#4dd0ff] text-sm font-bold mb-2 tracking-wide">المعرفة</div>
                        <p className="text-white text-lg md:text-xl font-black mb-3 leading-snug">
                            {page.knowledge}
                        </p>

                        {/* Visual discovery slot (illustration placeholder — final art = Yahia) */}
                        <div className="my-3 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-2xl bg-black/30 border border-[#ffd700]/30 flex items-center justify-center text-5xl">
                                {page.visual}
                            </div>
                        </div>

                        {page.extra && (
                            <p className="text-white/75 text-xs md:text-sm leading-relaxed mb-3">
                                {page.extra}
                            </p>
                        )}

                        {/* Noor's reflection — the narrative woven into every page */}
                        <div className="mt-3 mb-5 bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2 text-right">
                            <span className="text-lg shrink-0">🌟</span>
                            <p className="text-[#ffd66b]/90 text-xs md:text-sm leading-relaxed italic">
                                {page.noorComment}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onComplete}
                            className="px-7 py-2.5 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/25 font-bold text-sm transition cursor-pointer touch-manipulation"
                        >
                            أضف إلى الكتاب 📖
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
