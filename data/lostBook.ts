/**
 * M4: The Lost Book — chapter & page model + content.
 *
 * The Lost Book is the primary long-term progression system. The framework is CHAPTER-BASED
 * and EXPANDABLE from the start (Yahia 2026-06-15): each chapter holds up to CHAPTER_SIZE pages,
 * and new chapters can be appended without redesigning anything.
 *
 * Each PAGE is a complete discovery unit that combines the four pillars:
 *   - story:      one line that advances the overarching Lost Book mystery / world,
 *   - curiosity:  the question shown FIRST (creates the urge to discover),
 *   - knowledge:  the answer revealed LATER (the reward),
 *   - noorComment: Noor's reflection when the page is restored.
 *
 * Plus a `visual` slot — the framework displays an illustration beside the knowledge answer.
 * The illustration ASSETS are Yahia's deliverable; `visual` here is a placeholder key (emoji for now).
 *
 * Content note: this file is Yahia-editable. Chapter 1 is fully seeded as a working reference;
 * Chapters 2–3 are intentionally `locked` ("Coming Soon" teasers) so the retention loop shows
 * there is always more ahead. Fill them in (or add Chapter 4+) without touching engine code.
 */

export type PageCategory =
    | 'lost-book'      // directly advances the main mystery
    | 'desert'         // desert & travel
    | 'astronomy'      // stars & the Observatory
    | 'civilization'   // ancient civilizations & history
    | 'nature';        // world & nature discoveries

export type MysteryScale = 'small' | 'medium' | 'major';

export interface LostBookPage {
    /** unique, kebab-case, e.g. 'ch1-p1'. Used as the persistence id (see data/progress.ts). */
    id: string;
    chapter: number;       // 1-based chapter number
    page: number;          // 1-based position within the chapter (1..CHAPTER_SIZE)
    /** narrative line tied to the overarching mystery / world-building. */
    story: string;
    /** the question shown first — creates curiosity. */
    curiosity: string;
    /** the answer revealed as the reward. */
    knowledge: string;
    /** illustration placeholder key (emoji for now; final art = Yahia). Shown beside the answer. */
    visual: string;
    /** one extra discovery line shown under the visual (optional deeper note). */
    extra?: string;
    /** Noor's reflection when this page is restored. */
    noorComment: string;
    /** content mix — some pages advance the Lost Book, others expand the world. */
    category: PageCategory;
    /** true = advances the main Lost Book mystery; false = world-expansion content. */
    advancesLostBook: boolean;
    /** discovery scale, drives how it is framed in the world (step 6). */
    mystery: MysteryScale;
    /** which stage this page tends to surface in (1 desert, 2 city, 3 observatory). */
    stage?: 1 | 2 | 3;
}

export interface LostBookChapter {
    chapter: number;
    title: string;     // Arabic chapter title
    subtitle: string;  // short Arabic tagline
    /** false = a "Coming Soon" teaser the player can see but not yet fill. */
    unlocked: boolean;
}

/** Target pages per chapter. Pages beyond this in CONTENT are still valid — this is the design target. */
export const CHAPTER_SIZE = 12;

export const LOST_BOOK_CHAPTERS: LostBookChapter[] = [
    { chapter: 1, title: 'الفصل الأول: دروب الصحراء', subtitle: 'كيف وجد المسافرون طريقهم؟', unlocked: true },
    { chapter: 2, title: 'الفصل الثاني: مدينة الحكمة', subtitle: 'قريباً…', unlocked: false },
    { chapter: 3, title: 'الفصل الثالث: أسرار المرصد', subtitle: 'قريباً…', unlocked: false },
];

/**
 * Chapter 1 — fully seeded (12 pages). Themed around the desert journey and the first
 * traces of the Lost Book. Page 1 follows Yahia's own example (navigating by the North Star),
 * and page 12 is the chapter cliffhanger that points toward the City of Knowledge.
 */
