/**
 * Knowledge Fragment lore library.
 *
 * Yahia owns this content. Add / edit fragments freely without touching engine code.
 * The runtime picks fragments by `stage` when spawning collectibles.
 *
 * Fields:
 *  - id:     unique, kebab-case. Used by save data later for "already collected" tracking.
 *  - stage:  1 = desert/heritage zone, 2 = city/knowledge zone, undefined = any.
 *  - title:  1-line label shown on pickup (Arabic preferred).
 *  - body:   1-2 line lore note shown beneath the title on pickup.
 */

export interface LoreFragment {
    id: string;
    stage?: 1 | 2;
    title: string;
    body: string;
}

export const LORE_FRAGMENTS: LoreFragment[] = [
    // ─────────────────────────────────────────────────────────────
    // STAGE 1 — Desert / Heritage
    // ─────────────────────────────────────────────────────────────
    {
        id: 'desert-camel',
        stage: 1,
        title: 'سفينة الصحراء',
        body: 'يستطيع الجمل أن يسير أياماً دون ماء، حاملاً المسافرين بين الواحات.',
    },
    {
        id: 'desert-stars',
        stage: 1,
        title: 'نجوم البدو',
        body: 'كان البدو يعرفون طريقهم في الليل عن طريق النجوم قبل ظهور البوصلة.',
    },
    {
        id: 'desert-palm',
        stage: 1,
        title: 'النخلة الكريمة',
        body: 'يقال إن النخلة تعطي ظلاً وثمراً وليفاً — كل جزء منها نافع للإنسان.',
    },
    {
        id: 'desert-arabic-alphabet',
        stage: 1,
        title: 'حروف النور',
        body: 'الأبجدية العربية ٢٨ حرفاً، وكل حرف له شكل مختلف حسب موقعه في الكلمة.',
    },
    {
        id: 'desert-oasis',
        stage: 1,
        title: 'الواحة',
        body: 'الواحة بقعة خضراء في قلب الصحراء، تتكون حول عين ماء قديمة.',
    },

    // ─────────────────────────────────────────────────────────────
    // STAGE 2 — City / Knowledge (Bayt al-Hikma era)
    // ─────────────────────────────────────────────────────────────
    {
        id: 'knowledge-bayt-al-hikma',
        stage: 2,
        title: 'بيت الحكمة',
        body: 'في بغداد القديمة، كان بيت الحكمة مكتبة جمعت علوم العالم بلغات كثيرة.',
    },
    {
        id: 'knowledge-al-khwarizmi',
        stage: 2,
        title: 'الخوارزمي',
        body: 'وضع الخوارزمي علم الجبر، ومن اسمه جاءت كلمة "الخوارزمية" الحديثة.',
    },
    {
        id: 'knowledge-zero',
        stage: 2,
        title: 'الصفر',
        body: 'عرف العرب الصفر من علماء الهند ونقلوه إلى أوروبا — فغيّر الرياضيات إلى الأبد.',
    },
    {
        id: 'knowledge-astrolabe',
        stage: 2,
        title: 'الإسطرلاب',
        body: 'الإسطرلاب أداة فلكية كانت تساعد على معرفة الوقت ومواقع النجوم.',
    },
    {
        id: 'knowledge-paper',
        stage: 2,
        title: 'صناعة الورق',
        body: 'انتقلت صناعة الورق إلى العالم العربي في القرن الثامن، فازدهرت الكتب.',
    },
];

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/**
 * Pick one lore fragment matching the given stage. Falls back to any fragment if the stage pool is empty.
 */
export const pickLoreFragment = (stage?: number): LoreFragment => {
    const stageMatches = stage === 1 || stage === 2
        ? LORE_FRAGMENTS.filter(f => f.stage === stage)
        : [];
    const pool = stageMatches.length > 0 ? stageMatches : LORE_FRAGMENTS;
    return shuffle(pool)[0];
};

/** Lookup by id for save-system / discovery moments. */
export const findLoreFragment = (id: string): LoreFragment | undefined =>
    LORE_FRAGMENTS.find(f => f.id === id);
