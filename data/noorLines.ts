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
 *  - `color_discovery`     — fired mid-run when Noor invites the player to choose their scarf color
 *  - `color_chosen`        — fired right after the player commits a color (Noor's closing beat)
 *  - `lost_book_page`      — M4: fired when the player uncovers a Lost Book page (curiosity moment)
 *  - `lost_book_chapter_complete` — M4: fired when a whole chapter is restored (cliffhanger beat)
 */

export type NoorCue =
    | 'stage_2_enter'
    | 'stage_3_enter'
    | 'low_hp_warning'
    | 'combo_milestone_high'
    | 'rare_fragment_discovery'
    | 'lost_book_intro'
    | 'color_discovery'
    | 'color_chosen'
    | 'lost_book_page'
    | 'lost_book_chapter_complete';

type NoorLine = { text: string; tone: 'encourage' | 'warning' | 'success' | 'greet' };

const LINES: Record<NoorCue, NoorLine[]> = {
    stage_2_enter: [
        { text: 'لقد وصلنا إلى مدينة الحكمة. أبواب المعرفة تفتح أمامنا.', tone: 'success' },
        { text: 'هذه المدينة تخفي علوماً كثيرة. تابع التقدم!', tone: 'encourage' },
        { text: 'مرحباً بك في بغداد القديمة، قلب العلم.', tone: 'success' },
    ],
    stage_3_enter: [
        { text: 'انظر إلى الأعلى يا صديقي… لقد بلغنا برج الرصد، حيث يلتقي العلم بالسماء.', tone: 'success' },
        { text: 'هنا رصد العلماء النجوم والأفلاك. رحلتنا تصعد الآن نحو السماء!', tone: 'success' },
    ],
    low_hp_warning: [
        { text: 'احذر يا صديقي… قلبٌ واحد فقط متبقٍ.', tone: 'warning' },
        { text: 'تنفّس بهدوء، وركّز. نستطيع المتابعة.', tone: 'warning' },
        { text: 'حذارِ من العقبات القادمة!', tone: 'warning' },
    ],
    combo_milestone_high: [
        { text: 'ما شاء الله! هذه قوة الإيقاع.', tone: 'success' },
        { text: 'سلسلة مذهلة! حافظ عليها.', tone: 'success' },
    ],
    rare_fragment_discovery: [
        { text: 'رائع! اكتشفت كنزاً نادراً.', tone: 'success' },
        { text: 'ما شاء الله، هذه قطعة معرفة ثمينة!', tone: 'success' },
        { text: 'عينك حادة — هذا اكتشاف مميز.', tone: 'success' },
    ],
    lost_book_intro: [
        { text: 'هناك كتاب مفقود في مكان ما من مدينة العلم… لكن صفحاته تناثرت في أنحاء العالم.', tone: 'greet' },
    ],
    color_discovery: [
        { text: 'توقّف لحظة يا صديقي… في كل رحلة لحظةٌ يجد فيها المسافر لونه. لقد حانت لحظتك — اختر اللون الذي يرافقك في طريق المعرفة.', tone: 'greet' },
        { text: 'انظر كيف يلمع النور حولك! يقول القدماء إن لكل قلبٍ لوناً يحمله في رحلته. أخبرني… أي لونٍ يمثّلك أنت؟', tone: 'greet' },
        { text: 'هذه لحظة خاصة في رحلتنا. اللون الذي تختاره الآن سيصبح جزءاً من هويتك على هذا الطريق. اختر بقلبك.', tone: 'greet' },
    ],
    color_chosen: [
        { text: 'اختيار جميل! ليكن هذا اللون رفيقك على الطريق. هيا نواصل رحلتنا.', tone: 'success' },
        { text: 'رائع… أرى أن قلبك قد اختار. سيرافقك هذا النور أينما ذهبت.', tone: 'success' },
        { text: 'الآن أصبحت رحلتك تحمل لونك الخاص. لنُكمل إلى الأمام!', tone: 'success' },
    ],
    lost_book_page: [
        { text: 'انظر! صفحة من الكتاب المفقود… لنكتشف سرّها معاً.', tone: 'greet' },
        { text: 'لقد لاحت صفحة جديدة. أشعر أنها تحمل سؤالاً يستحق الإجابة.', tone: 'greet' },
        { text: 'صفحة أخرى من الكتاب! كل صفحة تقرّبنا من الحقيقة.', tone: 'greet' },
    ],
    lost_book_chapter_complete: [
        { text: 'لقد أتممنا فصلاً كاملاً من الكتاب المفقود! لكن السرّ الأكبر ما زال ينتظرنا في الأمام…', tone: 'success' },
        { text: 'فصلٌ اكتمل، وقصةٌ تتّضح شيئاً فشيئاً. إلى أين ستقودنا الصفحات التالية؟', tone: 'success' },
    ],
};

/** Pick one random line from the pool matching the cue. */
export const pickNoorLine = (cue: NoorCue): NoorLine | null => {
    const pool = LINES[cue];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};
