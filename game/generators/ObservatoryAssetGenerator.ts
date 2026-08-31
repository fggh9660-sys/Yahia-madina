
import Phaser from 'phaser';

/**
 * M3B — Stage 3 "Observatory of the Stars" (برج الرصد) asset generator.
 *
 * Procedurally draws the foreground identity of Stage 3: great observatory domes on the
 * horizon (mid layer), tall columns + a mounted telescope + astrolabe rings (near layer),
 * and a polished star-inlaid stone ground. The night sky / starfield / moon already exist in
 * the base atmosphere (Background.ts), so this generator only adds the architectural silhouettes
 * that make the world read as a celestial observatory rather than desert or city.
 *
 * Mirrors the texture conventions of CityAssetGenerator: 1024×1024 background layers with the
 * horizon baseline at y=512, and a 1024×128 ground strip.
 */
export class ObservatoryAssetGenerator {
    static init(scene: Phaser.Scene) {
        this.generateDomeLayer(scene);
        this.generateStructureLayer(scene);
        this.generateGround(scene);
    }

    // Indigo / starlit palette
    private static readonly DOME_DARK = '#1b1633';
    private static readonly DOME_MID = '#2b2350';
    private static readonly DOME_RIM = '#5b4a9e';
    private static readonly GOLD = '#ffd86b';
    private static readonly GLOW = '#8fb8ff';

    /** MID LAYER — a line of observatory domes on the horizon with glowing apertures. */
    private static generateDomeLayer(scene: Phaser.Scene) {
        if (scene.textures.exists('obs_dome')) return;
        const W = 1024, H = 1024, BASE = 512;
        const canvas = scene.textures.createCanvas('obs_dome', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const drawDome = (cx: number, baseW: number, height: number, lit: boolean) => {
            const left = cx - baseW / 2;
            const right = cx + baseW / 2;
            const topY = BASE - height;

            // Drum (cylindrical base under the dome)
            const drumH = height * 0.32;
            ctx.fillStyle = this.DOME_DARK;
            ctx.fillRect(left, BASE - drumH, baseW, drumH);

            // Dome cap (half-ellipse)
            ctx.fillStyle = this.DOME_MID;
            ctx.beginPath();
            ctx.ellipse(cx, BASE - drumH, baseW / 2, height - drumH, 0, Math.PI, 0);
            ctx.fill();

            // Rim highlight along the dome edge
            ctx.strokeStyle = this.DOME_RIM;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, BASE - drumH, baseW / 2, height - drumH, 0, Math.PI, 0);
            ctx.stroke();

            // Aperture slit + glow (the telescope opening)
            if (lit) {
                ctx.save();
                ctx.strokeStyle = this.GLOW;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 14;
                ctx.shadowColor = this.GLOW;
                ctx.beginPath();
                ctx.moveTo(cx, topY + 6);
                ctx.lineTo(cx, BASE - drumH - 4);
                ctx.stroke();
                ctx.restore();
            }

            // Finial on top
            ctx.fillStyle = this.GOLD;
            ctx.beginPath();
            ctx.arc(cx, topY + 2, 3, 0, Math.PI * 2);
            ctx.fill();

            // A couple of lit drum windows
            ctx.fillStyle = 'rgba(255, 216, 107, 0.5)';
            for (let wx = left + 10; wx < right - 6; wx += 22) {
                ctx.fillRect(wx, BASE - drumH + 8, 5, 9);
            }
        };

        // Three domes of varied size across the tile (tile wraps, so keep edges modest)
        drawDome(170, 220, 250, true);
        drawDome(470, 300, 330, true);
        drawDome(760, 200, 230, false);
        drawDome(960, 150, 180, true);

        // Faint connecting wall along the base
        ctx.fillStyle = this.DOME_DARK;
        ctx.fillRect(0, BASE - 28, W, 28);

        canvas.refresh();
    }

