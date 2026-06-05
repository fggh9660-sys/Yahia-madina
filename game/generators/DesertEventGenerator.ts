
import Phaser from 'phaser';

/**
 * M3B (Yahia event design doc 2026-06-05) — signature props for the 4 themed desert event set-pieces:
 *   Oasis (Color)   → flowers (+ reused palms/well/tent)
 *   Ruins (Pair)    → glowing glyph stone (+ reused ruins)
 *   Caravan (Object)→ camel + lantern (+ reused tent)
 *   Storm (Fruit)   → drifting sand cloud (+ reused shelter tent)
 *
 * These are decorative only (no physics) — spawned into RoadsideArchitecture.decorations so they
 * scroll + cull with the world. Textures are drawn with ground contact at the bottom of the canvas;
 * sprites use origin (0.5, 1) so they sit on the ground line.
 */
export class DesertEventGenerator {
    static init(scene: Phaser.Scene) {
        this.generateCamel(scene);
        this.generateLantern(scene);
        this.generateFlowers(scene);
        this.generateGlyph(scene);
        this.generateSandCloud(scene);
    }

    private static generateCamel(scene: Phaser.Scene) {
        if (scene.textures.exists('event_camel')) return;
        const W = 110, H = 86;
        const c = scene.textures.createCanvas('event_camel', W, H);
        if (!c) return;
        const ctx = c.context;
        const body = '#b07a44', dark = '#8a5d31', light = '#c9965c';

        // Legs
        ctx.strokeStyle = dark; ctx.lineWidth = 6; ctx.lineCap = 'round';
        [28, 44, 70, 86].forEach((lx, i) => {
            ctx.beginPath(); ctx.moveTo(lx, 52); ctx.lineTo(lx + (i % 2 ? 3 : -3), H - 4); ctx.stroke();
        });
        // Body
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.ellipse(58, 46, 36, 18, 0, 0, Math.PI * 2); ctx.fill();
        // Humps
        ctx.beginPath();
        ctx.moveTo(34, 40); ctx.quadraticCurveTo(46, 16, 58, 36);
        ctx.quadraticCurveTo(70, 14, 84, 38); ctx.lineTo(84, 46); ctx.lineTo(34, 46); ctx.fill();
        // Highlight
        ctx.fillStyle = light;
        ctx.beginPath(); ctx.ellipse(58, 42, 30, 10, 0, Math.PI, 0); ctx.fill();
        // Neck + head
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(86, 44); ctx.quadraticCurveTo(100, 36, 100, 18);
        ctx.lineTo(108, 16); ctx.quadraticCurveTo(112, 10, 104, 8);
        ctx.lineTo(96, 12); ctx.quadraticCurveTo(92, 30, 80, 40); ctx.fill();
        // Eye
        ctx.fillStyle = '#2b1d10';
        ctx.beginPath(); ctx.arc(101, 14, 1.6, 0, Math.PI * 2); ctx.fill();
        // Tail
        ctx.strokeStyle = dark; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(24, 42); ctx.lineTo(18, 58); ctx.stroke();

        c.refresh();
    }

