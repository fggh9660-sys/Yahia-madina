/**
 * Mini-challenge content library — Yahia owns this.
 * Add / edit challenge instances freely without touching engine code.
 *
 * 4 types per Yahia M3A spec (2026-06-01):
 *   - COLOR_MATCH    — pair colored swatches with their target slot
 *   - FRUIT_MATCH    — pair fruit icons with their target slot
 *   - PAIR_MATCH     — memory-card style, find matching pairs
 *   - OBJECT_ORDER   — sequence items in correct order
 *
 * Each challenge has a `prompt` (1-line Arabic instruction), `data` (type-specific config),
 * and optional `stage` filter so we can keep desert-themed content out of city sections.
 */

export type MiniChallengeType = 'COLOR_MATCH' | 'FRUIT_MATCH' | 'PAIR_MATCH' | 'OBJECT_ORDER';

export interface MiniChallenge {
    id: string;
    type: MiniChallengeType;
    prompt: string;
    data: ColorMatchData | FruitMatchData | PairMatchData | ObjectOrderData;
    stage?: 1 | 2;
    timeoutMs?: number;
}

/** Pick the swatch that matches the highlighted target color. */
export interface ColorMatchData {
    kind: 'COLOR_MATCH';
    targetColor: string;       // hex like "#ffaa00" — the prompt highlight
    options: string[];         // 3-4 hex colors, one matches targetColor
}

/** Pick the fruit that matches the highlighted target fruit. */
export interface FruitMatchData {
    kind: 'FRUIT_MATCH';
    targetFruit: string;       // emoji like "🍎"
    options: string[];         // 3-4 emoji, one matches targetFruit
}

/** Memory-card grid — flip 2 at a time, find all pairs. */
export interface PairMatchData {
    kind: 'PAIR_MATCH';
    icons: string[];           // emoji pool (each appears twice in the grid)
    gridSize: 2 | 3;           // 2 = 2x2 (2 pairs), 3 = 2x3 (3 pairs)
}

/** Drag/tap items into the correct sequence. */
export interface ObjectOrderData {
    kind: 'OBJECT_ORDER';
    items: string[];           // emoji items to order
    correctOrder: number[];    // indices into items showing correct order
    hint?: string;             // optional hint shown above items
}

const MINI_CHALLENGES: MiniChallenge[] = [
    // ─────────────────────────────────────────────────────────────
    // COLOR MATCHING — Stage 1 desert palette
    // ─────────────────────────────────────────────────────────────
    {
        id: 'cm1', type: 'COLOR_MATCH', stage: 1, timeoutMs: 10000,
        prompt: 'اختر اللون المطابق',
        data: { kind: 'COLOR_MATCH', targetColor: '#e0a040', options: ['#e0a040', '#6090c0', '#80b060', '#c060a0'] },
    },
    {
        id: 'cm2', type: 'COLOR_MATCH', stage: 1, timeoutMs: 10000,
        prompt: 'اختر اللون المطابق',
        data: { kind: 'COLOR_MATCH', targetColor: '#c0603a', options: ['#80b060', '#c0603a', '#a0a0a0', '#f0d060'] },
    },
    {
        id: 'cm3', type: 'COLOR_MATCH', stage: 2, timeoutMs: 10000,
        prompt: 'اختر اللون المطابق',
        data: { kind: 'COLOR_MATCH', targetColor: '#4dd0ff', options: ['#ffd700', '#4dd0ff', '#80b060', '#c060a0'] },
    },

    // ─────────────────────────────────────────────────────────────
    // FRUIT MATCHING — desert fruits (palm date, fig, pomegranate, grapes, melon)
    // ─────────────────────────────────────────────────────────────
    {
        id: 'fm1', type: 'FRUIT_MATCH', stage: 1, timeoutMs: 10000,
        prompt: 'اختر الفاكهة المطابقة',
        data: { kind: 'FRUIT_MATCH', targetFruit: '🍇', options: ['🍇', '🍉', '🍎', '🍓'] },
    },
    {
        id: 'fm2', type: 'FRUIT_MATCH', stage: 1, timeoutMs: 10000,
        prompt: 'اختر الفاكهة المطابقة',
        data: { kind: 'FRUIT_MATCH', targetFruit: '🍉', options: ['🍓', '🍇', '🍉', '🍊'] },
    },
    {
        id: 'fm3', type: 'FRUIT_MATCH', stage: 2, timeoutMs: 10000,
        prompt: 'اختر الفاكهة المطابقة',
        data: { kind: 'FRUIT_MATCH', targetFruit: '🍊', options: ['🍎', '🍌', '🍊', '🍇'] },
    },

    // ─────────────────────────────────────────────────────────────
    // PAIR MATCHING — memory cards
    // ─────────────────────────────────────────────────────────────
    {
        id: 'pm1', type: 'PAIR_MATCH', stage: 1, timeoutMs: 20000,
        prompt: 'اقلب البطاقات وابحث عن الأزواج',
        data: { kind: 'PAIR_MATCH', icons: ['🌴', '🐪'], gridSize: 2 },
    },
    {
        id: 'pm2', type: 'PAIR_MATCH', stage: 1, timeoutMs: 25000,
        prompt: 'اقلب البطاقات وابحث عن الأزواج',
        data: { kind: 'PAIR_MATCH', icons: ['🌙', '⭐', '☀️'], gridSize: 3 },
    },
    {
        id: 'pm3', type: 'PAIR_MATCH', stage: 2, timeoutMs: 25000,
        prompt: 'اقلب البطاقات وابحث عن الأزواج',
        data: { kind: 'PAIR_MATCH', icons: ['📚', '🕌', '🪔'], gridSize: 3 },
    },

    // ─────────────────────────────────────────────────────────────
    // OBJECT ORDERING — sequence puzzles
    // ─────────────────────────────────────────────────────────────
    {
        id: 'oo1', type: 'OBJECT_ORDER', stage: 1, timeoutMs: 15000,
        prompt: 'رتّب من الأصغر إلى الأكبر',
        data: { kind: 'OBJECT_ORDER', items: ['🌱', '🌿', '🌳'], correctOrder: [0, 1, 2], hint: 'من الأصغر إلى الأكبر' },
    },
    {
        id: 'oo2', type: 'OBJECT_ORDER', stage: 1, timeoutMs: 15000,
        prompt: 'رتّب مراحل اليوم',
        data: { kind: 'OBJECT_ORDER', items: ['🌅', '☀️', '🌇', '🌙'], correctOrder: [0, 1, 2, 3], hint: 'من الفجر إلى الليل' },
    },
    {
        id: 'oo3', type: 'OBJECT_ORDER', stage: 2, timeoutMs: 15000,
        prompt: 'رتّب الأعداد من الأصغر',
        data: { kind: 'OBJECT_ORDER', items: ['١', '٣', '٥', '٧'], correctOrder: [0, 1, 2, 3], hint: 'تصاعدياً' },
    },
];

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** Pick a random mini-challenge matching the stage. Falls back across stages if pool is exhausted. */
export const pickMiniChallenge = (stage?: number): MiniChallenge => {
    const stagePool = stage === 1 || stage === 2
        ? MINI_CHALLENGES.filter(c => c.stage === stage)
        : MINI_CHALLENGES;
    const pool = stagePool.length > 0 ? stagePool : MINI_CHALLENGES;
    return shuffle(pool)[0];
};

/** Lookup by id for explicit triggers (debug, specific encounter scripting). */
export const findMiniChallenge = (id: string): MiniChallenge | undefined =>
    MINI_CHALLENGES.find(c => c.id === id);
