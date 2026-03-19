/**
 * Отрисовка танка (спрайт или fallback-геометрия) + полоска HP.
 */
import { TANK_MAX_HP } from '../config/constants.js';
import { assets } from '../lib/assets.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} t — танк с x,y,angle,turretAngle,w,h,color,...
 */
export function drawTank(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.angle);
    if (t.spawnImmunityTimer > 0 && Math.floor(performance.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    const baseImg = assets.images.tankBase;
    if (assets.loaded && baseImg.complete && baseImg.naturalWidth > 0) {
        ctx.drawImage(baseImg, -baseImg.naturalWidth / 2, -baseImg.naturalHeight / 2);
    } else {
        ctx.fillStyle = t.color;
        ctx.fillRect(-t.w / 2, -t.h / 2, t.w, t.h);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(t.w / 2, -t.h / 2);
        ctx.lineTo(t.w / 2 + 5, 0);
        ctx.lineTo(t.w / 2, t.h / 2);
        ctx.fill();
        ctx.fillStyle = t.trackColor;
        ctx.fillRect(-t.w / 2, -t.h / 2, t.w, 5);
        ctx.fillRect(-t.w / 2, t.h / 2 - 5, t.w, 5);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(t.x + Math.cos(t.angle) * 4, t.y + Math.sin(t.angle) * 4);
    ctx.rotate(t.turretAngle);

    const turImg = assets.images.tankTurret;
    if (assets.loaded && turImg.complete && turImg.naturalWidth > 0) {
        ctx.drawImage(turImg, -turImg.naturalWidth / 2, -turImg.naturalHeight / 2);
    } else {
        ctx.fillStyle = t.turretColor;
        ctx.fillRect(10, -3, 22, 6);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    if (t.hp < TANK_MAX_HP && t.hp > 0) {
        ctx.fillStyle = '#333';
        ctx.fillRect(t.x - 20, t.y - 30, 40, 5);
        ctx.fillStyle = t.color;
        ctx.fillRect(t.x - 20, t.y - 30, (t.hp / TANK_MAX_HP) * 40, 5);
    }
}
