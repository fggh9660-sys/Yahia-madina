import Phaser from 'phaser';
import { KNOWLEDGE_FRAGMENT } from '../../constants';

/**
 * Knowledge Fragment collectible — spawns on the Knowledge path of the Split Path event
 * and (M2) at scattered discovery points across stages. Carries a loreId pointing into
 * data/loreFragments.ts so pickup can surface a Noor message with the actual lore note.
 */
export class KnowledgeFragment extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare setDepth: (value: number) => this;
    declare setOrigin: (x?: number, y?: number) => this;
    declare destroy: (fromScene?: boolean) => void;

    public loreId: string | null = null;
    public isRare: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, loreId: string | null = null, isRare: boolean = false) {
        // store before super-side init so it survives texture-gen path
        const _loreId = loreId;
        const _isRare = isRare;
        if (!scene.textures.exists('knowledge_fragment_tex')) {
            KnowledgeFragment.generateTexture(scene);
        }
        super(scene, x, y, 'knowledge_fragment_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.loreId = _loreId;
        this.isRare = _isRare;
        this.setOrigin(0.5, 0.5).setDepth(6);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setSize(KNOWLEDGE_FRAGMENT.SPRITE_W - 6, KNOWLEDGE_FRAGMENT.SPRITE_H - 6);
        body.setOffset(3, 3);

        // Float + glow pulse to draw attention
        scene.tweens.add({
            targets: this,
            y: y - 6,
            duration: 760,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        scene.tweens.add({
            targets: this,
            scale: { from: 0.94, to: 1.08 },
            duration: 520,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    public update(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        if (this.x < -50) this.destroy();
    }

    public collect() {
        this.scene.tweens.killTweensOf(this);
        if (this.body) (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.5 },
            alpha: { from: 1, to: 0 },
            y: this.y - 30,
            duration: 360,
            ease: 'Cubic.out',
            onComplete: () => this.destroy(),
        });
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('knowledge_fragment_tex')) return;
        const w = KNOWLEDGE_FRAGMENT.SPRITE_W;
        const h = KNOWLEDGE_FRAGMENT.SPRITE_H;
        const canvas = scene.textures.createCanvas('knowledge_fragment_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;

        // Glow halo
        const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
        grad.addColorStop(0, 'rgba(255,215,0,0.7)');
        grad.addColorStop(0.55, 'rgba(255,215,0,0.25)');
        grad.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Book body (cyan)
        const bx = w * 0.25;
        const by = h * 0.25;
        const bw = w * 0.5;
        const bh = h * 0.55;
        ctx.fillStyle = `#${KNOWLEDGE_FRAGMENT.BOOK_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(bx, by, bw, bh);

        // Book spine darker
        ctx.fillStyle = '#1a1625';
        ctx.fillRect(bx + bw / 2 - 1, by, 2, bh);

        // Book outline
        ctx.strokeStyle = '#1a1625';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Pages hint
        ctx.fillStyle = '#fff8e1';
        ctx.fillRect(bx + 2, by + 2, bw / 2 - 3, bh - 4);
        ctx.fillRect(bx + bw / 2 + 1, by + 2, bw / 2 - 3, bh - 4);

        canvas.refresh();
    }
}
