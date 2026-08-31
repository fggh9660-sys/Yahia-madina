
import Phaser from 'phaser';
import { BuildingGenerator } from '../generators/BuildingGenerator';

export class LibraryBuilding extends Phaser.GameObjects.Container {
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    BuildingGenerator.init(scene); // Ensure texture exists

    const exterior = scene.add.sprite(0, 0, 'library_exterior');
    exterior.setOrigin(0.5, 1);
    this.add(exterior);

    // Inner Glow (Open door inviting player)
    const glow = scene.add.image(0, -100, 'city_lamp_glow');
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setAlpha(0.6);
    glow.setScale(3, 4);
    glow.setTint(0xffd700); // Gold light
    this.add(glow);

    // Pulse effect
    scene.tweens.add({
        targets: glow,
        alpha: 0.8,
        scaleX: 3.2,
        duration: 1500,
        yoyo: true,
        repeat: -1
    });

    this.setDepth(15); // Behind player (20), but in front of bg
    // Responsive scale. The exterior texture is 600px wide with a SOLID dark archway centre
    // (unlike CityGate, whose centre is a transparent cutout). At a fixed 1.0 scale on a narrow
    // portrait phone (iPhone Safari ≈ 390px) the building is ~1.5× the viewport, so its dark
    // archway fills the whole playfield and hides the floor/path as it slides in on approach
    // (reported by Yahia 2026-06-19). Cap the building to ~65% of viewport width; never upscale
    // past the native 1.0 so desktop/wide layouts stay unchanged.
    const BASE_TEXTURE_WIDTH = 600;
    const MAX_VIEWPORT_FRACTION = 0.65;
    const fitScale = Math.min(1.0, (scene.scale.width * MAX_VIEWPORT_FRACTION) / BASE_TEXTURE_WIDTH);
    this.setScale(fitScale);
  }
}
