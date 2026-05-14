// Fallback to 800x600 if window dimensions are reported as 0 (e.g. headless/unmounted state)
export const GAME_WIDTH = window.innerWidth > 0 ? window.innerWidth : 800;
export const GAME_HEIGHT = window.innerHeight > 0 ? window.innerHeight : 600;

// Camera tuning – zoom in slightly so the road and obstacles feel larger.
export const GAMEPLAY_CAMERA_ZOOM = 1.10;

/** Ground: run surface is this many pixels from the bottom (raised = larger value). */
export const RUN_SURFACE_FROM_BOTTOM = 182;
export const GROUND_TILE_HEIGHT = 128;

/** Y coordinate of the run surface (top of ground). */
export function getGroundY(screenHeight: number): number {
  return screenHeight - RUN_SURFACE_FROM_BOTTOM;
}

/** Player spawn Y so feet sit on the run surface (accounts for body offset). */
export function getPlayerSpawnY(screenHeight: number): number {
  const FEET_BELOW_ORIGIN = 39;
  return getGroundY(screenHeight) - FEET_BELOW_ORIGIN;
}

/** Player spawn/reset X – accurate on both PC and mobile. */
export function getPlayerStartX(viewWidth: number): number {
  const MOBILE_BREAKPOINT = 600;
  const DESKTOP_X = 135;
  if (viewWidth >= MOBILE_BREAKPOINT) return DESKTOP_X;
  const pct = 0.14;
  const min = 82;
  return Math.max(min, Math.round(viewWidth * pct));
}

// Physics Tuning - "Variable Height"
export const PHYSICS = {
  GRAVITY: 1800,        // Slightly lighter than before for a smoother, less heavy feel
  JUMP_FORCE: -800,    // Force calculated to give ~0.7s hang time with the new gravity
  RUN_SPEED: 350,       // Normal/max run speed
  RUN_SPEED_START: 290, // Slower start so player can read the environment
  COYOTE_TIME: 100,     // ms
  BUFFER_TIME: 150,     // ms

  // Apex hang: brief zero-gravity at the top of the jump arc for a satisfying "floaty" peak
  APEX_HANG_MS: 70,            // duration of the hang window
  APEX_VY_THRESHOLD: 80,       // |vy| < this counts as "at apex"

  // Asymmetric fall: descent is heavier than ascent so landings feel snappy
  FALL_GRAVITY_MULTIPLIER: 1.5,

  // Low-jump gravity multiplier: applied while RISING and jump key released.
  // Higher = more aggressive cut. Tuned so tap reads as "shorter proper jump", hold reads as "fuller arc".
  LOW_JUMP_MULTIPLIER: 2.5,
  // Velocity cap when jump key is released mid-rise. Lower = tap shorter.
  VARIABLE_JUMP_CAP: -600,

  // Limited mid-air steering: small horizontal nudge while airborne, capped close to start X
  // Keeps the auto-runner identity intact — ground movement is NOT affected.
  AIR_NUDGE_SPEED: 220,        // px/s while airborne with input held
  AIR_NUDGE_MAX_OFFSET: 80,    // max ±px from startX the player can drift mid-air
};

// Skill depth — near-miss detection & reward
// Phase 1 (sub-slice 1): obstacle passes within this distance of the player without overlap = near-miss
export const SKILL = {
  /** Distance threshold (px) for near-miss. Smaller = harder to trigger. */
  NEAR_MISS_THRESHOLD: 28,
  /** Score bonus awarded per near-miss event. */
  NEAR_MISS_BONUS: 5,
  /** Duration (ms) of the slow-mo / hit-stop window on a near-miss. */
  NEAR_MISS_SLOWMO_MS: 130,
  /** Time-scale during slow-mo (1 = normal, 0.5 = half speed). */
  NEAR_MISS_SLOWMO_SCALE: 0.4,
  /** Camera zoom punch amount on near-miss (1 = no change). */
  NEAR_MISS_ZOOM_PUNCH: 1.04,
  /** How far ahead/behind the player an obstacle has to travel to "count as passed". */
  NEAR_MISS_PASS_THRESHOLD_PX: 30,
};

// Skill depth — perfect-jump apex tap (sub-slice 3)
// Tapping jump while near the apex of a variable jump (|vy| < threshold) awards a bonus.
// Fires at most once per jump arc. Math: with JUMP_FORCE -800 and GRAVITY 1800, the
// |vy| < 220 window is reached only ~320ms after takeoff, so the initial takeoff tap
// cannot false-trigger this.
export const PERFECT_JUMP = {
  /** Apex window: |vy| < this px/s = perfect-jump zone. ~245ms window with current physics. */
  VY_THRESHOLD: 220,
  /** Score bonus per perfect jump (multiplied by combo tier). */
  BONUS: 8,
  /** Detune (cents) for the chime SFX. 1200 = +1 octave. */
  DETUNE: 1200,
  /** Ring outer radius (px) at end of expansion. */
  RING_RADIUS: 70,
  /** Ring start radius (px). */
  RING_START_RADIUS: 14,
  /** Ring stroke width (px). */
  RING_STROKE_WIDTH: 3,
  /** Ring lifespan (ms). */
  RING_DURATION_MS: 380,
  /** Ring color (gold). */
  RING_COLOR: 0xffd700,
};

// Skill depth — combo chain (sub-slice 2)
// Combo increments every time an obstacle is cleared without damage. Resets when player
// actually takes damage. Multiplier applies to near-miss bonuses.
export const COMBO = {
  /** Tier thresholds (inclusive). Reaching N clean clears moves you to that tier. */
  TIER_2_AT: 3,   // combo 3-5  → x2
  TIER_3_AT: 6,   // combo 6-9  → x3
  TIER_4_AT: 10,  // combo 10+  → x4
  /** Multiplier per tier. Index 0 = tier 1 (combos 1-2), no bonus boost. */
  MULTIPLIERS: [1, 2, 3, 4] as const,
  /** Tier badge color (hex string for Phaser text). */
  TIER_COLORS: ['#ffffff', '#00f2ff', '#ffd700', '#ff4d4d'] as const,
  /** Audio detune (cents) per tier — pitch escalation on near-miss SFX. 100 cents = 1 semitone. */
  TIER_DETUNE: [0, 200, 400, 700] as const,
  /** HUD badge horizontal ratio (0=left, 0.5=center, 1=right). Center keeps it clear of the
   *  React-side distance/hearts/audio/pause cluster anchored top-right. */
  HUD_X_RATIO: 0.5,
  /** HUD badge y position — sits below the progress bar at the very top. */
  HUD_Y: 100,
};

/** Distance in meters with no obstacles at run start (tutorial: Nur explains jump first). */
export const INTRO_SAFE_DISTANCE_M = 22;

export const UI_STRINGS = {
  TITLE: "Knowledge Run",
  JUMP_INSTRUCTION: "Click or Tap to Jump",
};

/** Step 2 – Progress system: distance in meters, ~4.5–5 m/s at base speed */
export const PROGRESS = {
  /** Stage 1 length in meters (~90–100 s at ~4.8 m/s) */
  STAGE_1_LENGTH_M: 450,
  /** Stage 2 length in meters (progress bar cap; longer city before library) */
  STAGE_2_LENGTH_M: 600,
  /** Converts world movement to displayed meters (~4.8 m/s at RUN_SPEED 350) */
  DISTANCE_SCALE: 0.0137,
};