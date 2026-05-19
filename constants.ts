export const GAME_WIDTH = window.innerWidth > 0 ? window.innerWidth : 800;
export const GAME_HEIGHT = window.innerHeight > 0 ? window.innerHeight : 600;

export const GAMEPLAY_CAMERA_ZOOM = 1.10;

export const MOBILE_BREAKPOINT_PX = 600;
export const SHORT_HEIGHT_BREAKPOINT_PX = 500;

export const GAMEPLAY_CAMERA_ZOOM_LANDSCAPE_MOBILE = 1.10;
export const GAMEPLAY_CAMERA_ZOOM_PORTRAIT_MOBILE = 1.10;

export function getGameplayCameraZoom(viewWidth: number, viewHeight: number): number {
  if (viewHeight < SHORT_HEIGHT_BREAKPOINT_PX) return GAMEPLAY_CAMERA_ZOOM_LANDSCAPE_MOBILE;
  if (viewWidth < MOBILE_BREAKPOINT_PX) return GAMEPLAY_CAMERA_ZOOM_PORTRAIT_MOBILE;
  return GAMEPLAY_CAMERA_ZOOM;
}

export const TOUCH_BTN = {
  SIZE_DESKTOP: 84,
  SIZE_COMPACT: 56,
  EDGE_MARGIN_DESKTOP: 80,
  EDGE_MARGIN_COMPACT: 52,
  EDGE_MARGIN_PORTRAIT: 48,
  BOTTOM_MARGIN_DESKTOP: 28,
  BOTTOM_MARGIN_COMPACT: 22,
  BOTTOM_MARGIN_PORTRAIT: 64,
  GAP_DESKTOP: 48,
  GAP_COMPACT: 16,
  ICON_SIZE_DESKTOP: 36,
  ICON_SIZE_COMPACT: 24,
};

export function getTouchButtonLayout(viewWidth: number, viewHeight: number) {
  const isLandscapeShort = viewHeight < SHORT_HEIGHT_BREAKPOINT_PX;
  const isPortraitMobile = viewWidth < MOBILE_BREAKPOINT_PX && !isLandscapeShort;
  const isCompact = isLandscapeShort || isPortraitMobile;
  return {
    size: isCompact ? TOUCH_BTN.SIZE_COMPACT : TOUCH_BTN.SIZE_DESKTOP,
    edgeMargin: isPortraitMobile
      ? TOUCH_BTN.EDGE_MARGIN_PORTRAIT
      : isCompact
        ? TOUCH_BTN.EDGE_MARGIN_COMPACT
        : TOUCH_BTN.EDGE_MARGIN_DESKTOP,
    gap: isCompact ? TOUCH_BTN.GAP_COMPACT : TOUCH_BTN.GAP_DESKTOP,
    iconSize: isCompact ? TOUCH_BTN.ICON_SIZE_COMPACT : TOUCH_BTN.ICON_SIZE_DESKTOP,
    bottomMargin: isPortraitMobile
      ? TOUCH_BTN.BOTTOM_MARGIN_PORTRAIT
      : isCompact
        ? TOUCH_BTN.BOTTOM_MARGIN_COMPACT
        : TOUCH_BTN.BOTTOM_MARGIN_DESKTOP,
  };
}

export const RUN_SURFACE_FROM_BOTTOM = 182;
export const GROUND_TILE_HEIGHT = 128;

export function getGroundY(screenHeight: number): number {
  return screenHeight - RUN_SURFACE_FROM_BOTTOM;
}

export function getPlayerSpawnY(screenHeight: number): number {
  const FEET_BELOW_ORIGIN = 39;
  return getGroundY(screenHeight) - FEET_BELOW_ORIGIN;
}

export function getPlayerStartX(viewWidth: number): number {
  const MOBILE_BREAKPOINT = 600;
  const DESKTOP_X = 135;
  if (viewWidth >= MOBILE_BREAKPOINT) return DESKTOP_X;
  const pct = 0.14;
  const min = 82;
  return Math.max(min, Math.round(viewWidth * pct));
}

