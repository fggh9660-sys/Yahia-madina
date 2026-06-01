import React from 'react';
import { LORE_FRAGMENTS, LoreFragment } from '../data/loreFragments';
import { isCollected, getCollectedCount, getTotalPossible, getCompletionPercent } from '../data/collectionState';

interface Props {
    onClose: () => void;
}

/**
 * M3A: Book of Noor collection screen — the Library hub Yahia asked for.
 * Shows all lore fragments grouped by section. Collected entries reveal title + body;
 * uncollected stay locked with "غير مكتشف" placeholder so the gap motivates exploration.
 *
 * Accessible from the HUD progression chip (click).
 */
export const BookOfNoorModal: React.FC<Props> = ({ onClose }) => {
    const collected = getCollectedCount();
    const total = getTotalPossible();
    const percent = getCompletionPercent();

    // Section split: Lost Book (special), Stage 1 heritage, Stage 2 knowledge, anything else.
    const lostBook = LORE_FRAGMENTS.filter(f => f.id === 'lost-book-intro');
    const stage1 = LORE_FRAGMENTS.filter(f => f.stage === 1);
    const stage2 = LORE_FRAGMENTS.filter(f => f.stage === 2);
    const other = LORE_FRAGMENTS.filter(f => f.id !== 'lost-book-intro' && f.stage === undefined);

    return (
        <div
            className="absolute inset-0 z-[58] flex items-start md:items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6 cursor-pointer animate-in fade-in duration-300 overflow-y-auto"
            onClick={onClose}
            dir="rtl"
        >
            <div
                className="bg-gradient-to-b from-[#2a1d3a] to-[#1a1625] border-2 border-[#ffd700]/60 rounded-2xl p-5 md:p-7 max-w-2xl w-full my-auto shadow-[0_0_60px_rgba(255,215,0,0.25)] animate-in zoom-in-95 duration-300 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 md:mb-5">
                    <h3 className="text-[#ffd66b] text-xl md:text-2xl font-black flex items-center gap-2">
                        <span className="text-2xl md:text-3xl">📖</span>
                        كتاب نور
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold flex items-center justify-center cursor-pointer touch-manipulation"
                    >
                        ✕
                    </button>
                </div>

                {/* Completion bar — visible page count + completion % per Yahia 2026-06-01 ask */}
                <div className="mb-5 md:mb-6">
                    <div className="flex justify-between text-xs md:text-sm text-white/70 mb-1.5">
                        <span className="font-bold">التقدم</span>
                        <span className="font-mono">{collected} / {total} ({percent}%)</span>
                    </div>
                    <div className="h-2.5 md:h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-[#4dd0ff] via-[#ffd66b] to-[#ffd700] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                {/* Sections */}
                {lostBook.length > 0 && (
                    <Section title="📚 الكتاب المفقود" fragments={lostBook} accent="#ffd700" />
                )}
                {stage1.length > 0 && (
                    <Section title="🏜️ معرفة الصحراء" fragments={stage1} accent="#e0a040" />
                )}
                {stage2.length > 0 && (
                    <Section title="🏛️ علوم المدينة" fragments={stage2} accent="#4dd0ff" />
                )}
                {other.length > 0 && (
                    <Section title="✨ معرفة عامة" fragments={other} accent="#bb7dd0" />
                )}
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; fragments: LoreFragment[]; accent: string }> = ({ title, fragments, accent }) => {
    const sectionCollected = fragments.filter(f => isCollected(f.id)).length;
    return (
        <div className="mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-2 md:mb-3">
                <h4 className="text-sm md:text-base font-bold" style={{ color: accent }}>{title}</h4>
                <span className="text-xs text-white/50 font-mono">{sectionCollected}/{fragments.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
                {fragments.map(f => {
                    const has = isCollected(f.id);
                    return (
                        <div
                            key={f.id}
                            className={`rounded-lg p-2.5 md:p-3 border transition-colors ${
                                has
                                    ? 'bg-white/5 border-[#ffd700]/30'
                                    : 'bg-black/20 border-white/10'
                            }`}
                        >
                            {has ? (
                                <>
                                    <div className="text-[#ffd66b] text-sm md:text-base font-bold mb-1 leading-tight">{f.title}</div>
                                    <div className="text-white/80 text-xs md:text-sm leading-relaxed">{f.body}</div>
                                </>
                            ) : (
                                <div className="text-white/40 text-xs md:text-sm flex items-center gap-2 py-1">
                                    <span className="text-base md:text-lg">❓</span>
                                    <span>غير مكتشف</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
