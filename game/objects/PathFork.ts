import Phaser from 'phaser';
import { PATH_FORK } from '../../constants';

/**
 * Branching path fork marker (Wk 1 Day 5). Spawns periodically from the right edge in city
 * stage. As the marker scrolls past the player, holding A (left) or D (right) commits the
 * player to a track for PATH_FORK.ACTIVE_DURATION_MS, after which spawn behavior returns to
 * normal. If no input is held when the marker passes, no track is committed (default path).
 */
export class PathFork extends Phaser.GameObjects.Sprite {
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare destroy: (fromScene?: boolean) => void;

    private hasResolved: boolean = false;
    private bobTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        if (!scene.textures.exists('path_fork_tex')) {
            PathFork.generateTexture(scene);
        }
        super(scene, x, y, 'path_fork_tex');
        scene.add.existing(this);
        this.setOrigin(0.5, 1);
        this.setDepth(11);

        // Subtle bob to draw the eye
        this.bobTween = scene.tweens.add({
            targets: this,
            y: y - 6,
            duration: 520,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    /** Scroll left with world. Caller (SpawnManager) supplies frameMove. */
    public update(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        if (this.x < -100) this.destroy();
    }

    /** True if the fork is within the input window of the player's x position (resolved once). */
    public canResolveAt(playerX: number): boolean {
        if (this.hasResolved) return false;
        return Math.abs(this.x - playerX) < PATH_FORK.INPUT_WINDOW_PX;
    }

    /** Mark this fork as resolved + flash the corresponding arrow side. */
    public resolve(side: 'A' | 'B' | 'NONE') {
        if (this.hasResolved) return;
        this.hasResolved = true;
        if (side === 'NONE') return;
        const tint = side === 'A' ? PATH_FORK.COMMITTED_TINT_LEFT : PATH_FORK.COMMITTED_TINT_RIGHT;
        this.setTint(tint);
        if (this.bobTween) this.bobTween.stop();
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.15 },
            duration: 220,
            yoyo: true,
        });
    }

    public preDestroy(): void {
        if (this.bobTween) this.bobTween.stop();
        this.scene.tweens.killTweensOf(this);
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('path_fork_tex')) return;
        const w = PATH_FORK.MARKER_W;
        const h = PATH_FORK.MARKER_H;
        const canvas = scene.textures.createCanvas('path_fork_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;
        // Wooden pole
        ctx.fillStyle = `#${PATH_FORK.POLE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(w / 2 - 3, 56, 6, h - 56);
        // Sign board background (wider, taller for labels)
        ctx.fillRect(4, 6, w - 8, 50);
        // Divider in middle
        ctx.fillStyle = '#3a2f24';
        ctx.fillRect(w / 2 - 1, 6, 2, 50);
        // Left arrow + Knowledge label
        ctx.fillStyle = `#${PATH_FORK.ARROW_COLOR_LEFT.toString(16).padStart(6, '0')}`;
        ctx.beginPath();
        ctx.moveTo(8, 22);
        ctx.lineTo(18, 14);
        ctx.lineTo(18, 19);
        ctx.lineTo(w / 2 - 4, 19);
        ctx.lineTo(w / 2 - 4, 26);
        ctx.lineTo(18, 26);
        ctx.lineTo(18, 30);
        ctx.closePath();
        ctx.fill();
        // Right arrow + Speed label
        ctx.fillStyle = `#${PATH_FORK.ARROW_COLOR_RIGHT.toString(16).padStart(6, '0')}`;
        ctx.beginPath();
        ctx.moveTo(w - 8, 22);
        ctx.lineTo(w - 18, 14);
        ctx.lineTo(w - 18, 19);
        ctx.lineTo(w / 2 + 4, 19);
        ctx.lineTo(w / 2 + 4, 26);
        ctx.lineTo(w - 18, 26);
        ctx.lineTo(w - 18, 30);
        ctx.closePath();
        ctx.fill();
        // Arabic-style label area (placeholder rect for labels — actual text rendered as separate Phaser Text)
        ctx.fillStyle = '#fff8e1';
        ctx.font = 'bold 10px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📚', w / 4, 44);
        ctx.fillText('⚡', (3 * w) / 4, 44);
        // Dark outline on sign board
        ctx.strokeStyle = '#2a2018';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 6, w - 8, 50);
        // Ground spike (anchor)
        ctx.fillStyle = '#3a2f24';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 8, h - 4);
        ctx.lineTo(w / 2 + 8, h - 4);
        ctx.lineTo(w / 2, h);
        ctx.closePath();
        ctx.fill();
        canvas.refresh();
    }
}
