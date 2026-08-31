/**
 * M4 — Stage Integration (system 9): per-stage CLIFFHANGERS.
 *
 * Each stage should END on a forward hook — a question, a clue, or a hint toward the next
 * destination — so the journey feels like ONE continuous story (desert → city/Bayt al-Hikma →
 * observatory → the overarching Lost Book mystery) and the player always has a reason to continue.
 *
 * Shown on the stage-results screen at the end of each stage. This file is Yahia-editable: tweak the
 * wording or hook without touching engine code (keys map to MainScene's pendingTransition values).
 */

export type StageTransition = 'DESERT_END' | 'LIBRARY_END' | 'OBSERVATORY_END';

export interface StageCliffhanger {
    /** short forward-hook line (Arabic) teasing the next destination / deepening the mystery. */
    text: string;
}

export const STAGE_CLIFFHANGERS: Record<StageTransition, StageCliffhanger> = {
    // End of Stage 1 (desert) → hints the City of Knowledge / Bayt al-Hikma ahead.
    DESERT_END: {
        text: 'وراء الكثبان تلوح أضواء مدينةٍ عظيمة… يُقال إنّ فيها بيتاً يجمع علوم الدنيا كلّها. تُرى ما الذي ينتظرنا هناك؟',
    },
    // End of Stage 2 (city / Bayt al-Hikma) → hints the Observatory and the stars.
    LIBRARY_END: {
        text: 'في أعلى بيت الحكمة بابٌ يصعد نحو السماء… برج رصدٍ قديم يحرس أسراراً عن النجوم لم تُروَ بعد.',
    },
    // End of Stage 3 (observatory) → opens onto the overarching Lost Book mystery (to be continued).
    OBSERVATORY_END: {
        text: 'أجابت النجوم بعض أسئلتنا… لكنّ الكتاب المفقود ما زال يُخفي صفحاته الأخيرة. إلى أين تقودنا الرحلة بعد؟',
    },
};

/** Forward-hook text for a stage end. Returns '' if none is defined (caller hides the block). */
export const getStageCliffhanger = (transition: StageTransition): string =>
    STAGE_CLIFFHANGERS[transition]?.text ?? '';
