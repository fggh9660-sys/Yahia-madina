/**
 * M4: unified long-term progression persistence.
 *
 * This is the spine of the M4 "Lost Book" narrative loop. It tracks everything that
 * must survive across runs and sessions:
 *   - which Lost Book PAGES the player has restored,
 *   - which CURIOSITY questions are open (asked, answer not yet found),
 *   - how far the NOOR narrative chain has been revealed,
 *   - which ACHIEVEMENTS have been unlocked.
 *
 * Design rules (matching data/collectionState.ts):
 *   - One versioned localStorage key per concern, so a future schema change can bump the suffix.
 *   - Every read/write is wrapped in try/catch and degrades to in-memory defaults — the game must
 *     never crash because storage is unavailable (Safari private mode, quota, etc.).
 *   - All mutating helpers are idempotent and return whether they changed anything, so callers can
 *     drive one-shot side effects (Noor lines, reward popups) off the boolean.
 *
 * The actual Lost Book content (chapters, pages, curiosity/knowledge text) lives in data/lostBook.ts.
 * This module only stores IDs + counters, so content can grow without touching persistence.
 */

const PAGES_KEY = 'kr.m4.pages.v1';            // string[] of restored page ids
const PENDING_KEY = 'kr.m4.curiosity.pending.v1'; // string[] of page ids whose curiosity is open
const NOOR_BEAT_KEY = 'kr.m4.noor.beat.v1';    // number — highest Noor chain beat index revealed
const ACHIEVEMENTS_KEY = 'kr.m4.achievements.v1'; // string[] of unlocked achievement ids

export interface M4Progress {
    /** Page ids the player has fully restored (curiosity answered → knowledge revealed). */
    restoredPageIds: string[];
    /** Page ids whose curiosity question is open but whose knowledge answer is not yet found. */
    pendingCuriosityIds: string[];
    /** Highest Noor narrative beat index the player has seen (drives gradual reveal). */
    noorBeatSeen: number;
    /** Achievement ids already unlocked (see data/achievements.ts). */
    achievementsUnlocked: string[];
}

// ── low-level helpers ────────────────────────────────────────────────────────

const readList = (key: string): string[] => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
};

const writeList = (key: string, list: string[]): void => {
    try { localStorage.setItem(key, JSON.stringify(list)); }
    catch { /* swallow — storage unavailable */ }
};

const readNumber = (key: string): number => {
    try {
        const raw = localStorage.getItem(key);
        const n = raw ? parseInt(raw, 10) : 0;
        return Number.isFinite(n) ? n : 0;
    } catch {
        return 0;
    }
};

const writeNumber = (key: string, n: number): void => {
    try { localStorage.setItem(key, String(n)); }
    catch { /* swallow */ }
};

// ── snapshot ─────────────────────────────────────────────────────────────────

/** Pull the full M4 progress state. */
export const getProgress = (): M4Progress => ({
    restoredPageIds: readList(PAGES_KEY),
    pendingCuriosityIds: readList(PENDING_KEY),
    noorBeatSeen: readNumber(NOOR_BEAT_KEY),
    achievementsUnlocked: readList(ACHIEVEMENTS_KEY),
});

// ── Lost Book pages ──────────────────────────────────────────────────────────

export const isPageRestored = (id: string): boolean => readList(PAGES_KEY).includes(id);

export const getRestoredPageCount = (): number => readList(PAGES_KEY).length;

export const getRestoredPageIds = (): string[] => readList(PAGES_KEY);

/**
 * Restore a page. Idempotent. Also clears any matching pending-curiosity entry,
 * since restoring a page means its curiosity has been resolved.
 * Returns true if the page was newly restored.
 */
export const restorePage = (id: string): boolean => {
    const pages = readList(PAGES_KEY);
    if (pages.includes(id)) return false;
    pages.push(id);
    writeList(PAGES_KEY, pages);

    const pending = readList(PENDING_KEY);
    if (pending.includes(id)) writeList(PENDING_KEY, pending.filter(p => p !== id));

    return true;
};

// ── Curiosity chain (question asked → awaiting knowledge answer) ──────────────

export const isCuriosityPending = (id: string): boolean => readList(PENDING_KEY).includes(id);

export const getPendingCuriosityIds = (): string[] => readList(PENDING_KEY);

/**
 * Mark a page's curiosity question as asked (open loop). Idempotent.
 * No-op if the page is already restored. Returns true if newly marked pending.
 */
export const markCuriosityAsked = (id: string): boolean => {
    if (isPageRestored(id)) return false;
    const pending = readList(PENDING_KEY);
    if (pending.includes(id)) return false;
    pending.push(id);
    writeList(PENDING_KEY, pending);
    return true;
};

// ── Noor narrative chain ─────────────────────────────────────────────────────

export const getNoorBeatSeen = (): number => readNumber(NOOR_BEAT_KEY);

/** Advance the Noor chain to `beat` if it is further than what was seen. Returns true if advanced. */
export const setNoorBeatSeen = (beat: number): boolean => {
    if (beat <= readNumber(NOOR_BEAT_KEY)) return false;
    writeNumber(NOOR_BEAT_KEY, beat);
    return true;
};

// ── Achievements ─────────────────────────────────────────────────────────────

export const isAchievementUnlocked = (id: string): boolean =>
    readList(ACHIEVEMENTS_KEY).includes(id);

export const getUnlockedAchievementIds = (): string[] => readList(ACHIEVEMENTS_KEY);

/** Unlock an achievement. Idempotent. Returns true if newly unlocked (drives the toast). */
export const unlockAchievement = (id: string): boolean => {
    const unlocked = readList(ACHIEVEMENTS_KEY);
    if (unlocked.includes(id)) return false;
    unlocked.push(id);
    writeList(ACHIEVEMENTS_KEY, unlocked);
    return true;
};

// ── maintenance ──────────────────────────────────────────────────────────────

/** Wipe all M4 progress. Used by dev shortcuts / "reset progress" affordances only. */
export const resetProgress = (): void => {
    [PAGES_KEY, PENDING_KEY, NOOR_BEAT_KEY, ACHIEVEMENTS_KEY].forEach(k => {
        try { localStorage.removeItem(k); } catch { /* swallow */ }
    });
};