export const PHYSICS = {
  GRAVITY: 1800,
  JUMP_FORCE: -800,
  RUN_SPEED: 350,
  RUN_SPEED_START: 290,
  COYOTE_TIME: 100,
  BUFFER_TIME: 150,

  APEX_HANG_MS: 70,
  APEX_VY_THRESHOLD: 80,

  FALL_GRAVITY_MULTIPLIER: 1.5,

  LOW_JUMP_MULTIPLIER: 2.5,
  VARIABLE_JUMP_CAP: -600,

  AIR_NUDGE_SPEED: 220,
  AIR_NUDGE_MAX_OFFSET: 80,
};

export const SKILL = {
  NEAR_MISS_THRESHOLD: 28,
  NEAR_MISS_BONUS: 5,
  NEAR_MISS_SHAKE_MS: 80,
  NEAR_MISS_SHAKE_INTENSITY_X: 0.004,
  NEAR_MISS_PASS_THRESHOLD_PX: 30,
};

export const HITSTOP = {
  TIER_UP_MS: 70,
  TIER_UP_SCALE: 0.6,
  PERFECT_JUMP_MS: 80,
  PERFECT_JUMP_SCALE: 0.55,
};

export const PERFECT_JUMP = {
  VY_THRESHOLD: 220,
  BONUS: 8,
  DETUNE: 1200,
  PARTICLE_COUNT: 10,
  PARTICLE_LIFESPAN_MS: 420,
  PARTICLE_SPEED_MIN: 60,
  PARTICLE_SPEED_MAX: 160,
  PARTICLE_COLOR: 0xffd700,
  SHAKE_MS: 90,
  SHAKE_INTENSITY_Y: 0.006,
};

export const COMBO = {
  TIER_2_AT: 3,
  TIER_3_AT: 6,
  TIER_4_AT: 10,
  MULTIPLIERS: [1, 2, 3, 4] as const,
  TIER_COLORS: ['#ffffff', '#00f2ff', '#ffd700', '#ff4d4d'] as const,
  TIER_TINTS: [0xffffff, 0x00f2ff, 0xffd700, 0xff4d4d] as const,
  TIER_DETUNE: [0, 200, 400, 700] as const,
  HUD_X_RATIO: 0.5,
  HUD_Y: 100,
  TICK_PULSE_SCALE: 1.08,
  TICK_PULSE_MS: 120,
  TIER_UP_PULSE_SCALE: 1.5,
  TIER_UP_PULSE_MS: 250,
  AURA_ALPHA: [0, 0.35, 0.55, 0.75] as const,
};

export const SPEED_LINES = {
  TIER_ALPHA_MAX: [0, 0.18, 0.32, 0.48] as const,
  TIER_FREQUENCY_MS: [0, 220, 130, 70] as const,
  STREAK_W: 56,
  STREAK_H: 2,
  STREAK_SPEED_MIN: -880,
  STREAK_SPEED_MAX: -560,
  STREAK_LIFESPAN_MS: 620,
  TOP_BAND_RATIO: 0.18,
  BOTTOM_BAND_RATIO: 0.82,
  BAND_HEIGHT_RATIO: 0.12,
};

export const BOND_HUD = {
  Y: 138,
  WIDTH: 240,
  HEIGHT: 16,
  PADDING: 2,
  BG_COLOR: 0x1a1625,
  FILL_COLOR: 0xffd700,
  BORDER_COLOR: 0xffffff,
  BORDER_WIDTH: 2,
  LABEL_SIZE: 12,
};

export const BRIDGE_WIND = {
  TRIGGER_DISTANCE_IN_CITY_M: 380,
  SEGMENT_LENGTH_M: 40,
  WIND_FORCE_X: -120,
  PLAYER_COUNTER_FORCE: 220,
  X_DRIFT_MAX: 80,
  BANNER_SPAWN_INTERVAL_PX: 280,
  DUST_PARTICLE_EMIT_MS: 60,
  DUST_PARTICLE_LIFESPAN_MS: 700,
  DUST_PARTICLE_SPEED_X_MIN: -540,
  DUST_PARTICLE_SPEED_X_MAX: -380,
};

export const INTRO_SAFE_DISTANCE_M = 22;

export const UI_STRINGS = {
  TITLE: "Knowledge Run",
  JUMP_INSTRUCTION: "Click or Tap to Jump",
};

export const PROGRESS = {
  STAGE_1_LENGTH_M: 450,
  STAGE_2_LENGTH_M: 600,
  DISTANCE_SCALE: 0.0137,
};
