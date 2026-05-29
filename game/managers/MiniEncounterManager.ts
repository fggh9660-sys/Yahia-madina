import Phaser from 'phaser';

/**
 * M2: ambient mini-encounters — short non-blocking visual moments that add texture
 * between major events. All variants are edge-anchored and respect the "center 60% stays clear"
 * visual rule per feedback_visual_style_subtle_cinematic.
 *
 * Pool varies by stage so the same world stretch feels distinct (desert dust vs city fireflies).
 */

type MiniEncounterType = 'WIND_STREAK' | 'SUN_SHAFT' | 'FALLING_LEAVES' | 'FIREFLIES' | 'DISTANT_GLOW' | 'SAND_SWIRL' | 'LANTERN_PROCESSION';

// M2-R2b: bumped from 14-26s → 10-18s per Yahia world-enrichment ask. Still respects "subtle cinematic"
// rule per [[feedback-visual-style-subtle-cinematic]] — center 60% stays clear.
const MIN_INTERVAL_MS = 10000;
const MAX_INTERVAL_MS = 18000;

export class MiniEncounterManager {
    private scene: Phaser.Scene;
    private nextFireAt: number = 0;
    private currentStageGetter: () => number;
    private eventActiveGetter: () => boolean;

    constructor(scene: Phaser.Scene, currentStageGetter: () => number, eventActiveGetter: () => boolean) {
        this.scene = scene;
        this.currentStageGetter = currentStageGetter;
        this.eventActiveGetter = eventActiveGetter;
        this.nextFireAt = scene.time.now + Phaser.Math.Between(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    }

    public update() {
        if (this.scene.time.now < this.nextFireAt) return;
        // Don't pile on top of a big event — wait for quiet stretches.
        if (this.eventActiveGetter()) {
            this.nextFireAt = this.scene.time.now + 4000;
            return;
        }
        this.fire();
        this.nextFireAt = this.scene.time.now + Phaser.Math.Between(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    }

    public reset() {
        this.nextFireAt = this.scene.time.now + Phaser.Math.Between(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
    }

    private fire() {
        const stage = this.currentStageGetter();
        const pool: MiniEncounterType[] = stage >= 2
            ? ['SUN_SHAFT', 'FIREFLIES', 'DISTANT_GLOW', 'WIND_STREAK', 'LANTERN_PROCESSION']
            : ['WIND_STREAK', 'SUN_SHAFT', 'FALLING_LEAVES', 'DISTANT_GLOW', 'SAND_SWIRL'];
        const pick = Phaser.Utils.Array.GetRandom(pool) as MiniEncounterType;
        switch (pick) {
            case 'WIND_STREAK': return this.spawnWindStreak();
            case 'SUN_SHAFT': return this.spawnSunShaft();
            case 'FALLING_LEAVES': return this.spawnFallingLeaves();
            case 'FIREFLIES': return this.spawnFireflies();
            case 'DISTANT_GLOW': return this.spawnDistantGlow();
            case 'SAND_SWIRL': return this.spawnSandSwirl();
            case 'LANTERN_PROCESSION': return this.spawnLanternProcession();
        }
    }

    /** Fast dust/sand streak across the upper edge, left-to-right. */
    private spawnWindStreak() {
        const { width, height } = this.scene.scale;
        const count = 9;
        const yBase = height * 0.18;
        for (let i = 0; i < count; i++) {
            const dot = this.scene.add.rectangle(
                -20 - i * 30,
                yBase + Phaser.Math.Between(-30, 30),
                Phaser.Math.Between(14, 26),
                2,
                0xd4b876,
                Phaser.Math.FloatBetween(0.35, 0.7)
            ).setDepth(8).setScrollFactor(0);
            this.scene.tweens.add({
                targets: dot,
                x: width + 60,
                alpha: { from: dot.alpha, to: 0 },
                duration: Phaser.Math.Between(900, 1300),
                delay: i * 60,
                ease: 'Sine.out',
                onComplete: () => dot.destroy(),
            });
        }
    }

    /** Soft golden alpha shaft from top-right corner. */
    private spawnSunShaft() {
        const { width, height } = this.scene.scale;
        const shaft = this.scene.add.rectangle(width * 0.85, height * 0.35, width * 0.45, height * 0.9, 0xffe6a8, 0)
            .setDepth(7)
            .setScrollFactor(0)
            .setRotation(-0.35)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
            targets: shaft,
            alpha: { from: 0, to: 0.18 },
            duration: 700,
            yoyo: true,
            hold: 600,
            ease: 'Sine.inOut',
            onComplete: () => shaft.destroy(),
        });
    }

    /** A few tiny leaves drifting down from top-right (Stage 1 / desert: dry leaves). */
    private spawnFallingLeaves() {
        const { width, height } = this.scene.scale;
        for (let i = 0; i < 5; i++) {
            const leaf = this.scene.add.rectangle(
                width - Phaser.Math.Between(30, 160),
                -10,
                3, 5,
                Phaser.Utils.Array.GetRandom([0xa67c3b, 0xc4a05f, 0xd9b87e]),
                0.85
            ).setDepth(8).setScrollFactor(0);
            const drift = Phaser.Math.Between(-40, 20);
            this.scene.tweens.add({
                targets: leaf,
                y: height * 0.6,
                x: leaf.x + drift,
                rotation: Phaser.Math.FloatBetween(-1.5, 1.5),
                alpha: { from: 0.85, to: 0 },
                duration: Phaser.Math.Between(2400, 3400),
                delay: i * 180,
                ease: 'Sine.inOut',
                onComplete: () => leaf.destroy(),
            });
        }
    }

    /** Small golden floating pulses (Stage 2 / city: fireflies / library motes). */
    private spawnFireflies() {
        const { width, height } = this.scene.scale;
        const side = Math.random() < 0.5 ? 'left' : 'right';
        for (let i = 0; i < 6; i++) {
            const startX = side === 'left'
                ? Phaser.Math.Between(20, 110)
                : Phaser.Math.Between(width - 110, width - 20);
            const fly = this.scene.add.circle(
                startX,
                Phaser.Math.Between(Math.floor(height * 0.25), Math.floor(height * 0.55)),
                2,
                0xffd66b,
                0.9
            ).setDepth(8).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);
            this.scene.tweens.add({
                targets: fly,
                y: fly.y - Phaser.Math.Between(40, 90),
                x: fly.x + Phaser.Math.Between(-30, 30),
                alpha: { from: 0.9, to: 0 },
                scale: { from: 1, to: 1.6 },
                duration: Phaser.Math.Between(2000, 3000),
                delay: i * 240,
                ease: 'Sine.inOut',
                onComplete: () => fly.destroy(),
            });
        }
    }

