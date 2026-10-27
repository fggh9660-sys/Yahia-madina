import Phaser from 'phaser';
import { SPEED_BOOST } from '../../constants';

/**
 * Speed boost pickup (Wk 1 Day 3): collected by overlap with player. Triggers a temporary
 * gameplay speed multiplier via MainScene.triggerSpeedBoost(). Visually a glowing chevron
 * / lightning bolt icon. Auto-despawns when scrolled off-screen.
 */
export class SpeedBoost extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare setDepth: (value: number) => this;
    declare setOrigin: (x?: number, y?: number) => this;
    declare destroy: (fromScene?: boolean) => void;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        if (!scene.textures.exists('speed_boost_tex')) {
            SpeedBoost.generateTexture(scene);
        }
        super(scene, x, y, 'speed_boost_tex');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5).setDepth(6);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setSize(SPEED_BOOST.SPRITE_W - 6, SPEED_BOOST.SPRITE_H - 6);
        body.setOffset(3, 3);

        // Pulse + bob to draw attention
        scene.tweens.add({
            targets: this,
            scale: { from: 0.92, to: 1.08 },
            duration: 480,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        scene.tweens.add({
            targets: this,
            y: y - 6,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    public update(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        if (this.x < -50) {
            this.destroy();
        }
    }

    public collect() {
        this.scene.tweens.killTweensOf(this);
        if (this.body) (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.6 },
            alpha: { from: 1, to: 0 },
            duration: 280,
            ease: 'Cubic.out',
            onComplete: () => this.destroy(),
        });
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('speed_boost_tex')) return;
        const w = SPEED_BOOST.SPRITE_W;
        const h = SPEED_BOOST.SPRITE_H;
        const canvas = scene.textures.createCanvas('speed_boost_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;

        // Glow halo behind icon
        const grad = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
        grad.addColorStop(0, 'rgba(255,200,80,0.85)');
        grad.addColorStop(0.5, 'rgba(255,170,0,0.45)');
        grad.addColorStop(1, 'rgba(255,170,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Lightning bolt centered
        ctx.fillStyle = '#fff8e1';
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.55, 4);
        ctx.lineTo(w * 0.3, h * 0.55);
        ctx.lineTo(w * 0.5, h * 0.55);
        ctx.lineTo(w * 0.4, h - 4);
        ctx.lineTo(w * 0.7, h * 0.4);
        ctx.lineTo(w * 0.52, h * 0.4);
        ctx.lineTo(w * 0.65, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        canvas.refresh();
    }
}
