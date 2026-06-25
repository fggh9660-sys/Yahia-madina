/**
 * M4 — Noor Narrative Chain / VISUAL MEMORIES (system 4).
 *
 * Noor's own story deepens as the player restores Lost Book pages: early memories are simple and
 * mysterious, later ones reveal her past and her connection to the Lost Book. Each memory shows a
 * VISUAL beside Noor (a symbol / constellation / artifact / page) — the `visual` key is a placeholder
 * (emoji for now); the final illustrations are Yahia's deliverable, same framework as the Knowledge
 * visual slot.
 *
 * A memory unlocks the moment the restored-page count reaches `unlockAtPages` (fires exactly once,
 * since the count only ever increases by one per restored page). This file is Yahia-editable.
 */

export interface NoorMemory {
    id: string;
    /** restored-page count at which this memory is revealed. */
    unlockAtPages: number;
    /** Noor's reflection — her past / her tie to the Lost Book. */
    text: string;
    /** visual-memory placeholder key (emoji now; final art = Yahia). */
    visual: string;
}

/** Ordered by unlockAtPages. Tuned to Chapter 1 (12 pages); extend as chapters grow. */
export const NOOR_MEMORIES: NoorMemory[] = [
    { id: 'nm-1', unlockAtPages: 1,  visual: '✨', text: 'كلّ صفحةٍ تُعيدها… تُعيد إليّ ذكرى كنتُ قد نسيتها.' },
    { id: 'nm-2', unlockAtPages: 3,  visual: '🪔', text: 'أتذكّر الآن… لم أكن دائماً دليلةً للمسافرين. كنتُ يوماً أبحثُ مثلك تماماً.' },
    { id: 'nm-3', unlockAtPages: 6,  visual: '📜', text: 'هذا الكتاب… أعرفه. رأيتُه قبل أن تتفرّق صفحاته بين الرمال والنجوم.' },
    { id: 'nm-4', unlockAtPages: 9,  visual: '🌙', text: 'كلّما اكتمل العلم، اتّضحت صورتي أكثر. ربّما أنا جزءٌ من هذا الكتاب.' },
    { id: 'nm-5', unlockAtPages: 12, visual: '📖', text: 'شكراً لك… بفضلك أوشكتُ أن أتذكّر من أكون حقّاً. لكنّ السرّ الأكبر ما زال في الفصول القادمة.' },
];

/** The memory revealed exactly when the restored-page count hits a threshold, or undefined. */
export const getNoorMemoryForPageCount = (restoredPageCount: number): NoorMemory | undefined =>
    NOOR_MEMORIES.find(m => m.unlockAtPages === restoredPageCount);
