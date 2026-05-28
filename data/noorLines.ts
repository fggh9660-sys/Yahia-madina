/**
 * Noor contextual one-liners — surfaced at moments of interest during a run.
 *
 * Yahia owns this content. Add / edit lines freely without touching engine code.
 * The runtime picks lines by `cue` from the appropriate pool. Variants in a pool are
 * picked at random so repeat playthroughs don't show the same line every time.
 *
 * Cue glossary:
 *  - `stage_2_enter`       — fired when the run advances from desert (Stage 1) to city (Stage 2)
 *  - `low_hp_warning`      — fired when the player drops to their last heart
 *  - `combo_milestone_mid` — fired when reaching combo tier 2 (mid streak)
 *  - `combo_milestone_high`— fired when reaching combo tier 3+ (high streak)
 *  - `near_miss`           — fired when narrowly avoiding an obstacle (already wired separately)
 */

export type NoorCue =
    | 'stage_2_enter'
    | 'low_hp_warning'
    | 'combo_milestone_mid'
    | 'combo_milestone_high';

type NoorLine = { text: string; tone: 'encourage' | 'warning' | 'success' | 'greet' };

const LINES: Record<NoorCue, NoorLine[]> = {
    stage_2_enter: [
        { text: 'لقد وصلنا إلى مدينة الحكمة. أبواب المعرفة تفتح أمامنا.', tone: 'success' },
        { text: 'هذه المدينة تخفي علوماً كثيرة. تابع التقدم!', tone: 'encourage' },
        { text: 'مرحباً بك في بغداد القديمة، قلب العلم.', tone: 'success' },
    ],
    low_hp_warning: [
        { text: 'احذر يا صديقي… قلبٌ واحد فقط متبقٍ.', tone: 'warning' },
        { text: 'تنفّس بهدوء، وركّز. نستطيع المتابعة.', tone: 'warning' },
        { text: 'حذارِ من العقبات القادمة!', tone: 'warning' },
    ],
    combo_milestone_mid: [
        { text: 'تركيزك يبني نوراً جديداً!', tone: 'encourage' },
        { text: 'استمر… أنت في تدفقٍ رائع.', tone: 'encourage' },
    ],
    combo_milestone_high: [
        { text: 'ما شاء الله! هذه قوة الإيقاع.', tone: 'success' },
        { text: 'سلسلة مذهلة! حافظ عليها.', tone: 'success' },
    ],
};

/** Pick one random line from the pool matching the cue. */
export const pickNoorLine = (cue: NoorCue): NoorLine | null => {
    const pool = LINES[cue];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};
