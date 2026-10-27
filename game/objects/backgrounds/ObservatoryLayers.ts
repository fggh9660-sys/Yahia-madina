
import Phaser from 'phaser';
import { RUN_SURFACE_FROM_BOTTOM } from '../../../constants';
import { ObservatoryAssetGenerator } from '../../generators/ObservatoryAssetGenerator';

/**
 * M3B — Stage 3 "Observatory of the Stars" parallax environment.
 *
 * The night sky / starfield / moon live in the base atmosphere (Background.ts) and stay visible,
 * so this layer set only adds the architectural foreground that gives Stage 3 its identity:
 * - Mid: a row of glowing observatory domes on the horizon.
 * - Near: foreground colonnade + a mounted telescope + an astrolabe ring.
 *
 * Mirrors the CityLayers structure (create / resize / update / fadeIn / fadeOut) so Background.ts
 * can drive it the same way.
 */
export class ObservatoryLayers {
    private scene: Phaser.Scene;
    private domeLayer!: Phaser.GameObjects.TileSprite;
    private nearLayer!: Phaser.GameObjects.TileSprite;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        ObservatoryAssetGenerator.init(scene);
    }

    public create(width: number, height: number) {
        // MID — observatory domes on the horizon
        this.domeLayer = this.scene.add.tileSprite(0, 0, width, 1024, 'obs_dome');
        this.domeLayer.setOrigin(0, 0);
        this.domeLayer.setScrollFactor(0);
        this.domeLayer.setAlpha(0);
        this.domeLayer.setDepth(-62);

        // NEAR — foreground colonnade + telescope
        this.nearLayer = this.scene.add.tileSprite(0, 0, width, 1024, 'obs_near');
        this.nearLayer.setOrigin(0, 0);
        this.nearLayer.setScrollFactor(0);
        this.nearLayer.setAlpha(0);
        this.nearLayer.setDepth(-55);

        this.resize(width, height);
    }

    public resize(width: number, height: number) {
        // Keep the texture horizon (y=512) sitting at the run surface, same as CityLayers.
        const horizonOffset = 512;
        const groundHeight = RUN_SURFACE_FROM_BOTTOM;
        const yPos = (height - groundHeight) - horizonOffset;

        const positionLayer = (layer: Phaser.GameObjects.TileSprite | undefined) => {
            if (!layer) return;
            layer.setPosition(0, yPos);
            layer.width = width;
        };

        positionLayer(this.domeLayer);
        positionLayer(this.nearLayer);
    }

    public update(speed: number) {
        if (!this.domeLayer || this.domeLayer.alpha <= 0) return;
        this.domeLayer.tilePositionX += speed * 0.08;  // distant domes, slow
        this.nearLayer.tilePositionX += speed * 0.22;   // foreground, faster
    }

    public fadeIn(duration: number) {
        this.scene.tweens.add({
            targets: [this.domeLayer, this.nearLayer],
            alpha: 1,
            duration,
            ease: 'Power2.inOut'
        });
    }

    public fadeOut(duration: number) {
        this.scene.tweens.add({
            targets: [this.domeLayer, this.nearLayer],
            alpha: 0,
            duration,
            ease: 'Power2.inOut'
        });
    }
}
