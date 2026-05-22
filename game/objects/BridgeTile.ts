import Phaser from 'phaser';
import { BRIDGE_COLLAPSE } from '../../constants';

export type BridgeTileState = 'normal' | 'cracking' | 'collapsed';

/**
 * Collapsible bridge tile (Wk 1 Day 5 — collapsing bridge sequence).
 * Visual-only sprite (no physics); player fall detection is handled by MainScene checking
 * if the player is grounded over a collapsed tile.
 *
 * Lifecycle:
 *   normal → cracking (red tint + jitter, CRACK_TELEGRAPH_MS) → collapsed (tween down + rotate)
 *   After collapse the tile remains in the bridge tile list (with state=collapsed) until it
 *   scrolls off-screen, so MainScene's fall detection can check its x-range.
 */
export class BridgeTile extends Phaser.GameObjects.Sprite {
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare destroy: (fromScene?: boolean) => void;

    public tileState: BridgeTileState = 'normal';
    private crackTween: Phaser.Tweens.Tween | null = null;
    private crackTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        if (!scene.textures.exists('bridge_tile_tex')) {
            BridgeTile.generateTexture(scene);
        }
        super(scene, x, y, 'bridge_tile_tex');
        scene.add.existing(this);
        this.setOrigin(0.5, 0.5);
        this.setDepth(9);
    }

    public scrollWith(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        if (this.x < -100) this.destroy();
    }

    /** Begin crack telegraph. After CRACK_TELEGRAPH_MS, tile collapses. */
    public startCrack() {
        if (this.tileState !== 'normal') return;
        this.tileState = 'cracking';
        // Red flash overlay + jitter
        this.setTint(BRIDGE_COLLAPSE.CRACK_COLOR);
        this.crackTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.55 },
            duration: 120,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        this.crackTimer = this.scene.time.delayedCall(BRIDGE_COLLAPSE.CRACK_TELEGRAPH_MS, () => this.collapse());
    }

    /** Tile breaks off — tween down past the void with rotation. */
    public collapse() {
        if (this.tileState === 'collapsed') return;
        this.tileState = 'collapsed';
        if (this.crackTween) this.crackTween.stop();
        this.scene.tweens.killTweensOf(this);
        this.clearTint();
        this.setAlpha(1);
        this.scene.tweens.add({
            targets: this,
            y: this.y + 320,
            angle: Phaser.Math.Between(-45, 45),
            alpha: { from: 1, to: 0 },
            duration: BRIDGE_COLLAPSE.COLLAPSE_DURATION_MS,
            ease: 'Cubic.in',
        });
    }

    public preDestroy(): void {
        if (this.crackTimer) this.crackTimer.remove(false);
        if (this.crackTween) this.crackTween.stop();
        this.scene.tweens.killTweensOf(this);
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('bridge_tile_tex')) return;
        const w = BRIDGE_COLLAPSE.TILE_WIDTH;
        const h = BRIDGE_COLLAPSE.TILE_HEIGHT;
        const canvas = scene.textures.createCanvas('bridge_tile_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;
        // Base stone fill
        ctx.fillStyle = `#${BRIDGE_COLLAPSE.TILE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, w, h);
        // Dark top + bottom edges
        ctx.fillStyle = `#${BRIDGE_COLLAPSE.TILE_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, w, 2);
        ctx.fillRect(0, h - 2, w, 2);
        // Left + right edges
        ctx.fillRect(0, 0, 2, h);
        ctx.fillRect(w - 2, 0, 2, h);
        // Highlight band
        ctx.fillStyle = `#${BRIDGE_COLLAPSE.TILE_HIGHLIGHT_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(2, 2, w - 4, 2);
        // Crack hint (small subtle line)
        ctx.strokeStyle = `#${BRIDGE_COLLAPSE.TILE_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h / 2 - 1);
        ctx.lineTo(w * 0.7, h / 2 - 1);
        ctx.stroke();
        canvas.refresh();
    }
}