    private static generateLantern(scene: Phaser.Scene) {
        if (scene.textures.exists('event_lantern')) return;
        const W = 30, H = 76;
        const c = scene.textures.createCanvas('event_lantern', W, H);
        if (!c) return;
        const ctx = c.context;
        const cx = 15;
        // Pole
        ctx.fillStyle = '#5d4037'; ctx.fillRect(cx - 2, 22, 4, H - 22);
        ctx.fillStyle = '#4e342e'; ctx.fillRect(cx - 4, H - 6, 8, 5);
        // Hook arm
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, 22); ctx.lineTo(cx, 12); ctx.lineTo(cx + 8, 12); ctx.stroke();
        // Lantern body
        ctx.fillStyle = '#caa24a';
        ctx.beginPath(); ctx.moveTo(cx + 2, 16); ctx.lineTo(cx + 14, 16);
        ctx.lineTo(cx + 12, 34); ctx.lineTo(cx + 4, 34); ctx.fill();
        // Glow
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = '#ffd86b';
        ctx.fillStyle = 'rgba(255,216,107,0.9)';
        ctx.fillRect(cx + 5, 20, 6, 10);
        ctx.restore();
        // Cap
        ctx.fillStyle = '#8a6d2f'; ctx.fillRect(cx + 1, 13, 14, 4);
        c.refresh();
    }

    private static generateFlowers(scene: Phaser.Scene) {
        if (scene.textures.exists('event_flowers')) return;
        const W = 70, H = 44;
        const c = scene.textures.createCanvas('event_flowers', W, H);
        if (!c) return;
        const ctx = c.context;
        const petals = ['#e74c3c', '#f1c40f', '#9b59b6', '#ff7f50'];
        const stems = [10, 24, 38, 52, 62];
        stems.forEach((sx, i) => {
            const top = 12 + (i % 2) * 6;
            // stem + leaf
            ctx.strokeStyle = '#3f7d3a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx, top + 4); ctx.stroke();
            ctx.fillStyle = '#4f9a45';
            ctx.beginPath(); ctx.ellipse(sx + 4, H - 14, 5, 2.5, -0.6, 0, Math.PI * 2); ctx.fill();
            // flower head (petals)
            const col = petals[i % petals.length];
            ctx.fillStyle = col;
            for (let p = 0; p < 5; p++) {
                const a = (p / 5) * Math.PI * 2;
                ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 3.5, top + Math.sin(a) * 3.5, 2.6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = '#ffe9a8';
            ctx.beginPath(); ctx.arc(sx, top, 2, 0, Math.PI * 2); ctx.fill();
        });
        c.refresh();
    }

    private static generateGlyph(scene: Phaser.Scene) {
        if (scene.textures.exists('event_glyph')) return;
        const W = 48, H = 62;
        const c = scene.textures.createCanvas('event_glyph', W, H);
        if (!c) return;
        const ctx = c.context;
        // Stone tablet
        ctx.fillStyle = '#8a7a58';
        ctx.beginPath();
        ctx.moveTo(8, H); ctx.lineTo(6, 16); ctx.quadraticCurveTo(24, 4, 42, 16); ctx.lineTo(40, H); ctx.fill();
        // cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(20, 16); ctx.lineTo(24, 40); ctx.lineTo(20, H); ctx.stroke();
        // Glowing symbol
        ctx.save();
        ctx.shadowBlur = 12; ctx.shadowColor = '#8fb8ff';
        ctx.strokeStyle = '#bcd6ff'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(24, 30, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(24, 21); ctx.lineTo(24, 39); ctx.moveTo(16, 30); ctx.lineTo(32, 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(18, 24); ctx.lineTo(30, 36); ctx.stroke();
        ctx.restore();
        c.refresh();
    }

    private static generateSandCloud(scene: Phaser.Scene) {
        if (scene.textures.exists('event_sandcloud')) return;
        const W = 180, H = 110;
        const c = scene.textures.createCanvas('event_sandcloud', W, H);
        if (!c) return;
        const ctx = c.context;
        // Soft layered sand gusts
        const tint = ['rgba(206,170,90,0.22)', 'rgba(176,140,70,0.18)', 'rgba(230,200,140,0.16)'];
        for (let i = 0; i < 26; i++) {
            ctx.fillStyle = tint[i % tint.length];
            const x = Math.random() * W, y = Math.random() * H;
            const rx = 24 + Math.random() * 40, ry = 8 + Math.random() * 16;
            ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        }
        // streaks
        ctx.strokeStyle = 'rgba(230,210,160,0.25)'; ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const y = Math.random() * H;
            ctx.beginPath(); ctx.moveTo(Math.random() * 40, y); ctx.lineTo(40 + Math.random() * (W - 60), y + Math.random() * 6 - 3); ctx.stroke();
        }
        c.refresh();
    }
}
