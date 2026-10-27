/**
 * Noor bond meter — central data for the progression anchor (sub-slice 4 scaffold).
 *
 * EDITABLE BY YAHIA: tier dialogue lines, cosmetic swap keys, passive-effect keys, and
 * the point rewards for each skill event can all be tuned here without touching the
 * engine. The engine reads these by structure, not by literal value, so changing labels,
 * thresholds, or text never requires recompiling logic.
 *
 * Slice 4 wires the meter, HUD, and tier-up event. Slice 5 will resolve cosmeticKey /
 * passiveKey / dialogue into actual visuals + Nur lines + passive buffs.
 */

export interface NoorBondTier {
  /** Tier number (1-5). */
  tier: number;
  /** Bond points needed to REACH this tier (cumulative across the run). */
  threshold: number;
  /** Short label shown in the HUD/floating notification when this tier is reached. */
  label: string;
  /**
   * Dialogue line spoken by Noor on reaching this tier. Placeholder English for now;
   * Yahia replaces with proper Arabic + lore content gradually.
   */
  dialogue: string;
  /** Cosmetic swap key (slice 5 resolves to actual visual). Null = no cosmetic at this tier. */
  cosmeticKey: string | null;
  /** Passive effect key (slice 5 wires into player). Null = no passive at this tier. */
  passiveKey: string | null;
}

export const NOOR_BOND_TIERS: readonly NoorBondTier[] = [
  {
    tier: 1,
    threshold: 30,
    label: 'Tier 1 — Spark',
    dialogue: '(placeholder) A spark of trust. I see you.',
    cosmeticKey: 'scarf_color_red',
    passiveKey: null,
  },
  {
    tier: 2,
    threshold: 80,
    label: 'Tier 2 — Glow',
    dialogue: '(placeholder) You\'re someone I can rely on now.',
    cosmeticKey: null,
    passiveKey: 'starting_heart_plus_one',
  },
  {
    tier: 3,
    threshold: 150,
    label: 'Tier 3 — Flame',
    dialogue: '(placeholder — Yahia to fill: Noor backstory beat)',
    cosmeticKey: 'scarf_color_gold',
    passiveKey: null,
  },
  {
    tier: 4,
    threshold: 250,
    label: 'Tier 4 — Beacon',
    dialogue: '(placeholder — Yahia to fill: slow-motion ability unlock line)',
    cosmeticKey: null,
    passiveKey: 'slow_motion_ability',
  },
  {
    tier: 5,
    threshold: 400,
    label: 'Tier 5 — Bond',
    dialogue: '(placeholder — Yahia to fill: closing arc line)',
    cosmeticKey: 'final_visual',
    passiveKey: null,
  },
] as const;

/** Point rewards per skill event. Tune to taste — these shape pacing of tier unlocks. */
export const NOOR_BOND_REWARDS = {
  CLEAN_CLEAR: 1,
  NEAR_MISS: 2,
  PERFECT_JUMP: 3,
  COMBO_TIER_UP: 5,
  QUIZ_CORRECT: 5,
} as const;

/** Resolve a bond-point total to its current tier (0 = below tier 1). */
export function getBondTier(points: number): number {
  let reached = 0;
  for (const t of NOOR_BOND_TIERS) {
    if (points >= t.threshold) reached = t.tier;
    else break;
  }
  return reached;
}

/** Look up a tier definition. Returns null if out of range. */
export function getBondTierDef(tier: number): NoorBondTier | null {
  return NOOR_BOND_TIERS.find((t) => t.tier === tier) ?? null;
}

/** Threshold for the next tier above currentTier. Null if already at max tier. */
export function getNextTierThreshold(currentTier: number): number | null {
  const next = NOOR_BOND_TIERS.find((t) => t.tier > currentTier);
  return next?.threshold ?? null;
}

/** Points already banked for the current tier (used to compute progress ratio in HUD). */
export function getCurrentTierFloor(currentTier: number): number {
  if (currentTier <= 0) return 0;
  return getBondTierDef(currentTier)?.threshold ?? 0;
}
