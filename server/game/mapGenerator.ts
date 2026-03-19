import { BRICK_SIZE, MAP_HEIGHT, MAP_WIDTH } from '#shared/map.js';
import type { MapData } from '../ws/lobbyStore.js';

export function generateMapData(): MapData {
    const bricks: { x: number; y: number }[] = [];
    const biome = Math.floor(Math.random() * 3);
    const buildings: { x: number; y: number; w: number; h: number }[] = [];

    for (let i = 0; i < 15; i++) {
        const w = (Math.floor(Math.random() * 6) + 3) * BRICK_SIZE;
        const h = (Math.floor(Math.random() * 3) + 3) * BRICK_SIZE;
        let valid = false;
        let attempts = 0;
        let b: { x: number; y: number; w: number; h: number } | null = null;

        while (!valid && attempts < 50) {
            b = { x: Math.random() * (MAP_WIDTH - w), y: Math.random() * (MAP_HEIGHT - h), w, h };
            valid = true;
            for (const other of buildings) {
                if (
                    b.x < other.x + other.w + BRICK_SIZE &&
                    b.x + b.w + BRICK_SIZE > other.x &&
                    b.y < other.y + other.h + BRICK_SIZE &&
                    b.y + b.h + BRICK_SIZE > other.y
                ) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }

        if (valid && b) {
            buildings.push(b);
            for (let r = 0; r < b.h / BRICK_SIZE; r++) {
                for (let c = 0; c < b.w / BRICK_SIZE; c++) {
                    bricks.push({ x: b.x + c * BRICK_SIZE, y: b.y + r * BRICK_SIZE });
                }
            }
        }
    }

    return { bricks, biome, w: MAP_WIDTH, h: MAP_HEIGHT };
}
