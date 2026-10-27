import React from 'react';
import { LORE_FRAGMENTS, LoreFragment } from '../data/loreFragments';
import { isCollected, getCollectedCount, getTotalPossible, getCompletionPercent } from '../data/collectionState';
import { LOST_BOOK_CHAPTERS, LOST_BOOK_PAGES, getPagesForChapter, getTotalPages, getChapterRestoredCount } from '../data/lostBook';
import { ACHIEVEMENTS } from '../data/achievements';
import { isPageRestored, getRestoredPageCount, isAchievementUnlocked } from '../data/progress';

interface Props {
    onClose: () => void;
}

/**
 * M3A→M4: the Library hub — central progression screen.
 * Sections:
 *   1. Lost Book   — chapters & restored pages (incl. "Coming Soon" locked chapters for retention).
 *   2. Achievements — the Achievement Shelf (visible record of the journey).
 *   3. Knowledge fragments — collected lore (world-expansion content).
 *
 * Accessible from the HUD progression chip (click). All data is read live from persistence,
 * so it reflects progress across sessions.
 */
export const BookOfNoorModal: React.FC<Props> = ({ onClose }) => {
    const collected = getCollectedCount();
    const total = getTotalPossible();
    const percent = getCompletionPercent();

    const pagesRestored = getRestoredPageCount();
    const totalPages = getTotalPages();
    const pagePercent = totalPages === 0 ? 0 : Math.min(100, Math.round((pagesRestored / totalPages) * 100));

    // M4 (systems 6 & 10): Discoveries & Mysteries — uncovered count by scale + the overarching thread.
    const mysteryScale = (scale: 'small' | 'medium' | 'major') => {
        const all = LOST_BOOK_PAGES.filter(p => p.mystery === scale);
        return { found: all.filter(p => isPageRestored(p.id)).length, total: all.length };
    };
    const MYSTERY_TIERS = [
        { scale: 'small' as const, icon: '🔹', label: 'إشارات صغيرة' },
        { scale: 'medium' as const, icon: '🔸', label: 'أسرار غامضة' },
        { scale: 'major' as const, icon: '🌟', label: 'أسرار كبرى' },
    ];
    const overarchingTeaser =
        pagePercent >= 100 ? 'كل الصفحات عادت… لكنّ سرّ الكتاب الأكبر ينتظر الفصول القادمة.'
        : pagePercent >= 50 ? 'الخيط يتّضح شيئاً فشيئاً… من كتب الكتاب المفقود، ولماذا تفرّقت صفحاته؟'
        : 'ثمّة سرٌّ يربط كل هذه الاكتشافات… واصل لتكشفه.';

    // Fragment sections (world-expansion lore).
    const stage1 = LORE_FRAGMENTS.filter(f => f.stage === 1);
    const stage2 = LORE_FRAGMENTS.filter(f => f.stage === 2);
    const stage3 = LORE_FRAGMENTS.filter(f => f.stage === 3);
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

                {/* ── Lost Book progression (primary) ─────────────────────────── */}
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm md:text-base font-bold text-[#ffd700]">📚 الكتاب المفقود</h4>
                    <span className="text-xs text-white/50 font-mono">{pagesRestored} / {totalPages} صفحة ({pagePercent}%)</span>
                </div>
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 mb-4">
                    <div
                        className="h-full bg-gradient-to-r from-[#ffd66b] to-[#ffd700] transition-all duration-500"
                        style={{ width: `${pagePercent}%` }}
                    />
                </div>

                {/* ── Discoveries & Mysteries (systems 6 & 10) ─────────────────── */}
                <div className="mb-5 rounded-xl border border-[#ffd700]/20 bg-black/20 p-3">
                    <h4 className="text-sm md:text-base font-bold text-[#ffd700] mb-2">🔍 الاكتشافات والأسرار</h4>
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                        {MYSTERY_TIERS.map(t => {
                            const { found, total } = mysteryScale(t.scale);
                            return (
                                <div key={t.scale} className="flex flex-col items-center rounded-lg bg-white/5 border border-white/10 py-2">
                                    <span className="text-lg leading-none mb-1">{t.icon}</span>
                                    <span className="text-[10px] md:text-xs text-white/60 text-center leading-tight">{t.label}</span>
                                    <span className="text-sm font-black text-white font-mono mt-0.5">{found}/{total}</span>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[11px] md:text-xs text-white/70 italic text-center leading-relaxed">{overarchingTeaser}</p>
                </div>

                <div className="space-y-2.5 mb-6">
                    {LOST_BOOK_CHAPTERS.map(ch => {
                        const pages = getPagesForChapter(ch.chapter);
                        const restored = getChapterRestoredCount(ch.chapter, isPageRestored);
                        return (
                            <div
                                key={ch.chapter}
                                className={`rounded-xl p-3 border ${ch.unlocked ? 'bg-white/5 border-[#ffd700]/25' : 'bg-black/20 border-white/10'}`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`text-sm font-bold ${ch.unlocked ? 'text-[#ffd66b]' : 'text-white/40'}`}>
                                        {ch.title}
                                    </span>
                                    {ch.unlocked ? (
                                        <span className="text-[11px] text-white/50 font-mono">{restored}/{pages.length}</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-white/40 bg-white/10 px-2 py-0.5 rounded-full">قريباً</span>
                                    )}
                                </div>
                                {ch.unlocked && pages.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {pages.map(p => {
                                            const has = isPageRestored(p.id);
                                            return (
                                                <div
                                                    key={p.id}
                                                    title={has ? p.curiosity : 'غير مكتشفة'}
                                                    className={`w-6 h-7 rounded flex items-center justify-center text-[10px] font-bold border ${
                                                        has
                                                            ? 'bg-[#ffd700]/20 border-[#ffd700]/50 text-[#ffd66b]'
                                                            : 'bg-black/30 border-white/10 text-white/25'
                                                    }`}
                                                >
                                                    {has ? p.page : '🔒'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-white/35 text-xs">{ch.subtitle}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Achievement Shelf ───────────────────────────────────────── */}
                <h4 className="text-sm md:text-base font-bold text-[#ffd700] mb-2.5">🏅 رفّ الإنجازات</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                    {ACHIEVEMENTS.map(a => {
                        const has = isAchievementUnlocked(a.id);
                        return (
                            <div
                                key={a.id}
                                className={`rounded-lg p-2.5 border flex items-start gap-2 ${
                                    has ? 'bg-white/5 border-[#ffd700]/30' : 'bg-black/20 border-white/10'
                                }`}
                            >
                                <span className={`text-xl ${has ? '' : 'grayscale opacity-40'}`}>{has ? a.icon : '🔒'}</span>
                                <div className="min-w-0">
                                    <div className={`text-xs font-bold leading-tight ${has ? 'text-[#ffd66b]' : 'text-white/40'}`}>
                                        {a.title}
                                    </div>
                                    {has && <div className="text-white/60 text-[10px] leading-snug mt-0.5">{a.description}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Knowledge fragments (world-expansion lore) ──────────────── */}
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm md:text-base font-bold text-[#4dd0ff]">✨ شظايا المعرفة</h4>
                    <span className="text-xs text-white/50 font-mono">{collected} / {total} ({percent}%)</span>
                </div>
                {stage1.length > 0 && <Section title="🏜️ معرفة الصحراء" fragments={stage1} accent="#e0a040" />}
                {stage2.length > 0 && <Section title="🏛️ علوم المدينة" fragments={stage2} accent="#4dd0ff" />}
                {stage3.length > 0 && <Section title="🔭 أسرار المرصد" fragments={stage3} accent="#bb7dd0" />}
                {other.length > 0 && <Section title="📜 معرفة عامة" fragments={other} accent="#bb7dd0" />}
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