export const LOST_BOOK_PAGES: LostBookPage[] = [
    {
        id: 'ch1-p1', chapter: 1, page: 1, stage: 1,
        story: 'أول صفحة من الكتاب المفقود تبدأ من قلب الصحراء، حيث لا طرق ولا علامات.',
        curiosity: 'كيف وجد المسافرون طريقهم عبر الصحراء بلا خرائط؟',
        knowledge: 'كانوا يهتدون بالنجوم.',
        visual: '⭐',
        extra: 'كان النجم القطبي من أهم النجوم المستخدمة في تحديد الاتجاه.',
        noorComment: 'حين تضيع الطرق، تبقى السماء دليلاً. هكذا بدأت أول صفحة.',
        category: 'lost-book', advancesLostBook: true, mystery: 'major',
    },
    {
        id: 'ch1-p2', chapter: 1, page: 2, stage: 1,
        story: 'رفيق المسافر في الصحراء لم يكن إنساناً، بل كائناً صبوراً عجيباً.',
        curiosity: 'كيف يستطيع الجمل السير أياماً دون ماء؟',
        knowledge: 'يخزّن الدهون في سنامه ويحافظ على ماء جسمه بكفاءة عالية.',
        visual: '🐪',
        extra: 'يستطيع الجمل أن يشرب كميات كبيرة من الماء دفعة واحدة عند توفره.',
        noorComment: 'الصبر يقطع المسافات التي يعجز عنها المتعجّل.',
        category: 'desert', advancesLostBook: false, mystery: 'small',
    },
    {
        id: 'ch1-p3', chapter: 1, page: 3, stage: 1,
        story: 'في وسط الرمال القاحلة، تظهر فجأة بقعة خضراء كالحلم.',
        curiosity: 'كيف تظهر الواحة في وسط الصحراء؟',
        knowledge: 'تتكوّن حول عين ماء جوفية تصل إلى السطح.',
        visual: '🌴',
        extra: 'كانت الواحات محطات حياة للقوافل التي تعبر الصحراء.',
        noorComment: 'حتى أقسى الأماكن تخبّئ نبعاً لمن يبحث.',
        category: 'nature', advancesLostBook: false, mystery: 'small',
    },
    {
        id: 'ch1-p4', chapter: 1, page: 4, stage: 1,
        story: 'حين يحلّ الليل، كانت السماء ساعةً لا تتوقف.',
        curiosity: 'كيف عرف البدو الوقت في الليل؟',
        knowledge: 'من خلال مواقع القمر والنجوم ومنازلهما.',
        visual: '🌙',
        extra: 'قسّم الفلكيون مسار القمر إلى ٢٨ منزلة لمعرفة الزمن والمواسم.',
        noorComment: 'من قرأ السماء، لم يعد الليل غريباً عنه.',
        category: 'astronomy', advancesLostBook: false, mystery: 'medium',
    },
    {
        id: 'ch1-p5', chapter: 1, page: 5, stage: 1,
        story: 'شجرة واحدة كانت تكفي قافلة بأكملها.',
        curiosity: 'لماذا تُسمّى النخلة "الشجرة الكريمة"؟',
        knowledge: 'لأن كل جزء منها نافع: ثمرها وظلّها وليفها وجذعها.',
        visual: '🌴',
        extra: 'التمر غذاء غنيّ بالطاقة، رافق المسافرين في رحلاتهم الطويلة.',
        noorComment: 'الكرم الحقيقي أن تُعطي من كل ما تملك.',
        category: 'nature', advancesLostBook: false, mystery: 'small',
    },
    {
        id: 'ch1-p6', chapter: 1, page: 6, stage: 1,
        story: 'قبل أن تُكتب الصفحات، كان للكلمات بيوت أخرى.',
        curiosity: 'على ماذا كان الناس يكتبون قبل صناعة الورق؟',
        knowledge: 'على الرقّ والجلود وألواح الطين وسعف النخيل.',
        visual: '📜',
        extra: 'انتقلت صناعة الورق إلى العالم العربي في القرن الثامن فازدهرت الكتب.',
        noorComment: 'الكلمة تبحث دائماً عن مكان يحفظها… كصفحات كتابنا.',
        category: 'civilization', advancesLostBook: false, mystery: 'medium',
    },
    {
        id: 'ch1-p7', chapter: 1, page: 7, stage: 1,
        story: 'وجد المسافر على صخرة حروفاً قديمة لا يعرف من نقشها.',
        curiosity: 'كم عدد حروف الأبجدية العربية؟',
        knowledge: 'ثمانية وعشرون حرفاً، لكل حرف شكل يتغيّر حسب موقعه.',
        visual: '🔤',
        extra: 'بهذه الحروف كُتبت أعظم كتب العلم والشعر عبر القرون.',
        noorComment: 'من الحروف تُبنى الكلمات، ومن الكلمات تُبنى المعرفة.',
        category: 'civilization', advancesLostBook: false, mystery: 'small',
    },
    {
        id: 'ch1-p8', chapter: 1, page: 8, stage: 1,
        story: 'في الأفق، خطّ طويل من الجمال يحمل بضائع من أقاصي الأرض.',
        curiosity: 'كيف نقلت القوافل البضائع عبر المسافات الشاسعة؟',
        knowledge: 'عبر قوافل الجمال التي سارت على طرق تجارة معروفة بين المدن.',
        visual: '🐫',
        extra: 'حملت طرق الحرير والبخور العلم والثقافة، لا البضائع فقط.',
        noorComment: 'الطرق لا تنقل السلع وحدها، بل الأفكار أيضاً.',
        category: 'civilization', advancesLostBook: false, mystery: 'medium',
    },
    {
        id: 'ch1-p9', chapter: 1, page: 9, stage: 1,
        story: 'في الصباح تغيّر شكل الكثبان، كأن الصحراء تتنفّس.',
        curiosity: 'لماذا تتحرّك الكثبان الرملية؟',
        knowledge: 'تدفعها الرياح فتنقل حبّات الرمل وتعيد تشكيلها باستمرار.',
        visual: '🏜️',
        extra: 'بعض الكثبان تقطع أمتاراً كل عام بفعل الرياح الثابتة.',
        noorComment: 'حتى الأرض الثابتة تتغيّر… ما دامت هناك ريح.',
        category: 'nature', advancesLostBook: false, mystery: 'small',
    },
    {
        id: 'ch1-p10', chapter: 1, page: 10, stage: 1,
        story: 'عند الواحة، وجد المسافر بئراً حُفرت قبل مئات السنين.',
        curiosity: 'كيف حافظ القدماء على الماء في الصحراء؟',
        knowledge: 'حفروا الآبار والصهاريج لتجميع الماء وحمايته من التبخّر.',
        visual: '💧',
        extra: 'كانت معرفة مواقع الآبار سرّاً ثميناً يتوارثه أهل الصحراء.',
        noorComment: 'الماء سرّ الحياة، ومن حفظه حفظ الطريق لمن بعده.',
        category: 'desert', advancesLostBook: false, mystery: 'medium',
    },
    {
        id: 'ch1-p11', chapter: 1, page: 11, stage: 1,
        story: 'وصل المسافر إلى الساحل، حيث تبدأ رحلة أخرى فوق الماء.',
        curiosity: 'بماذا اهتدى البحّارة قبل اختراع البوصلة؟',
        knowledge: 'بالنجوم وأداة قديمة تُسمّى الإسطرلاب.',
        visual: '🧭',
        extra: 'الإسطرلاب أداة فلكية تحدّد مواقع النجوم وأوقات اليوم.',
        noorComment: 'كل بحر جديد يحتاج إلى نجمٍ قديم يدلّ عليه.',
        category: 'astronomy', advancesLostBook: false, mystery: 'medium',
    },
    {
        id: 'ch1-p12', chapter: 1, page: 12, stage: 1,
        story: 'في آخر صفحات الفصل، رسمٌ لمدينة تتلألأ قبابها… مدينة الحكمة.',
        curiosity: 'إلى أين تقود صفحات الكتاب المفقود الأولى؟',
        knowledge: 'تقود نحو مدينة العلم، حيث جُمعت معارف العالم تحت سقف واحد.',
        visual: '🏛️',
        extra: 'لكن من رسم هذه الخريطة؟ ولماذا تفرّقت بقية الصفحات؟ السرّ ينتظر في الفصل التالي…',
        noorComment: 'أشعر أنني أعرف هذه المدينة… وكأن جزءاً من قصتي ينتظرني هناك.',
        category: 'lost-book', advancesLostBook: true, mystery: 'major',
    },
];