    /** A single soft glowing dot at the horizon — distant landmark / lantern. */
    private spawnDistantGlow() {
        const { width, height } = this.scene.scale;
        const x = Phaser.Math.FloatBetween(width * 0.15, width * 0.85);
        const y = height * 0.55;
        const glow = this.scene.add.circle(x, y, 4, 0xffd66b, 0)
            .setDepth(6)
            .setScrollFactor(0)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0, to: 0.55 },
            scale: { from: 1, to: 2.2 },
            duration: 900,
            yoyo: true,
            hold: 700,
            ease: 'Sine.inOut',
            onComplete: () => glow.destroy(),
        });
    }

    /** M2-R2b: Stage 1 desert ambient — small swirling dust devil near horizon, rotates then dissipates. */
    private spawnSandSwirl() {
        const { width, height } = this.scene.scale;
        const baseX = Phaser.Math.FloatBetween(width * 0.7, width * 0.95);
        const baseY = height * 0.58;
        const dustColor = 0xc4a05f;
        const ring = this.scene.add.ellipse(baseX, baseY, 18, 6, dustColor, 0.45)
            .setDepth(7)
            .setScrollFactor(0)
            .setBlendMode(Phaser.BlendModes.ADD);
        // Spiral up + rotate + grow + fade
        this.scene.tweens.add({
            targets: ring,
            y: baseY - 40,
            scaleX: 1.8,
            scaleY: 1.4,
            rotation: Math.PI * 1.5,
            alpha: { from: 0.45, to: 0 },
            duration: 2200,
            ease: 'Sine.out',
            onComplete: () => ring.destroy(),
        });
        // Trailing small dust particles
        for (let i = 0; i < 6; i++) {
            const dot = this.scene.add.circle(
                baseX + Phaser.Math.Between(-8, 8),
                baseY + Phaser.Math.Between(-5, 5),
                1.4,
                dustColor,
                Phaser.Math.FloatBetween(0.35, 0.7)
            ).setDepth(7).setScrollFactor(0);
            this.scene.tweens.add({
                targets: dot,
                y: baseY - Phaser.Math.Between(25, 50),
                x: dot.x + Phaser.Math.Between(-12, 12),
                alpha: 0,
                duration: Phaser.Math.Between(1600, 2400),
                delay: i * 80,
                ease: 'Sine.out',
                onComplete: () => dot.destroy(),
            });
        }
    }

    /** M2-R2b: Stage 2 city ambient — chain of small lantern glows floating along upper edge,
     *  reads as a distant night procession past the library district.
     *  M2-R2c fix: raised y from 22% → 12% of screen height so the chain stays clear of any
     *  floating platforms (highest platform spawns reach roughly groundY-250 = ~25% from top).
     *  Tightened bob amplitude (4px → 2px) so the path stays predictable. */
    private spawnLanternProcession() {
        const { width, height } = this.scene.scale;
        const count = 5;
        const yBase = height * 0.12;
        const startSide = Math.random() < 0.5 ? 'left' : 'right';
        const dir = startSide === 'left' ? 1 : -1;
        for (let i = 0; i < count; i++) {
            const startX = startSide === 'left' ? -20 - i * 60 : width + 20 + i * 60;
            const lantern = this.scene.add.circle(
                startX,
                yBase + Phaser.Math.Between(-4, 4),
                3,
                0xffc97a,
                0.85
            ).setDepth(7).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);
            // Soft outer aura
            const aura = this.scene.add.circle(startX, lantern.y, 9, 0xffd66b, 0.18)
                .setDepth(6).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);
            const endX = startSide === 'left' ? width + 60 : -60;
            this.scene.tweens.add({
                targets: [lantern, aura],
                x: endX,
                alpha: { from: lantern.alpha, to: 0 },
                duration: Phaser.Math.Between(3200, 4200),
                delay: i * 180,
                ease: 'Sine.inOut',
                onComplete: () => { lantern.destroy(); aura.destroy(); },
            });
            // Gentle bob — small amplitude so the procession stays clear of platforms.
            this.scene.tweens.add({
                targets: [lantern, aura],
                y: lantern.y + 2 * dir,
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
            });
        }
    }
}
