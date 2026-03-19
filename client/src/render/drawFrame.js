/**
 * Полный кадр мира: камера, слои world → tanks → effects → UI.
 */
import { clampCamera } from '../game/collision.js';
import { shadeColor } from '../game/colorUtils.js';
import { assets } from '../lib/assets.js';
import {
    drawBullets,
    drawDarkSmokeParticles,
    drawExplosions,
    drawMines,
    drawParticlesSmoke,
    drawParticlesSparks,
    drawRockets,
    drawSmokes,
    drawTracks,
} from './effects.js';
import { drawTank } from './tank.js';
import { drawAimCrosshair, drawNickname } from './uiOverlay.js';
import {
    drawBoostIcon,
    drawBricks,
    drawMapBackground,
} from './world.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} view
 */
export function drawGameFrame(ctx, view) {
    const {
        width,
        height,
        scaleFactor,
        keys,
        tank,
        enemyTanks,
        session,
        level,
        bricks,
        boosts,
        tracks,
        particles,
        mines,
        bullets,
        smokes,
        explosions,
        rockets,
        cachedPatterns,
        onRocketSmoke,
    } = view;

    const dx = (keys['MouseX'] || width / 2) - width / 2;
    const dy = (keys['MouseY'] || height / 2) - height / 2;
    const rawCamX = tank.x + (dx / scaleFactor) * 0.33;
    const rawCamY = tank.y + (dy / scaleFactor) * 0.33;
    const c = clampCamera(rawCamX, rawCamY, width, height, scaleFactor, level.mapWidth, level.mapHeight);
    const camX = c.x;
    const camY = c.y;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-camX, -camY);

    drawMapBackground(ctx, {
        mapWidth: level.mapWidth,
        mapHeight: level.mapHeight,
        biome: level.biome,
        cachedPatterns,
        grassImg: assets.images.grassBase,
        perlinImg: assets.images.perlinMask,
    });

    drawBricks(ctx, bricks, level.biome);
    boosts.forEach((b) => drawBoostIcon(ctx, b.x, b.y, b.type));

    const now = performance.now();
    drawTracks(ctx, tracks, now);

    drawParticlesSparks(ctx, particles);

    drawMines(ctx, mines, session.myTeam);

    for (const id in enemyTanks) {
        const et = enemyTanks[id];
        if (et.hp > 0) {
            et.color = session.playerData[id]?.color || '#f44336';
            et.turretColor = shadeColor(et.color, -20);
            et.trackColor = shadeColor(et.color, -40);
            drawTank(ctx, et);
        }
    }
    if (tank.hp > 0) {
        drawTank(ctx, tank);
    }

    drawBullets(ctx, bullets);

    drawParticlesSmoke(ctx, particles);
    ctx.globalAlpha = 1;

    for (const id in enemyTanks) {
        const et = enemyTanks[id];
        if (et.hp > 0) drawNickname(ctx, et, false, session);
    }
    if (tank.hp > 0) {
        drawNickname(ctx, tank, true, session);
    }

    drawSmokes(ctx, smokes);
    drawDarkSmokeParticles(ctx, particles);

    drawExplosions(ctx, explosions);

    drawRockets(ctx, rockets, onRocketSmoke);

    if (tank.hp > 0) {
        drawAimCrosshair(ctx, tank);
    }

    ctx.restore();

    return { camX, camY };
}
