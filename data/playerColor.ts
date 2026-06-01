/**
 * Player color customization — M3A simple version per Yahia 2026-05-29 + 2026-06-01 scope lock.
 *
 * Each color tints the player's scarf (P.SASH in Player.ts texture generation).
 * Aura/particle tints + Noor color-reveal lines deferred to M4.
 *
 * Yahia owns this content — add/edit colors freely without engine code changes.
 */

export type PlayerColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black' | 'white';

export interface PlayerColor {
    id: PlayerColorId;
    label: string;          // Arabic display name
    hex: string;            // scarf tint
    accentHex?: string;     // optional UI accent (e.g., picker tile glow)
}

export const PLAYER_COLORS: PlayerColor[] = [
    { id: 'red',    label: 'أحمر',  hex: '#e74c3c', accentHex: '#ff7064' },
    { id: 'blue',   label: 'أزرق',  hex: '#3498db', accentHex: '#5dade2' },
    { id: 'green',  label: 'أخضر',  hex: '#27ae60', accentHex: '#52be80' },
    { id: 'yellow', label: 'أصفر',  hex: '#f1c40f', accentHex: '#f4d03f' },
    { id: 'purple', label: 'بنفسجي', hex: '#9b59b6', accentHex: '#bb7dd0' },
    { id: 'black',  label: 'أسود',  hex: '#2c3e50', accentHex: '#5d6d7e' },
    { id: 'white',  label: 'أبيض',  hex: '#ecf0f1', accentHex: '#ffffff' },
];

const STORAGE_KEY = 'playerColorId';
const DEFAULT_COLOR_ID: PlayerColorId = 'red';

/** Read the saved color id from localStorage, falling back to the default. */
export const getSavedPlayerColorId = (): PlayerColorId => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && PLAYER_COLORS.some(c => c.id === saved)) {
            return saved as PlayerColorId;
        }
    } catch { /* localStorage unavailable, fall through */ }
    return DEFAULT_COLOR_ID;
};

/** Persist the player's color choice. */
export const setSavedPlayerColorId = (id: PlayerColorId): void => {
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* swallow */ }
};

/** Look up the full PlayerColor record by id. */
export const findPlayerColor = (id: PlayerColorId): PlayerColor => {
    return PLAYER_COLORS.find(c => c.id === id) ?? PLAYER_COLORS[0];
};

/** Convenience: get the hex value of the currently-saved color. Used by Player texture gen. */
export const getCurrentScarfHex = (): string => {
    return findPlayerColor(getSavedPlayerColorId()).hex;
};

/** True if the player has actively picked a color this session (false on very first load). */
export const hasPlayerPickedColor = (): boolean => {
    try { return localStorage.getItem(STORAGE_KEY) !== null; }
    catch { return false; }
};
