/**
 * M4: Achievement Shelf definitions.
 *
 * Achievements give the player a visible record of their journey (Yahia 2026-06-15) — the goal is
 * recognition, not big rewards. Each achievement has a `check` predicate evaluated against the
 * current progression context after every page restore. Unlock state persists via data/progress.ts.
 *
 * Yahia-editable: add / reword achievements freely. Keep ids stable once shipped (they are the
 * persistence keys). To add a milestone like "20 pages", append an entry — no engine change needed.
 */

export interface AchievementContext {
    pagesRestored: number;
    chaptersComplete: number;
    /** true if the player has restored at least one 'major' mystery page. */
    restoredMajorMystery: boolean;
}

export interface Achievement {
    id: string;
    title: string;        // Arabic display title
    description: string;  // Arabic one-line description
    icon: string;         // emoji badge (final art = Yahia)
    /** returns true once this achievement's condition is met. */
    check: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-page',
        title: 'أول صفحة',
        description: 'استعد أول صفحة من الكتاب المفقود.',
        icon: '📄',
        check: (c) => c.pagesRestored >= 1,
    },
    {
        id: 'first-curiosity',
        title: 'فضولٌ أول',
        description: 'حلّ أول لغز فضول.',
        icon: '🤔',
        check: (c) => c.pagesRestored >= 1,
    },
    {
        id: 'five-pages',
        title: 'باحثٌ ناشئ',
        description: 'استعد خمس صفحات من الكتاب.',
        icon: '📚',
        check: (c) => c.pagesRestored >= 5,
    },
    {
        id: 'ten-pages',
        title: 'جامع المعرفة',
        description: 'استعد عشر صفحات من الكتاب.',
        icon: '🔎',
        check: (c) => c.pagesRestored >= 10,
    },
    {
        id: 'first-chapter',
        title: 'الفصل الأول',
        description: 'أكمل فصلاً كاملاً من الكتاب المفقود.',
        icon: '🏅',
        check: (c) => c.chaptersComplete >= 1,
    },
    {
        id: 'major-mystery',
        title: 'سرٌّ كبير',
        description: 'اكتشف أحد أسرار الكتاب الكبرى.',
        icon: '🗝️',
        check: (c) => c.restoredMajorMystery,
    },
];

export const findAchievement = (id: string): Achievement | undefined =>
    ACHIEVEMENTS.find(a => a.id === id);

export const getTotalAchievements = (): number => ACHIEVEMENTS.length;

/**
 * Given the current context, return the ids of every achievement whose condition is now met.
 * The caller diffs this against already-unlocked ids (via data/progress.ts) to fire toasts only
 * for newly earned ones.
 */
export const evaluateAchievements = (ctx: AchievementContext): string[] =>
    ACHIEVEMENTS.filter(a => a.check(ctx)).map(a => a.id);