// ── helpers ──────────────────────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** All chapters (incl. locked teasers). */
export const getChapters = (): LostBookChapter[] => LOST_BOOK_CHAPTERS;

export const findChapter = (chapter: number): LostBookChapter | undefined =>
    LOST_BOOK_CHAPTERS.find(c => c.chapter === chapter);

/** Pages belonging to a chapter, in page order. */
export const getPagesForChapter = (chapter: number): LostBookPage[] =>
    LOST_BOOK_PAGES.filter(p => p.chapter === chapter).sort((a, b) => a.page - b.page);

export const findPage = (id: string): LostBookPage | undefined =>
    LOST_BOOK_PAGES.find(p => p.id === id);

/** Total authored pages across all chapters. Drives completion % and HUD totals. */
export const getTotalPages = (): number => LOST_BOOK_PAGES.length;

/**
 * Pick the next page to surface for a given stage, preferring pages not yet restored
 * and not already pending. `excludeIds` lets the caller avoid re-offering a page mid-run.
 * Returns undefined when there is nothing left to offer.
 */
export const pickNextPage = (
    stage: number | undefined,
    isRestored: (id: string) => boolean,
    isPending: (id: string) => boolean,
    excludeIds: string[] = [],
): LostBookPage | undefined => {
    const available = LOST_BOOK_PAGES.filter(p =>
        !isRestored(p.id) && !isPending(p.id) && !excludeIds.includes(p.id),
    );
    if (available.length === 0) return undefined;
    const stageMatches = stage ? available.filter(p => p.stage === stage) : [];
    const pool = stageMatches.length > 0 ? stageMatches : available;
    // prefer lower chapter/page first so the story unfolds in order, with light shuffle inside a chapter
    const lowestChapter = Math.min(...pool.map(p => p.chapter));
    const sameChapter = pool.filter(p => p.chapter === lowestChapter);
    return shuffle(sameChapter)[0];
};

/** How many pages of a chapter are restored. */
export const getChapterRestoredCount = (
    chapter: number,
    isRestored: (id: string) => boolean,
): number => getPagesForChapter(chapter).filter(p => isRestored(p.id)).length;

/** True when every authored page in a chapter is restored (and the chapter has pages). */
export const isChapterComplete = (
    chapter: number,
    isRestored: (id: string) => boolean,
): boolean => {
    const pages = getPagesForChapter(chapter);
    return pages.length > 0 && pages.every(p => isRestored(p.id));
};
