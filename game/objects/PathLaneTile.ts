import Phaser from 'phaser';
import { PATH_FORK } from '../../constants';

/**
 * Upper lane platform tile for the Split Path event (Wk 1 Day 5 — two-lane rendering).
 * Spawned continuously during the Knowledge-path active window. Physics-enabled so the
 * player can stand on it after auto-tweening up onto the upper lane. Scrolls left with
 * the world and despawns off-screen.
 */
export class PathLaneTile extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: Phaser.Scene;
    declare active: boolean;
    declare setDepth: (value: number) => this;
    declare setOrigin: (x?: number, y?: number) => this;
    declare destroy: (fromScene?: boolean) => void;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        if (!scene.textures.exists('path_lane_tile_tex')) {
            PathLaneTile.generateTexture(scene);
        }
        super(scene, x, y, 'path_lane_tile_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 0.5).setDepth(9);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setSize(PATH_FORK.LANE_TILE_WIDTH, PATH_FORK.LANE_TILE_HEIGHT);
    }

    public scrollWith(frameMove: number) {
        if (!this.active) return;
        this.x -= frameMove;
        // Sync body position with sprite movement
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body?.updateFromGameObject) body.updateFromGameObject();
        if (this.x < -100) this.destroy();
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('path_lane_tile_tex')) return;
        const w = PATH_FORK.LANE_TILE_WIDTH;
        const h = PATH_FORK.LANE_TILE_HEIGHT;
        const canvas = scene.textures.createCanvas('path_lane_tile_tex', w, h);
        if (!canvas) return;
        const ctx = canvas.context;
        // Base fill (cyan to suggest Knowledge path)
        ctx.fillStyle = `#${PATH_FORK.LANE_TILE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, w, h);
        // Edges
        ctx.fillStyle = `#${PATH_FORK.LANE_TILE_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, w, 2);
        ctx.fillRect(0, h - 2, w, 2);
        ctx.fillRect(0, 0, 2, h);
        ctx.fillRect(w - 2, 0, 2, h);
        // Highlight band
        ctx.fillStyle = '#bff0ff';
        ctx.fillRect(2, 2, w - 4, 2);
        // Hint dots
        ctx.fillStyle = `#${PATH_FORK.LANE_TILE_EDGE_COLOR.toString(16).padStart(6, '0')}`;
        ctx.fillRect(w * 0.3, h / 2 - 1, 2, 2);
        ctx.fillRect(w * 0.7, h / 2 - 1, 2, 2);
        canvas.refresh();
    }
}