    /** NEAR LAYER — foreground colonnade + a mounted telescope + an astrolabe ring. */
    private static generateStructureLayer(scene: Phaser.Scene) {
        if (scene.textures.exists('obs_near')) return;
        const W = 1024, H = 1024, BASE = 512;
        const canvas = scene.textures.createCanvas('obs_near', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Tall slender columns (foreground silhouettes)
        const drawColumn = (x: number, h: number) => {
            ctx.fillStyle = '#120e26';
            ctx.fillRect(x, BASE - h, 18, h);
            // capital + base
            ctx.fillStyle = '#241c44';
            ctx.fillRect(x - 4, BASE - h, 26, 8);
            ctx.fillRect(x - 4, BASE - 10, 26, 10);
            // gold fluting hint
            ctx.fillStyle = 'rgba(255,216,107,0.18)';
            ctx.fillRect(x + 8, BASE - h + 8, 2, h - 18);
        };
        drawColumn(70, 300);
        drawColumn(300, 360);
        drawColumn(880, 330);

        // Mounted telescope on a pedestal (the signature silhouette), pointed to the sky
        const tx = 560, tBase = BASE;
        ctx.save();
        // pedestal
        ctx.fillStyle = '#161129';
        ctx.fillRect(tx - 16, tBase - 70, 32, 70);
        ctx.fillStyle = '#2b2350';
        ctx.fillRect(tx - 26, tBase - 10, 52, 10);
        // yoke pivot
        ctx.fillStyle = '#241c44';
        ctx.beginPath(); ctx.arc(tx, tBase - 78, 12, 0, Math.PI * 2); ctx.fill();
        // barrel (angled up-right)
        ctx.translate(tx, tBase - 78);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#1d1738';
        ctx.fillRect(-10, -90, 20, 110);
        ctx.fillStyle = this.GOLD;
        ctx.fillRect(-10, -90, 20, 6);                 // gold front ring
        ctx.fillStyle = 'rgba(143,184,255,0.5)';        // lens glow
        ctx.fillRect(-8, -88, 16, 4);
        ctx.restore();

        // Astrolabe ring (decorative celestial circle) hovering near foreground
        ctx.save();
        ctx.strokeStyle = 'rgba(255,216,107,0.5)';
        ctx.lineWidth = 3;
        const ax = 980, ay = BASE - 240, ar = 46;
        ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ax, ay, ar * 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ax - ar, ay); ctx.lineTo(ax + ar, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax, ay - ar); ctx.lineTo(ax, ay + ar); ctx.stroke();
        ctx.restore();

        canvas.refresh();
    }

    /** GROUND — polished dark stone with a faint constellation inlay + gold rim. */
    private static generateGround(scene: Phaser.Scene) {
        if (scene.textures.exists('ground_observatory')) return;
        const W = 1024, H = 128;
        const canvas = scene.textures.createCanvas('ground_observatory', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Deep indigo polished stone
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#241c44');
        grd.addColorStop(1, '#0d0a1c');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Subtle marble veining
        ctx.strokeStyle = 'rgba(143,184,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
            const y = 20 + Math.random() * (H - 24);
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 4);
            ctx.stroke();
        }

        // Inlaid "stars" + tiny constellation links
        ctx.fillStyle = 'rgba(255,216,107,0.7)';
        const pts: Array<[number, number]> = [];
        for (let i = 0; i < 22; i++) {
            const x = Math.random() * W;
            const y = 30 + Math.random() * (H - 40);
            pts.push([x, y]);
            ctx.beginPath(); ctx.arc(x, y, Math.random() < 0.3 ? 2 : 1.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,216,107,0.12)';
        for (let i = 0; i < pts.length - 1; i += 3) {
            ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
        }

        // Gold top rim (matches the city/library ornate edge language)
        const goldGrad = ctx.createLinearGradient(0, 0, 0, 14);
        goldGrad.addColorStop(0, '#ffe08a');
        goldGrad.addColorStop(1, '#b8860b');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 0, W, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(0, 0, W, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 6, W, 4);

        canvas.refresh();
    }
}
