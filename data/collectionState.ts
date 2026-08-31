/**
 * M3A: persistent collection tracker for fragments + Lost Book pages + curiosity items.
 *
 * Per Yahia 2026-06-01 emphasis: progression should be FELT during gameplay (HUD counter +
 * milestone rewards), not just passive tracking in a menu.
 *
 * Stored as a single localStorage entry with a flat set of collected IDs.
 */

import { LORE_FRAGMENTS } from './loreFragments';

const STORAGE_KEY = 'kr.collection.v1';
const MILESTONE_AWARDED_KEY = 'kr.collection.milestones.v1';

interface CollectionState {
    collectedIds: string[];          // any fragment / lore / lost book entry id
    milestonesAwarded: number[];     // thresholds already rewarded this profile (5, 10, ...)
}

/** Pull the full collection state from localStorage. */
export const getCollectionState = (): CollectionState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const milestonesRaw = localStorage.getItem(MILESTONE_AWARDED_KEY);
        return {
            collectedIds: raw ? (JSON.parse(raw) as string[]) : [],
            milestonesAwarded: milestonesRaw ? (JSON.parse(milestonesRaw) as number[]) : [],
        };
    } catch {
        return { collectedIds: [], milestonesAwarded: [] };
    }
};

/** Add a fragment id to the persistent set. Idempotent — returns true if newly added, false if dup. */
export const addToCollection = (id: string): boolean => {
    const state = getCollectionState();
    if (state.collectedIds.includes(id)) return false;
    state.collectedIds.push(id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.collectedIds)); }
    catch { /* swallow */ }
    return true;
};

/** Total unique collected count. */
export const getCollectedCount = (): number => getCollectionState().collectedIds.length;

/** Total possible (Lost Book + lore fragments). Curiosity fragments deferred to M4. */
export const getTotalPossible = (): number => LORE_FRAGMENTS.length;

/** Completion percentage 0-100, rounded. */
export const getCompletionPercent = (): number => {
    const total = getTotalPossible();
    if (total === 0) return 0;
    return Math.min(100, Math.round((getCollectedCount() / total) * 100));
};

// Milestone thresholds — each unlocks small reward when crossed for the first time.
export const COLLECTION_MILESTONES = [
    { count: 3, reward: { stars: 10, label: '⭐ +10' } },
    { count: 6, reward: { stars: 20, label: '⭐ +20' } },
    { count: 10, reward: { stars: 40, label: '⭐ +40 ❤️ +1' } },
    { count: 15, reward: { stars: 80, label: '⭐ +80 ❤️ +1' } },
];

/** Check whether collecting `id` crosses a milestone threshold for the first time.
 *  Returns the milestone reward to award (and marks it consumed), or null if no new milestone. */
export const consumeNewMilestone = (): { count: number; stars: number; label: string } | null => {
    const state = getCollectionState();
    const total = state.collectedIds.length;
    for (const m of COLLECTION_MILESTONES) {
        if (total >= m.count && !state.milestonesAwarded.includes(m.count)) {
            state.milestonesAwarded.push(m.count);
            try { localStorage.setItem(MILESTONE_AWARDED_KEY, JSON.stringify(state.milestonesAwarded)); }
            catch { /* swallow */ }
            return { count: m.count, stars: m.reward.stars, label: m.reward.label };
        }
    }
    return null;
};

/** Returns true if id is in the persistent set. Used by collection screen to show collected vs locked. */
export const isCollected = (id: string): boolean => getCollectionState().collectedIds.includes(id);
