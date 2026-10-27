import Phaser from 'phaser';
import { FALLING_DEBRIS } from '../../constants';

/**
 * Falling debris obstacle (Wk 1 Day 3): spawns a ground shadow telegraph at the landing
 * zone, then drops a debris chunk from above after TELEGRAPH_DURATION_MS. Player must
 * step out of the marked zone before impact.
 *
 * Lifecycle:
 *   1. Constructor — spawn shadow at (x, groundY), schedule drop
 *   2. After telegraph — spawn debris sprite at (x, groundY - DROP_HEIGHT), enable gravity
 *   3. On hit ground OR player — destroy debris, leave brief rubble (shadow stays + dims),
 *      auto-cleanup after POST_IMPACT_LIFETIME_MS
 */
export class FallingDebris extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare setDepth: (value: number) => this;
    declare setOrigin: (x?: number, y?: number) => this;
    declare destroy: (fromScene?: boolean) => void;

    /** Set externally by CollisionManager when the player hits this. */
    public wasHit: boolean = false;

    private shadow: Phaser.GameObjects.Graphics;
    private hasDropped: boolean = false;
    private hasImpacted: boolean = false;
    private groundY: number;
    private dropTimer: Phaser.Time.TimerEvent;
    private cleanupTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene, x: number, groundY: number) {
        // Spawn invisible debris at sky height. Becomes visible when dropping.
        const startY = groundY - FALLING_DEBRIS.DROP_HEIGHT_PX;
        super(scene, x, startY, 'falling_debris_tex');

        if (!scene.textures.exists('falling_debris_tex')) {
            FallingDebris.generateTexture(scene);
        }

        this.setTexture('falling_debris_tex');
        this.groundY = groundY;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setDepth(5);
        this.setVisible(false);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setImmovable(false);
        body.setSize(FALLING_DEBRIS.HITBOX_W, FALLING_DEBRIS.HITBOX_H);
        body.setOffset((FALLING_DEBRIS.DEBRIS_W - FALLING_DEBRIS.HITBOX_W) / 2, (FALLING_DEBRIS.DEBRIS_H - FALLING_DEBRIS.HITBOX_H) / 2);

        // Ground shadow — telegraphs landing zone
        this.shadow = scene.add.graphics();
        this.shadow.setDepth(4);
        this.drawShadow(1);

        // Pulsing tween to draw eye
        scene.tweens.add({
            targets: this.shadow,
            alpha: { from: 0.45, to: 0.9 },
            duration: 220,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.dropTimer = scene.time.delayedCall(FALLING_DEBRIS.TELEGRAPH_DURATION_MS, () => this.beginDrop());
    }

    private drawShadow(scale: number) {
        if (!this.shadow.active) return;
        const w = FALLING_DEBRIS.SHADOW_W * scale;
        const h = FALLING_DEBRIS.SHADOW_H * scale;
        this.shadow.clear();
        this.shadow.fillStyle(FALLING_DEBRIS.SHADOW_COLOR, FALLING_DEBRIS.SHADOW_ALPHA);
        this.shadow.fillEllipse(this.x, this.groundY, w, h);
    }

    private beginDrop() {
        if (!this.active) return;
        this.hasDropped = true;
        this.setVisible(true);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setGravityY(FALLING_DEBRIS.GRAVITY_Y);
        this.scene.tweens.killTweensOf(this.shadow);
        if (this.shadow.active) this.shadow.setAlpha(0.55);
    }

    /** Called by SpawnManager.update — keeps shadow x in sync with debris x and detects ground impact. */
    public scrollWith(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        if (this.shadow.active) {
            this.drawShadow(this.hasDropped ? 1 : 1);
        }
        // Ground impact: when debris bottom reaches groundY
        if (this.hasDropped && !this.hasImpacted && this.y + FALLING_DEBRIS.DEBRIS_H / 2 >= this.groundY) {
            this.onImpact();
        }
        // Despawn when scrolled off-screen
        if (this.x < -100) {
            this.destroy();
        }
    }

    private onImpact() {
        this.hasImpacted = true;
        this.y = this.groundY - FALLING_DEBRIS.DEBRIS_H / 2;
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setVelocityY(0);
        // Small puff + dim shadow
        if (this.shadow.active) {
            this.scene.tweens.add({
                targets: this.shadow,
                alpha: 0,
                duration: FALLING_DEBRIS.POST_IMPACT_LIFETIME_MS,
            });
        }
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            duration: FALLING_DEBRIS.POST_IMPACT_LIFETIME_MS,
        });
        // Camera nudge on impact
        this.scene.cameras.main.shake(80, 0.004);
        this.cleanupTimer = this.scene.time.delayedCall(FALLING_DEBRIS.POST_IMPACT_LIFETIME_MS, () => this.destroy());
    }

    public preDestroy(): void {
        if (this.dropTimer) this.dropTimer.remove(false);
        if (this.cleanupTimer) this.cleanupTimer.remove(false);
        if (this.shadow?.active) {
            this.scene.tweens.killTweensOf(this.shadow);
            this.shadow.destroy();
        }
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('falling_debris_tex')) return;
        const w = FALLING_DEBRIS.DEBRIS_W;
        const h = FALLING_DEBRIS.DEBRIS_H;
        const canvas = scene.textures.createCanvas('falling_debris_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;
        // Stone chunk silhouette — angular blob
        ctx.fillStyle = `#${FALLING_DEBRIS.DEBRIS_COLOR.toString(16).padStart(6, '0')}`;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 2);
        ctx.lineTo(w - 4, h * 0.3);
        ctx.lineTo(w - 6, h - 4);
        ctx.lineTo(w * 0.35, h - 2);
        ctx.lineTo(4, h * 0.7);
        ctx.lineTo(6, h * 0.3);
        ctx.closePath();
        ctx.fill();
        // Edge stroke for definition
        ctx.strokeStyle = `#${FALLING_DEBRIS.DEBRIS_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner crack lines
        ctx.strokeStyle = `#${FALLING_DEBRIS.DEBRIS_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.3);
        ctx.lineTo(w * 0.65, h * 0.6);
        ctx.moveTo(w * 0.3, h * 0.5);
        ctx.lineTo(w * 0.45, h * 0.75);
        ctx.stroke();
        canvas.refresh();
    }
}
