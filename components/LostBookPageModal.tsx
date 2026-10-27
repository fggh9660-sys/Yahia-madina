import React from 'react';
import { LostBookPageView } from '../types';

interface Props {
    page: LostBookPageView;
    /** KNOWLEDGE beat — "add to book": restores the page. */
    onComplete: () => void;
    /** CURIOSITY beat — "let's search for the answer": closes the card, question stays open. */
    onContinue: () => void;
}

const MYSTERY_BADGE: Record<LostBookPageView['mystery'], { label: string; color: string }> = {
    small: { label: 'سرٌّ صغير', color: '#7fd0ff' },
    medium: { label: 'سرٌّ متوسط', color: '#ffd66b' },
    major: { label: 'سرٌّ كبير', color: '#ff9d5c' },
};

/**
 * M4: Lost Book discovery modal — the curiosity→knowledge loop, now split into TWO separate beats
 * (Yahia 2026-06-19). The same page surfaces twice, on different pickups:
 *
 *   mode === 'curiosity' → CURIOSITY FRAGMENT: shows ONLY the question + a prompt that the answer is
 *                          still out there. Tapping "let's search" keeps playing (question stays open).
 *   mode === 'knowledge' → KNOWLEDGE FRAGMENT: found on a LATER pickup. Shows the answer + a contextual
 *                          VISUAL + Noor's reflection. Tapping "add to book" restores the page.
 *
 * The delay between the two is the point: it creates curiosity and a reason to keep running.
 * The `visual` is a placeholder (emoji) — final illustrations are Yahia's deliverable; swap the emoji
 * render for an <img src=...> once assets land.
 */
export const LostBookPageModal: React.FC<Props> = ({ page, onComplete, onContinue }) => {
    const badge = MYSTERY_BADGE[page.mystery];
    const isCuriosity = page.mode === 'curiosity';
    const isClue = page.mode === 'clue';

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

                <div className="text-3xl mb-3">{isCuriosity ? '❔' : isClue ? '🔍' : '📖'}</div>

                {isCuriosity ? (
                    <>
                        {/* CURIOSITY FRAGMENT — question only; the answer is still out there. */}
                        <div className="text-[#ffd66b] text-sm font-bold mb-2 tracking-wide">جذاذة فضول</div>
                        <h3 className="text-white text-lg md:text-xl font-black mb-5 leading-snug">
                            {page.curiosity}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            لم نجد الإجابة بعد… لنواصل الركض ونبحث عنها في الطريق.
                        </p>
                        <button
                            type="button"
                            onClick={onContinue}
                            className="px-7 py-2.5 rounded-full bg-[#ffd700] hover:bg-[#ffe34d] text-slate-900 font-black text-sm shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer touch-manipulation"
                        >
                            لنبحث عن الإجابة ✨
                        </button>
                    </>
                ) : isClue ? (
                    <>
                        {/* CLUE — Noor's hint between the question and the answer; keep playing. */}
                        <div className="text-[#9be7ff] text-sm font-bold mb-2 tracking-wide">همسة من نور 🔎</div>
                        <h3 className="text-white text-lg md:text-xl font-black mb-5 leading-snug">
                            {page.clue}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            نقترب من الإجابة… لنواصل الركض ونبحث!
                        </p>
                        <button
                            type="button"
                            onClick={onContinue}
                            className="px-7 py-2.5 rounded-full bg-[#9be7ff] hover:bg-[#baf0ff] text-slate-900 font-black text-sm shadow-lg shadow-sky-400/30 transition transform hover:-translate-y-0.5 cursor-pointer touch-manipulation"
                        >
                            لنواصل البحث 🔎
                        </button>
                    </>
                ) : (
                    <>
                        {/* KNOWLEDGE FRAGMENT — the reward, found later: answer + visual + Noor reflection. */}
                        <div className="text-[#4dd0ff]/80 text-xs font-bold mb-1 tracking-wide">وجدنا الإجابة!</div>
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
