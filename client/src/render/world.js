/**
 * Фон карты, сетка (кэш offscreen — фаза 3.4), кирпичи, бусты на земле.
 */
import { BOOST_ICON_SCALE, BRICK_SIZE } from '../config/constants.js';

let gridCanvas = null;
let gridCtx = null;
let gridKey = '';

function ensureGridCanvas(w, h) {
    if (!gridCanvas) {
        gridCanvas = document.createElement('canvas');
        gridCtx = gridCanvas.getContext('2d');
    }
    if (gridCanvas.width !== w || gridCanvas.height !== h) {
        gridCanvas.width = w;
        gridCanvas.height = h;
    }
}

/** Перерисовка сетки только при смене размера карты или биома. */
function drawGridToCache(mapWidth, mapHeight, biome) {
    const key = `${mapWidth}|${mapHeight}|${biome}`;
    if (key === gridKey && gridCanvas?.width === mapWidth) return;
    gridKey = key;
    ensureGridCanvas(mapWidth, mapHeight);
    gridCtx.strokeStyle = ['#777', '#ccc', '#c1a275'][biome];
    gridCtx.lineWidth = 1;
    gridCtx.clearRect(0, 0, mapWidth, mapHeight);
    for (let i = 0; i < mapWidth; i += 100) {
        gridCtx.beginPath();
        gridCtx.moveTo(i, 0);
        gridCtx.lineTo(i, mapHeight);
        gridCtx.stroke();
    }
    for (let i = 0; i < mapHeight; i += 100) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, i);
        gridCtx.lineTo(mapWidth, i);
        gridCtx.stroke();
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx — уже в мировых координатах (после translate/scale)
 * @param {object} o
 */
export function drawMapBackground(ctx, o) {
    const { mapWidth, mapHeight, biome, cachedPatterns, grassImg, perlinImg } = o;
    if (grassImg.complete && grassImg.naturalWidth === 0) {
        cachedPatterns.grassBase = null;
        cachedPatterns.perlinMask = null;
    }
    if (!cachedPatterns.grassBase && grassImg.complete && grassImg.naturalWidth > 0) {
        const pat = ctx.createPattern(grassImg, 'repeat');
        if (pat) cachedPatterns.grassBase = pat;
    }
    if (!cachedPatterns.perlinMask && perlinImg.complete && perlinImg.naturalWidth > 0) {
        const pat = ctx.createPattern(perlinImg, 'repeat');
        if (pat) cachedPatterns.perlinMask = pat;
    }

    if (cachedPatterns.grassBase) {
        ctx.fillStyle = cachedPatterns.grassBase;
        ctx.fillRect(0, 0, mapWidth, mapHeight);
        if (cachedPatterns.perlinMask) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = cachedPatterns.perlinMask;
            ctx.fillRect(0, 0, mapWidth, mapHeight);
            ctx.restore();
        }
    } else {
        ctx.fillStyle = ['#888', '#eee', '#deb887'][biome];
        ctx.fillRect(0, 0, mapWidth, mapHeight);
    }

    drawGridToCache(mapWidth, mapHeight, biome);
    ctx.drawImage(gridCanvas, 0, 0);
}

export function drawBricks(ctx, bricks, biome) {
    bricks.forEach((b) => {
        ctx.fillStyle = biome === 1 ? '#aaa' : '#8b4513';
        ctx.fillRect(b.x, b.y, BRICK_SIZE - 1, BRICK_SIZE - 1);
    });
}

export function drawBoostIcon(ctx, x, y, type) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(BOOST_ICON_SCALE, BOOST_ICON_SCALE);
    const r = 12;
    if (type === 0) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.lineTo(0, 7);
        ctx.lineTo(5, -3);
        ctx.moveTo(0, 7);
        ctx.lineTo(0, -5);
        ctx.stroke();
    } else if (type === 1) {
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.moveTo(6, -4);
        ctx.lineTo(6, 4);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
    } else if (type === 2) {
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-6, -5);
        ctx.lineTo(-1, 0);
        ctx.lineTo(-6, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(1, -5);
        ctx.lineTo(6, 0);
        ctx.lineTo(1, 5);
        ctx.fill();
    } else if (type === 3) {
        ctx.fillStyle = '#888';
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -1, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 4) {
        ctx.fillStyle = '#2e4634';
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 5) {
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}
